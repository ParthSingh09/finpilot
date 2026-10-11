import React from 'react';
import { X, CheckCircle, Calculator, Database, ShieldCheck, Code } from 'lucide-react';
import { EvidenceCard } from '../../types';

interface EvidenceDrawerProps {
  evidence: EvidenceCard | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  const details = evidence.details || {};
  const breakdown = details.line_item_breakdown || [];
  const discrepancies = details.discrepancies || [];
  const overdueRecords = details.overdue_records || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '680px',
      maxWidth: '90vw',
      background: 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-subtle)',
      boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '1.25rem 1.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--accent-blue)',
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Calculator size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              {evidence.title}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Deterministic Verification & Primary Source Evidence
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            width: '32px',
            height: '32px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Drawer Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Verification Banner */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={18} color="var(--accent-emerald)" />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              Audited Deterministic Calculation
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              {details.calculation_method || "Calculated using pure Python Decimal precision without LLM approximation."}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="card">
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Evidence Summary
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.5rem', lineHeight: 1.6 }}>
            {evidence.summary}
          </p>
          {details.total_delta && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Total Delta:</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }} className="mono">
                  +{details.currency} {details.total_delta}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Percentage:</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)' }} className="mono">
                  {details.percentage_change}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Period Compare:</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  {details.previous_period} → {details.current_period}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Line Item Breakdown Table */}
        {breakdown.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              Itemized Variance Decomposition
            </h4>
            <div className="table-container">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Line Item</th>
                    <th>Qty Delta</th>
                    <th>Rate Delta</th>
                    <th>Volume Effect</th>
                    <th>Rate Effect</th>
                    <th>Total Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                      <td className="mono">{item.quantity_delta}</td>
                      <td className="mono">₹{item.unit_price_delta}</td>
                      <td className="mono" style={{ color: 'var(--accent-blue)' }}>
                        ₹{item.volume_variance}
                      </td>
                      <td className="mono" style={{ color: item.rate_variance !== '0.00' ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                        ₹{item.rate_variance}
                      </td>
                      <td className="mono" style={{ fontWeight: 700, color: '#fff' }}>
                        ₹{item.total_delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing Discrepancies (if any) */}
        {discrepancies.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', marginBottom: '0.75rem' }}>
              Identified Contract Rate Violations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {discrepancies.map((d: any, idx: number) => (
                <div key={idx} className="card" style={{ borderLeft: '3px solid var(--accent-rose)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{d.line_item}</strong>
                    <span className="badge badge-overdue">{d.issue_type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
                    <div>Billed Rate: <span className="mono">₹{d.billed_unit_rate}</span></div>
                    <div>Contract Rate: <span className="mono" style={{ color: 'var(--accent-emerald)' }}>₹{d.contracted_unit_rate}</span></div>
                    <div>Discrepancy: <span className="mono" style={{ color: 'var(--accent-rose)' }}>+₹{d.discrepancy_variance}</span></div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Rule: {d.rule_description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw JSON Data Toggle */}
        <details style={{ marginTop: '0.5rem' }}>
          <summary style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Code size={13} /> View Raw Primary Source Database Records
          </summary>
          <pre style={{
            marginTop: '0.65rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            color: '#a5f3fc',
            overflowX: 'auto',
            maxHeight: '260px'
          }}>
            {JSON.stringify(evidence.details, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};
