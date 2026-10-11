from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.database import get_db
from backend.app.models import ActionProposal
from backend.app.schemas import (
    ActionProposalRead, ActionProposalCreate, ApprovalDecisionRequest
)
from backend.app.services.approval_service import (
    create_action_proposal, review_proposal
)

router = APIRouter(prefix="/api/proposals", tags=["Proposals & Approvals"])

@router.get("", response_model=List[ActionProposalRead])
async def list_proposals(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ActionProposal)
        .options(
            selectinload(ActionProposal.customer),
            selectinload(ActionProposal.invoice),
            selectinload(ActionProposal.approval)
        )
        .order_by(ActionProposal.created_at.desc())
    )
    if status:
        stmt = stmt.where(ActionProposal.status == status.upper())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=ActionProposalRead)
async def create_proposal_endpoint(
    req: ActionProposalCreate,
    db: AsyncSession = Depends(get_db)
):
    prop = await create_action_proposal(
        db=db,
        customer_id=req.customer_id,
        invoice_id=req.invoice_id,
        action_type=req.action_type,
        title=req.title,
        justification=req.justification,
        proposed_payload=req.proposed_payload
    )
    await db.commit()
    return prop

@router.post("/{proposal_id}/review")
async def review_proposal_endpoint(
    proposal_id: str,
    req: ApprovalDecisionRequest,
    db: AsyncSession = Depends(get_db)
):
    return await review_proposal(
        db=db,
        proposal_id=proposal_id,
        reviewer_name=req.reviewer_name,
        decision=req.decision,
        comment=req.comment
    )
