import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, 
  UserCheck, Clock, FileText, ArrowRight, Check 
} from 'lucide-react';
import { ActionProposal } from '../../types';
import { api } from '../../services/api';

interface ApprovalsQueueProps {
  proposals: ActionProposal[];
  onProposalUpdated: () => void;
}

export const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({
  proposals,
  onProposalUpdated
}) => {
  const [reviewerName, setReviewerName] = useState('Parth Singh (Finance Ops Lead)');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const pendingProposals = proposals.filter(p => p.status === 'PENDING');
  const pastProposals = proposals.filter(p => p.status !== 'PENDING');

  const handleReview = async (proposalId: string, decision: 'APPROVED' | 'REJECTED') => {
    setProcessingId(proposalId);
    setLastFeedback(null);
    try {
      const res = await api.reviewProposal(
        proposalId,
        reviewerName,
        decision,
        decision === 'APPROVED' ? 'Approved by finance supervisor' : 'Rejected by reviewer'
      );

      if (res.status === 'ALREADY_PROCESSED') {
        setLastFeedback(`[IDEMPOTENCY GUARD] ${res.message}`);
      } else {
        setLastFeedback(res.message);
      }
      onProposalUpdated();
    } catch (err: any) {
      setLastFeedback(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Reviewer Configuration Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-emerald)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <UserCheck size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              Authorized Reviewer Session
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              All approval decisions are cryptographically attributed in the audit ledger.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Reviewing As:</span>
          <input
            type="text"
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
              minWidth: '240px'
            }}
          />
        </div>
      </div>

      {lastFeedback && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: lastFeedback.includes('[IDEMPOTENCY') ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${lastFeedback.includes('[IDEMPOTENCY') ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          color: lastFeedback.includes('[IDEMPOTENCY') ? '#7dd3fc' : '#6ee7b7',
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} />
          {lastFeedback}
        </div>
      )}

      {/* Pending Approvals Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              Pending Human Approval Queue
            </h3>
            <span className="badge badge-pending">
              {pendingProposals.length} Requiring Attention
            </span>
          </div>
        </div>

        {pendingProposals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>No Pending Action Proposals</h4>
            <p style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>
              All automated recommendations have been reviewed or none are currently staged.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingProposals.map(proposal => (
              <div
                key={proposal.id}
                className="card"
                style={{
                  borderLeft: '4px solid var(--accent-amber)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-pending">
                        {proposal.action_type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Created: {new Date(proposal.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.4rem' }}>
                      {proposal.title}
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {proposal.justification}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      className="btn btn-success"
                      disabled={processingId === proposal.id}
                      onClick={() => handleReview(proposal.id, 'APPROVED')}
                    >
                      <CheckCircle2 size={15} />
                      Approve & Execute Ledger Mutation
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={processingId === proposal.id}
                      onClick={() => handleReview(proposal.id, 'REJECTED')}
                    >
                      <XCircle size={15} />
                      Reject Proposal
                    </button>
                  </div>
                </div>

                {/* Proposed Payload Details */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Customer: <strong style={{ color: '#fff' }}>{proposal.customer?.name || 'Customer'}</strong>
                    {proposal.invoice && (
                      <span style={{ marginLeft: '1rem' }}>
                        Invoice Target: <strong className="mono" style={{ color: '#93c5fd' }}>{proposal.invoice.invoice_number}</strong>
                      </span>
                    )}
                  </div>

                  <div className="mono" style={{ fontSize: '0.75rem', color: '#a5f3fc' }}>
                    Payload: {JSON.stringify(proposal.proposed_payload)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Approvals / Rejections */}
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>
          Historical Approval Decisions & Execution Trail
        </h3>

        <div className="table-container">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Action Type</th>
                <th>Title</th>
                <th>Decision / Status</th>
                <th>Reviewer</th>
                <th>Executed At</th>
                <th>Idempotency Protection</th>
              </tr>
            </thead>
            <tbody>
              {pastProposals.map(p => (
                <tr key={p.id}>
                  <td>
                    <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.action_type}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td>
                    <span className={`badge ${
                      p.status === 'EXECUTED' ? 'badge-executed' :
                      p.status === 'APPROVED' ? 'badge-paid' : 'badge-rejected'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.approval?.reviewer_name || 'Finance Ops Lead'}</td>
                  <td>{p.executed_at ? new Date(p.executed_at).toLocaleTimeString() : 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => handleReview(p.id, 'APPROVED')}
                      title="Test idempotency: Attempt repeat approval on executed proposal"
                    >
                      Test Double-Click Guard
                    </button>
                  </td>
                </tr>
              ))}
              {pastProposals.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem' }}>
                    No decisions executed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
