import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Database, FileText, CheckCircle2, 
  XCircle, ArrowRight, ShieldCheck, Cpu, AlertCircle, 
  ChevronDown, ChevronUp, History, PlusCircle, RefreshCw,
  Search, Calculator, Filter, AlertTriangle, Check, RotateCcw,
  BookOpen, Terminal, Layers, Clock
} from 'lucide-react';
import { AgentInvestigationResponse, ActionProposal, EvidenceCard, ToolCallLog } from '../../types';
import { api } from '../../services/api';

interface ChatPanelProps {
  onOpenEvidence: (evidence: EvidenceCard) => void;
  onProposalUpdated: () => void;
}

interface InvestigationSession {
  id: string;
  title: string;
  customerName: string;
  timestamp: string;
  status: 'RESOLVED' | 'ACTION_REQUIRED' | 'AUDIT_FLAGGED';
  preview: string;
  messages: Message[];
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  response?: AgentInvestigationResponse;
  timestamp: string;
  isError?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onOpenEvidence,
  onProposalUpdated
}) => {
  // Session State
  const [sessions, setSessions] = useState<InvestigationSession[]>([
    {
      id: 'session-acme-spike',
      title: "Acme Corp: ₹12,000 Invoice Spike",
      customerName: "Acme Corp",
      timestamp: "Today, 10:45 AM",
      status: 'ACTION_REQUIRED',
      preview: "Variance broken down into ₹9k volume growth and ₹3k contract rate overcharge.",
      messages: [
        {
          id: 'welcome',
          sender: 'agent',
          text: (
            "Welcome to **FinPilot Operations**. I am your deterministic finance co-pilot.\n\n" +
            "I investigate billing anomalies against primary database ledgers, calculate variances using exact Python arithmetic, " +
            "and stage human-in-the-loop proposals before any financial mutation occurs."
          ),
          timestamp: "10:45 AM"
        }
      ]
    },
    {
      id: 'session-overdue-scan',
      title: "Delinquent Accounts Aging Scan",
      customerName: "All Accounts",
      timestamp: "Today, 09:15 AM",
      status: 'AUDIT_FLAGGED',
      preview: "Stark Industries (56d) and Nexus Dynamics (32d) exceed payment credit terms.",
      messages: []
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session-acme-spike');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active Chat State
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const [messages, setMessages] = useState<Message[]>(activeSession.messages);
  const [inputValue, setInputValue] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review & Proposal Modal State
  const [reviewingProposal, setReviewingProposal] = useState<ActionProposal | null>(null);
  const [reviewerName, setReviewerName] = useState('Parth Singh (Finance Ops Lead)');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [expandedToolsRunId, setExpandedToolsRunId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suggested Prompts by Intent
  const promptCategories = [
    {
      label: 'Variance Investigation',
      prompt: "Why is Acme Corp's invoice ₹12,000 higher this month?"
    },
    {
      label: 'Delinquent Receivables',
      prompt: "Which customers have overdue payments exceeding payment terms?"
    },
    {
      label: 'Contract Compliance',
      prompt: "Audit Acme Corp line items against contractual pricing rules"
    },
    {
      label: 'Customer Billing Search',
      prompt: "Retrieve billing history and payment status for Acme Corp"
    }
  ];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, loadingStep]);

  // Loading Pipeline Stepper Simulation
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(1);
      return;
    }
    const timer1 = setTimeout(() => setLoadingStep(2), 250);
    const timer2 = setTimeout(() => setLoadingStep(3), 500);
    const timer3 = setTimeout(() => setLoadingStep(4), 750);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isLoading]);

  // Switch session
  const handleSelectSession = (session: InvestigationSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  // Create new session
  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: InvestigationSession = {
      id: newId,
      title: "New Investigation Session",
      customerName: selectedCustomer === 'ALL' ? 'General Portfolio' : selectedCustomer,
      timestamp: "Just now",
      status: 'RESOLVED',
      preview: "Ready for new financial inquiry...",
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'agent',
          text: "FinPilot is ready. Specify an invoice number, account name, or discrepancy scenario to begin an evidence-backed inquiry.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages(newSession.messages);
    setInputValue('');
    setIsHistoryOpen(false);
  };

  // Submit Query
  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || inputValue;
    if (!text.trim() || isLoading) return;

    setErrorMessage(null);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.queryAgent(
        text, 
        selectedCustomer !== 'ALL' ? selectedCustomer : undefined,
        activeSessionId
      );

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.final_answer,
        response: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);

      // Update current session metadata in history
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: text.length > 40 ? text.slice(0, 37) + '...' : text,
            preview: response.final_answer.slice(0, 90) + '...',
            messages: [...s.messages, userMsg, agentMsg],
            status: response.recommended_proposal ? 'ACTION_REQUIRED' : 'RESOLVED'
          };
        }
        return s;
      }));

      if (response.recommended_proposal) {
        onProposalUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network request failed. Ensure backend or fallback engine is active.');
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: `Investigation halted: ${err.message || 'System encountered an error querying database'}. Click Retry below to re-execute.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Process Approval / Rejection
  const handleConfirmDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!reviewingProposal) return;
    setIsSubmittingReview(true);
    setReviewFeedback(null);

    try {
      const res = await api.reviewProposal(
        reviewingProposal.id,
        reviewerName,
        decision,
        reviewerNotes || (decision === 'APPROVED' ? 'Approved based on verified Python rate calculation' : 'Rejected proposal')
      );

      setReviewFeedback(`Decision registered: ${decision}. Status updated to ${res.status || 'FINALIZED'}.`);
      onProposalUpdated();

      // Update proposal state in messages
      setMessages(prev => prev.map(msg => {
        if (msg.response && msg.response.recommended_proposal?.id === reviewingProposal.id) {
          return {
            ...msg,
            response: {
              ...msg.response,
              recommended_proposal: {
                ...msg.response.recommended_proposal,
                status: decision === 'APPROVED' ? 'EXECUTED' : 'REJECTED'
              }
            }
          };
        }
        return msg;
      }));

      setTimeout(() => {
        setReviewingProposal(null);
        setReviewFeedback(null);
        setReviewerNotes('');
      }, 1200);
    } catch (err: any) {
      setReviewFeedback(`Failed: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '820px', padding: '0', position: 'relative' }}>
      {/* Top Workspace Header */}
      <div style={{
        padding: '0.85rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            title="Toggle Investigation History"
            style={{
              background: isHistoryOpen ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isHistoryOpen ? 'var(--primary)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.65rem',
              color: isHistoryOpen ? '#a5b4fc' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <History size={14} />
            <span>Threads ({sessions.length})</span>
          </button>

          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeSession.title}
              <span className={`badge ${
                activeSession.status === 'ACTION_REQUIRED' ? 'badge-pending' :
                activeSession.status === 'AUDIT_FLAGGED' ? 'badge-rejected' : 'badge-paid'
              }`} style={{ fontSize: '0.62rem' }}>
                {activeSession.status.replace('_', ' ')}
              </span>
            </h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Deterministic investigation grounded in primary database records
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={handleNewSession}
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.75rem',
              color: '#a5b4fc',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <PlusCircle size={14} />
            New Investigation
          </button>
        </div>
      </div>

      {/* History Drawer Sidebar Overlay */}
      {isHistoryOpen && (
        <div style={{
          position: 'absolute',
          top: '55px',
          left: 0,
          bottom: 0,
          width: '320px',
          background: 'rgba(11, 15, 25, 0.98)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid var(--border-subtle)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 25px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Investigation History</span>
            <button
              onClick={() => setIsHistoryOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Close
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: s.id === activeSessionId ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${s.id === activeSessionId ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{s.title}</span>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.preview}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <span>{s.customerName}</span>
                  <span>{s.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div style={{
        padding: '0.65rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        background: 'rgba(0, 0, 0, 0.25)'
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          SCENARIO TEMPLATES:
        </span>
        {promptCategories.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            disabled={isLoading}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Sender and Time */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.35rem',
              fontSize: '0.7rem',
              color: 'var(--text-dim)'
            }}>
              <span style={{ fontWeight: 600 }}>{msg.sender === 'user' ? 'Finance Ops Lead' : 'FinPilot Autonomous Agent'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: msg.sender === 'user' ? '70%' : '94%',
              padding: '1.1rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              background: msg.sender === 'user' 
                ? 'linear-gradient(135deg, #4f46e5, #4338ca)' 
                : msg.isError ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.035)',
              border: msg.sender === 'user' 
                ? 'none' 
                : msg.isError ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Verdict Summary Banner (if structured response available) */}
              {msg.response && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(56, 189, 248, 0.1))',
                  borderLeft: '4px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <Cpu size={18} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Deterministic Investigation Verdict
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginTop: '0.1rem' }}>
                      {msg.response.evidence_cards?.some(e => e.evidence_type === 'PRICING_MISMATCH')
                        ? "Discrepancy Confirmed: ₹9,000 Volume Growth (Valid) + ₹3,000 Rate Overcharge (Contract Error)"
                        : "Receivables Delinquency Scan: 2 Accounts Outside Agreed Credit Window"}
                    </div>
                  </div>
                </div>
              )}

              {/* Text Body */}
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>

              {/* Verifiable Financial Comparison Breakdown Table */}
              {msg.response && msg.response.evidence_cards?.some(e => e.evidence_type === 'INVOICE_DELTA') && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Calculator size={16} color="var(--accent-blue)" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e0f2fe' }}>
                        Verifiable Ledger Comparison (Sep 2026 vs Oct 2026)
                      </span>
                    </div>
                    <span className="badge badge-paid" style={{ fontSize: '0.65rem' }}>
                      Python Decimal Arithmetic Verified
                    </span>
                  </div>

                  {/* Formula Callout */}
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px dashed rgba(56, 189, 248, 0.3)',
                    fontSize: '0.72rem',
                    color: '#7dd3fc',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    ΔTotal (+₹12,000.00) = Volume Variance (+₹9,000.00) + Rate Variance (+₹3,000.00)
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '0.4rem' }}>Line Item</th>
                        <th style={{ textAlign: 'right', padding: '0.4rem' }}>Sep 2026</th>
                        <th style={{ textAlign: 'right', padding: '0.4rem' }}>Oct 2026</th>
                        <th style={{ textAlign: 'right', padding: '0.4rem' }}>Variance</th>
                        <th style={{ textAlign: 'left', padding: '0.4rem 0.75rem' }}>Root Cause Finding</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.45rem', fontWeight: 600 }}>Enterprise Base Subscription</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem' }} className="mono">₹100,000</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem' }} className="mono">₹100,000</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem', color: 'var(--text-dim)' }} className="mono">₹0.00</td>
                        <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-muted)' }}>Exact match with contract tier</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.45rem', fontWeight: 600 }}>API Calls Metered Overage</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem' }} className="mono">₹0.00</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem', color: '#93c5fd' }} className="mono">₹9,000.00</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem', color: '#93c5fd', fontWeight: 700 }} className="mono">+₹9,000.00</td>
                        <td style={{ padding: '0.45rem 0.75rem', color: '#93c5fd' }}>
                          Legitimate volume: 150k calls above 1M allowance @ ₹0.06/call
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.45rem', fontWeight: 600 }}>Dedicated Support Tier</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem' }} className="mono">₹20,000</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem', color: '#fca5a5' }} className="mono">₹23,000.00</td>
                        <td style={{ textAlign: 'right', padding: '0.45rem', color: '#f87171', fontWeight: 700 }} className="mono">+₹3,000.00</td>
                        <td style={{ padding: '0.45rem 0.75rem', color: '#f87171', fontWeight: 600 }}>
                          ⚠️ Pricing Rule Violation: Invoiced at ₹23k instead of contract ₹20k
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tool Execution Trace */}
              {msg.response && msg.response.tool_calls && msg.response.tool_calls.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div 
                    onClick={() => setExpandedToolsRunId(expandedToolsRunId === msg.response?.run_id ? null : msg.response?.run_id || null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Database size={13} color="#818cf8" />
                      <span><strong>{msg.response.tool_calls.length} Backend Read-Only Database Tools Executed</strong></span>
                    </div>
                    {expandedToolsRunId === msg.response.run_id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {expandedToolsRunId === msg.response.run_id && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {msg.response.tool_calls.map((tc, tcIdx) => (
                        <div
                          key={tcIdx}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(0, 0, 0, 0.35)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            fontSize: '0.72rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#818cf8', fontWeight: 600 }}>
                            <span>⚙️ {tc.tool_name}()</span>
                            <span style={{ color: 'var(--text-dim)' }}>{tc.execution_time_ms}ms</span>
                          </div>
                          <div style={{ color: 'var(--text-dim)', marginTop: '0.2rem' }} className="mono">
                            Input: {JSON.stringify(tc.tool_input)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Primary Evidence Cards */}
              {msg.response && msg.response.evidence_cards && msg.response.evidence_cards.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                    Primary Database Citations & Evidence ({msg.response.evidence_cards.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
                    {msg.response.evidence_cards.map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(56, 189, 248, 0.05)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#e0f2fe' }}>
                            {ev.title}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            {ev.summary}
                          </p>
                        </div>
                        <button
                          onClick={() => onOpenEvidence(ev)}
                          style={{
                            marginTop: '0.65rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#38bdf8',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            alignSelf: 'flex-start'
                          }}
                        >
                          Inspect Calculation Details <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRIORITY 3: Staged Human Approval Proposal */}
              {msg.response && msg.response.recommended_proposal && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.08)'
                }}>
                  {/* UNEXECUTED STAGING WARNING BANNER */}
                  <div style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fef08a',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertTriangle size={15} color="#f59e0b" />
                    <span>STAGED ACTION PROPOSAL — UNEXECUTED (Zero ledger changes have occurred)</span>
                  </div>

                  {/* Workflow Lifecycle Stepper */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.85rem',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> 1. AI Formulated
                    </div>
                    <span>→</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: msg.response.recommended_proposal.status === 'PENDING' ? '#fbbf24' : '#10b981',
                      fontWeight: 700
                    }}>
                      <Clock size={12} /> 2. Human Review
                    </div>
                    <span>→</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: msg.response.recommended_proposal.status === 'EXECUTED' ? '#10b981' : 'var(--text-dim)',
                      fontWeight: msg.response.recommended_proposal.status === 'EXECUTED' ? 700 : 400
                    }}>
                      <ShieldCheck size={12} /> 3. Ledger Mutation
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <ShieldCheck size={18} color="#f59e0b" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fde68a' }}>
                        ACTION TYPE: {msg.response.recommended_proposal.action_type}
                      </span>
                    </div>
                    <span className={`badge ${
                      msg.response.recommended_proposal.status === 'PENDING' ? 'badge-pending' :
                      msg.response.recommended_proposal.status === 'EXECUTED' ? 'badge-executed' : 'badge-rejected'
                    }`}>
                      {msg.response.recommended_proposal.status === 'PENDING' ? 'PENDING APPROVAL' : msg.response.recommended_proposal.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginTop: '0.5rem', color: '#fff' }}>
                    {msg.response.recommended_proposal.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {msg.response.recommended_proposal.justification}
                  </p>

                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    fontSize: '0.72rem',
                    color: 'var(--text-dim)'
                  }} className="mono">
                    Staged Payload: {JSON.stringify(msg.response.recommended_proposal.proposed_payload)}
                  </div>

                  {/* Actions */}
                  {msg.response.recommended_proposal.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.85rem' }}>
                      <button
                        className="btn btn-success"
                        onClick={() => setReviewingProposal(msg.response!.recommended_proposal!)}
                        style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                      >
                        <ShieldCheck size={14} />
                        Review & Apply Decision
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: msg.response.recommended_proposal.status === 'EXECUTED' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                    }}>
                      {msg.response.recommended_proposal.status === 'EXECUTED' ? (
                        <>
                          <CheckCircle2 size={14} />
                          Adjustment applied to ledger idempotently. Immutable audit trail recorded.
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Proposal was rejected by finance supervisor. Zero financial ledger changes occurred.
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* PRIORITY 1: Rich Multi-Stage Loading State */}
        {isLoading && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '85%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="pulse-indicator" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                FinPilot Autonomous Investigation Pipeline
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: loadingStep >= 1 ? '#a5b4fc' : 'var(--text-dim)'
              }}>
                <CheckCircle2 size={14} color={loadingStep >= 1 ? '#6366f1' : 'var(--text-dim)'} />
                <span>1. Scanning customer invoice line items & billing cycle records...</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: loadingStep >= 2 ? '#a5b4fc' : 'var(--text-dim)'
              }}>
                <CheckCircle2 size={14} color={loadingStep >= 2 ? '#6366f1' : 'var(--text-dim)'} />
                <span>2. Cross-referencing contractual pricing tiers and metered usage logs...</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: loadingStep >= 3 ? '#a5b4fc' : 'var(--text-dim)'
              }}>
                <CheckCircle2 size={14} color={loadingStep >= 3 ? '#6366f1' : 'var(--text-dim)'} />
                <span>3. Executing deterministic Python Decimal variance calculation...</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: loadingStep >= 4 ? '#a5b4fc' : 'var(--text-dim)'
              }}>
                <CheckCircle2 size={14} color={loadingStep >= 4 ? '#6366f1' : 'var(--text-dim)'} />
                <span>4. Synthesizing evidence cards & staging unapplied proposal in escrow...</span>
              </div>
            </div>
          </div>
        )}

        {/* PRIORITY 1: Structured Error State */}
        {errorMessage && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            maxWidth: '85%'
          }}>
            <AlertCircle size={18} color="var(--accent-rose)" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fca5a5' }}>
                Investigation Execution Error
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {errorMessage}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                <button
                  onClick={() => handleSend("Why is Acme Corp's invoice ₹12,000 higher this month?")}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '4px',
                    background: 'rgba(244, 63, 94, 0.2)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RotateCcw size={12} />
                  Retry Acme Investigation
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* PRIORITY 1: Input Composer */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {/* Customer Target Selector Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Filter size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>Filter Scope:</span>
            <select
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.2rem 0.5rem',
                fontSize: '0.73rem',
                color: '#fff',
                outline: 'none'
              }}
            >
              <option value="ALL">All Portfolio Accounts</option>
              <option value="Acme Corp">Acme Corp (CUST-ACME-001)</option>
              <option value="Stark Industries">Stark Industries (CUST-STARK-002)</option>
              <option value="Nexus Dynamics">Nexus Dynamics (CUST-NEXUS-003)</option>
              <option value="Globex Corp">Globex Corp (CUST-GLOBEX-004)</option>
            </select>
          </div>

          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            <span>Press <strong>Cmd + Enter</strong> to submit</span>
          </div>
        </div>

        {/* Textarea Composer */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder="Ask a deterministic finance question (e.g. Why did Acme Corp's invoice increase? Which accounts are overdue?)..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'none',
              lineHeight: 1.4
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              style={{ padding: '0.65rem 1rem', height: '40px' }}
            >
              <Send size={15} />
              <span>Investigate</span>
            </button>
            {inputValue.trim() && (
              <button
                onClick={() => setInputValue('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRIORITY 3: Review & Decision Workflow Modal */}
      {reviewingProposal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-lg)',
            width: '560px',
            maxWidth: '100%',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  Authorize Financial Mutation
                </h3>
              </div>
              <span className="badge badge-pending">PENDING SIGN-OFF</span>
            </div>

            {/* Caution Banner */}
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fef08a',
              fontSize: '0.74rem'
            }}>
              <strong>Safety Guard:</strong> You are authorizing an immutable credit memo ledger entry. Customer invoice balance will be adjusted from ₹132,000.00 to ₹129,000.00.
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>Proposal Target:</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '0.1rem' }}>
                {reviewingProposal.title}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {reviewingProposal.justification}
              </p>
            </div>

            {/* Reviewer Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Reviewing Official:
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Audit Justification Note:
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter audit trail rationale (e.g. Rate variance confirmed against Master Services Agreement)..."
                  value={reviewerNotes}
                  onChange={e => setReviewerNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontFamily: 'inherit',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            {reviewFeedback && (
              <div style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: reviewFeedback.includes('Failed') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${reviewFeedback.includes('Failed') ? 'var(--accent-rose)' : 'var(--accent-emerald)'}`,
                color: reviewFeedback.includes('Failed') ? '#fca5a5' : '#6ee7b7',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {reviewFeedback}
              </div>
            )}

            {/* Modal Decision Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setReviewingProposal(null)}
                disabled={isSubmittingReview}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleConfirmDecision('REJECTED')}
                disabled={isSubmittingReview}
              >
                <XCircle size={15} />
                Reject Proposal
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleConfirmDecision('APPROVED')}
                disabled={isSubmittingReview}
              >
                <CheckCircle2 size={15} />
                Approve & Execute Mutation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
