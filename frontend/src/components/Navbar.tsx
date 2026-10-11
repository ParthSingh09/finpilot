import React from 'react';
import { 
  Bot, ShieldCheck, FileSpreadsheet, CheckCircle2, 
  History, Sparkles, Scale, RefreshCw 
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
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.85rem 2rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)'
          }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                FinPilot
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                OPS COPILOT
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Deterministic AI Finance Operations & Approval Agent
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
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
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'chat' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'chat' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={15} />
            AI Copilot
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'invoices' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'invoices' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileSpreadsheet size={15} />
            Invoices
          </button>

          <button
            onClick={() => setActiveTab('variance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'variance' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'variance' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Scale size={15} />
            Variance Engine
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'approvals' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'approvals' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
          >
            <ShieldCheck size={15} />
            Approvals
            {pendingCount > 0 && (
              <span style={{
                background: 'var(--accent-amber)',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: 800,
                borderRadius: '999px',
                padding: '0.1rem 0.4rem',
                marginLeft: '0.2rem'
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
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'audit' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'audit' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <History size={15} />
            Audit Trail
          </button>
        </nav>

        {/* Live Engine Status Indicator & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--accent-emerald)'
          }}>
            <span className="pulse-indicator" />
            <span>Deterministic Decimal Engine Active</span>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh All System Data"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
};
