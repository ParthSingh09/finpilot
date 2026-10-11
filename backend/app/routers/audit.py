from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database import get_db
from backend.app.models import AuditLog
from backend.app.schemas import AuditLogRead

router = APIRouter(prefix="/api/audit", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogRead])
async def list_audit_logs(
    entity_type: Optional[str] = Query(None, description="Entity type filter (e.g. INVOICE, ACTION_PROPOSAL)"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc())
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type.upper())
    result = await db.execute(stmt)
    return result.scalars().all()
