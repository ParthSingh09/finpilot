import React from 'react';
import { 
  Bot, ShieldCheck, FileSpreadsheet, CheckCircle2, 
  History, Sparkles, Scale, RefreshCw, Cpu 
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'chat' | 'invoices' | 'variance' | 'approvals' | 'audit';
  setActiveTab: (tab: 'chat' | 'invoices' | 'variance' | 'approvals' | 'audit') => void;
  pendingCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header style={{
      background: 'rgba(10, 13, 20, 0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.75rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                FinPilot
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '0.12rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.18)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                FINANCE OPS AGENT
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Deterministic Investigation & Human Approval Workspace
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'chat' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'chat' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={14} />
            <span>Investigation</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'invoices' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'invoices' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileSpreadsheet size={14} />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('variance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'variance' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'variance' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Scale size={14} />
            <span>Variance Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'approvals' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'approvals' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
          >
            <ShieldCheck size={14} />
            <span>Approvals</span>
            {pendingCount > 0 && (
              <span style={{
                background: 'var(--accent-amber)',
                color: '#000',
                fontSize: '0.62rem',
                fontWeight: 800,
                borderRadius: '999px',
                padding: '0.08rem 0.38rem',
                marginLeft: '0.15rem'
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'audit' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'audit' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <History size={14} />
            <span>Audit Trail</span>
          </button>
        </nav>

        {/* Live Engine Status Indicator & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--accent-emerald)'
          }}>
            <span className="pulse-indicator" style={{ width: '6px', height: '6px' }} />
            <span>Python Decimal Engine Active</span>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh All System Records"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
};
