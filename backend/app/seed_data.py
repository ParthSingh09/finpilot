import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
from backend.app.database import engine, Base, AsyncSessionLocal
from backend.app.models import (
    Customer, Invoice, InvoiceLineItem, PricingRule, UsageEvent, Payment, AuditLog
)

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. CUSTOMERS
        acme = Customer(
            name="Acme Corp",
            code="CUST-ACME-001",
            email="billing@acme.com",
            billing_currency="INR",
            plan_tier="ENTERPRISE",
            payment_terms_days=30,
            status="ACTIVE"
        )
        stark = Customer(
            name="Stark Industries",
            code="CUST-STARK-002",
            email="finance@starkcorp.com",
            billing_currency="INR",
            plan_tier="PRO",
            payment_terms_days=15,
            status="ACTIVE"
        )
        nexus = Customer(
            name="Nexus Dynamics",
            code="CUST-NEXUS-003",
            email="accounts@nexusdynamics.io",
            billing_currency="INR",
            plan_tier="STARTER",
            payment_terms_days=30,
            status="ACTIVE"
        )
        globex = Customer(
            name="Globex Corp",
            code="CUST-GLOBEX-004",
            email="invoicing@globex.org",
            billing_currency="INR",
            plan_tier="PRO",
            payment_terms_days=30,
            status="ACTIVE"
        )

        session.add_all([acme, stark, nexus, globex])
        await session.flush()

        # 2. PRICING RULES (Contractual rules)
        # Acme: Enterprise Plan - Base 100,000, API calls overage at 0.18 INR
        rules = [
            PricingRule(
                customer_id=acme.id,
                plan_tier="ENTERPRISE",
                metric_name="api_calls",
                tier_name="Base Tier Included",
                min_units=Decimal("0"),
                max_units=Decimal("1000000"),
                unit_rate=Decimal("0.00"),
                currency="INR",
                description="First 1,000,000 API calls included in base contract"
            ),
            PricingRule(
                customer_id=acme.id,
                plan_tier="ENTERPRISE",
                metric_name="api_calls",
                tier_name="Overage Tier",
                min_units=Decimal("1000000"),
                max_units=None,
                unit_rate=Decimal("0.18"),
                currency="INR",
                description="Contracted API call overage rate: ₹0.18 per call"
            ),
            # Nexus: Starter Plan - 500 Compute Hours free, then 40 INR / hour
            PricingRule(
                customer_id=nexus.id,
                plan_tier="STARTER",
                metric_name="compute_hours",
                tier_name="Free Allowance",
                min_units=Decimal("0"),
                max_units=Decimal("500"),
                unit_rate=Decimal("0.00"),
                currency="INR",
                description="500 Compute Hours included for free in Starter Plan"
            ),
            PricingRule(
                customer_id=nexus.id,
                plan_tier="STARTER",
                metric_name="compute_hours",
                tier_name="Compute Overage",
                min_units=Decimal("500"),
                max_units=None,
                unit_rate=Decimal("40.00"),
                currency="INR",
                description="Compute hours over 500 billed at ₹40.00/hour"
            ),
            # Stark: Pro Plan - Base 50,000 + Storage 5 INR / GB
            PricingRule(
                customer_id=stark.id,
                plan_tier="PRO",
                metric_name="storage_gb",
                tier_name="Storage Standard",
                min_units=Decimal("0"),
                max_units=None,
                unit_rate=Decimal("5.00"),
                currency="INR",
                description="Standard storage rate: ₹5.00/GB"
            )
        ]
        session.add_all(rules)
        await session.flush()

        # 3. ACME INVOICES (September 2026 vs October 2026 - exactly ₹12,000 higher)
        # Sep 2026: Base ₹100,000 + 100k overage calls @ ₹0.18 = ₹18,000 -> Total ₹118,000
        inv_acme_sep = Invoice(
            customer_id=acme.id,
            invoice_number="INV-2026-SEP-0101",
            billing_period="2026-09",
            issue_date=datetime(2026, 9, 30),
            due_date=datetime(2026, 10, 30),
            status="PAID",
            subtotal=Decimal("118000.00"),
            tax=Decimal("0.00"),
            total_amount=Decimal("118000.00"),
            currency="INR",
            notes="September 2026 Regular Billing"
        )
        session.add(inv_acme_sep)
        await session.flush()

        session.add_all([
            InvoiceLineItem(
                invoice_id=inv_acme_sep.id,
                description="Enterprise Platform Base Subscription - Sep 2026",
                quantity=Decimal("1"),
                unit_price=Decimal("100000.00"),
                total_amount=Decimal("100000.00"),
                line_type="BASE_FEE",
                pricing_tier_ref="BASE_ENT"
            ),
            InvoiceLineItem(
                invoice_id=inv_acme_sep.id,
                description="API Calls Metered Overage (100,000 calls @ ₹0.18)",
                quantity=Decimal("100000"),
                unit_price=Decimal("0.18"),
                total_amount=Decimal("18000.00"),
                line_type="USAGE_TIER",
                pricing_tier_ref="Overage Tier"
            )
        ])

        # Oct 2026: Base ₹100,000 + 150k overage calls miscalculated @ ₹0.20 instead of contracted ₹0.18 = ₹30,000 -> Total ₹130,000
        # Notice: 130,000 - 118,000 = exactly ₹12,000 higher!
        # Legitimate usage change: +50k calls @ 0.18 = +₹9,000
        # Billing calculation rate error: 150k calls billed at 0.20 instead of 0.18 = +₹3,000 overcharge
        inv_acme_oct = Invoice(
            customer_id=acme.id,
            invoice_number="INV-2026-OCT-0102",
            billing_period="2026-10",
            issue_date=datetime(2026, 10, 5),
            due_date=datetime(2026, 11, 4),
            status="ISSUED",
            subtotal=Decimal("130000.00"),
            tax=Decimal("0.00"),
            total_amount=Decimal("130000.00"),
            currency="INR",
            notes="October 2026 Monthly Invoice"
        )
        session.add(inv_acme_oct)
        await session.flush()

        session.add_all([
            InvoiceLineItem(
                invoice_id=inv_acme_oct.id,
                description="Enterprise Platform Base Subscription - Oct 2026",
                quantity=Decimal("1"),
                unit_price=Decimal("100000.00"),
                total_amount=Decimal("100000.00"),
                line_type="BASE_FEE",
                pricing_tier_ref="BASE_ENT"
            ),
            InvoiceLineItem(
                invoice_id=inv_acme_oct.id,
                description="API Calls Metered Overage (150,000 calls billed @ ₹0.20)",
                quantity=Decimal("150000"),
                unit_price=Decimal("0.20"),  # Notice: Contract specifies 0.18!
                total_amount=Decimal("30000.00"),
                line_type="USAGE_TIER",
                pricing_tier_ref="Overage Tier"
            )
        ])

        # Sep payment for Acme
        session.add(Payment(
            invoice_id=inv_acme_sep.id,
            customer_id=acme.id,
            amount=Decimal("118000.00"),
            payment_date=datetime(2026, 10, 2),
            status="SUCCESS",
            payment_method="NEFT_TRANSFER",
            reference_id="TXN-ACME-SEP-994"
        ))

        # Acme Usage Events
        session.add_all([
            UsageEvent(
                customer_id=acme.id,
                metric_name="api_calls",
                event_timestamp=datetime(2026, 9, 28),
                quantity=Decimal("1100000"),  # 1.1M total = 100k overage
                billing_period="2026-09"
            ),
            UsageEvent(
                customer_id=acme.id,
                metric_name="api_calls",
                event_timestamp=datetime(2026, 10, 4),
                quantity=Decimal("1150000"),  # 1.15M total = 150k overage
                billing_period="2026-10"
            )
        ])

        # 4. STARK INDUSTRIES - OVERDUE INVOICE
        inv_stark_aug = Invoice(
            customer_id=stark.id,
            invoice_number="INV-2026-AUG-0089",
            billing_period="2026-08",
            issue_date=datetime(2026, 8, 15),
            due_date=datetime(2026, 8, 30),  # Well overdue!
            status="OVERDUE",
            subtotal=Decimal("85000.00"),
            tax=Decimal("0.00"),
            total_amount=Decimal("85000.00"),
            currency="INR",
            notes="Overdue invoice for August 2026"
        )
        session.add(inv_stark_aug)
        await session.flush()

        session.add(InvoiceLineItem(
            invoice_id=inv_stark_aug.id,
            description="Pro Plan Platform License + 7,000 GB Storage",
            quantity=Decimal("1"),
            unit_price=Decimal("85000.00"),
            total_amount=Decimal("85000.00"),
            line_type="BASE_FEE"
        ))

        # Stark made a partial payment of ₹40,000, leaving ₹45,000 unpaid!
        session.add(Payment(
            invoice_id=inv_stark_aug.id,
            customer_id=stark.id,
            amount=Decimal("40000.00"),
            payment_date=datetime(2026, 9, 10),
            status="SUCCESS",
            payment_method="BANK_WIRE",
            reference_id="TXN-STARK-PARTIAL-441"
        ))

        # 5. NEXUS DYNAMICS - PRICING RULE VIOLATION
        # Invoiced 800 hours @ ₹40 = ₹32,000, ignoring the 500 free tier allowance!
        inv_nexus_oct = Invoice(
            customer_id=nexus.id,
            invoice_number="INV-2026-OCT-0144",
            billing_period="2026-10",
            issue_date=datetime(2026, 10, 1),
            due_date=datetime(2026, 10, 31),
            status="DISPUTED",
            subtotal=Decimal("32000.00"),
            tax=Decimal("0.00"),
            total_amount=Decimal("32000.00"),
            currency="INR",
            notes="Client reported pricing discrepancy regarding free tier allowance"
        )
        session.add(inv_nexus_oct)
        await session.flush()

        session.add(InvoiceLineItem(
            invoice_id=inv_nexus_oct.id,
            description="Compute Hours (800 hours @ ₹40/hr)",
            quantity=Decimal("800"),
            unit_price=Decimal("40.00"),
            total_amount=Decimal("32000.00"),
            line_type="USAGE_TIER",
            pricing_tier_ref="Compute Overage"
        ))

        session.add(UsageEvent(
            customer_id=nexus.id,
            metric_name="compute_hours",
            event_timestamp=datetime(2026, 10, 1),
            quantity=Decimal("800"),
            billing_period="2026-10"
        ))

        # 6. GLOBEX - REGULAR PAID INVOICE
        inv_globex = Invoice(
            customer_id=globex.id,
            invoice_number="INV-2026-OCT-0091",
            billing_period="2026-10",
            issue_date=datetime(2026, 10, 1),
            due_date=datetime(2026, 10, 31),
            status="PAID",
            subtotal=Decimal("45000.00"),
            tax=Decimal("0.00"),
            total_amount=Decimal("45000.00"),
            currency="INR",
            notes="Standard subscription paid"
        )
        session.add(inv_globex)
        await session.flush()

        session.add(InvoiceLineItem(
            invoice_id=inv_globex.id,
            description="Pro Tier Monthly Base",
            quantity=Decimal("1"),
            unit_price=Decimal("45000.00"),
            total_amount=Decimal("45000.00"),
            line_type="BASE_FEE"
        ))

        session.add(Payment(
            invoice_id=inv_globex.id,
            customer_id=globex.id,
            amount=Decimal("45000.00"),
            payment_date=datetime(2026, 10, 5),
            status="SUCCESS",
            payment_method="CREDIT_CARD",
            reference_id="TXN-GLOBEX-OCT-112"
        ))

        # 7. INITIAL AUDIT LOG
        session.add(AuditLog(
            entity_type="SYSTEM",
            entity_id="SEED-INIT",
            action="INITIALIZED",
            performed_by="System Genesis",
            notes="Initialized financial database with Acme Corp, Stark Industries, Nexus Dynamics, and Globex Corp records."
        ))

        await session.commit()
        print("Database seeded successfully with all realistic financial scenarios!")

if __name__ == "__main__":
    asyncio.run(seed_database())
