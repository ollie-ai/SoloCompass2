import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import Button from '../Button';
import { 
  Activity, 
  RefreshCw, 
  AlertTriangle,
  Clock,
  Zap,
  XCircle,
  CheckCircle,
  Timer,
  Play,
  Pause,
  BarChart3,
  Server,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const JobsSection = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [stats, setStats] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [historyJobs, setHistoryJobs] = useState([]);
  const [failedJobs, setFailedJobs] = useState([]);
  const [backoffSchedule, setBackoffSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStats, setHistoryStats] = useState(null);
  const limit = 20;

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, activeRes, historyRes] = await Promise.all([
        api.get('/admin/jobs/stats'),
        api.get('/admin/jobs/active'),
        api.get('/admin/jobs/history', { params: { limit: 50, offset: 0 } })
      ]);
      
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (activeRes.data.success) {
        setActiveJobs(activeRes.data.data.jobs || []);
      }
      if (historyRes.data.success) {
        setHistoryJobs(historyRes.data.data.jobs || []);
        setHistoryStats(historyRes.data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch queue data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFailedJobs = async () => {
    try {
      const response = await api.get('/admin/webhooks/failures', { params: { limit, offset: (historyPage - 1) * limit } });
      if (response.data.success) {
        setFailedJobs(response.data.data.failures || []);
        setBackoffSchedule(response.data.data.backoffSchedule || []);
      }
    } catch (error) {
      console.error('Failed to fetch failed jobs:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'failed') {
      fetchFailedJobs();
    }
  }, [activeTab, historyPage]);

  const handleRetry = async (id, immediate = true) => {
    try {
      const response = await api.post(`/admin/jobs/${id}/retry`, { immediate });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchQueueData();
      } else {
        toast.error(response.data.error || 'Failed to retry');
      }
    } catch (error) {
      toast.error('Failed to retry job');
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await api.post(`/admin/jobs/${id}/cancel`);
      if (response.data.success) {
        toast.success('Job cancelled');
        fetchQueueData();
      } else {
        toast.error(response.data.error || 'Failed to cancel');
      }
    } catch (error) {
      toast.error('Failed to cancel job');
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '-';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getHealthBadge = (health) => {
    const config = {
      healthy: { bg: 'bg-success/10', text: 'text-success', icon: CheckCircle, label: 'Healthy' },
      degraded: { bg: 'bg-warning/10', text: 'text-warning', icon: AlertTriangle, label: 'Degraded' },
      critical: { bg: 'bg-error/10', text: 'text-error', icon: AlertCircle, label: 'Critical' }
    };
    const c = config[health] || config.healthy;
    const Icon = c.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${c.bg} ${c.text}`}>
        <Icon size={14} />
        {c.label}
      </span>
    );
  };

  const QueueStatsCard = () => {
    if (!stats) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
          <div className="flex items-center gap-2 text-base-content/60 text-xs mb-1">
            <Clock size={12} />
            Pending
          </div>
          <div className="text-2xl font-bold text-warning animate-pulse">
            {stats.pending}
          </div>
        </div>
        
        <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
          <div className="flex items-center gap-2 text-base-content/60 text-xs mb-1">
            <Activity size={12} className="text-info animate-pulse" />
            Processing
          </div>
          <div className="text-2xl font-bold text-info">
            {stats.processing}
            <span className="relative ml-2 inline-flex">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-info opacity-75 animation-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-info"></span>
            </span>
          </div>
        </div>
        
        <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
          <div className="flex items-center gap-2 text-base-content/60 text-xs mb-1">
            <CheckCircle size={12} />
            Success Today
          </div>
          <div className="text-2xl font-bold text-success">
            {stats.successToday}
          </div>
        </div>
        
        <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
          <div className="flex items-center gap-2 text-base-content/60 text-xs mb-1">
            <AlertTriangle size={12} />
            Failed Today
          </div>
          <div className="text-2xl font-bold text-error">
            {stats.failedToday}
          </div>
        </div>
        
        <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
          <div className="flex items-center gap-2 text-base-content/60 text-xs mb-1">
            <TrendingUp size={12} />
            Success Rate
          </div>
          <div className="text-2xl font-bold text-base-content">
            {stats.successRate}%
          </div>
        </div>
        
        <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
          <div className="flex items-center gap-2 text-base-content/60 text-xs mb-1">
            <Timer size={12} />
            Avg Time
          </div>
          <div className="text-2xl font-bold text-base-content">
            {formatDuration(stats.avgProcessingTime)}
          </div>
        </div>
      </div>
    );
  };

  const ProcessingJobRow = ({ job }) => {
    const isProcessing = job.state === 'processing';
    const duration = isProcessing ? Date.now() - new Date(job.startedAt).getTime() : null;
    
    return (
      <div className="flex items-center justify-between p-3 bg-base-200/30 rounded-lg border border-base-300/20">
        <div className="flex items-center gap-3">
          {isProcessing && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-info"></span>
            </span>
          )}
          <div>
            <div className="font-mono text-sm font-medium">{job.id}</div>
            <div className="text-xs text-base-content/60">{job.type} • {job.state}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isProcessing && job.progress !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-base-300/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-info transition-all duration-500"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <span className="text-xs text-base-content/60">{job.progress}%</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="text-xs text-base-content/50">
              {formatDuration(duration)}
            </div>
          )}
          
          {!isProcessing && (
            <span className="text-xs text-warning">
              Waiting • {formatTimeAgo(job.createdAt)}
            </span>
          )}
          
          <Button 
            variant="ghost" 
            size="xs"
            className="text-error/70 hover:text-error"
            onClick={() => handleCancel(job.id)}
          >
            <XCircle size={14} />
          </Button>
        </div>
      </div>
    );
  };

  const HistoryJobRow = ({ job }) => {
    const isFailed = job.status === 'failed';
    
    return (
      <div className="flex items-center justify-between p-3 bg-base-200/30 rounded-lg border border-base-300/20">
        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-lg ${isFailed ? 'bg-error/10' : 'bg-success/10'}`}>
            {isFailed ? <AlertTriangle size={14} className="text-error" /> : <CheckCircle size={14} className="text-success" />}
          </span>
          <div>
            <div className="font-mono text-sm font-medium">{job.id}</div>
            <div className="text-xs text-base-content/60">{job.type}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-xs font-medium ${isFailed ? 'text-error' : 'text-success'}`}>
              {job.status}
            </div>
            <div className="text-xs text-base-content/40">
              {job.duration ? formatDuration(job.duration) : '-'}
            </div>
          </div>
          
          <div className="text-xs text-base-content/40">
            {formatTimeAgo(job.completedAt)}
          </div>
          
          {isFailed && job.attempts < job.maxAttempts && (
            <Button 
              variant="outline" 
              size="xs"
              onClick={() => handleRetry(job.id, true)}
            >
              <Zap size={12} />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const FailedJobDetails = ({ job }) => {
    const nextRetry = job.nextRetryAt ? new Date(job.nextRetryAt).getTime() - Date.now() : null;
    const retryText = nextRetry > 0 
      ? nextRetry < 60000 ? `${Math.ceil(nextRetry / 1000)}s` 
        : nextRetry < 3600000 ? `${Math.ceil(nextRetry / 60000)}m`
        : `${Math.ceil(nextRetry / 3600000)}h`
      : 'Ready';
    
    return (
      <div className="bg-base-200/30 rounded-lg border border-error/20 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-mono text-sm font-medium">{job.webhook_id?.slice(0, 16) || job.id}</div>
            <div className="text-xs text-base-content/60 mt-1">
              {job.url || job.type}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-error/10 text-error text-xs rounded font-medium uppercase">
              Failed
            </span>
            <span className="text-xs text-base-content/50">
              {job.attempts}/{job.max_attempts || job.maxAttempts} attempts
            </span>
          </div>
        </div>
        
        <div className="text-sm text-error/80 mb-3 bg-error/5 p-2 rounded">
          {job.error || job.response || 'Unknown error'}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="text-base-content/50">
            Last attempt: {formatTimeAgo(job.last_attempt_at || job.lastAttemptAt)}
          </div>
          
          <div className="flex items-center gap-2">
            {nextRetry > 0 && (
              <span className="flex items-center gap-1 text-warning">
                <Timer size={12} />
                Retry in {retryText}
              </span>
            )}
            
            {job.attempts < (job.max_attempts || job.maxAttempts) && (
              <Button variant="outline" size="xs" onClick={() => handleRetry(job.id, true)}>
                <Zap size={12} />
              </Button>
            )}
          </div>
        </div>
        
        {(job.next_retry_at || job.nextRetryAt) && nextRetry > 0 && (
          <div className="mt-2 w-full h-1.5 bg-base-300/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-warning transition-all"
              style={{ 
                width: `${Math.min(100, ((job.max_attempts || job.maxAttempts) - job.attempts) / (job.max_attempts || job.maxAttempts) * 100)}%` 
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Server className="text-base-content/50" size={20} />
          <span className="text-lg font-bold">Queue Status</span>
          {stats && getHealthBadge(stats.queueHealth)}
        </div>
        <Button 
          variant="outline" 
          onClick={fetchQueueData}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <QueueStatsCard />

      <div className="tabs tabs-boxed bg-base-200/30 w-fit">
        <button 
          className={`tab ${activeTab === 'queue' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <Play size={14} className="mr-2" />
          Processing
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <BarChart3 size={14} className="mr-2" />
          History
        </button>
        <button 
          className={`tab ${activeTab === 'failed' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('failed')}
        >
          <AlertTriangle size={14} className="mr-2" />
          Failed
          {failedJobs.length > 0 && (
            <span className="ml-1 badge badge-error badge-xs">{failedJobs.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'queue' && (
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-base-content/50">Loading queue...</div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <CheckCircle size={40} className="mx-auto mb-2 text-success/50" />
              <p>Queue is empty - all caught up!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-base-content/50 mb-2">
                <span className="font-medium">{activeJobs.filter(j => j.state === 'pending').length}</span> pending,
                <span className="font-medium">{activeJobs.filter(j => j.state === 'processing').length}</span> processing
              </div>
              {activeJobs.map(job => (
                <ProcessingJobRow key={job.id} job={job} />
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyStats && (
            <div className="flex items-center gap-4 p-3 bg-base-200/30 rounded-lg text-sm">
              <div className="text-base-content/60">Total:</div>
              <div className="font-medium">{historyStats.total}</div>
              <div className="text-success">{historyStats.success} success</div>
              <div className="text-error">{historyStats.failed} failed</div>
              <div className="text-base-content/60">Avg:</div>
              <div className="font-medium">{formatDuration(historyStats.avgDuration)}</div>
            </div>
          )}
          
          {historyJobs.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">No history yet</div>
          ) : (
            historyJobs.map(job => (
              <HistoryJobRow key={job.id} job={job} />
            ))
          )}
        </div>
      )}

      {activeTab === 'failed' && (
        <div className="space-y-3">
          {backoffSchedule.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-base-200/30 rounded-lg text-xs">
              <span className="text-base-content/60">Backoff schedule:</span>
              {backoffSchedule.map((b, i) => (
                <span key={i} className="px-2 py-0.5 bg-base-300/50 rounded">
                  {b.waitFormatted}
                </span>
              ))}
            </div>
          )}
          
          {failedJobs.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <CheckCircle size={40} className="mx-auto mb-2 text-success/50" />
              <p>No failed jobs - system is healthy!</p>
            </div>
          ) : (
            failedJobs.map(job => (
              <FailedJobDetails key={job.id} job={job} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default JobsSection;