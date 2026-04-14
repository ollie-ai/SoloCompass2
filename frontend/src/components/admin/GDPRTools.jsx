import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminModal from './AdminModal';
import Button from '../Button';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  RefreshCw, 
  FileText,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  Database,
  History,
  EyeOff
} from 'lucide-react';

const GDPRTools = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retentionSettings, setRetentionSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('audit-log');

  useEffect(() => {
    fetchAuditLogs();
    fetchRetentionSettings();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/gdpr/audit-log', {
        params: { limit: 50 }
      });
      setAuditLogs(response.data.data?.logs || []);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRetentionSettings = async () => {
    try {
      const response = await api.get('/admin/gdpr/retention');
      setRetentionSettings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch retention settings');
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'export':
        return <Download size={14} className="text-sky-500" />;
      case 'anonymize':
        return <EyeOff size={14} className="text-amber-500" />;
      case 'delete':
        return <Trash2 size={14} className="text-red-500" />;
      default:
        return <Eye size={14} className="text-base-content/50" />;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'export':
        return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'anonymize':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'delete':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-base-300 text-base-content/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-sky-500/10 rounded-2xl border border-sky-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <Shield size={24} className="text-sky-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-base-content">Privacy & GDPR</h2>
            <p className="text-base-content/60">Manage data exports, deletions, and compliance tools</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-base-300">
        <button
          onClick={() => setActiveTab('audit-log')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit-log'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-base-content/50 hover:text-base-content'
          }`}
        >
          <History size={16} />
          Privacy Audit Log
        </button>
        <button
          onClick={() => setActiveTab('retention')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'retention'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-base-content/50 hover:text-base-content'
          }`}
        >
          <Database size={16} />
          Data Retention
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'audit-log' && (
        <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-base-200/30 flex items-center justify-between">
            <h3 className="font-black text-base-content flex items-center gap-2">
              <Clock size={18} className="text-sky-500" />
              Privacy Audit Log
            </h3>
            <button
              onClick={fetchAuditLogs}
              className="p-2 hover:bg-base-100 rounded-xl transition-all text-sky-500"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="animate-spin text-sky-500" size={32} />
            </div>
          ) : auditLogs.length > 0 ? (
            <div className="divide-y divide-base-300">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-base-200/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionBadge(log.action).split(' ')[0]}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <p className="font-bold text-base-content">{log.user_name || 'System'}</p>
                        <p className="text-sm text-base-content/60">{log.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <p className="text-xs text-base-content/40 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {log.target_user && (
                    <div className="mt-2 ml-11 text-xs text-base-content/50">
                      Target: {log.target_user}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-base-content/40">
              <History size={48} className="mx-auto mb-2 opacity-30" />
              <p>No privacy audit logs yet</p>
              <p className="text-sm mt-1">Actions like exports, anonymizations, and deletions will appear here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'retention' && (
        <div className="space-y-4">
          <div className="bg-base-100 rounded-2xl border border-base-300 p-6">
            <h3 className="font-black text-base-content mb-4 flex items-center gap-2">
              <Database size={18} className="text-sky-500" />
              Data Retention Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-base-200/30 rounded-xl">
                <div className="flex items-center gap-2 text-base-content/60 mb-2">
                  <Calendar size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Last Cleanup</span>
                </div>
                <p className="font-bold text-base-content">
                  {retentionSettings?.last_cleanup 
                    ? new Date(retentionSettings.last_cleanup).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              
              <div className="p-4 bg-base-200/30 rounded-xl">
                <div className="flex items-center gap-2 text-base-content/60 mb-2">
                  <Clock size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Retention Period</span>
                </div>
                <p className="font-bold text-base-content">
                  {retentionSettings?.retention_days || 365} days
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-sky-500 mt-0.5" />
                <div>
                  <p className="font-bold text-base-content text-sm">GDPR Compliance</p>
                  <p className="text-xs text-base-content/60 mt-1">
                    User data is retained according to your settings. Users can request data deletion at any time via their account settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-300 p-6">
            <h3 className="font-black text-base-content mb-4">Data Categories</h3>
            <div className="space-y-3">
              {[
                { category: 'User Profiles', retention: 'Until account deletion', gdpr: 'Required' },
                { category: 'Trip Data', retention: 'Until account deletion', gdpr: 'Required' },
                { category: 'Check-ins', retention: '2 years', gdpr: 'Analytics' },
                { category: 'Session Logs', retention: '90 days', gdpr: 'Security' },
                { category: 'Audit Logs', retention: '1 year', gdpr: 'Compliance' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-base-200/30 rounded-xl">
                  <div>
                    <p className="font-medium text-base-content">{item.category}</p>
                    <p className="text-xs text-base-content/50">{item.gdpr}</p>
                  </div>
                  <span className="text-sm text-base-content/60">{item.retention}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDPRTools;