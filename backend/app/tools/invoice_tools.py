from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from backend.app.models import Customer, Invoice, InvoiceLineItem, Payment
from backend.app.tools.calculations import (
    compare_invoices_deterministic, calculate_aging_and_outstanding
)

async def search_invoices_tool(
    db: AsyncSession,
    customer_query: Optional[str] = None,
    status: Optional[str] = None,
    billing_period: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Read-only tool: Search invoices filtered by customer name/code, status, or billing period.
    """
    stmt = select(Invoice).options(selectinload(Invoice.customer))
    
    conditions = []
    if customer_query:
        # Search by customer name or code
        cust_subquery = select(Customer.id).where(
            or_(
                Customer.name.ilike(f"%{customer_query}%"),
                Customer.code.ilike(f"%{customer_query}%")
            )
        )
        conditions.append(Invoice.customer_id.in_(cust_subquery))
    
    if status:
        conditions.append(Invoice.status == status.upper())
    
    if billing_period:
        conditions.append(Invoice.billing_period == billing_period)

    if conditions:
        stmt = stmt.where(and_(*conditions))

    stmt = stmt.order_by(Invoice.issue_date.desc())
    result = await db.execute(stmt)
    invoices = result.scalars().all()

    return [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "customer_id": inv.customer_id,
            "customer_name": inv.customer.name if inv.customer else "Unknown",
            "customer_code": inv.customer.code if inv.customer else "Unknown",
            "billing_period": inv.billing_period,
            "issue_date": inv.issue_date.strftime("%Y-%m-%d"),
            "due_date": inv.due_date.strftime("%Y-%m-%d"),
            "status": inv.status,
            "subtotal": str(inv.subtotal),
            "tax": str(inv.tax),
            "total_amount": str(inv.total_amount),
            "currency": inv.currency,
            "notes": inv.notes
        }
        for inv in invoices
    ]

async def get_invoice_details_tool(
    db: AsyncSession,
    invoice_number_or_id: str
) -> Optional[Dict[str, Any]]:
    """
    Read-only tool: Retrieve full invoice details including itemized charges and payments.
    """
    stmt = (
        select(Invoice)
        .options(
            selectinload(Invoice.customer),
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments)
        )
        .where(
            or_(
                Invoice.id == invoice_number_or_id,
                Invoice.invoice_number == invoice_number_or_id
            )
        )
    )
    result = await db.execute(stmt)
    inv = result.scalars().first()
    if not inv:
        return None

    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "customer": {
            "id": inv.customer.id,
            "name": inv.customer.name,
            "code": inv.customer.code,
            "email": inv.customer.email,
            "plan_tier": inv.customer.plan_tier
        } if inv.customer else None,
        "billing_period": inv.billing_period,
        "issue_date": inv.issue_date.strftime("%Y-%m-%d"),
        "due_date": inv.due_date.strftime("%Y-%m-%d"),
        "status": inv.status,
        "subtotal": str(inv.subtotal),
        "tax": str(inv.tax),
        "total_amount": str(inv.total_amount),
        "currency": inv.currency,
        "notes": inv.notes,
        "line_items": [
            {
                "id": li.id,
                "description": li.description,
                "quantity": str(li.quantity),
                "unit_price": str(li.unit_price),
                "total_amount": str(li.total_amount),
                "line_type": li.line_type,
                "pricing_tier_ref": li.pricing_tier_ref
            }
            for li in inv.line_items
        ],
        "payments": [
            {
                "id": p.id,
                "amount": str(p.amount),
                "payment_date": p.payment_date.strftime("%Y-%m-%d"),
                "status": p.status,
                "payment_method": p.payment_method,
                "reference_id": p.reference_id
            }
            for p in inv.payments
        ]
    }

async def compare_customer_invoices_tool(
    db: AsyncSession,
    customer_query: str,
    period_previous: Optional[str] = None,
    period_current: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deterministic comparison tool: Compares two consecutive or specified invoices for a customer.
    Runs Python Decimal arithmetic to identify exact line item shifts, rate variances, and volume variances.
    """
    invoices = await search_invoices_tool(db, customer_query=customer_query)
    if not invoices or len(invoices) < 2:
        return {
            "error": f"Need at least two invoices to compare for customer '{customer_query}'. Found {len(invoices)}."
        }

    # Find the requested periods or take the latest two
    curr_summary = None
    prev_summary = None

    if period_current and period_previous:
        for inv in invoices:
            if inv["billing_period"] == period_current:
                curr_summary = inv
            elif inv["billing_period"] == period_previous:
                prev_summary = inv
    else:
        # Sort by billing_period desc
        sorted_invs = sorted(invoices, key=lambda x: x["billing_period"], reverse=True)
        curr_summary = sorted_invs[0]
        prev_summary = sorted_invs[1]

    if not curr_summary or not prev_summary:
        return {
            "error": f"Could not find matching invoices for periods {period_previous} and {period_current}."
        }

    curr_detail = await get_invoice_details_tool(db, curr_summary["id"])
    prev_detail = await get_invoice_details_tool(db, prev_summary["id"])

    # Run deterministic calculation
    comparison_result = compare_invoices_deterministic(prev_detail, curr_detail)
    comparison_result["customer_name"] = curr_detail["customer"]["name"] if curr_detail.get("customer") else customer_query
    return comparison_result

async def get_overdue_invoices_tool(
    db: AsyncSession,
    customer_query: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Read-only tool: Identifies all overdue invoices, calculates outstanding balances and aging buckets.
    """
    overdue_invoices = await search_invoices_tool(db, customer_query=customer_query, status="OVERDUE")
    results = []

    for inv in overdue_invoices:
        detail = await get_invoice_details_tool(db, inv["id"])
        if detail:
            aging = calculate_aging_and_outstanding(detail, detail.get("payments", []))
            aging["customer_name"] = detail["customer"]["name"] if detail.get("customer") else "Unknown"
            aging["customer_email"] = detail["customer"]["email"] if detail.get("customer") else ""
            results.append(aging)

    return results
