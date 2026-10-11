from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.schemas import AgentQueryRequest, AgentInvestigationResponse
from backend.app.agent.orchestrator import AgentOrchestrator
from backend.app.tools import TOOL_DEFINITIONS

router = APIRouter(prefix="/api/agent", tags=["AI Agent"])

@router.post("/query")
async def query_agent(
    req: AgentQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    orchestrator = AgentOrchestrator(db)
    return await orchestrator.run_investigation(
        query=req.query,
        session_id=req.session_id,
        customer_id=req.customer_id
    )

@router.get("/tools")
async def list_available_tools():
    return {
        "count": len(TOOL_DEFINITIONS),
        "tools": TOOL_DEFINITIONS
    }
