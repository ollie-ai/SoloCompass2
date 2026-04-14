import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import { 
  CreditCard, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  XCircle,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';

const BillingSection = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('failures');
  const [failures, setFailures] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFailures, setTotalFailures] = useState(0);
  const [totalActivity, setTotalActivity] = useState(0);
  const [pageFailures, setPageFailures] = useState(1);
  const [pageActivity, setPageActivity] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const limit = 20;

  const isSuperAdmin = user?.admin_level === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchFailures();
      fetchActivity();
    }
  }, [pageFailures, pageActivity, statusFilter, dateFrom, dateTo, isSuperAdmin]);

  const fetchFailures = async () => {
    try {
      setLoading(true);
      const offset = (pageFailures - 1) * limit;
      const params = { limit, offset };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const response = await api.get('/admin/billing/failures', { params });
      if (response.data.success) {
        setFailures(response.data.data || []);
        setTotalFailures(response.data.data.length);
      }
    } catch (error) {
      toast.error('Failed to fetch payment failures');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const offset = (pageActivity - 1) * limit;
      const params = { limit, offset };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const response = await api.get('/admin/billing/activity', { params });
      if (response.data.success) {
        setActivity(response.data.data || []);
        setTotalActivity(response.data.data.length);
      }
    } catch (error) {
      toast.error('Failed to fetch billing activity');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'gbp') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const failureColumns = [
    {
      key: 'user_id',
      label: 'User',
      render: (_, row) => (
        <div>
          <p className="font-bold text-base-content text-sm">{row.user_id?.substring(0, 8) || 'N/A'}...</p>
          <p className="text-xs text-base-content/50">ID: {row.user_id?.substring(0, 8)}</p>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount, row) => (
        <span className="font-bold text-error">
          {formatCurrency(amount, row.currency)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => {
        const colors = {
          failed: 'bg-error/10 text-error border border-error/20',
          pending: 'bg-warning/10 text-warning border border-warning/20',
          refunded: 'bg-info/10 text-info border border-info/20'
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${colors[status] || colors.failed}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'failure_reason',
      label: 'Failure Reason',
      render: (reason) => (
        <div className="max-w-xs">
          <p className="text-sm text-base-content truncate" title={reason}>
            {reason || 'Unknown error'}
          </p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (date) => (
        <span className="text-xs text-base-content/50">{formatDate(date)}</span>
      )
    }
  ];

  const activityColumns = [
    {
      key: 'user_id',
      label: 'User',
      render: (_, row) => (
        <div>
          <p className="font-bold text-base-content text-sm">{row.user_id?.substring(0, 8) || 'N/A'}...</p>
          <p className="text-xs text-base-content/50">ID: {row.user_id?.substring(0, 8)}</p>
        </div>
      )
    },
    {
      key: 'event_name',
      label: 'Event',
      render: (event) => {
        const eventConfig = {
          subscription_upgraded: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          subscription_downgraded: { icon: TrendingDown, color: 'text-warning', bg: 'bg-warning/10' },
          subscription_cancelled: { icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
          subscription_started: { icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10' },
          payment_succeeded: { icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
          payment_failed: { icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' }
        };
        const config = eventConfig[event] || { icon: CreditCard, color: 'text-base-content/50', bg: 'bg-base-300' };
        const Icon = config.icon;
        
        return (
          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${config.bg}`}>
            <Icon size={14} className={config.color} />
            <span className={`text-xs font-bold ${config.color}`}>
              {event?.replace(/_/g, ' ')}
            </span>
          </div>
        );
      }
    },
    {
      key: 'plan_from',
      label: 'From',
      render: (plan) => (
        <span className="text-sm text-base-content/60">{plan || '-'}</span>
      )
    },
    {
      key: 'plan_to',
      label: 'To',
      render: (plan) => (
        <span className="text-sm font-bold text-base-content">{plan || '-'}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (date) => (
        <span className="text-xs text-base-content/50">{formatDate(date)}</span>
      )
    }
  ];

  const handleFilterApply = () => {
    setPageFailures(1);
    setPageActivity(1);
    fetchFailures();
    fetchActivity();
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPageFailures(1);
    setPageActivity(1);
    fetchFailures();
    fetchActivity();
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-error/10 rounded-full p-6 mb-4">
          <AlertCircle size={48} className="text-error" />
        </div>
        <h3 className="text-xl font-bold text-base-content mb-2">Access Denied</h3>
        <p className="text-base-content/60 text-center max-w-md">
          This section is restricted to super administrators only. You do not have permission to view billing data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-2 bg-base-200/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('failures')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'failures'
                ? 'bg-error text-white'
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            <AlertCircle size={16} className="inline mr-2" />
            Payment Failures
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'activity'
                ? 'bg-primary text-white'
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            <CreditCard size={16} className="inline mr-2" />
            Billing Activity
          </button>
        </div>
      </div>

      <div className="bg-base-200/30 rounded-xl p-4 border border-base-300">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-base-content/50" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-sm"
              placeholder="From"
            />
          </div>
          <span className="text-base-content/40">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-sm"
            placeholder="To"
          />
          {activeTab === 'failures' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-sm"
            >
              <option value="all">All Status</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleFilterApply}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'failures' && (
        <AdminDataTable
          data={failures}
          columns={failureColumns}
          loading={loading}
          total={totalFailures}
          page={pageFailures}
          limit={limit}
          onPageChange={setPageFailures}
          onRefresh={fetchFailures}
          emptyMessage="No failed payments"
          emptyIcon={AlertCircle}
        />
      )}

      {activeTab === 'activity' && (
        <AdminDataTable
          data={activity}
          columns={activityColumns}
          loading={loading}
          total={totalActivity}
          page={pageActivity}
          limit={limit}
          onPageChange={setPageActivity}
          onRefresh={fetchActivity}
          emptyMessage="No billing activity"
          emptyIcon={CreditCard}
        />
      )}
    </div>
  );
};

export default BillingSection;