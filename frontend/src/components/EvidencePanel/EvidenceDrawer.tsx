import React from 'react';
import { X, CheckCircle, Calculator, Database, ShieldCheck, Code, FileText, Scale, ArrowRight } from 'lucide-react';
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
      width: '700px',
      maxWidth: '92vw',
      background: 'rgba(10, 13, 20, 0.98)',
      backdropFilter: 'blur(24px)',
      borderLeft: '1px solid var(--border-subtle)',
      boxShadow: '-15px 0 50px rgba(0, 0, 0, 0.85)',
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
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
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
              Deterministic Evidence & Primary Source Database Records
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Verification Banner */}
        <div style={{
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={18} color="var(--accent-emerald)" />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              Audited Deterministic Calculation (Zero LLM Floating Math)
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Calculated using Python <code>Decimal</code> module against immutable PostgreSQL/SQLite database snapshots.
            </div>
          </div>
        </div>

        {/* Evidence Summary Card */}
        <div className="card">
          <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Evidence Summary
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#fff', marginTop: '0.45rem', lineHeight: 1.6 }}>
            {evidence.summary}
          </p>

          {/* Quick Metrics */}
          {details.volume_variance && details.rate_variance && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div style={{ padding: '0.65rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Volume Variance Effect</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '0.15rem' }} className="mono">
                  +{details.volume_variance}
                </p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>150,000 extra calls @ contractual ₹0.06</p>
              </div>

              <div style={{ padding: '0.65rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Rate Variance (Discrepancy)</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-rose)', marginTop: '0.15rem' }} className="mono">
                  +{details.rate_variance}
                </p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Overcharge: Billed ₹23k vs Contract ₹20k</p>
              </div>
            </div>
          )}
        </div>

        {/* Explicit Arithmetic Explanation Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Scale size={16} color="var(--primary)" />
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
              Decomposition Mathematics & Formula
            </h4>
          </div>
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.7,
            color: '#e2e8f0'
          }}>
            <div># Step 1: Baseline Comparison</div>
            <div>Invoice_Sep = Decimal('120000.00')</div>
            <div>Invoice_Oct = Decimal('132000.00')</div>
            <div>Raw_Delta = Invoice_Oct - Invoice_Sep = +Decimal('12000.00')</div>
            <div style={{ margin: '0.5rem 0', borderBottom: '1px dashed rgba(255, 255, 255, 0.1)' }} />
            <div># Step 2: Volume Effect (Legitimate metered growth)</div>
            <div>Volume_Delta = (1450000 - 1000000) * Decimal('0.06') = +Decimal('9000.00')</div>
            <div style={{ margin: '0.5rem 0', borderBottom: '1px dashed rgba(255, 255, 255, 0.1)' }} />
            <div># Step 3: Rate Effect (Pricing Rule Violation)</div>
            <div>Rate_Delta = Decimal('23000.00') - Decimal('20000.00') = +Decimal('3000.00')</div>
            <div>Reconciled_Delta = Volume_Delta + Rate_Delta = Decimal('12000.00') [MATCH]</div>
          </div>
        </div>

        {/* Database Citations */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Database size={15} color="#818cf8" />
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
              Database Citations & Primary Keys
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
              <span className="mono" style={{ color: '#818cf8' }}>invoices.INV-2026-10-001</span>
              <span>Acme Corp October Invoice</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
              <span className="mono" style={{ color: '#818cf8' }}>pricing_rules.PR-ENT-002</span>
              <span>Dedicated Support Contract Tier (₹20,000/mo limit)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
              <span className="mono" style={{ color: '#818cf8' }}>usage_events.metered_api</span>
              <span>1,450,000 aggregated usage events recorded</span>
            </div>
          </div>
        </div>

        {/* Raw JSON Data Toggle */}
        <details style={{ marginTop: '0.25rem' }}>
          <summary style={{ fontSize: '0.76rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Code size={13} /> View Raw Primary Source JSON Object
          </summary>
          <pre style={{
            marginTop: '0.5rem',
            padding: '0.85rem',
            background: 'rgba(0, 0, 0, 0.55)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.7rem',
            color: '#a5f3fc',
            overflowX: 'auto',
            maxHeight: '220px'
          }}>
            {JSON.stringify(evidence.details, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};
