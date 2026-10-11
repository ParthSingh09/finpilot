import React, { useState } from 'react';
import { 
  Send, Sparkles, Database, FileText, CheckCircle2, 
  XCircle, ArrowRight, ShieldCheck, Cpu, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import { AgentInvestigationResponse, ActionProposal, EvidenceCard } from '../../types';
import { api } from '../../services/api';

interface ChatPanelProps {
  onOpenEvidence: (evidence: EvidenceCard) => void;
  onProposalUpdated: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  response?: AgentInvestigationResponse;
  timestamp: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onOpenEvidence,
  onProposalUpdated
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: (
        "Welcome to **FinPilot Operations**. I am your deterministic finance co-pilot.\n\n" +
        "I can investigate invoice discrepancies, calculate exact month-over-month variances in Python, " +
        "audit metered usage against contract pricing tiers, and draft human-in-the-loop adjustment proposals."
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewingProposalId, setReviewingProposalId] = useState<string | null>(null);
  const [expandedToolsRunId, setExpandedToolsRunId] = useState<string | null>(null);

  const suggestedPrompts = [
    "Why is Acme Corp's invoice ₹12,000 higher this month?",
    "Which customers have overdue payments?",
    "Are any invoices inconsistent with their pricing rules?",
    "Search invoices for Acme Corp"
  ];

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || inputValue;
    if (!text.trim() || isLoading) return;

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
      const response = await api.queryAgent(text);
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.final_answer,
        response: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
      if (response.recommended_proposal) {
        onProposalUpdated();
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: `Error executing investigation: ${err.message || 'Unknown network error'}. Please verify backend connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewProposal = async (proposal: ActionProposal, decision: 'APPROVED' | 'REJECTED') => {
    setReviewingProposalId(proposal.id);
    try {
      await api.reviewProposal(
        proposal.id,
        'Parth Singh (Finance Ops Lead)',
        decision,
        decision === 'APPROVED' ? 'Approved verified variance calculation' : 'Rejected by finance manager'
      );
      onProposalUpdated();
      
      // Update local state in messages
      setMessages(prev => prev.map(msg => {
        if (msg.response && msg.response.recommended_proposal?.id === proposal.id) {
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
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setReviewingProposalId(null);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '760px', padding: '0' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-active)'
          }}>
            <Sparkles size={18} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Financial Investigation Session
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Deterministic Tool Orchestration & Human Approval Gate
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-issued" style={{ fontSize: '0.68rem' }}>
            <Cpu size={11} style={{ marginRight: '3px' }} />
            Zero-Hallucination Mode
          </span>
        </div>
      </div>

      {/* Suggested prompts chips */}
      <div style={{
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          Suggested Scenarios:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.73rem',
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
            {prompt}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.35rem',
              fontSize: '0.72rem',
              color: 'var(--text-dim)'
            }}>
              <span>{msg.sender === 'user' ? 'Finance Manager' : 'FinPilot Agent'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div style={{
              maxWidth: msg.sender === 'user' ? '70%' : '90%',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: msg.sender === 'user' 
                ? 'linear-gradient(135deg, #4f46e5, #4338ca)' 
                : 'rgba(255, 255, 255, 0.04)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Formatted Text */}
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>

              {/* Tool Execution Pills (if present) */}
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
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Database size={13} color="#818cf8" />
                      <span><strong>{msg.response.tool_calls.length} Backend Tools Executed</strong> (Read-Only Isolated)</span>
                    </div>
                    {expandedToolsRunId === msg.response.run_id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {expandedToolsRunId === msg.response.run_id && (
                    <div style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}>
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

              {/* Evidence Cards Carousel / Grid */}
              {msg.response && msg.response.evidence_cards && msg.response.evidence_cards.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
                    VERIFIED EVIDENCE RECORDS ({msg.response.evidence_cards.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
                    {msg.response.evidence_cards.map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(56, 189, 248, 0.06)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#e0f2fe' }}>
                            {ev.title}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
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

              {/* Recommended Action Proposal Card (Human-in-the-Loop) */}
              {msg.response && msg.response.recommended_proposal && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <ShieldCheck size={18} color="#f59e0b" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fde68a' }}>
                        HUMAN APPROVAL REQUIRED: {msg.response.recommended_proposal.action_type}
                      </span>
                    </div>
                    <span className={`badge ${
                      msg.response.recommended_proposal.status === 'PENDING' ? 'badge-pending' :
                      msg.response.recommended_proposal.status === 'EXECUTED' ? 'badge-executed' : 'badge-rejected'
                    }`}>
                      {msg.response.recommended_proposal.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: '0.5rem', color: '#fff' }}>
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
                    Proposed Payload: {JSON.stringify(msg.response.recommended_proposal.proposed_payload)}
                  </div>

                  {/* Approve / Reject Controls */}
                  {msg.response.recommended_proposal.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.85rem' }}>
                      <button
                        className="btn btn-success"
                        disabled={reviewingProposalId === msg.response.recommended_proposal.id}
                        onClick={() => handleReviewProposal(msg.response!.recommended_proposal!, 'APPROVED')}
                        style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                      >
                        <CheckCircle2 size={14} />
                        Approve & Apply Adjustment
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={reviewingProposalId === msg.response.recommended_proposal.id}
                        onClick={() => handleReviewProposal(msg.response!.recommended_proposal!, 'REJECTED')}
                        style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                      >
                        <XCircle size={14} />
                        Reject Proposal
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
                          Proposal was rejected. No financial mutations were applied.
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: 'var(--text-muted)' }}>
            <span className="pulse-indicator" />
            <span style={{ fontSize: '0.82rem' }}>
              FinPilot is querying read-only tools, computing deterministic Decimal differences, and auditing pricing compliance...
            </span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'flex',
        gap: '0.75rem'
      }}>
        <input
          type="text"
          placeholder="Ask a question (e.g. Why is Acme Corp's invoice ₹12,000 higher this month?)..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '0.88rem',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={isLoading || !inputValue.trim()}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <Send size={16} />
          Investigate
        </button>
      </div>
    </div>
  );
};
