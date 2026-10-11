import React, { useState } from 'react';
import { History, Shield, Filter, Code, ArrowRight } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogViewerProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, onRefresh }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    if (filterType === 'ALL') return true;
    return log.entity_type === filterType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Immutable Financial Audit Trail
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Cryptographic ledger tracking all tool calls, proposal stages, and executed adjustments.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--text-dim)" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Entity Types</option>
            <option value="INVOICE">Invoices</option>
            <option value="ACTION_PROPOSAL">Action Proposals</option>
            <option value="COMMUNICATION">Communications</option>
            <option value="SYSTEM">System Genesis</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Entity Type</th>
                <th>Entity Reference</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Audit Notes</th>
                <th style={{ textAlign: 'right' }}>Payload Diff</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td>
                    <span className="badge badge-issued" style={{ fontSize: '0.65rem' }}>
                      {log.entity_type}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                    {log.entity_id}
                  </td>
                  <td>
                    <span className={`badge ${
                      log.action === 'EXECUTED' || log.action === 'ADJUSTED' ? 'badge-executed' :
                      log.action === 'PROPOSED' ? 'badge-pending' :
                      log.action === 'REJECTED' ? 'badge-rejected' : 'badge-issued'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.performed_by}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                    {log.notes || 'No extra notes'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(log.payload_before || log.payload_after) ? (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={() => setSelectedLog(log)}
                      >
                        <Code size={12} /> Inspect
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
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
          <div className="card" style={{ width: '680px', maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  Audit Record: {selectedLog.action} on {selectedLog.entity_type}
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  By {selectedLog.performed_by} at {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedLog(null)}
                style={{ padding: '0.35rem' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedLog.payload_before && (
                <div>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    State Prior to Execution (Before)
                  </h5>
                  <pre style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    fontSize: '0.75rem',
                    color: '#fca5a5'
                  }}>
                    {JSON.stringify(selectedLog.payload_before, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.payload_after && (
                <div>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Mutated State / Execution Result (After)
                  </h5>
                  <pre style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: '0.75rem',
                    color: '#a7f3d0'
                  }}>
                    {JSON.stringify(selectedLog.payload_after, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
