import React, { useState } from 'react';
import { Scale, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../../services/api';

export const VarianceAnalyzer: React.FC = () => {
  const [customer, setCustomer] = useState('Acme Corp');
  const [periodPrev, setPeriodPrev] = useState('2026-09');
  const [periodCurr, setPeriodCurr] = useState('2026-10');
  const [comparison, setComparison] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.compareInvoices(customer, periodPrev, periodCurr);
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Control Box */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Scale size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Deterministic Financial Variance Engine
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Decomposes month-over-month differences into Volume Variance vs. Rate Variance with Decimal precision.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Customer
            </label>
            <select
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '0.85rem',
                minWidth: '200px'
              }}
            >
              <option value="Acme Corp">Acme Corp (Enterprise)</option>
              <option value="Nexus Dynamics">Nexus Dynamics (Starter)</option>
              <option value="Stark Industries">Stark Industries (Pro)</option>
              <option value="Globex Corp">Globex Corp (Pro)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Base Period
            </label>
            <input
              type="text"
              value={periodPrev}
              onChange={e => setPeriodPrev(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '0.85rem',
                width: '120px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Target Period
            </label>
            <input
              type="text"
              value={periodCurr}
              onChange={e => setPeriodCurr(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '0.85rem',
                width: '120px'
              }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={isLoading}
            style={{ padding: '0.55rem 1.25rem' }}
          >
            {isLoading ? 'Calculating...' : 'Run Variance Decomposition'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-rose-bg)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fca5a5',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top High-Level Variance Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div className="card">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Base Invoice ({comparison.previous_period})
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.3rem', color: '#fff' }} className="mono">
                ₹{parseFloat(comparison.previous_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className="mono" style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                {comparison.previous_invoice_number}
              </span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Target Invoice ({comparison.current_period})
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.3rem', color: '#fff' }} className="mono">
                ₹{parseFloat(comparison.current_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className="mono" style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                {comparison.current_invoice_number}
              </span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                Verified Net Delta
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.3rem', color: '#6ee7b7' }} className="mono">
                +₹{parseFloat(comparison.total_delta).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                {comparison.percentage_change} increase
              </span>
            </div>
          </div>

          {/* Mathematical Proof & Decomposition Explanation */}
          <div className="card" style={{ background: 'rgba(0, 0, 0, 0.35)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              Deterministic Variance Formula Proof
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              In standard enterprise financial accounting, variance decomposes strictly as:
              <br />
              <code className="mono" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                ΔTotal = Σ(Volume Variance + Rate Variance)
              </code>
              <br />
              Where <strong style={{ color: '#fff' }}>Volume Variance</strong> = (Q_curr - Q_prev) × P_prev, and <strong style={{ color: '#fff' }}>Rate Variance</strong> = Q_curr × (P_curr - P_prev).
            </p>
          </div>

          {/* Detailed Line Item Breakdown Table */}
          <div className="card">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>
              Itemized Line Item Variance Breakdown
            </h4>
            <div className="table-container">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Prev Qty</th>
                    <th>Curr Qty</th>
                    <th>Qty Delta</th>
                    <th>Prev Rate</th>
                    <th>Curr Rate</th>
                    <th>Volume Variance</th>
                    <th>Rate Variance</th>
                    <th>Net Item Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.line_item_breakdown?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                      <td className="mono">{item.previous_quantity}</td>
                      <td className="mono">{item.current_quantity}</td>
                      <td className="mono" style={{ color: item.quantity_delta !== '0' ? '#6ee7b7' : 'inherit' }}>
                        {item.quantity_delta}
                      </td>
                      <td className="mono">₹{item.previous_unit_price}</td>
                      <td className="mono">₹{item.current_unit_price}</td>
                      <td className="mono" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                        ₹{item.volume_variance}
                      </td>
                      <td className="mono" style={{ color: item.rate_variance !== '0.00' ? 'var(--accent-amber)' : 'inherit', fontWeight: 600 }}>
                        ₹{item.rate_variance}
                      </td>
                      <td className="mono" style={{ color: '#fff', fontWeight: 700 }}>
                        ₹{item.total_delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
