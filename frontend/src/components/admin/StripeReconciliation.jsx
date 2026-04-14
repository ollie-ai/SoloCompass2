import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter,
  ArrowRightLeft,
  Wrench,
  History,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';

const StripeReconciliation = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalDiscrepancies, setTotalDiscrepancies] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const isSuperAdmin = user?.admin_level === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSyncStatus();
      fetchDiscrepancies();
      fetchLogs();
    }
  }, [isSuperAdmin, page, filterType, filterSeverity]);

  const fetchSyncStatus = async () => {
    try {
      const response = await api.get('/admin/stripe/sync-status');
      if (response.data.success) {
        setSyncStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const fetchDiscrepancies = async () => {
    try {
      setLoading(true);
      const params = { limit, offset: (page - 1) * limit };
      if (filterType !== 'all') params.type = filterType;
      if (filterSeverity !== 'all') params.severity = filterSeverity;

      const response = await api.get('/admin/stripe/discrepancies', { params });
      if (response.data.success) {
        setDiscrepancies(response.data.data.discrepancies);
        setTotalDiscrepancies(response.data.data.total);
      }
    } catch (error) {
      toast.error('Failed to fetch discrepancies');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/stripe/reconciliation-logs', { 
        params: { limit: 10 } 
      });
      if (response.data.success) {
        setLogs(response.data.data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/admin/stripe/sync');
      if (response.data.success) {
        toast.success('Reconciliation completed successfully');
        fetchSyncStatus();
        fetchDiscrepancies();
        fetchLogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleFix = async (userId, fixType = 'sync_to_local') => {
    try {
      const response = await api.post(`/admin/stripe/discrepancies/${userId}/fix`, { 
        fixType 
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDiscrepancies();
        fetchLogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fix discrepancy');
    }
  };

  const handleFixAllLow = async () => {
    const lowSeverity = discrepancies.filter(d => d.severity === 'low' && d.user_id);
    if (lowSeverity.length === 0) {
      toast.info('No low-severity discrepancies to fix');
      return;
    }

    let fixed = 0;
    for (const disc of lowSeverity) {
      try {
        await api.post(`/admin/stripe/discrepancies/${disc.user_id}/fix`, { 
          fixType: 'sync_to_local' 
        });
        fixed++;
      } catch (e) {}
    }
    
    toast.success(`Fixed ${fixed} discrepancies`);
    fetchDiscrepancies();
    fetchLogs();
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const getSeverityBadge = (severity) => {
    const config = {
      high: { color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'High' },
      medium: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Medium' },
      low: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Low' }
    };
    const { color, label } = config[severity] || config.low;
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${color}`}>
        {label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const config = {
      status_mismatch: { color: 'bg-amber-500/10 text-amber-600', icon: AlertTriangle },
      plan_mismatch: { color: 'bg-purple-500/10 text-purple-600', icon: ArrowRightLeft },
      missing_stripe: { color: 'bg-red-500/10 text-red-600', icon: XCircle },
      missing_local: { color: 'bg-orange-500/10 text-orange-600', icon: Users }
    };
    const { color, icon: Icon } = config[type] || { color: 'bg-gray-500/10 text-gray-600', icon: AlertCircle };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${color}`}>
        <Icon size={12} />
        {type?.replace(/_/g, ' ')}
      </span>
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-error/10 rounded-full p-6 mb-4">
          <AlertCircle size={48} className="text-error" />
        </div>
        <h3 className="text-xl font-bold text-base-content mb-2">Access Denied</h3>
        <p className="text-base-content/60 text-center max-w-md">
          This section is restricted to super administrators only.
        </p>
      </div>
    );
  }

  const isNotConfigured = syncStatus && !syncStatus.configured;

  return (
    <div className="space-y-6">
      {isNotConfigured && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-warning shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-warning">Stripe Not Configured</h3>
              <p className="text-base-content/70 mt-1">
                {syncStatus?.message || 'Add STRIPE_SECRET_KEY to enable reconciliation.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={syncing || isNotConfigured}
            className={`btn btn-primary gap-2 ${syncing ? 'loading' : ''}`}
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
          
          {syncStatus?.lastSync && (
            <div className="flex items-center gap-2 text-base-content/60 text-sm">
              <Clock size={14} />
              Last sync: {formatDate(syncStatus.lastSync.timestamp)}
            </div>
          )}
        </div>

        {totalDiscrepancies > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleFixAllLow}
              disabled={!discrepancies.some(d => d.severity === 'low' && d.user_id)}
              className="btn btn-sm btn-outline gap-1"
            >
              <Wrench size={14} />
              Fix All Low
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-base-200/30 rounded-xl p-4 border border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Users className="text-sky-500" size={20} />
            </div>
            <div>
              <p className="text-base-content/60 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-base-content">
                {syncStatus?.lastSync?.details?.total_users_checked || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-200/30 rounded-xl p-4 border border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="text-emerald-500" size={20} />
            </div>
            <div>
              <p className="text-base-content/60 text-sm">Synced</p>
              <p className="text-2xl font-bold text-base-content">
                {syncStatus?.lastSync?.details?.total_synced || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-200/30 rounded-xl p-4 border border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-base-content/60 text-sm">Discrepancies</p>
              <p className="text-2xl font-bold text-base-content">
                {syncStatus?.lastSync?.details?.discrepancies_found || 0}
              </p>
            </div>
          </div>
          {syncStatus?.lastSync?.details && (
            <div className="mt-3 flex gap-2 text-xs">
              <span className="text-red-500">H: {syncStatus.lastSync.details.high_severity}</span>
              <span className="text-amber-500">M: {syncStatus.lastSync.details.medium_severity}</span>
              <span className="text-blue-500">L: {syncStatus.lastSync.details.low_severity}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-base-200/30 rounded-xl p-4 border border-base-300">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-base-content/50" />
            <span className="text-sm font-medium text-base-content/70">Type:</span>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="select select-sm select-bordered"
            >
              <option value="all">All Types</option>
              <option value="status_mismatch">Status Mismatch</option>
              <option value="plan_mismatch">Plan Mismatch</option>
              <option value="missing_stripe">Missing in Stripe</option>
              <option value="missing_local">Missing Local</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-base-content/70">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}
              className="select select-sm select-bordered"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>User</th>
              <th>Local Status</th>
              <th>Stripe Status</th>
              <th>Local Plan</th>
              <th>Stripe Plan</th>
              <th>Severity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </td>
              </tr>
            ) : discrepancies.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-base-content/50">
                  <CheckCircle size={32} className="mx-auto mb-2 text-success" />
                  <p>No discrepancies found</p>
                </td>
              </tr>
            ) : (
              discrepancies.map((disc, idx) => (
                <tr key={idx} className="hover">
                  <td>{getTypeBadge(disc.type)}</td>
                  <td>
                    <div>
                      <p className="font-bold text-sm">{disc.user_name || disc.stripe_email || 'Unknown'}</p>
                      <p className="text-xs text-base-content/50">{disc.user_email || disc.stripe_email || '-'}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      disc.local_status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-base-300 text-base-content/50'
                    }`}>
                      {disc.local_status || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      disc.stripe_status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                      disc.stripe_status === 'past_due' ? 'bg-amber-500/10 text-amber-500' :
                      disc.stripe_status === 'canceled' ? 'bg-red-500/10 text-red-500' :
                      'bg-base-300 text-base-content/50'
                    }`}>
                      {disc.stripe_status || '-'}
                    </span>
                  </td>
                  <td className="text-sm">{disc.local_plan || '-'}</td>
                  <td className="text-sm">{disc.stripe_plan || '-'}</td>
                  <td>{getSeverityBadge(disc.severity)}</td>
                  <td>
                    {disc.user_id && isSuperAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleFix(disc.user_id, 'sync_to_local')}
                          className="btn btn-xs btn-outline btn-primary"
                          title="Sync to Local"
                        >
                          <ArrowRightLeft size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalDiscrepancies > limit && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-sm"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {Math.ceil(totalDiscrepancies / limit)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalDiscrepancies / limit)}
            className="btn btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {logs.length > 0 && (
        <div className="bg-base-200/30 rounded-xl p-4 border border-base-300">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-base-content/50" />
            <h3 className="font-bold text-base-content">Action Log</h3>
          </div>
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-base-100 rounded-lg">
                <div className="mt-1">
                  {log.event_name === 'stripe_reconciliation_completed' ? (
                    <CheckCircle size={16} className="text-emerald-500" />
                  ) : (
                    <Wrench size={16} className="text-sky-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-base-content">
                    {log.event_name === 'stripe_reconciliation_completed' 
                      ? 'Reconciliation completed' 
                      : 'Discrepancy fixed'}
                  </p>
                  {log.event_data && (
                    <p className="text-xs text-base-content/50 mt-1">
                      {JSON.stringify(log.event_data).substring(0, 100)}
                    </p>
                  )}
                </div>
                <div className="text-xs text-base-content/50">
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StripeReconciliation;