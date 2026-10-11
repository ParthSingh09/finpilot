from typing import Dict, Any, List
from backend.app.tools.invoice_tools import (
    search_invoices_tool, get_invoice_details_tool, 
    compare_customer_invoices_tool, get_overdue_invoices_tool
)
from backend.app.tools.usage_tools import get_customer_usage_tool
from backend.app.tools.pricing_tools import (
    get_pricing_rules_tool, audit_invoice_pricing_compliance_tool
)

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_invoices",
            "description": "Search invoices by customer name or code, status (PAID, ISSUED, OVERDUE, DISPUTED), or billing period.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_query": {"type": "string", "description": "Name or code of the customer (e.g., 'Acme Corp')"},
                    "status": {"type": "string", "description": "Filter by invoice status: PAID, ISSUED, OVERDUE, DISPUTED"},
                    "billing_period": {"type": "string", "description": "Billing period filter, e.g., '2026-10'"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_invoice_details",
            "description": "Fetch detailed line items, unit rates, quantities, and payment history for a specific invoice number or ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "invoice_number_or_id": {"type": "string", "description": "The invoice number (e.g. 'INV-2026-OCT-0102') or ID"}
                },
                "required": ["invoice_number_or_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_customer_invoices",
            "description": "Perform deterministic Python calculations comparing two invoices for a customer to explain month-over-month increases, line item variance, volume variance, and rate variance.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_query": {"type": "string", "description": "Name or code of the customer (e.g. 'Acme Corp')"},
                    "period_previous": {"type": "string", "description": "Previous billing period (e.g. '2026-09')"},
                    "period_current": {"type": "string", "description": "Current billing period (e.g. '2026-10')"}
                },
                "required": ["customer_query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_overdue_invoices",
            "description": "Retrieve all overdue customer invoices, calculating days overdue, aging bucket (1-30, 31-60, 61-90, 90+), and verified outstanding balances.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_query": {"type": "string", "description": "Optional customer name or code filter"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_usage",
            "description": "Retrieve metered usage records and aggregated consumption for a customer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_query": {"type": "string", "description": "Customer name or code"},
                    "billing_period": {"type": "string", "description": "Billing period (e.g. '2026-10')"},
                    "metric_name": {"type": "string", "description": "Metered metric name (e.g. 'api_calls', 'compute_hours')"}
                },
                "required": ["customer_query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_pricing_rules",
            "description": "Retrieve contracted pricing tiers, base fees, free allowances, and overage rates for a customer or plan.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_query": {"type": "string", "description": "Customer name or code"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "audit_invoice_pricing_compliance",
            "description": "Deterministically audit an invoice against the customer's contract pricing rules to detect unauthorized rate spikes or calculation errors.",
            "parameters": {
                "type": "object",
                "properties": {
                    "invoice_number_or_id": {"type": "string", "description": "The invoice number to audit"}
                },
                "required": ["invoice_number_or_id"]
            }
        }
    }
]

TOOL_REGISTRY = {
    "search_invoices": search_invoices_tool,
    "get_invoice_details": get_invoice_details_tool,
    "compare_customer_invoices": compare_customer_invoices_tool,
    "get_overdue_invoices": get_overdue_invoices_tool,
    "get_customer_usage": get_customer_usage_tool,
    "get_pricing_rules": get_pricing_rules_tool,
    "audit_invoice_pricing_compliance": audit_invoice_pricing_compliance_tool
}
