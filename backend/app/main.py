from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from backend.app.database import engine, Base, AsyncSessionLocal
from backend.app.models import Customer
from backend.app.seed_data import seed_database
from backend.app.routers import invoices, customers, proposals, audit, agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed if database is fresh
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Customer))
        first_cust = res.scalars().first()
        if not first_cust:
            await seed_database()

    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="FinPilot — AI Finance Operations Agent API",
    description="Deterministic AI Agent backend for invoice discrepancy investigations, pricing compliance, and human-in-the-loop approvals.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoices.router)
app.include_router(customers.router)
app.include_router(proposals.router)
app.include_router(audit.router)
app.include_router(agent.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FinPilot Backend",
        "version": "1.0.0",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
