import pytest
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from backend.app.database import Base
from backend.app.models import Customer, Invoice, InvoiceLineItem, ActionProposal, Approval, AuditLog
from backend.app.services.approval_service import (
    create_action_proposal, review_proposal
)

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture
async def async_session():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with session_maker() as session:
        # Seed test customer and invoice
        cust = Customer(name="Test Corp", code="CUST-TEST", email="test@corp.com")
        session.add(cust)
        await session.flush()

        inv = Invoice(
            customer_id=cust.id,
            invoice_number="INV-TEST-001",
            billing_period="2026-10",
            issue_date=datetime(2026, 10, 1),
            due_date=datetime(2026, 10, 31),
            subtotal=Decimal("10000.00"),
            tax=Decimal("0.00"),
            total_amount=Decimal("10000.00"),
            currency="INR"
        )
        session.add(inv)
        await session.flush()
        await session.commit()
        yield session

    await engine.dispose()

@pytest.mark.asyncio
async def test_proposal_creation_does_not_mutate_invoice(async_session):
    """
    Ensures creating a proposal leaves the invoice total untouched.
    """
    res = await async_session.execute(select(Invoice).where(Invoice.invoice_number == "INV-TEST-001"))
    invoice = res.scalars().first()
    assert invoice.total_amount == Decimal("10000.00")

    proposal = await create_action_proposal(
        db=async_session,
        customer_id=invoice.customer_id,
        invoice_id=invoice.id,
        action_type="INVOICE_ADJUSTMENT",
        title="Credit Memo ₹2000",
        justification="Test overcharge",
        proposed_payload={"adjustment_amount": "2000.00", "adjustment_type": "CREDIT_MEMO"}
    )
    await async_session.commit()

    # Verify status is PENDING and invoice is unchanged
    res = await async_session.execute(select(Invoice).where(Invoice.id == invoice.id))
    inv_after = res.scalars().first()
    assert inv_after.total_amount == Decimal("10000.00")
    assert proposal.status == "PENDING"

@pytest.mark.asyncio
async def test_rejection_leaves_invoice_untouched(async_session):
    """
    Ensures rejecting a proposal does not alter financial balances.
    """
    res = await async_session.execute(select(Invoice).where(Invoice.invoice_number == "INV-TEST-001"))
    invoice = res.scalars().first()

    proposal = await create_action_proposal(
        db=async_session,
        customer_id=invoice.customer_id,
        invoice_id=invoice.id,
        action_type="INVOICE_ADJUSTMENT",
        title="Credit Memo ₹2000",
        justification="Test",
        proposed_payload={"adjustment_amount": "2000.00", "adjustment_type": "CREDIT_MEMO"}
    )
    await async_session.commit()

    review_res = await review_proposal(
        db=async_session,
        proposal_id=proposal.id,
        reviewer_name="Parth Singh",
        decision="REJECTED",
        comment="Adjustment not approved by management"
    )

    assert review_res["status"] == "SUCCESS"
    assert review_res["decision"] == "REJECTED"

    res_inv = await async_session.execute(select(Invoice).where(Invoice.id == invoice.id))
    inv_check = res_inv.scalars().first()
    assert inv_check.total_amount == Decimal("10000.00")

@pytest.mark.asyncio
async def test_approval_executes_adjustment_and_preserves_idempotency(async_session):
    """
    Ensures approval applies adjustment exactly once, and a repeated review request is rejected safely.
    """
    res = await async_session.execute(select(Invoice).where(Invoice.invoice_number == "INV-TEST-001"))
    invoice = res.scalars().first()

    proposal = await create_action_proposal(
        db=async_session,
        customer_id=invoice.customer_id,
        invoice_id=invoice.id,
        action_type="INVOICE_ADJUSTMENT",
        title="Credit Memo ₹2000",
        justification="Confirmed rate calculation mismatch",
        proposed_payload={"adjustment_amount": "2000.00", "adjustment_type": "CREDIT_MEMO", "reason": "Rate mismatch"}
    )
    await async_session.commit()

    # First Approval
    first_review = await review_proposal(
        db=async_session,
        proposal_id=proposal.id,
        reviewer_name="Parth Singh",
        decision="APPROVED",
        comment="Approved rate fix"
    )

    assert first_review["status"] == "SUCCESS"
    assert first_review["proposal_status"] == "EXECUTED"

    # Verify invoice adjusted: 10,000 - 2,000 = 8,000.00
    res_inv = await async_session.execute(select(Invoice).where(Invoice.id == invoice.id))
    inv_check = res_inv.scalars().first()
    assert inv_check.total_amount == Decimal("8000.00")
    assert inv_check.status == "ADJUSTED"

    # SECOND (REPEATED) APPROVAL REQUEST - IDEMPOTENCY TEST
    second_review = await review_proposal(
        db=async_session,
        proposal_id=proposal.id,
        reviewer_name="Parth Singh",
        decision="APPROVED",
        comment="Accidental double-click"
    )

    assert second_review["status"] == "ALREADY_PROCESSED"
    assert "Idempotency preserved" in second_review["message"]

    # Verify invoice total is STILL 8,000.00, NOT double-subtracted to 6,000!
    res_inv_double = await async_session.execute(select(Invoice).where(Invoice.id == invoice.id))
    inv_double_check = res_inv_double.scalars().first()
    assert inv_double_check.total_amount == Decimal("8000.00")
