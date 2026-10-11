import React from 'react';
import { 
  DollarSign, AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp 
} from 'lucide-react';
import { Invoice, ActionProposal } from '../types';

interface MetricCardsProps {
  invoices: Invoice[];
  proposals: ActionProposal[];
  onSelectTab: (tab: 'chat' | 'invoices' | 'variance' | 'approvals' | 'audit') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  invoices,
  proposals,
  onSelectTab
}) => {
  // Compute metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || '0'), 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');
  const overdueTotal = overdueInvoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || '0'), 0);
  const pendingProposals = proposals.filter(p => p.status === 'PENDING');
  const executedProposals = proposals.filter(p => p.status === 'EXECUTED');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {/* Metric 1 */}
      <div 
        className="card" 
        onClick={() => onSelectTab('invoices')}
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Billed Volume
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.35rem', color: '#fff' }} className="mono">
              ₹{totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Across {invoices.length} active invoices
            </p>
          </div>
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--primary)'
          }}>
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Metric 2 */}
      <div 
        className="card" 
        onClick={() => onSelectTab('invoices')}
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171', textTransform: 'uppercase' }}>
              Overdue Receivables
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.35rem', color: '#fca5a5' }} className="mono">
              ₹{overdueTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              {overdueInvoices.length} account flagged for collection
            </p>
          </div>
          <div style={{
            background: 'var(--accent-rose-bg)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-rose)'
          }}>
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Metric 3 */}
      <div 
        className="card" 
        onClick={() => onSelectTab('variance')}
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase' }}>
              Pricing Discrepancies
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.35rem', color: '#fde68a' }} className="mono">
              2 Anomalies
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Acme Corp (₹3,000) & Nexus Dynamics
            </p>
          </div>
          <div style={{
            background: 'var(--accent-amber-bg)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-amber)'
          }}>
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* Metric 4 */}
      <div 
        className="card" 
        onClick={() => onSelectTab('approvals')}
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
              Pending Human Approvals
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.35rem', color: '#a7f3d0' }} className="mono">
              {pendingProposals.length} Action{pendingProposals.length === 1 ? '' : 's'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              {executedProposals.length} executed with audit records
            </p>
          </div>
          <div style={{
            background: 'var(--accent-emerald-bg)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-emerald)'
          }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
