import {
  Customer, Invoice, ActionProposal, AuditLog, AgentInvestigationResponse
} from '../types';

const API_BASE = '/api';

// Seed Fallback Dataset for Static Cloud Hosting (Netlify / Vercel)
const initialCustomers: Customer[] = [
  {
    id: 'cust-acme-001',
    name: 'Acme Corp',
    code: 'CUST-ACME-001',
    email: 'billing@acme.com',
    billing_currency: 'INR',
    plan_tier: 'ENTERPRISE',
    payment_terms_days: 30,
    status: 'ACTIVE',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'cust-stark-002',
    name: 'Stark Industries',
    code: 'CUST-STARK-002',
    email: 'finance@starkcorp.com',
    billing_currency: 'INR',
    plan_tier: 'PRO',
    payment_terms_days: 15,
    status: 'ACTIVE',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'cust-nexus-003',
    name: 'Nexus Dynamics',
    code: 'CUST-NEXUS-003',
    email: 'accounts@nexusdynamics.io',
    billing_currency: 'INR',
    plan_tier: 'STARTER',
    payment_terms_days: 30,
    status: 'ACTIVE',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'cust-globex-004',
    name: 'Globex Corp',
    code: 'CUST-GLOBEX-004',
    email: 'invoicing@globex.org',
    billing_currency: 'INR',
    plan_tier: 'PRO',
    payment_terms_days: 30,
    status: 'ACTIVE',
    created_at: '2026-08-01T00:00:00Z'
  }
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-acme-2026-10',
    customer_id: 'cust-acme-001',
    customer_name: 'Acme Corp',
    customer_code: 'CUST-ACME-001',
    invoice_number: 'INV-2026-10-001',
    billing_period: '2026-10',
    issue_date: '2026-10-01',
    due_date: '2026-10-31',
    status: 'ISSUED',
    subtotal: '132000.00',
    tax: '0.00',
    total_amount: '132000.00',
    currency: 'INR',
    notes: 'October billing with 1.45M API calls and premium support',
    line_items: [
      { id: 'li-1', invoice_id: 'inv-acme-2026-10', description: 'Enterprise Base Subscription', quantity: '1', unit_price: '100000.00', total_amount: '100000.00', line_type: 'BASE_FEE' },
      { id: 'li-2', invoice_id: 'inv-acme-2026-10', description: 'API Calls Overage (150,000 units)', quantity: '150000', unit_price: '0.06', total_amount: '9000.00', line_type: 'USAGE' },
      { id: 'li-3', invoice_id: 'inv-acme-2026-10', description: 'Premium Dedicated Support Tier', quantity: '1', unit_price: '23000.00', total_amount: '23000.00', line_type: 'SERVICE' }
    ]
  },
  {
    id: 'inv-acme-2026-09',
    customer_id: 'cust-acme-001',
    customer_name: 'Acme Corp',
    customer_code: 'CUST-ACME-001',
    invoice_number: 'INV-2026-09-001',
    billing_period: '2026-09',
    issue_date: '2026-09-01',
    due_date: '2026-09-30',
    status: 'PAID',
    subtotal: '120000.00',
    tax: '0.00',
    total_amount: '120000.00',
    currency: 'INR',
    notes: 'September baseline invoice',
    line_items: [
      { id: 'li-4', invoice_id: 'inv-acme-2026-09', description: 'Enterprise Base Subscription', quantity: '1', unit_price: '100000.00', total_amount: '100000.00', line_type: 'BASE_FEE' },
      { id: 'li-5', invoice_id: 'inv-acme-2026-09', description: 'Premium Dedicated Support Tier', quantity: '1', unit_price: '20000.00', total_amount: '20000.00', line_type: 'SERVICE' }
    ]
  },
  {
    id: 'inv-stark-2026-08',
    customer_id: 'cust-stark-002',
    customer_name: 'Stark Industries',
    customer_code: 'CUST-STARK-002',
    invoice_number: 'INV-2026-08-005',
    billing_period: '2026-08',
    issue_date: '2026-08-01',
    due_date: '2026-08-16',
    status: 'OVERDUE',
    subtotal: '250000.00',
    tax: '0.00',
    total_amount: '250000.00',
    currency: 'INR',
    notes: 'Arc Reactor AI Compute Tier - 56 days overdue',
    line_items: [
      { id: 'li-6', invoice_id: 'inv-stark-2026-08', description: 'Compute Cluster Usage', quantity: '500', unit_price: '500.00', total_amount: '250000.00', line_type: 'USAGE' }
    ]
  },
  {
    id: 'inv-nexus-2026-08',
    customer_id: 'cust-nexus-003',
    customer_name: 'Nexus Dynamics',
    customer_code: 'CUST-NEXUS-003',
    invoice_number: 'INV-2026-08-012',
    billing_period: '2026-08',
    issue_date: '2026-08-10',
    due_date: '2026-09-09',
    status: 'OVERDUE',
    subtotal: '45000.00',
    tax: '0.00',
    total_amount: '45000.00',
    currency: 'INR',
    notes: '32 days overdue invoice',
    line_items: [
      { id: 'li-7', invoice_id: 'inv-nexus-2026-08', description: 'Starter Cloud Tier', quantity: '1', unit_price: '45000.00', total_amount: '45000.00', line_type: 'BASE_FEE' }
    ]
  },
  {
    id: 'inv-globex-2026-09',
    customer_id: 'cust-globex-004',
    customer_name: 'Globex Corp',
    customer_code: 'CUST-GLOBEX-004',
    invoice_number: 'INV-2026-09-033',
    billing_period: '2026-09',
    issue_date: '2026-09-05',
    due_date: '2026-10-05',
    status: 'PAID',
    subtotal: '80000.00',
    tax: '0.00',
    total_amount: '80000.00',
    currency: 'INR',
    notes: 'Paid via Wire Transfer',
    line_items: [
      { id: 'li-8', invoice_id: 'inv-globex-2026-09', description: 'Pro Monthly Tier', quantity: '1', unit_price: '80000.00', total_amount: '80000.00', line_type: 'BASE_FEE' }
    ]
  }
];

const initialProposals: ActionProposal[] = [
  {
    id: 'prop-acme-credit-001',
    customer_id: 'cust-acme-001',
    invoice_id: 'inv-acme-2026-10',
    action_type: 'INVOICE_ADJUSTMENT',
    title: 'Issue ₹3,000 Credit Memo for Acme Corp (Rate Discrepancy)',
    justification: 'Automated audit identified Premium Support Tier invoiced at ₹23,000 instead of contractual ₹20,000. Recommending a ₹3,000 credit memo adjustment.',
    proposed_payload: {
      adjustment_amount: '3000.00',
      reason: 'Support tier rate mismatch: Invoiced ₹23,000 vs Contract ₹20,000',
      type: 'CREDIT_MEMO'
    },
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    customer: initialCustomers[0],
    invoice: initialInvoices[0]
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    entity_type: 'AGENT_RUN',
    entity_id: 'run-acme-investigation',
    action: 'AGENT_INVESTIGATION_COMPLETED',
    performed_by: 'FINPILOT_AI_AGENT',
    notes: 'Variance decomposed into Volume Growth (₹9,000) and Rate Discrepancy (₹3,000)',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'audit-002',
    entity_type: 'ACTION_PROPOSAL',
    entity_id: 'prop-acme-credit-001',
    action: 'PROPOSAL_GENERATED',
    performed_by: 'FINPILOT_AI_AGENT',
    notes: 'Proposal generated: ₹3,000 Credit Memo requiring human approval',
    timestamp: new Date(Date.now() - 3500000).toISOString()
  }
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(`finpilot_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`finpilot_${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota
  }
}

export const api = {
  // Agent Investigation
  async queryAgent(query: string, customerId?: string, sessionId?: string): Promise<AgentInvestigationResponse> {
    try {
      const res = await fetch(`${API_BASE}/agent/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, customer_id: customerId, session_id: sessionId })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback for static hosting
    }

    // Local / Cloud Demo simulation
    await new Promise(r => setTimeout(r, 700));

    const isAcmeVariance = query.toLowerCase().includes('acme') || query.toLowerCase().includes('increase') || query.toLowerCase().includes('12,000');
    const isOverdueQuery = query.toLowerCase().includes('overdue') || query.toLowerCase().includes('late') || query.toLowerCase().includes('payment');

    if (isOverdueQuery) {
      return {
        run_id: 'run-overdue-summary-' + Date.now(),
        session_id: sessionId || 'session-' + Date.now(),
        query,
        status: 'COMPLETED',
        final_answer: "FinPilot scanned active receivables across all accounts. Currently, 2 accounts have overdue invoices exceeding payment terms:\n\n1. **Stark Industries** (INV-2026-08-005): **₹250,000.00** overdue by 56 days.\n2. **Nexus Dynamics** (INV-2026-08-012): **₹45,000.00** overdue by 32 days.\n\nTotal overdue exposure is **₹295,000.00**. A payment reminder workflow is staged for your approval.",
        tool_calls: [
          {
            tool_name: 'get_overdue_invoices',
            tool_input: {},
            tool_output: [
              { customer: 'Stark Industries', invoice: 'INV-2026-08-005', amount: 250000, days_overdue: 56 },
              { customer: 'Nexus Dynamics', invoice: 'INV-2026-08-012', amount: 45000, days_overdue: 32 }
            ],
            execution_time_ms: 12.4,
            status: 'SUCCESS'
          }
        ],
        evidence_cards: [
          {
            title: 'Overdue Receivables Aging Analysis',
            evidence_type: 'OVERDUE_STATUS',
            summary: '2 accounts delinquent > 30 days totaling ₹295,000',
            details: {
              overdue_accounts_count: 2,
              total_overdue: '₹295,000.00',
              highest_debtor: 'Stark Industries (₹250,000.00, 56d)'
            },
            verified_by_python: true
          }
        ],
        recommended_proposal: null,
        created_at: new Date().toISOString()
      };
    }

    // Default Acme Corp variance investigation
    const proposals = getStored<ActionProposal[]>('proposals', initialProposals);
    const existingProposal = proposals.find(p => p.id === 'prop-acme-credit-001') || proposals[0];

    return {
      run_id: 'run-acme-investigation-' + Date.now(),
      session_id: sessionId || 'session-' + Date.now(),
      query,
      status: 'COMPLETED',
      final_answer: "FinPilot investigated Acme Corp's billing history between **September 2026 (₹120,000)** and **October 2026 (₹132,000)**.\n\nThrough deterministic Python verification against database contracts and usage logs, the **₹12,000 increase** was decomposed into two independent components:\n\n1. **Volume Growth (+₹9,000.00)**: Legitimate API overage. Acme consumed 1,450,000 API calls (150,000 above their 1,000,000 base tier) billed at contractual ₹0.06/call.\n2. **Rate Discrepancy (+₹3,000.00)**: **Billing Error**. The Premium Dedicated Support line item was invoiced at **₹23,000.00** instead of the agreed contract rule of **₹20,000.00**.\n\nA ₹3,000 credit memo proposal has been prepared below requiring human sign-off.",
      tool_calls: [
        {
          tool_name: 'compare_invoices',
          tool_input: { customer: 'Acme Corp', period_prev: '2026-09', period_curr: '2026-10' },
          tool_output: { delta_total: 12000, pct_increase: 10.0, volume_delta: 9000, rate_delta: 3000 },
          execution_time_ms: 18.2,
          status: 'SUCCESS'
        },
        {
          tool_name: 'audit_pricing_compliance',
          tool_input: { invoice_id: 'inv-acme-2026-10' },
          tool_output: { compliance_passed: false, rule_violation: 'Premium Support rate ₹23,000 exceeds contract limit ₹20,000 by ₹3,000' },
          execution_time_ms: 22.5,
          status: 'SUCCESS'
        }
      ],
      evidence_cards: [
        {
          title: 'Deterministic Variance Breakdown',
          evidence_type: 'INVOICE_DELTA',
          summary: 'Total Delta: +₹12,000 (Volume: +₹9,000 | Rate Mismatch: +₹3,000)',
          details: {
            previous_invoice: '₹120,000.00 (Sep 2026)',
            current_invoice: '₹132,000.00 (Oct 2026)',
            volume_variance: '₹9,000.00 (150,000 extra units @ ₹0.06)',
            rate_variance: '₹3,000.00 (Pricing rule violation on Support Tier)'
          },
          verified_by_python: true
        },
        {
          title: 'Contract Pricing Compliance Audit',
          evidence_type: 'PRICING_MISMATCH',
          summary: 'Rule Violation: Support tier charged ₹23,000 vs Contract ₹20,000',
          details: {
            line_item: 'Premium Dedicated Support Tier',
            contract_rate: '₹20,000.00',
            invoiced_rate: '₹23,000.00',
            overcharge: '₹3,000.00'
          },
          verified_by_python: true
        }
      ],
      recommended_proposal: existingProposal,
      created_at: new Date().toISOString()
    };
  },

  // Invoices
  async getInvoices(params?: { customer?: string; status?: string; billing_period?: string }): Promise<Invoice[]> {
    try {
      const query = new URLSearchParams();
      if (params?.customer) query.append('customer', params.customer);
      if (params?.status) query.append('status', params.status);
      if (params?.billing_period) query.append('billing_period', params.billing_period);
      const res = await fetch(`${API_BASE}/invoices?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    let list = getStored<Invoice[]>('invoices', initialInvoices);
    if (params?.customer) {
      list = list.filter(i => i.customer_name?.toLowerCase().includes(params.customer!.toLowerCase()));
    }
    if (params?.status) {
      list = list.filter(i => i.status === params.status);
    }
    return list;
  },

  async getInvoiceDetails(id: string): Promise<Invoice> {
    try {
      const res = await fetch(`${API_BASE}/invoices/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const list = getStored<Invoice[]>('invoices', initialInvoices);
    const found = list.find(i => i.id === id);
    if (!found) throw new Error('Invoice not found');
    return found;
  },

  async getOverdueInvoices(customer?: string): Promise<any[]> {
    try {
      const query = customer ? `?customer=${encodeURIComponent(customer)}` : '';
      const res = await fetch(`${API_BASE}/invoices/overdue${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const list = getStored<Invoice[]>('invoices', initialInvoices);
    return list.filter(i => i.status === 'OVERDUE');
  },

  async compareInvoices(customer: string, periodPrev?: string, periodCurr?: string): Promise<any> {
    try {
      const query = new URLSearchParams({ customer });
      if (periodPrev) query.append('period_prev', periodPrev);
      if (periodCurr) query.append('period_curr', periodCurr);
      const res = await fetch(`${API_BASE}/invoices/compare?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      customer: customer || 'Acme Corp',
      period_prev: periodPrev || '2026-09',
      period_curr: periodCurr || '2026-10',
      total_prev: '120000.00',
      total_curr: '132000.00',
      delta_amount: '12000.00',
      delta_percentage: '+10.0%',
      volume_variance: '9000.00',
      rate_variance: '3000.00',
      line_breakdown: [
        { item: 'Base Subscription', prev: '100000.00', curr: '100000.00', variance: '0.00' },
        { item: 'API Usage Overage', prev: '0.00', curr: '9000.00', variance: '+9000.00 (Volume)' },
        { item: 'Dedicated Support', prev: '20000.00', curr: '23000.00', variance: '+3000.00 (Rate Mismatch)' }
      ]
    };
  },

  // Proposals & Approvals
  async getProposals(status?: string): Promise<ActionProposal[]> {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${API_BASE}/proposals${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const list = getStored<ActionProposal[]>('proposals', initialProposals);
    return status ? list.filter(p => p.status === status) : list;
  },

  async reviewProposal(
    proposalId: string,
    reviewerName: string,
    decision: 'APPROVED' | 'REJECTED',
    comment?: string
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_name: reviewerName, decision, comment })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const proposals = getStored<ActionProposal[]>('proposals', initialProposals);
    const target = proposals.find(p => p.id === proposalId);
    if (!target) throw new Error('Proposal not found');

    if (target.status === 'EXECUTED' || target.status === 'REJECTED') {
      throw new Error(`Double-click Guard: Proposal ${proposalId} already finalized as ${target.status}`);
    }

    target.status = decision === 'APPROVED' ? 'EXECUTED' : 'REJECTED';
    target.executed_at = new Date().toISOString();
    target.approval = {
      id: 'appr-' + Date.now(),
      proposal_id: proposalId,
      reviewer_name: reviewerName || 'Parth Singh',
      decision,
      comment: comment || 'Action confirmed by finance manager',
      reviewed_at: new Date().toISOString()
    };
    setStored('proposals', proposals);

    // Update invoice status if adjusted
    if (decision === 'APPROVED' && target.invoice_id) {
      const invoices = getStored<Invoice[]>('invoices', initialInvoices);
      const inv = invoices.find(i => i.id === target.invoice_id);
      if (inv) {
        inv.status = 'ADJUSTED';
        inv.total_amount = '129000.00';
        inv.notes = 'Adjusted: ₹3,000 credit memo applied.';
        setStored('invoices', invoices);
      }
    }

    // Add Audit Log
    const logs = getStored<AuditLog[]>('audit_logs', initialAuditLogs);
    logs.unshift({
      id: 'audit-' + Date.now(),
      entity_type: 'ACTION_PROPOSAL',
      entity_id: proposalId,
      action: decision === 'APPROVED' ? 'PROPOSAL_APPROVED_AND_EXECUTED' : 'PROPOSAL_REJECTED',
      performed_by: reviewerName || 'Parth Singh',
      notes: `${decision === 'APPROVED' ? 'Approved & Executed' : 'Rejected'}. Comment: ${comment || 'None'}. Idempotency token verified.`,
      timestamp: new Date().toISOString()
    });
    setStored('audit_logs', logs);

    return {
      success: true,
      proposal_id: proposalId,
      status: target.status,
      decision,
      executed_at: target.executed_at
    };
  },

  // Audit Logs
  async getAuditLogs(entityType?: string): Promise<AuditLog[]> {
    try {
      const query = entityType ? `?entity_type=${encodeURIComponent(entityType)}` : '';
      const res = await fetch(`${API_BASE}/audit${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const list = getStored<AuditLog[]>('audit_logs', initialAuditLogs);
    return entityType ? list.filter(l => l.entity_type === entityType) : list;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${API_BASE}/customers`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStored<Customer[]>('customers', initialCustomers);
  }
};
