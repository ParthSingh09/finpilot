from datetime import datetime
from decimal import Decimal
import uuid
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, 
    Numeric, Integer, JSON, Boolean, Index
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    code = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False)
    billing_currency = Column(String(10), default="INR")
    plan_tier = Column(String(64), default="ENTERPRISE")  # STARTER, PRO, ENTERPRISE
    payment_terms_days = Column(Integer, default=30)
    status = Column(String(32), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    invoices = relationship("Invoice", back_populates="customer", cascade="all, delete-orphan")
    usage_events = relationship("UsageEvent", back_populates="customer", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="customer", cascade="all, delete-orphan")
    action_proposals = relationship("ActionProposal", back_populates="customer")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    invoice_number = Column(String(64), unique=True, nullable=False, index=True)
    billing_period = Column(String(32), nullable=False, index=True)  # e.g., "2026-09", "2026-10"
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(32), default="ISSUED", index=True)  # DRAFT, ISSUED, PAID, OVERDUE, DISPUTED, ADJUSTED
    
    # Accurate Decimal precision
    subtotal = Column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    tax = Column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    total_amount = Column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="invoices")
    line_items = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice")
    action_proposals = relationship("ActionProposal", back_populates="invoice")

class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    quantity = Column(Numeric(18, 4), default=Decimal("1.0000"), nullable=False)
    unit_price = Column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    total_amount = Column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    line_type = Column(String(32), default="BASE_FEE")  # BASE_FEE, USAGE_TIER, ADDON, DISCOUNT, ADJUSTMENT
    pricing_tier_ref = Column(String(64), nullable=True)
    metadata_json = Column(JSON, nullable=True)

    invoice = relationship("Invoice", back_populates="line_items")

class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True, index=True)  # null = default
    plan_tier = Column(String(64), nullable=False)
    metric_name = Column(String(64), nullable=False, index=True)  # api_calls, compute_hours, storage_gb
    tier_name = Column(String(64), nullable=False)  # Tier 1, Overage
    min_units = Column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    max_units = Column(Numeric(18, 4), nullable=True)  # Null if unbounded
    unit_rate = Column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    description = Column(String(255), nullable=True)

class UsageEvent(Base):
    __tablename__ = "usage_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    metric_name = Column(String(64), nullable=False, index=True)
    event_timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    quantity = Column(Numeric(18, 4), nullable=False)
    billing_period = Column(String(32), nullable=False, index=True)
    raw_payload = Column(JSON, nullable=True)

    customer = relationship("Customer", back_populates="usage_events")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    amount = Column(Numeric(18, 4), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, PENDING, FAILED
    payment_method = Column(String(64), default="BANK_TRANSFER")
    reference_id = Column(String(128), nullable=True)

    invoice = relationship("Invoice", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")

class AgentSession(Base):
    __tablename__ = "agent_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), default="Finance Investigation Session")
    customer_filter = Column(String(36), nullable=True)
    status = Column(String(32), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    runs = relationship("AgentRun", back_populates="session", cascade="all, delete-orphan")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("agent_sessions.id"), nullable=False, index=True)
    user_query = Column(Text, nullable=False)
    status = Column(String(32), default="COMPLETED")  # RUNNING, COMPLETED, FAILED, AWAITING_APPROVAL
    final_answer = Column(Text, nullable=True)
    explanation_structured = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    session = relationship("AgentSession", back_populates="runs")
    tool_calls = relationship("ToolCall", back_populates="run", cascade="all, delete-orphan")
    proposals = relationship("ActionProposal", back_populates="run")

class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=False, index=True)
    tool_name = Column(String(128), nullable=False, index=True)
    tool_input = Column(JSON, nullable=False)
    tool_output = Column(JSON, nullable=True)
    execution_time_ms = Column(Integer, default=0)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, ERROR
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("AgentRun", back_populates="tool_calls")

class ActionProposal(Base):
    __tablename__ = "action_proposals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=True, index=True)
    action_type = Column(String(64), nullable=False)  # INVOICE_ADJUSTMENT, PAYMENT_REMINDER, WAIVE_LATE_FEE, RECALCULATE_PRICING
    title = Column(String(255), nullable=False)
    justification = Column(Text, nullable=False)
    proposed_payload = Column(JSON, nullable=False)
    status = Column(String(32), default="PENDING", index=True)  # PENDING, APPROVED, REJECTED, EXECUTED
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="action_proposals")
    invoice = relationship("Invoice", back_populates="action_proposals")
    run = relationship("AgentRun", back_populates="proposals")
    approval = relationship("Approval", uselist=False, back_populates="proposal")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    proposal_id = Column(String(36), ForeignKey("action_proposals.id"), unique=True, nullable=False)
    reviewer_name = Column(String(128), nullable=False)
    decision = Column(String(32), nullable=False)  # APPROVED, REJECTED
    comment = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    proposal = relationship("ActionProposal", back_populates="approval")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(64), nullable=False, index=True)  # INVOICE, PROPOSAL, APPROVAL, AGENT_ACTION
    entity_id = Column(String(64), nullable=False, index=True)
    action = Column(String(64), nullable=False)  # CREATED, PROPOSED, APPROVED, REJECTED, EXECUTED, ADJUSTED
    performed_by = Column(String(128), nullable=False)  # "FinPilot Agent", "Finance Manager (Parth)"
    payload_before = Column(JSON, nullable=True)
    payload_after = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
