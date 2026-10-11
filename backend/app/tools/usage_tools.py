from typing import Optional, List, Dict, Any
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from backend.app.models import Customer, UsageEvent

async def get_customer_usage_tool(
    db: AsyncSession,
    customer_query: str,
    billing_period: Optional[str] = None,
    metric_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Read-only tool: Fetches metered usage events for a customer and aggregates totals deterministically.
    """
    # Find customer
    cust_stmt = select(Customer).where(
        or_(
            Customer.name.ilike(f"%{customer_query}%"),
            Customer.code.ilike(f"%{customer_query}%")
        )
    )
    cust_res = await db.execute(cust_stmt)
    customer = cust_res.scalars().first()
    if not customer:
        return {"error": f"Customer '{customer_query}' not found."}

    stmt = select(UsageEvent).where(UsageEvent.customer_id == customer.id)
    if billing_period:
        stmt = stmt.where(UsageEvent.billing_period == billing_period)
    if metric_name:
        stmt = stmt.where(UsageEvent.metric_name == metric_name)

    stmt = stmt.order_by(UsageEvent.event_timestamp.desc())
    res = await db.execute(stmt)
    events = res.scalars().all()

    # Aggregate by metric and period
    aggregation: Dict[str, Decimal] = {}
    for ev in events:
        key = f"{ev.billing_period}::{ev.metric_name}"
        aggregation[key] = aggregation.get(key, Decimal("0")) + Decimal(str(ev.quantity))

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "total_event_records": len(events),
        "aggregated_usage": [
            {
                "billing_period": k.split("::")[0],
                "metric_name": k.split("::")[1],
                "total_quantity": str(v)
            }
            for k, v in aggregation.items()
        ],
        "events": [
            {
                "id": ev.id,
                "metric_name": ev.metric_name,
                "timestamp": ev.event_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "quantity": str(ev.quantity),
                "billing_period": ev.billing_period
            }
            for ev in events
        ]
    }
