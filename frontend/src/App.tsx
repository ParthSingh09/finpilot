import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { ChatPanel } from './components/Chat/ChatPanel';
import { InvoicesTable } from './components/Invoices/InvoicesTable';
import { ApprovalsQueue } from './components/Approvals/ApprovalsQueue';
import { VarianceAnalyzer } from './components/Variance/VarianceAnalyzer';
import { AuditLogViewer } from './components/AuditLogs/AuditLogViewer';
import { EvidenceDrawer } from './components/EvidencePanel/EvidenceDrawer';
import { Invoice, ActionProposal, AuditLog, EvidenceCard } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'invoices' | 'variance' | 'approvals' | 'audit'>('chat');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<ActionProposal[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCard | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [invData, propData, auditData] = await Promise.all([
        api.getInvoices(),
        api.getProposals(),
        api.getAuditLogs()
      ]);
      setInvoices(invData);
      setProposals(propData);
      setAuditLogs(auditData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingApprovalsCount = proposals.filter(p => p.status === 'PENDING').length;

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingApprovalsCount}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      <main className="main-content">
        {/* KPI Metrics */}
        <MetricCards
          invoices={invoices}
          proposals={proposals}
          onSelectTab={setActiveTab}
        />

        {/* Tab Views */}
        {activeTab === 'chat' && (
          <ChatPanel
            onOpenEvidence={ev => setSelectedEvidence(ev)}
            onProposalUpdated={loadData}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesTable
            invoices={invoices}
            onRefresh={loadData}
            onSelectInvoiceForCompare={() => setActiveTab('variance')}
          />
        )}

        {activeTab === 'variance' && (
          <VarianceAnalyzer />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsQueue
            proposals={proposals}
            onProposalUpdated={loadData}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogViewer
            logs={auditLogs}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Side Evidence Drawer */}
      <EvidenceDrawer
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}

export default App;
