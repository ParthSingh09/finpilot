from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from backend.app.models import Customer, PricingRule
from backend.app.tools.invoice_tools import get_invoice_details_tool
from backend.app.tools.calculations import audit_pricing_compliance_deterministic

async def get_pricing_rules_tool(
    db: AsyncSession,
    customer_query: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Read-only tool: Retrieves applicable contract pricing rules and tier thresholds.
    """
    stmt = select(PricingRule)
    if customer_query:
        cust_sub = select(Customer.id).where(
            or_(
                Customer.name.ilike(f"%{customer_query}%"),
                Customer.code.ilike(f"%{customer_query}%")
            )
        )
        stmt = stmt.where(or_(PricingRule.customer_id.in_(cust_sub), PricingRule.customer_id.is_(None)))

    res = await db.execute(stmt)
    rules = res.scalars().all()

    return [
        {
            "id": r.id,
            "plan_tier": r.plan_tier,
            "metric_name": r.metric_name,
            "tier_name": r.tier_name,
            "min_units": str(r.min_units),
            "max_units": str(r.max_units) if r.max_units else None,
            "unit_rate": str(r.unit_rate),
            "currency": r.currency,
            "description": r.description
        }
        for r in rules
    ]

async def audit_invoice_pricing_compliance_tool(
    db: AsyncSession,
    invoice_number_or_id: str
) -> Dict[str, Any]:
    """
    Audit tool: Verifies that every line item in an invoice strictly complies with contracted rates.
    Identifies pricing discrepancies, unauthorized rate inflations, or missed discounts.
    """
    invoice_detail = await get_invoice_details_tool(db, invoice_number_or_id)
    if not invoice_detail:
        return {"error": f"Invoice '{invoice_number_or_id}' not found."}

    customer_id = invoice_detail["customer"]["id"] if invoice_detail.get("customer") else None
    rules = await get_pricing_rules_tool(db, customer_query=invoice_detail["customer"]["name"] if invoice_detail.get("customer") else None)

    # Deterministic compliance verification
    audit_result = audit_pricing_compliance_deterministic(
        invoice_data=invoice_detail,
        contract_rules=rules,
        usage_events=[]
    )
    audit_result["customer_name"] = invoice_detail["customer"]["name"] if invoice_detail.get("customer") else "Unknown"
    return audit_result
