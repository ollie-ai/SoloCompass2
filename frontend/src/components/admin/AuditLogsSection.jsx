import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import { 
  ShieldAlert,
  RefreshCw,
  Search,
  Filter,
  Download,
  Clock
} from 'lucide-react';

const AuditLogsSection = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState('');
  const [days, setDays] = useState(30);
  const limit = 50;
  const offset = (page - 1) * limit;

  useEffect(() => {
    fetchAuditLogs();
  }, [page, eventType, days]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs', {
        params: { limit, offset, type: eventType, days }
      });
      
      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleExport = () => {
    const headers = ['Event', 'User', 'Data', 'Timestamp'];
    const rows = logs.map(log => [
      log.event_name,
      log.user_email || 'System',
      JSON.stringify(log.event_data),
      new Date(log.timestamp).toISOString()
    ].join(','));
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(() => [
    {
      key: 'event',
      label: 'Event',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            row.event_name?.includes('SOS') ? 'bg-error animate-ping' : 'bg-primary'
          }`} />
          <span className="font-bold text-sm text-base-content">{row.event_name}</span>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      sortable: false,
      render: (_, row) => (
        <span className="text-xs font-medium text-base-content/60">
          {row.user_email || 'System'}
        </span>
      )
    },
    {
      key: 'data',
      label: 'Data',
      sortable: false,
      render: (_, row) => (
        <div className="max-w-xs truncate">
          <code className="text-[10px] font-mono bg-base-200 px-2 py-1 rounded text-base-content/70">
            {row.event_data || '{}'}
          </code>
        </div>
      )
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (_, row) => (
        <span className="text-[10px] font-bold text-base-content/40 font-mono italic">
          {new Date(row.timestamp).toLocaleString()}
        </span>
      )
    }
  ], []);

  const filterOptions = [
    { value: '', label: 'All Events' },
    { value: 'user_registered', label: 'User Registered' },
    { value: 'user_login', label: 'User Login' },
    { value: 'trip_created', label: 'Trip Created' },
    { value: 'trip_updated', label: 'Trip Updated' },
    { value: 'sos_triggered', label: 'SOS Triggered' },
    { value: 'safety_checkin', label: 'Safety Check-in' }
  ];

  const dayOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Real-time Stream
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => { setDays(parseInt(e.target.value)); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm font-medium"
          >
            {dayOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-base-300 text-sm font-bold hover:bg-base-200 transition-all"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        data={logs}
        columns={columns}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onFilter={setEventType}
        onRefresh={fetchAuditLogs}
        filterOptions={filterOptions}
        emptyMessage="No events recorded yet"
        emptyIcon={Clock}
      />
    </div>
  );
};

export default AuditLogsSection;