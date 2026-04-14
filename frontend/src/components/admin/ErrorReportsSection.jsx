import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import AdminModal from './AdminModal';
import Button from '../Button';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Clock, 
  ChevronDown,
  Copy,
  Check,
  X,
  Archive,
  RotateCcw,
  CheckSquare,
  ArchiveRestore
} from 'lucide-react';

const ErrorReportsSection = () => {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(7);
  const [showDismissed, setShowDismissed] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedStack, setCopiedStack] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const limit = 20;
  const offset = (page - 1) * limit;

  useEffect(() => {
    fetchErrors();
  }, [page, days, showDismissed]);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs', {
        params: { type: 'client_error', days, limit, offset, dismissed: showDismissed ? 'true' : 'false' }
      });
      
      if (response.data.success) {
        setErrors(response.data.data.logs || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch error reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewError = (error) => {
    setSelectedError(error);
    setShowDetailModal(true);
  };

  const handleDismissError = async (id) => {
    try {
      setDismissing(true);
      await api.post(`/admin/errors/${id}/dismiss`);
      toast.success('Error dismissed');
      fetchErrors();
      setShowDetailModal(false);
    } catch (error) {
      toast.error('Failed to dismiss error');
    } finally {
      setDismissing(false);
    }
  };

  const handleRestoreError = async (id) => {
    try {
      setDismissing(true);
      await api.post(`/admin/errors/${id}/restore`);
      toast.success('Error restored');
      fetchErrors();
    } catch (error) {
      toast.error('Failed to restore error');
    } finally {
      setDismissing(false);
    }
  };

  const handleBulkDismiss = async () => {
    if (selectedRows.size === 0) return;
    try {
      setBulkLoading(true);
      const ids = Array.from(selectedRows);
      await api.post('/admin/errors/bulk-dismiss', { ids });
      toast.success(`Dismissed ${ids.length} errors`);
      setSelectedRows(new Set());
      fetchErrors();
    } catch (error) {
      toast.error('Failed to dismiss errors');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedRows.size === 0) return;
    try {
      setBulkLoading(true);
      const ids = Array.from(selectedRows);
      await api.post('/admin/errors/bulk-restore', { ids });
      toast.success(`Restored ${ids.length} errors`);
      setSelectedRows(new Set());
      fetchErrors();
    } catch (error) {
      toast.error('Failed to restore errors');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSelectionChange = useCallback((selected) => {
    setSelectedRows(selected);
  }, []);

  const handleCopyStack = () => {
    if (selectedError?.event_data) {
      const data = typeof selectedError.event_data === 'string' 
        ? selectedError.event_data 
        : JSON.stringify(selectedError.event_data, null, 2);
      navigator.clipboard.writeText(data);
      setCopiedStack(true);
      setTimeout(() => setCopiedStack(false), 2000);
    }
  };

  const formatStackTrace = (eventData) => {
    if (!eventData) return 'No stack trace available';
    try {
      const data = typeof eventData === 'string' ? JSON.parse(eventData) : eventData;
      return data.stack || data.error?.stack || JSON.stringify(data, null, 2);
    } catch {
      return String(eventData);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'error',
      label: 'Error',
      sortable: false,
      render: (_, row) => {
        let errorInfo = { message: 'Unknown error', type: 'Error' };
        try {
          const data = typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data;
          errorInfo = { 
            message: data?.message || data?.error?.message || 'Unknown error',
            type: data?.type || data?.error?.type || 'Error'
          };
        } catch {}
        
        return (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
              <Bug size={14} className="text-error" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-base-content truncate max-w-xs">{errorInfo.message}</p>
              <p className="text-[10px] text-base-content/50">{errorInfo.type}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'source',
      label: 'Source',
      sortable: false,
      render: (_, row) => {
        let source = 'Unknown';
        try {
          const data = typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data;
          source = data?.source || data?.url || row.event_name;
        } catch {}
        return (
          <code className="text-xs text-base-content/60">{source}</code>
        );
      }
    },
    {
      key: 'user',
      label: 'User',
      sortable: false,
      render: (_, row) => (
        <span className="text-xs text-base-content/60">
          {row.user_email || 'Anonymous'}
        </span>
      )
    },
    {
      key: 'timestamp',
      label: 'Time',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1 text-xs text-base-content/40">
          <Clock size={12} />
          {new Date(row.timestamp).toLocaleString()}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (_, row) => (
        row.dismissed_at ? (
          <span className="px-2 py-1 bg-base-300 text-base-content/50 text-[10px] font-bold rounded flex items-center gap-1">
            <Archive size={10} />
            Dismissed
          </span>
        ) : (
          <span className="px-2 py-1 bg-error/10 text-error text-[10px] font-bold rounded">
            Active
          </span>
        )
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (_, row) => (
        <button 
          onClick={() => handleViewError(row)}
          className="p-2 hover:bg-base-100 rounded-xl transition-all text-base-content/40 hover:text-primary"
          title="View Details"
        >
          <ChevronDown size={16} />
        </button>
      )
    }
  ], []);

  const dayOptions = [
    { value: 1, label: 'Last 24 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' }
  ];

  const errorStats = useMemo(() => {
    const stats = { active: 0, dismissed: 0 };
    errors.forEach(err => {
      if (err.dismissed_at) {
        stats.dismissed++;
      } else {
        stats.active++;
      }
    });
    return stats;
  }, [errors]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-error/10 rounded-2xl border border-error/20">
          <div className="flex items-center gap-2 mb-1">
            <Bug size={14} className="text-error" />
            <span className="text-xs font-bold text-error">Active Errors</span>
          </div>
          <p className="text-2xl font-black text-error">{errorStats.active}</p>
        </div>
        <div className="p-4 bg-base-100 rounded-2xl border border-base-300">
          <div className="flex items-center gap-2 mb-1">
            <Archive size={14} className="text-base-content/50" />
            <span className="text-xs font-bold text-base-content/60">Dismissed</span>
          </div>
          <p className="text-2xl font-black text-base-content">{errorStats.dismissed}</p>
        </div>
        <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-sky-500" />
            <span className="text-xs font-bold text-sky-500">Total</span>
          </div>
          <p className="text-2xl font-black text-sky-500">{total}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">Time Range:</span>
            <select
              value={days}
              onChange={(e) => { setDays(parseInt(e.target.value)); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm font-medium"
            >
              {dayOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDismissed(false)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${!showDismissed ? 'bg-sky-500 text-white' : 'bg-base-200 text-base-content/60 hover:bg-base-300'}`}
            >
              Active
            </button>
            <button
              onClick={() => setShowDismissed(true)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${showDismissed ? 'bg-sky-500 text-white' : 'bg-base-200 text-base-content/60 hover:bg-base-300'}`}
            >
              <Archive size={14} className="inline mr-1" />
              Dismissed
            </button>
          </div>
        </div>
        
        <Button variant="outline" onClick={fetchErrors}>
          <RefreshCw size={14} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <AdminDataTable
        data={errors}
        columns={columns}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onRefresh={fetchErrors}
        onSelectionChange={handleSelectionChange}
        showCheckboxes={true}
        bulkActions={[
          {
            label: 'Dismiss Selected',
            icon: Archive,
            onClick: handleBulkDismiss,
            loading: bulkLoading,
            show: !showDismissed && selectedRows.size > 0
          },
          {
            label: 'Restore Selected',
            icon: ArchiveRestore,
            onClick: handleBulkRestore,
            loading: bulkLoading,
            show: showDismissed && selectedRows.size > 0
          }
        ]}
        emptyMessage={showDismissed ? "No dismissed errors" : "No errors reported in this period"}
        emptyIcon={Check}
      />

      {/* Error Detail Modal */}
      <AdminModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedError(null); }}
        title="Error Details"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            {selectedError?.dismissed_at ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/50">
                  Dismissed by {selectedError.dismissed_by} at {new Date(selectedError.dismissed_at).toLocaleString()}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRestoreError(selectedError.id)}
                  disabled={dismissing}
                >
                  <RotateCcw size={14} className="mr-1" />
                  Restore
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleDismissError(selectedError?.id)}
                  disabled={dismissing}
                  className="bg-error hover:bg-error/90 border-error"
                >
                  {dismissing ? 'Dismissing...' : (
                    <>
                      <Archive size={14} className="mr-1" />
                      Dismiss Error
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedError && (
          <div className="space-y-4">
            <div className="p-4 bg-base-200/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-base-content/60 uppercase">Error Type</span>
                <span className="px-2 py-1 bg-error/10 text-error text-xs font-bold rounded">
                  {(() => {
                    try {
                      const data = typeof selectedError.event_data === 'string' ? JSON.parse(selectedError.event_data) : selectedError.event_data;
                      return data?.type || 'Error';
                    } catch { return 'Error'; }
                  })()}
                </span>
              </div>
              <p className="font-bold text-base-content">
                {(() => {
                  try {
                    const data = typeof selectedError.event_data === 'string' ? JSON.parse(selectedError.event_data) : selectedError.event_data;
                    return data?.message || data?.error?.message || 'Unknown error';
                  } catch { return 'Unknown error'; }
                })()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-base-200/30 rounded-xl">
                <p className="text-xs text-base-content/50 mb-1">User</p>
                <p className="font-medium text-base-content">{selectedError.user_email || 'Anonymous'}</p>
              </div>
              <div className="p-3 bg-base-200/30 rounded-xl">
                <p className="text-xs text-base-content/50 mb-1">Time</p>
                <p className="font-medium text-base-content">{new Date(selectedError.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-base-content/60 uppercase">Stack Trace</p>
                <button
                  onClick={handleCopyStack}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  {copiedStack ? <Check size={12} /> : <Copy size={12} />}
                  {copiedStack ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs overflow-x-auto max-h-64 font-mono">
                {formatStackTrace(selectedError.event_data)}
              </pre>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default ErrorReportsSection;