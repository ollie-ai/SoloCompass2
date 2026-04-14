import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  RefreshCw,
  Server,
  Database,
  Zap,
  CreditCard,
  Mail,
  Globe,
  MapPin,
  Image,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatUptime = (seconds) => {
  if (!seconds) return '0s';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const ServiceCard = ({ title, service, icon: Icon }) => {
  const statusColors = {
    connected: 'bg-success',
    online: 'bg-success',
    error: 'bg-error',
    offline: 'bg-error',
    checking: 'bg-warning',
    not_configured: 'bg-base-300'
  };
  
  const statusTextColors = {
    connected: 'text-success',
    online: 'text-success',
    error: 'text-error',
    offline: 'text-error',
    checking: 'text-warning',
    not_configured: 'text-base-content/40'
  };

  return (
    <div className="p-4 bg-base-100 rounded-2xl border border-base-300 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
            <Icon size={20} className="text-base-content/60" />
          </div>
          <span className="font-bold text-base-content">{title}</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[service.status] || 'bg-base-300'} ${
          service.status === 'checking' ? 'animate-pulse' : ''
        }`} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-base-content/40">Status</span>
          <span className={`font-bold capitalize ${statusTextColors[service.status] || 'text-base-content/60'}`}>
            {service.status?.replace('_', ' ') || 'Unknown'}
          </span>
        </div>
        {service.responseTime && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-content/40">Response Time</span>
            <span className="font-mono font-bold text-base-content/60">
              {service.responseTime}ms
            </span>
          </div>
        )}
        {service.error && (
          <div className="mt-2 p-2 bg-error/10 rounded-lg">
            <p className="text-xs text-error">{service.error}</p>
          </div>
        )}
        {service.provider && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-content/40">Provider</span>
            <span className="font-mono font-bold text-base-content/60">{service.provider}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SystemHealthSection = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      if (!systemHealth) setLoading(true);
      setRefreshing(true);
      const response = await api.get('/admin/system-health');
      if (response.data.success) {
        setSystemHealth(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch system health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <div className="text-center p-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-error" />
        <p className="text-base-content/60">Failed to load system health</p>
        <button
          onClick={fetchSystemHealth}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Auto-refresh notice */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-base-content/50">Auto-refreshes every 30 seconds</p>
        <button
          onClick={fetchSystemHealth}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-base-300 text-xs font-bold hover:bg-base-200 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ServiceCard title="Database" service={systemHealth.database} icon={Database} />
        <ServiceCard title="AI / OpenAI" service={systemHealth.ai} icon={Zap} />
        <ServiceCard title="Stripe" service={systemHealth.stripe} icon={CreditCard} />
        <ServiceCard title="Resend" service={systemHealth.resend} icon={Mail} />
        <ServiceCard title="FCDO Feed" service={systemHealth.fcdo} icon={Globe} />
        <ServiceCard title="Geoapify" service={systemHealth.geoapify} icon={MapPin} />
        <ServiceCard title="Unsplash" service={systemHealth.unsplash} icon={Image} />
      </div>

      {/* Server Information */}
      <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300">
        <h4 className="font-black text-xs uppercase tracking-widest text-base-content/60 mb-4 flex items-center gap-2">
          <Server size={16} />
          Server Information
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">Environment</p>
            <p className="font-mono text-sm font-bold capitalize">{systemHealth.server?.environment}</p>
          </div>
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">Node.js</p>
            <p className="font-mono text-sm font-bold">{systemHealth.server?.nodeVersion}</p>
          </div>
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">Uptime</p>
            <p className="font-mono text-sm font-bold">{formatUptime(systemHealth.server?.uptime)}</p>
          </div>
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">Health Check</p>
            <p className="font-mono text-sm font-bold">{systemHealth.server?.totalResponseTime || 0}ms</p>
          </div>
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">Memory RSS</p>
            <p className="font-mono text-xs font-bold">{formatBytes(systemHealth.server?.memoryUsage?.rss)}</p>
          </div>
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">Memory Heap</p>
            <p className="font-mono text-xs font-bold">{formatBytes(systemHealth.server?.memoryUsage?.heapTotal)}</p>
          </div>
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">PID</p>
            <p className="font-mono text-sm font-bold">{systemHealth.server?.pid}</p>
          </div>
          <div className="p-4 bg-base-100 rounded-xl border border-base-300">
            <p className="text-[10px] font-black text-base-content/40 uppercase mb-1">Last Check</p>
            <p className="font-mono text-xs font-bold">{new Date(systemHealth.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthSection;