export interface Customer {
  id: string;
  name: string;
  code: string;
  email: string;
  billing_currency: string;
  plan_tier: string;
  payment_terms_days: number;
  status: string;
  created_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: string;
  unit_price: string;
  total_amount: string;
  line_type: string;
  pricing_tier_ref?: string;
}

export interface Payment {
  id: string;
  amount: string;
  payment_date: string;
  status: string;
  payment_method: string;
  reference_id?: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_code?: string;
  invoice_number: string;
  billing_period: string;
  issue_date: string;
  due_date: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'DISPUTED' | 'ADJUSTED';
  subtotal: string;
  tax: string;
  total_amount: string;
  currency: string;
  notes?: string;
  customer?: Customer;
  line_items?: InvoiceLineItem[];
  payments?: Payment[];
}

export interface ToolCallLog {
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output: any;
  execution_time_ms: number;
  status: string;
  error?: string;
}

export interface EvidenceCard {
  title: string;
  evidence_type: 'INVOICE_DELTA' | 'USAGE_SPIKE' | 'PRICING_MISMATCH' | 'OVERDUE_STATUS';
  summary: string;
  details: Record<string, any>;
  verified_by_python: boolean;
}

export interface Approval {
  id: string;
  proposal_id: string;
  reviewer_name: string;
  decision: 'APPROVED' | 'REJECTED';
  comment?: string;
  reviewed_at: string;
}

export interface ActionProposal {
  id: string;
  run_id?: string;
  customer_id: string;
  invoice_id?: string;
  action_type: 'INVOICE_ADJUSTMENT' | 'PAYMENT_REMINDER' | 'WAIVE_LATE_FEE';
  title: string;
  justification: string;
  proposed_payload: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  created_at: string;
  executed_at?: string;
  approval?: Approval;
  customer?: Customer;
  invoice?: Invoice;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by: string;
  payload_before?: Record<string, any>;
  payload_after?: Record<string, any>;
  notes?: string;
  timestamp: string;
}

export interface AgentInvestigationResponse {
  run_id: string;
  session_id: string;
  query: string;
  status: string;
  final_answer: string;
  tool_calls: ToolCallLog[];
  evidence_cards: EvidenceCard[];
  recommended_proposal?: ActionProposal | null;
  created_at: string;
}
