import React, { useState } from 'react';
import { Search, Eye, Filter, ArrowUpDown, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Invoice } from '../../types';
import { api } from '../../services/api';

interface InvoicesTableProps {
  invoices: Invoice[];
  onSelectInvoiceForCompare?: (customerName: string) => void;
  onRefresh: () => void;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  onSelectInvoiceForCompare,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      (inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.billing_period.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = async (inv: Invoice) => {
    setIsLoadingDetail(true);
    try {
      const fullDetail = await api.getInvoiceDetails(inv.id);
      setSelectedInvoice(fullDetail);
    } catch (e) {
      setSelectedInvoice(inv);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID': return 'badge-paid';
      case 'ISSUED': return 'badge-issued';
      case 'OVERDUE': return 'badge-overdue';
      case 'DISPUTED': return 'badge-disputed';
      case 'ADJUSTED': return 'badge-adjusted';
      default: return 'badge-issued';
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search & Filter Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by customer name, invoice #, period..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="var(--text-dim)" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '0.6rem 0.85rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ISSUED">Issued</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="DISPUTED">Disputed</option>
              <option value="ADJUSTED">Adjusted</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredInvoices.length}</strong> of {invoices.length} invoices
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Billing Period</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(inv => (
              <tr key={inv.id}>
                <td className="mono" style={{ fontWeight: 600, color: '#93c5fd' }}>
                  {inv.invoice_number}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {inv.customer_name || 'Customer'}
                </td>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>
                  {inv.billing_period}
                </td>
                <td>{inv.issue_date}</td>
                <td>{inv.due_date}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="mono" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  ₹{parseFloat(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleViewDetails(inv)}
                    className="btn btn-ghost"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    <Eye size={13} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '700px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <span className={`badge ${getStatusBadgeClass(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.4rem' }}>
                  {selectedInvoice.invoice_number}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Customer: <strong>{selectedInvoice.customer?.name || selectedInvoice.customer_name}</strong> ({selectedInvoice.customer?.plan_tier} Plan)
                </p>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-ghost"
                style={{ padding: '0.4rem' }}
              >
                ✕ Close
              </button>
            </div>

            {/* Line Items */}
            <div style={{ marginTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.65rem' }}>
                Itemized Line Items
              </h4>
              <div className="table-container">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.line_items?.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>
                          {item.description}
                          {item.line_type === 'ADJUSTMENT' && (
                            <span className="badge badge-adjusted" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                              AUDITED ADJUSTMENT
                            </span>
                          )}
                        </td>
                        <td className="mono">{item.quantity}</td>
                        <td className="mono">₹{item.unit_price}</td>
                        <td className="mono" style={{ fontWeight: 700, color: '#fff' }}>
                          ₹{parseFloat(item.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments */}
            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.65rem' }}>
                  Verified Payment Transactions
                </h4>
                <div className="table-container">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Reference ID</th>
                        <th>Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.payments.map((p, pIdx) => (
                        <tr key={pIdx}>
                          <td>{p.payment_date}</td>
                          <td>{p.payment_method}</td>
                          <td className="mono">{p.reference_id || 'N/A'}</td>
                          <td className="mono" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                            ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Total Footer */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Billing Period: {selectedInvoice.billing_period}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Total:</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }} className="mono">
                  ₹{parseFloat(selectedInvoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
