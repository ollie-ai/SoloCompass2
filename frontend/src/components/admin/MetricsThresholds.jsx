import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  Gauge, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Save, 
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  CreditCard,
  HeadphonesIcon,
  AlertCircle
} from 'lucide-react';

const METRIC_LABELS = {
  error_rate: { name: 'Error Rate', unit: '%', icon: AlertTriangle, period: 'per hour' },
  avg_response_time: { name: 'Avg Response Time', unit: 'ms', icon: Clock, period: 'last check' },
  failed_logins: { name: 'Failed Logins', unit: '', icon: Users, period: 'per hour' },
  support_tickets: { name: 'Support Tickets', unit: '', icon: HeadphonesIcon, period: 'per day' },
  failed_payments: { name: 'Failed Payments', unit: '', icon: CreditCard, period: 'per day' },
  active_incidents: { name: 'Active Incidents', unit: '', icon: AlertCircle, period: 'current' }
};

const THRESHOLD_DEFAULTS = {
  error_rate: { warning: 1, critical: 5 },
  avg_response_time: { warning: 500, critical: 2000 },
  failed_logins: { warning: 10, critical: 50 },
  support_tickets: { warning: 20, critical: 100 },
  failed_payments: { warning: 5, critical: 20 },
  active_incidents: { warning: 3, critical: 10 }
};

const ThresholdCard = ({ metric, values, isEditing, editValues, onEditChange, onSave, onCancel, isSuperAdmin }) => {
  const config = METRIC_LABELS[metric];
  const Icon = config?.icon || Gauge;
  const currentValue = values?.value ?? 0;
  
  const criticalThreshold = values?.critical ?? (THRESHOLD_DEFAULTS[metric]?.critical ?? 0);
  const warningThreshold = values?.warning ?? (THRESHOLD_DEFAULTS[metric]?.warning ?? 0);
  
  let status = 'healthy';
  let statusColor = 'text-success';
  let bgColor = 'bg-success/10';
  
  if (currentValue >= criticalThreshold) {
    status = 'critical';
    statusColor = 'text-error';
    bgColor = 'bg-error/10';
  } else if (currentValue >= warningThreshold) {
    status = 'warning';
    statusColor = 'text-warning';
    bgColor = 'bg-warning/10';
  }

  return (
    <div className={`p-4 rounded-xl border ${status === 'healthy' ? 'border-base-300 bg-base-100' : `${bgColor} border-current/20`}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className={statusColor} />
          <span className="font-bold text-base-content">{config?.name || metric}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${statusColor}`}>
          {status === 'critical' && <XCircle size={14} />}
          {status === 'warning' && <AlertTriangle size={14} />}
          {status === 'healthy' && <CheckCircle size={14} />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      
      <div className="mb-3">
        <span className="text-2xl font-black text-base-content">
          {currentValue}
          <span className="text-sm font-medium text-base-content/50 ml-1">{config?.unit}</span>
        </span>
        <span className="text-xs text-base-content/40 ml-2">{config?.period}</span>
      </div>
      
      {isEditing ? (
        <div className="space-y-2 mt-3 pt-3 border-t border-base-300">
          <div className="flex items-center gap-2">
            <label className="text-xs text-warning font-medium w-16">Warning:</label>
            <input
              type="number"
              value={editValues.warning}
              onChange={(e) => onEditChange(metric, 'warning', parseFloat(e.target.value) || 0)}
              className="input input-sm input-bordered w-20"
              min={0}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-error font-medium w-16">Critical:</label>
            <input
              type="number"
              value={editValues.critical}
              onChange={(e) => onEditChange(metric, 'critical', parseFloat(e.target.value) || 0)}
              className="input input-sm input-bordered w-20"
              min={0}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => onSave(metric)} className="btn btn-xs btn-success">
              <Save size={12} /> Save
            </button>
            <button onClick={onCancel} className="btn btn-xs btn-ghost">
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs pt-3 border-t border-base-300">
          <div className="flex gap-4">
            <span className="text-warning">⚠️ {values?.warning ?? THRESHOLD_DEFAULTS[metric]?.warning}</span>
            <span className="text-error">🔴 {values?.critical ?? THRESHOLD_DEFAULTS[metric]?.critical}</span>
          </div>
          {isSuperAdmin && (
            <button onClick={() => onEditChange(metric, 'start', true)} className="text-sky-500 hover:text-sky-600">
              <Edit2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ViolationItem = ({ violation }) => {
  const config = METRIC_LABELS[violation.metric];
  const isCritical = violation.threshold === 'critical';
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isCritical ? 'bg-error/10' : 'bg-warning/10'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCritical ? 'bg-error/20' : 'bg-warning/20'}`}>
          {isCritical ? <XCircle size={16} className="text-error" /> : <AlertTriangle size={16} className="text-warning" />}
        </div>
        <div>
          <p className="font-medium text-base-content text-sm">{config?.name || violation.metric}</p>
          <p className="text-xs text-base-content/50">
            Value: <span className="font-bold">{violation.value}{config?.unit}</span> exceeded {violation.threshold} threshold of {violation.thresholdValue}{config?.unit}
          </p>
        </div>
      </div>
    </div>
  );
};

const MetricsThresholds = () => {
  const [loading, setLoading] = useState(true);
  const [thresholds, setThresholds] = useState(THRESHOLD_DEFAULTS);
  const [metrics, setMetrics] = useState({});
  const [violations, setViolations] = useState([]);
  const [summary, setSummary] = useState({ total: 0, critical: 0, warning: 0, healthy: 0 });
  const [editingMetric, setEditingMetric] = useState(null);
  const [editValues, setEditValues] = useState({ warning: 0, critical: 0 });
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchData();
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsSuperAdmin(user?.admin_level === 'super_admin');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [thresholdsRes, violationsRes] = await Promise.all([
        api.get('/admin/metrics/thresholds'),
        api.get('/admin/metrics/violations')
      ]);
      
      if (thresholdsRes?.data?.success) {
        setThresholds(thresholdsRes.data.data.thresholds);
      }
      
      if (violationsRes?.data?.success) {
        setViolations(violationsRes.data.data.violations || []);
        setMetrics(violationsRes.data.data.metrics || {});
        setSummary(violationsRes.data.data.summary || { total: 0, critical: 0, warning: 0, healthy: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      toast.error('Failed to load metrics data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (metric) => {
    const current = thresholds[metric] || THRESHOLD_DEFAULTS[metric];
    setEditValues({ warning: current.warning, critical: current.critical });
    setEditingMetric(metric);
  };

  const handleEditChange = (metric, field, value) => {
    if (field === 'start') {
      handleEditStart(metric);
    } else {
      setEditValues(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async (metric) => {
    if (editValues.critical <= editValues.warning) {
      toast.error('Critical threshold must be greater than warning');
      return;
    }

    try {
      setSaving(true);
      const result = await api.patch('/admin/metrics/thresholds', {
        thresholds: { [metric]: editValues }
      });

      if (result.data?.success) {
        setThresholds(prev => ({ ...prev, [metric]: editValues }));
        toast.success(`${METRIC_LABELS[metric]?.name || metric} threshold updated`);
        fetchData();
      } else {
        toast.error(result.data?.error || 'Failed to update threshold');
      }
    } catch (error) {
      console.error('Failed to save threshold:', error);
      toast.error('Failed to update threshold');
    } finally {
      setSaving(false);
      setEditingMetric(null);
    }
  };

  const handleCancel = () => {
    setEditingMetric(null);
  };

  const handleResetDefaults = async () => {
    try {
      setSaving(true);
      const result = await api.patch('/admin/metrics/thresholds', {
        thresholds: THRESHOLD_DEFAULTS
      });

      if (result.data?.success) {
        setThresholds(THRESHOLD_DEFAULTS);
        toast.success('Thresholds reset to defaults');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to reset thresholds');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  const hasViolations = violations.length > 0;
  const criticalViolations = violations.filter(v => v.threshold === 'critical');

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge size={24} className="text-sky-500" />
          <h2 className="text-xl font-black text-base-content">Metrics & Thresholds</h2>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <button onClick={handleResetDefaults} disabled={saving} className="btn btn-sm btn-ghost">
              Reset to Defaults
            </button>
          )}
          <button onClick={fetchData} disabled={loading} className="btn btn-sm btn-outline">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${hasViolations ? 'bg-error/10 border-error/20' : 'bg-success/10 border-success/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            {hasViolations ? <AlertTriangle size={18} className="text-error" /> : <CheckCircle size={18} className="text-success" />}
            <span className="text-sm font-medium text-base-content/60">Status</span>
          </div>
          <p className={`text-2xl font-black ${hasViolations ? 'text-error' : 'text-success'}`}>
            {hasViolations ? 'Attention Needed' : 'All Healthy'}
          </p>
        </div>
        
        <div className="p-4 rounded-xl border border-error/20 bg-error/10">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={18} className="text-error" />
            <span className="text-sm font-medium text-base-content/60">Critical</span>
          </div>
          <p className="text-2xl font-black text-error">{summary.critical}</p>
        </div>
        
        <div className="p-4 rounded-xl border border-warning/20 bg-warning/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-warning" />
            <span className="text-sm font-medium text-base-content/60">Warning</span>
          </div>
          <p className="text-2xl font-black text-warning">{summary.warning}</p>
        </div>
        
        <div className="p-4 rounded-xl border border-success/20 bg-success/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-success" />
            <span className="text-sm font-medium text-base-content/60">Healthy</span>
          </div>
          <p className="text-2xl font-black text-success">{summary.healthy}</p>
        </div>
      </div>

      {/* Active Violations Panel */}
      {violations.length > 0 && (
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
          <div className="p-4 bg-error/5 border-b border-error/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className={criticalViolations.length > 0 ? 'text-error' : 'text-warning'} />
              <h3 className="font-black text-base-content">Active Violations</h3>
              <span className={`badge ${criticalViolations.length > 0 ? 'badge-error' : 'badge-warning'}`}>
                {violations.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {violations.map((violation, idx) => (
              <ViolationItem key={idx} violation={violation} />
            ))}
          </div>
        </div>
      )}

      {/* Threshold Cards Grid */}
      <div className="bg-base-100 rounded-xl border border-base-300 p-4">
        <h3 className="font-black text-base-content mb-4 flex items-center gap-2">
          <Gauge size={18} className="text-sky-500" />
          Threshold Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(THRESHOLD_DEFAULTS).map(metric => (
            <ThresholdCard
              key={metric}
              metric={metric}
              values={{
                value: metrics[metric]?.value ?? 0,
                warning: thresholds[metric]?.warning ?? THRESHOLD_DEFAULTS[metric].warning,
                critical: thresholds[metric]?.critical ?? THRESHOLD_DEFAULTS[metric].critical
              }}
              isEditing={editingMetric === metric}
              editValues={editValues}
              onEditChange={handleEditChange}
              onSave={handleSave}
              onCancel={handleCancel}
              isSuperAdmin={isSuperAdmin}
            />
          ))}
        </div>
      </div>

      {/* Historical Chart Placeholder */}
      <div className="bg-base-100 rounded-xl border border-base-300 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-base-content flex items-center gap-2">
            <TrendingUp size={18} className="text-sky-500" />
            7-Day Trend
          </h3>
          <span className="text-xs text-base-content/40">Chart integration coming soon</span>
        </div>
        <div className="h-40 flex items-center justify-center bg-base-200/30 rounded-lg">
          <div className="text-center text-base-content/40">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Historical metrics visualization</p>
            <p className="text-xs">Connect Chart.js for detailed trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsThresholds;
