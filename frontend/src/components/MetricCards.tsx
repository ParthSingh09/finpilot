import React from 'react';
import { 
  TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, 
  ArrowUpRight, Clock, FileWarning, Scale 
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
  const totalInvoiced = invoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || '0'), 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');
  const overdueTotal = overdueInvoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || '0'), 0);
  const pendingProposals = proposals.filter(p => p.status === 'PENDING');
  const executedProposals = proposals.filter(p => p.status === 'EXECUTED');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {/* Metric 1: Active Billed Run Rate */}
      <div 
        className="card" 
        onClick={() => onSelectTab('invoices')}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Billed Run Rate
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8'
              }}>
                Q4 LIVE
              </span>
            </div>
            <h3 style={{ fontSize: '1.55rem', fontWeight: 800, marginTop: '0.4rem', color: '#fff' }} className="mono">
              ₹{totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Across {invoices.length} billed client accounts
              <ArrowUpRight size={13} color="var(--primary)" />
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

      {/* Metric 2: Uncollected Overdue Exposure */}
      <div 
        className="card" 
        onClick={() => onSelectTab('invoices')}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          border: overdueInvoices.length > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Uncollected Overdue Exposure
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f87171'
              }}>
                {overdueInvoices.length} DELINQUENT
              </span>
            </div>
            <h3 style={{ fontSize: '1.55rem', fontWeight: 800, marginTop: '0.4rem', color: '#fca5a5' }} className="mono">
              ₹{overdueTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Stark (56d overdue) & Nexus (32d overdue)
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

      {/* Metric 3: Contract Rate Violations */}
      <div 
        className="card" 
        onClick={() => onSelectTab('variance')}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contract Rate Violations
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24'
              }}>
                DISCREPANCY
              </span>
            </div>
            <h3 style={{ fontSize: '1.55rem', fontWeight: 800, marginTop: '0.4rem', color: '#fef08a' }} className="mono">
              ₹3,000.00 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Overcharge</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Acme Corp Support Tier billed @ ₹23k vs ₹20k rule
            </p>
          </div>
          <div style={{
            background: 'var(--accent-amber-bg)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-amber)'
          }}>
            <FileWarning size={20} />
          </div>
        </div>
      </div>

      {/* Metric 4: Staged Proposals (Unexecuted Escrow) */}
      <div 
        className="card" 
        onClick={() => onSelectTab('approvals')}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          border: pendingProposals.length > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Human Approvals
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: pendingProposals.length > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: pendingProposals.length > 0 ? '#34d399' : 'var(--text-muted)'
              }}>
                {pendingProposals.length} STAGED
              </span>
            </div>
            <h3 style={{ fontSize: '1.55rem', fontWeight: 800, marginTop: '0.4rem', color: '#a7f3d0' }} className="mono">
              {pendingProposals.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Awaiting Sign-off</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              {executedProposals.length} adjustment applied to ledger
            </p>
          </div>
          <div style={{
            background: 'var(--accent-emerald-bg)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-emerald)'
          }}>
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
