from decimal import Decimal
from backend.app.tools.calculations import (
    compare_invoices_deterministic,
    audit_pricing_compliance_deterministic,
    calculate_aging_and_outstanding
)

def test_acme_corp_deterministic_invoice_comparison():
    """
    Validates that comparing Acme Corp Sep and Oct invoices yields:
    - Exactly ₹12,000.00 total delta (from ₹118,000 to ₹130,000)
    - Separates volume variance from rate variance deterministically.
    """
    sep_invoice = {
        "invoice_number": "INV-2026-SEP-0101",
        "billing_period": "2026-09",
        "total_amount": "118000.00",
        "currency": "INR",
        "line_items": [
            {
                "description": "Enterprise Platform Base Subscription",
                "quantity": "1",
                "unit_price": "100000.00",
                "total_amount": "100000.00"
            },
            {
                "description": "API Calls Metered Overage",
                "quantity": "100000",
                "unit_price": "0.18",
                "total_amount": "18000.00"
            }
        ]
    }

    oct_invoice = {
        "invoice_number": "INV-2026-OCT-0102",
        "billing_period": "2026-10",
        "total_amount": "130000.00",
        "currency": "INR",
        "line_items": [
            {
                "description": "Enterprise Platform Base Subscription",
                "quantity": "1",
                "unit_price": "100000.00",
                "total_amount": "100000.00"
            },
            {
                "description": "API Calls Metered Overage",
                "quantity": "150000",
                "unit_price": "0.20",
                "total_amount": "30000.00"
            }
        ]
    }

    result = compare_invoices_deterministic(sep_invoice, oct_invoice)

    assert result["total_delta"] == "12000.00"
    assert result["previous_total"] == "118000.00"
    assert result["current_total"] == "130000.00"
    assert result["percentage_change"] == "10.17%"
    
    # Check line item breakdown
    overage_item = next(item for item in result["line_itemBreakdown"] if item["item_name"] == "API Calls Metered Overage") if "line_itemBreakdown" in result else next(item for item in result["line_item_breakdown"] if item["item_name"] == "API Calls Metered Overage")
    assert overage_item["quantity_delta"] == "50000"
    assert overage_item["unit_price_delta"] == "0.02"
    assert overage_item["total_delta"] == "12000.00"
    # Volume variance = 50,000 * 0.18 = 9,000.00
    assert overage_item["volume_variance"] == "9000.00"
    # Rate variance = 150,000 * 0.02 = 3,000.00
    assert overage_item["rate_variance"] == "3000.00"

def test_audit_pricing_compliance_rate_mismatch():
    """
    Validates that a rate discrepancy (billed 0.20 vs contract 0.18) is flagged deterministically.
    """
    invoice_data = {
        "invoice_number": "INV-2026-OCT-0102",
        "currency": "INR",
        "line_items": [
            {
                "description": "API Calls Metered Overage",
                "quantity": "150000",
                "unit_price": "0.20",
                "total_amount": "30000.00",
                "pricing_tier_ref": "Overage Tier"
            }
        ]
    }

    contract_rules = [
        {
            "tier_name": "Overage Tier",
            "metric_name": "api_calls",
            "unit_rate": "0.18",
            "description": "Agreed contract overage rate: ₹0.18"
        }
    ]

    result = audit_pricing_compliance_deterministic(invoice_data, contract_rules, [])
    assert result["has_discrepancies"] is True
    assert result["discrepancy_count"] == 1
    assert result["total_discrepancy_amount"] == "3000.00"
    assert result["discrepancies"][0]["billed_unit_rate"] == "0.20"
    assert result["discrepancies"][0]["contracted_unit_rate"] == "0.18"

def test_calculate_aging_and_outstanding():
    """
    Validates outstanding balance calculation and overdue aging.
    """
    from datetime import datetime
    invoice_data = {
        "invoice_number": "INV-2026-AUG-0089",
        "total_amount": "85000.00",
        "due_date": "2026-08-30T00:00:00",
        "currency": "INR"
    }
    payments = [
        {"amount": "40000.00", "status": "SUCCESS"}
    ]
    as_of = datetime(2026, 10, 11)
    aging = calculate_aging_and_outstanding(invoice_data, payments, as_of_date=as_of)

    assert aging["total_amount"] == "85000.00"
    assert aging["paid_amount"] == "40000.00"
    assert aging["outstanding_balance"] == "45000.00"
    assert aging["is_overdue"] is True
    assert aging["days_overdue"] == 42
    assert aging["aging_bucket"] == "31-60 DAYS"
