import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Check,
  X,
  CheckSquare,
  Archive
} from 'lucide-react';

const OpsAlertsTable = ({ showStats = true }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0
  });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchAlerts();
  }, [page]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await api.get('/admin/notifications/ops-alerts', {
        params: { limit, offset }
      });
      
      if (response.data.success) {
        setAlerts(response.data.data.alerts || []);
        setTotal(response.data.data.total || 0);
        
        // Calculate stats
        const alertData = response.data.data.alerts || [];
        setStats({
          critical: alertData.filter(a => a.severity === 'critical' && !a.resolved_at).length,
          warning: alertData.filter(a => a.severity === 'warning' && !a.resolved_at).length,
          info: alertData.filter(a => a.severity === 'info' && !a.resolved_at).length,
          resolved: alertData.filter(a => a.resolved_at).length
        });
      }
    } catch (error) {
      toast.error('Failed to fetch ops alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.post(`/admin/notifications/ops-alerts/${id}/acknowledge`);
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.post(`/admin/notifications/ops-alerts/${id}/resolve`);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const handleBulkResolve = async () => {
    if (selectedRows.size === 0) return;
    try {
      setBulkLoading(true);
      const ids = Array.from(selectedRows);
      await api.post('/admin/notifications/ops-alerts/bulk-resolve', { ids });
      toast.success(`Resolved ${ids.length} alerts`);
      setSelectedRows(new Set());
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alerts');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkAcknowledge = async () => {
    if (selectedRows.size === 0) return;
    try {
      setBulkLoading(true);
      const ids = Array.from(selectedRows);
      await api.post('/admin/notifications/ops-alerts/bulk-acknowledge', { ids });
      toast.success(`Acknowledged ${ids.length} alerts`);
      setSelectedRows(new Set());
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to acknowledge alerts');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSelectionChange = useCallback((selected) => {
    setSelectedRows(selected);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const columns = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      sortable: false,
      render: (id) => (
        <span className="text-xs font-mono text-base-content/60">#{id}</span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: false,
      render: (_, row) => (
        <span className="text-xs font-bold text-base-content">{row.alert_type}</span>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: false,
      render: (_, row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
          row.severity === 'critical' ? 'bg-error/10 text-error' :
          row.severity === 'warning' ? 'bg-warning/10 text-warning' :
          'bg-info/10 text-info'
        }`}>
          {row.severity}
        </span>
      )
    },
    {
      key: 'message',
      label: 'Message',
      sortable: false,
      render: (_, row) => (
        <p className="text-xs text-base-content/70 max-w-md truncate">{row.message}</p>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: false,
      render: (_, row) => (
        <span className="text-[10px] font-bold text-base-content/40">
          {new Date(row.created_at).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {row.acknowledged_at ? (
            <CheckCircle size={14} className="text-warning" />
          ) : (
            <Clock size={14} className="text-base-content/40" />
          )}
          {row.resolved_at ? (
            <span className="text-xs font-bold text-success">Resolved</span>
          ) : row.acknowledged_at ? (
            <span className="text-xs font-bold text-warning">Acknowledged</span>
          ) : (
            <span className="text-xs font-bold text-error">Open</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          {!row.acknowledged_at && (
            <button
              onClick={() => handleAcknowledge(row.id)}
              className="px-3 py-1.5 rounded-lg bg-base-200 text-base-content text-[10px] font-black uppercase tracking-widest hover:bg-base-300 transition-all"
            >
              Acknowledge
            </button>
          )}
          {!row.resolved_at && (
            <button
              onClick={() => handleResolve(row.id)}
              className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-[10px] font-black uppercase tracking-widest hover:bg-success hover:text-white transition-all"
            >
              Resolve
            </button>
          )}
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-error/10 border border-error/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-error" />
              <span className="text-xs font-bold text-error uppercase">Critical</span>
            </div>
            <p className="text-2xl font-black text-error">{stats.critical}</p>
          </div>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-warning" />
              <span className="text-xs font-bold text-warning uppercase">Warning</span>
            </div>
            <p className="text-2xl font-black text-warning">{stats.warning}</p>
          </div>
          <div className="p-4 bg-info/10 border border-info/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-info" />
              <span className="text-xs font-bold text-info uppercase">Info</span>
            </div>
            <p className="text-2xl font-black text-info">{stats.info}</p>
          </div>
          <div className="p-4 bg-success/10 border border-success/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-success" />
              <span className="text-xs font-bold text-success uppercase">Resolved</span>
            </div>
            <p className="text-2xl font-black text-success">{stats.resolved}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <AdminDataTable
        data={alerts}
        columns={columns}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onRefresh={fetchAlerts}
        onSelectionChange={handleSelectionChange}
        showCheckboxes={true}
        bulkActions={[
          {
            label: 'Resolve Selected',
            icon: CheckCircle,
            onClick: handleBulkResolve,
            loading: bulkLoading,
            show: selectedRows.size > 0
          },
          {
            label: 'Acknowledge Selected',
            icon: Archive,
            onClick: handleBulkAcknowledge,
            loading: bulkLoading,
            show: selectedRows.size > 0
          }
        ]}
        emptyMessage="No ops alerts. All systems operational."
        emptyIcon={CheckCircle}
      />
    </div>
  );
};

export default OpsAlertsTable;