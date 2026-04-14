import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  Settings,
  ToggleLeft,
  ToggleRight,
  Server,
  CreditCard,
  Mail,
  Zap,
  Globe,
  MapPin,
  Image,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const defaultFeatureFlags = {
  enable_ai_assistant: true,
  enable_buddy_matching: true,
  enable_flight_tracking: true,
  enable_esim_widget: true,
  enable_emergency_sos: true,
  maintenance_mode: false
};

const apiIntegrations = [
  { key: 'database', name: 'Database', icon: Server, provider: 'Supabase' },
  { key: 'stripe', name: 'Stripe', icon: CreditCard, provider: 'Stripe' },
  { key: 'resend', name: 'Resend', icon: Mail, provider: 'Resend' },
  { key: 'ai', name: 'AI / OpenAI', icon: Zap, provider: 'OpenAI/Azure' },
  { key: 'fcdo', name: 'FCDO Feed', icon: Globe, provider: 'FCDO' },
  { key: 'geoapify', name: 'Geoapify', icon: MapPin, provider: 'Geoapify' },
  { key: 'unsplash', name: 'Unsplash', icon: Image, provider: 'Unsplash' }
];

const featureFlagLabels = {
  enable_ai_assistant: 'AI Assistant',
  enable_buddy_matching: 'Trip Buddy Matching',
  enable_flight_tracking: 'Flight Tracking',
  enable_esim_widget: 'eSIM Widget',
  enable_emergency_sos: 'Emergency SOS',
  maintenance_mode: 'Maintenance Mode'
};

const getStatusColor = (status) => {
  switch (status) {
    case 'connected':
    case 'online':
      return { bg: 'bg-success', text: 'text-success', label: 'Connected' };
    case 'error':
    case 'offline':
      return { bg: 'bg-error', text: 'text-error', label: 'Error' };
    case 'checking':
      return { bg: 'bg-warning', text: 'text-warning', label: 'Checking' };
    default:
      return { bg: 'bg-base-300', text: 'text-base-content/40', label: 'Not Configured' };
  }
};

const FeatureFlagCard = ({ flag, value, onToggle }) => {
  return (
    <div className="p-4 bg-base-100 rounded-2xl border border-base-300 hover:border-sky-500/30 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-bold text-base-content text-sm">{featureFlagLabels[flag]}</p>
          <p className="text-xs text-base-content/40 font-mono mt-1">{flag}</p>
        </div>
        <button
          onClick={onToggle}
          className={`
            relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50
            ${value 
              ? 'bg-sky-500 shadow-lg shadow-sky-500/25' 
              : 'bg-base-300 group-hover:bg-base-300/80'
            }
          `}
        >
          <span className={`
            absolute top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300
            ${value ? 'left-7' : 'left-1'}
          `}>
            {value ? (
              <CheckCircle size={14} className="text-sky-500" />
            ) : (
              <AlertCircle size={14} className="text-base-content/30" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

const IntegrationCard = ({ integration, status, provider }) => {
  const statusInfo = getStatusColor(status);
  
  return (
    <div className="p-4 bg-base-100 rounded-2xl border border-base-300 hover:border-sky-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <integration.icon size={20} className="text-sky-500" />
          </div>
          <div>
            <p className="font-bold text-base-content text-sm">{integration.name}</p>
            <p className="text-xs text-base-content/40">{integration.provider}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusInfo.bg} ${status === 'checking' ? 'animate-pulse' : ''}`} />
      </div>
      <div className={`text-xs font-bold ${statusInfo.text}`}>
        {statusInfo.label}
      </div>
    </div>
  );
};

const ConfigSection = () => {
  const [featureFlags, setFeatureFlags] = useState(defaultFeatureFlags);
  const [apiStatus, setApiStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingFlag, setSavingFlag] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fall back to defaults
      try {
        const response = await api.get('/admin/system-health');
        if (response.data.success) {
          // Map system health to API status
          const health = response.data.data;
          setApiStatus({
            database: { status: health.database?.status || 'not_configured' },
            stripe: { status: health.stripe?.status || 'not_configured' },
            resend: { status: health.resend?.status || 'not_configured' },
            ai: { status: health.ai?.status || 'not_configured' },
            fcdo: { status: health.fcdo?.status || 'not_configured' },
            geoapify: { status: health.geoapify?.status || 'not_configured' },
            unsplash: { status: health.unsplash?.status || 'not_configured' }
          });
        }
      } catch (e) {
        console.log('Using default API status');
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatureFlag = async (flag) => {
    try {
      setSavingFlag(flag);
      const newValue = !featureFlags[flag];
      
      setFeatureFlags(prev => ({ ...prev, [flag]: newValue }));
      
      const response = await api.post('/admin/config/flags', {
        flag,
        value: newValue
      });
      
      if (response.data.success) {
        toast.success(`${featureFlagLabels[flag]} ${newValue ? 'enabled' : 'disabled'}`);
      } else {
        setFeatureFlags(prev => ({ ...prev, [flag]: !newValue }));
        toast.error('Failed to update flag');
      }
    } catch (error) {
      setFeatureFlags(prev => ({ ...prev, [flag]: !featureFlags[flag] }));
      toast.error('Failed to update flag');
    } finally {
      setSavingFlag(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Feature Flags Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <ToggleLeft size={20} className="text-sky-500" />
          </div>
          <div>
            <h3 className="font-black text-lg text-base-content">Feature Flags</h3>
            <p className="text-sm text-base-content/50">Control which features are available to users</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(featureFlags).map(([flag, value]) => (
            <FeatureFlagCard
              key={flag}
              flag={flag}
              value={value}
              onToggle={() => !savingFlag && toggleFeatureFlag(flag)}
            />
          ))}
        </div>
      </div>

      {/* API Integrations Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Server size={20} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-black text-lg text-base-content">API Integrations</h3>
            <p className="text-sm text-base-content/50">Status of connected services and integrations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {apiIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.key}
              integration={integration}
              status={apiStatus[integration.key]?.status || 'not_configured'}
              provider={apiStatus[integration.key]?.provider}
            />
          ))}
        </div>
      </div>

      {/* Environment Variables Status */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Settings size={20} className="text-violet-500" />
          </div>
          <div>
            <h3 className="font-black text-lg text-base-content">Environment Variables</h3>
            <p className="text-sm text-base-content/50">Configuration status for environment-based settings</p>
          </div>
        </div>
        
        <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-base-300">
            {[
              { key: 'DATABASE_URL', label: 'Database URL', status: apiStatus.database?.status },
              { key: 'STRIPE_SECRET_KEY', label: 'Stripe', status: apiStatus.stripe?.status },
              { key: 'RESEND_API_KEY', label: 'Resend', status: apiStatus.resend?.status },
              { key: 'OPENAI_API_KEY / AZURE_OPENAI_*', label: 'AI Provider', status: apiStatus.ai?.status },
              { key: 'FCDO_FEED_URL', label: 'FCDO Feed', status: apiStatus.fcdo?.status },
              { key: 'GEOAPIFY_API_KEY', label: 'Geoapify', status: apiStatus.geoapify?.status },
              { key: 'UNSPLASH_ACCESS_KEY', label: 'Unsplash', status: apiStatus.unsplash?.status },
              { key: 'INFISICAL_*', label: 'Secrets Manager', status: apiStatus.infisical?.status },
              { key: 'JWT_SECRET', label: 'JWT Secret', status: apiStatus.jwt?.status }
            ].map((env) => {
              const statusInfo = getStatusColor(env.status);
              return (
                <div key={env.key} className="p-4 flex items-center justify-between hover:bg-base-200/30 transition-colors">
                  <div>
                    <p className="font-bold text-base-content text-sm">{env.label}</p>
                    <p className="text-xs text-base-content/40 font-mono mt-1">{env.key}</p>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.bg}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center pt-4">
        <p className="text-xs text-base-content/40">
          Configuration loaded from server. Changes are applied immediately.
        </p>
      </div>
    </div>
  );
};

export default ConfigSection;