from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database import get_db
from backend.app.models import Customer
from backend.app.schemas import CustomerRead

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerRead])
async def list_customers(db: AsyncSession = Depends(get_db)):
    stmt = select(Customer).order_by(Customer.name.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(customer_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Customer).where(Customer.id == customer_id)
    result = await db.execute(stmt)
    customer = result.scalars().first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
