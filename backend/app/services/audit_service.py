from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models import AuditLog

async def create_audit_log(
    db: AsyncSession,
    entity_type: str,
    entity_id: str,
    action: str,
    performed_by: str,
    payload_before: Optional[Dict[str, Any]] = None,
    payload_after: Optional[Dict[str, Any]] = None,
    notes: Optional[str] = None
) -> AuditLog:
    """
    Creates an immutable audit log entry.
    """
    log_entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        performed_by=performed_by,
        payload_before=payload_before,
        payload_after=payload_after,
        notes=notes,
        timestamp=datetime.utcnow()
    )
    db.add(log_entry)
    await db.flush()
    return log_entry
