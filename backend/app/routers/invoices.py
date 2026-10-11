from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.tools.invoice_tools import (
    search_invoices_tool, get_invoice_details_tool,
    compare_customer_invoices_tool, get_overdue_invoices_tool
)

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("")
async def list_invoices(
    customer: Optional[str] = Query(None, description="Customer name or code filter"),
    status: Optional[str] = Query(None, description="Status filter"),
    billing_period: Optional[str] = Query(None, description="Billing period filter"),
    db: AsyncSession = Depends(get_db)
):
    return await search_invoices_tool(db, customer_query=customer, status=status, billing_period=billing_period)

@router.get("/overdue")
async def get_overdue(
    customer: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await get_overdue_invoices_tool(db, customer_query=customer)

@router.get("/compare")
async def compare_invoices(
    customer: str = Query(..., description="Customer name"),
    period_prev: Optional[str] = None,
    period_curr: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    result = await compare_customer_invoices_tool(db, customer_query=customer, period_previous=period_prev, period_current=period_curr)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db)
):
    detail = await get_invoice_details_tool(db, invoice_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return detail
