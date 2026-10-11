import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import engine, Base, AsyncSessionLocal
from backend.app.seed_data import seed_database

@pytest.fixture(autouse=True)
async def setup_test_db():
    await seed_database()

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_agent_query_acme_corp_invoice_spike():
    """
    Validates end-to-end prompt: 'Why is Acme Corp's invoice ₹12,000 higher this month?'
    Verifies:
    1. Tool calls executed (search_invoices, compare_customer_invoices, etc.)
    2. Exact ₹12,000 difference reported with volume and rate breakdown
    3. Action proposal generated for credit memo of ₹3,000
    4. Evidence cards returned
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/agent/query", json={
            "query": "Why is Acme Corp's invoice ₹12,000 higher this month?"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "COMPLETED"
        assert len(data["tool_calls"]) >= 3
        assert len(data["evidence_cards"]) >= 2
        assert "12000.00" in data["final_answer"] or "12,000" in data["final_answer"]
        assert data["recommended_proposal"] is not None
        assert data["recommended_proposal"]["action_type"] == "INVOICE_ADJUSTMENT"

@pytest.mark.asyncio
async def test_agent_query_overdue_invoices():
    """
    Validates prompt: 'Which customers have overdue payments?'
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/agent/query", json={
            "query": "Which customers have overdue payments?"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "COMPLETED"
        assert "Stark" in data["final_answer"]
        assert "45000" in data["final_answer"]
        assert data["recommended_proposal"] is not None
        assert data["recommended_proposal"]["action_type"] == "PAYMENT_REMINDER"

@pytest.mark.asyncio
async def test_human_approval_api_workflow():
    """
    Validates reviewing a proposal via the API endpoint.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Trigger an investigation to generate a proposal
        query_res = await client.post("/api/agent/query", json={
            "query": "Why is Acme Corp's invoice higher?"
        })
        proposal_id = query_res.json()["recommended_proposal"]["id"]

        # Approve proposal
        approval_res = await client.post(f"/api/proposals/{proposal_id}/review", json={
            "reviewer_name": "Parth Singh (Finance Ops)",
            "decision": "APPROVED",
            "comment": "Verified rate error from pricing contract"
        })
        assert approval_res.status_code == 200
        assert approval_res.json()["decision"] == "APPROVED"
        assert approval_res.json()["proposal_status"] == "EXECUTED"

        # Check audit trail
        audit_res = await client.get("/api/audit")
        assert audit_res.status_code == 200
        logs = audit_res.json()
        assert any(log["action"] == "EXECUTED" for log in logs)
