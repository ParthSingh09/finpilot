from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- CUSTOMER SCHEMAS ---
class CustomerBase(BaseModel):
    name: str
    code: str
    email: str
    billing_currency: str = "INR"
    plan_tier: str = "ENTERPRISE"
    payment_terms_days: int = 30
    status: str = "ACTIVE"

class CustomerRead(CustomerBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- LINE ITEM SCHEMAS ---
class InvoiceLineItemBase(BaseModel):
    description: str
    quantity: Decimal
    unit_price: Decimal
    total_amount: Decimal
    line_type: str = "BASE_FEE"
    pricing_tier_ref: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class InvoiceLineItemRead(InvoiceLineItemBase):
    id: str
    invoice_id: str

    class Config:
        from_attributes = True

# --- INVOICE SCHEMAS ---
class InvoiceBase(BaseModel):
    customer_id: str
    invoice_number: str
    billing_period: str
    issue_date: datetime
    due_date: datetime
    status: str = "ISSUED"
    subtotal: Decimal
    tax: Decimal
    total_amount: Decimal
    currency: str = "INR"
    notes: Optional[str] = None

class InvoiceRead(InvoiceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InvoiceDetailRead(InvoiceRead):
    customer: Optional[CustomerRead] = None
    line_items: List[InvoiceLineItemRead] = []

    class Config:
        from_attributes = True

# --- PRICING RULES SCHEMAS ---
class PricingRuleRead(BaseModel):
    id: str
    customer_id: Optional[str] = None
    plan_tier: str
    metric_name: str
    tier_name: str
    min_units: Decimal
    max_units: Optional[Decimal] = None
    unit_rate: Decimal
    currency: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# --- USAGE SCHEMAS ---
class UsageEventRead(BaseModel):
    id: str
    customer_id: str
    metric_name: str
    event_timestamp: datetime
    quantity: Decimal
    billing_period: str
    raw_payload: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- PAYMENT SCHEMAS ---
class PaymentRead(BaseModel):
    id: str
    invoice_id: str
    customer_id: str
    amount: Decimal
    payment_date: datetime
    status: str
    payment_method: str
    reference_id: Optional[str] = None

    class Config:
        from_attributes = True

# --- AUDIT LOG SCHEMAS ---
class AuditLogRead(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    action: str
    performed_by: str
    payload_before: Optional[Dict[str, Any]] = None
    payload_after: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- ACTION PROPOSALS & APPROVALS ---
class ActionProposalCreate(BaseModel):
    customer_id: str
    invoice_id: Optional[str] = None
    action_type: str
    title: str
    justification: str
    proposed_payload: Dict[str, Any]

class ApprovalDecisionRequest(BaseModel):
    reviewer_name: str = "Finance Lead"
    decision: str  # "APPROVED" or "REJECTED"
    comment: Optional[str] = None

class ApprovalRead(BaseModel):
    id: str
    proposal_id: str
    reviewer_name: str
    decision: str
    comment: Optional[str] = None
    reviewed_at: datetime

    class Config:
        from_attributes = True

class ActionProposalRead(BaseModel):
    id: str
    run_id: Optional[str] = None
    customer_id: str
    invoice_id: Optional[str] = None
    action_type: str
    title: str
    justification: str
    proposed_payload: Dict[str, Any]
    status: str
    created_at: datetime
    executed_at: Optional[datetime] = None
    approval: Optional[ApprovalRead] = None
    customer: Optional[CustomerRead] = None
    invoice: Optional[InvoiceRead] = None

    class Config:
        from_attributes = True

# --- AGENT SCHEMAS ---
class AgentQueryRequest(BaseModel):
    session_id: Optional[str] = None
    query: str
    customer_id: Optional[str] = None

class ToolCallLog(BaseModel):
    tool_name: str
    tool_input: Dict[str, Any]
    tool_output: Any
    execution_time_ms: int
    status: str
    error: Optional[str] = None

class EvidenceCard(BaseModel):
    title: str
    evidence_type: str  # INVOICE_DELTA, USAGE_SPIKE, PRICING_MISMATCH, OVERDUE_STATUS
    summary: str
    details: Dict[str, Any]
    verified_by_python: bool = True

class AgentInvestigationResponse(BaseModel):
    run_id: str
    session_id: str
    query: str
    status: str
    final_answer: str
    tool_calls: List[ToolCallLog] = []
    evidence_cards: List[EvidenceCard] = []
    recommended_proposal: Optional[ActionProposalRead] = None
    created_at: datetime
