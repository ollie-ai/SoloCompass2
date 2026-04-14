import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  FileText,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const ActionApprovalSection = () => {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingActions, setPendingActions] = useState([]);
  const [historyActions, setHistoryActions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const isSuperAdmin = user?.admin_level === 'super_admin';

  const fetchPendingActions = async () => {
    try {
      const response = await fetch('/api/admin/actions/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPendingActions(data.data.actions);
      }
    } catch (err) {
      console.error('Failed to fetch pending actions:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/admin/actions/history?status=${activeTab === 'history-approved' ? 'approved' : activeTab === 'history-rejected' ? 'rejected' : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistoryActions(data.data.actions);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/actions/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchPendingActions(), fetchHistory(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [token, activeTab]);

  useEffect(() => {
    if (activeTab === 'pending') {
      const interval = setInterval(fetchPendingActions, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, token]);

  const handleApprove = async () => {
    if (!selectedAction) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/actions/${selectedAction.id}/approve`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note: approveNote })
      });
      const data = await response.json();
      if (data.success) {
        setShowApproveModal(false);
        setSelectedAction(null);
        setApproveNote('');
        await Promise.all([fetchPendingActions(), fetchHistory(), fetchStats()]);
      } else {
        setError(data.error || 'Failed to approve action');
      }
    } catch (err) {
      setError('Failed to approve action');
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedAction || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/actions/${selectedAction.id}/reject`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await response.json();
      if (data.success) {
        setShowRejectModal(false);
        setSelectedAction(null);
        setRejectReason('');
        await Promise.all([fetchPendingActions(), fetchHistory(), fetchStats()]);
      } else {
        setError(data.error || 'Failed to reject action');
      }
    } catch (err) {
      setError('Failed to reject action');
    }
    setProcessing(false);
  };

  const getActionIcon = (actionType) => {
    const icons = {
      delete_user: <User className="w-4 h-4" />,
      bulk_delete_users: <User className="w-4 h-4" />,
      anonymize_user: <User className="w-4 h-4" />,
      delete_destination: <FileText className="w-4 h-4" />,
      force_cancel_subscription: <AlertTriangle className="w-4 h-4" />,
      modify_another_admin: <ShieldCheck className="w-4 h-4" />,
      bulk_export: <FileText className="w-4 h-4" />
    };
    return icons[actionType] || <FileText className="w-4 h-4" />;
  };

  const formatActionType = (actionType) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderPendingActions = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-sky-500"></span>
        </div>
      );
    }

    if (pendingActions.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-1">All caught up!</h3>
          <p className="text-base-content/60">No pending actions require your approval</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {pendingActions.map((action) => (
          <div 
            key={action.id} 
            className="bg-base-200/50 rounded-xl p-4 border border-sky-500/10 hover:border-sky-500/20 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
                  {getActionIcon(action.action_type)}
                </div>
                <div>
                  <h4 className="font-semibold text-base-content">
                    {formatActionType(action.action_type)}
                  </h4>
                  <p className="text-sm text-base-content/60">
                    Target: {action.target_type} ({action.target_id})
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-base-content/50">
                    <User className="w-3 h-3" />
                    <span>Requested by {action.actor_name || action.actor_email}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(action.created_at)}</span>
                  </div>
                  {action.params && Object.keys(JSON.parse(action.params || '{}')).length > 0 && (
                    <div className="mt-2 p-2 bg-base-300/50 rounded-lg">
                      <pre className="text-xs text-base-content/60 overflow-x-auto">
                        {JSON.stringify(JSON.parse(action.params || '{}'), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedAction(action);
                      setShowApproveModal(true);
                    }}
                    className="btn btn-sm btn-success gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAction(action);
                      setShowRejectModal(true);
                    }}
                    className="btn btn-sm btn-error gap-1"
                  >
                    <X className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHistory = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-sky-500"></span>
        </div>
      );
    }

    if (historyActions.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-300/50 flex items-center justify-center">
            <Clock className="w-8 h-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-1">No history yet</h3>
          <p className="text-base-content/60">Completed actions will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {historyActions.map((action) => (
          <div 
            key={action.id} 
            className={`bg-base-200/50 rounded-xl p-4 border ${
              action.status === 'approved' ? 'border-emerald-500/10' : 'border-red-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                action.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {action.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base-content">
                    {formatActionType(action.action_type)}
                  </h4>
                  <span className={`badge ${
                    action.status === 'approved' ? 'badge-success' : 'badge-error'
                  } badge-sm`}>
                    {action.status}
                  </span>
                </div>
                <p className="text-sm text-base-content/60">
                  Target: {action.target_type} ({action.target_id})
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-base-content/50">
                  <User className="w-3 h-3" />
                  <span>By {action.actor_name || action.actor_email}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(action.processed_at || action.created_at)}</span>
                </div>
                {action.status === 'rejected' && action.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                    <p className="text-xs text-red-500/80">
                      <strong>Reason:</strong> {action.rejection_reason}
                    </p>
                  </div>
                )}
                {action.status === 'approved' && (
                  <p className="text-xs text-emerald-500/70 mt-1">
                    Approved by {action.approver_name || action.approver_email}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">Dismiss</button>
        </div>
      )}

      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-base-200/50 rounded-xl p-4 border border-sky-500/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-content">{stats.pending}</p>
                <p className="text-sm text-base-content/60">Pending Approval</p>
              </div>
            </div>
          </div>
          <div className="bg-base-200/50 rounded-xl p-4 border border-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-content">{stats.approved}</p>
                <p className="text-sm text-base-content/60">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-base-200/50 rounded-xl p-4 border border-red-500/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-content">{stats.rejected}</p>
                <p className="text-sm text-base-content/60">Rejected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tabs tabs-boxed bg-base-200/50 w-fit">
        <button 
          className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Pending
          {stats.pending > 0 && (
            <span className="ml-2 badge badge-primary badge-sm">{stats.pending}</span>
          )}
        </button>
        <button 
          className={`tab ${activeTab === 'history-approved' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('history-approved')}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Approved
        </button>
        <button 
          className={`tab ${activeTab === 'history-rejected' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('history-rejected')}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejected
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-base-content">
          {activeTab === 'pending' ? 'Pending Actions' : 
           activeTab === 'history-approved' ? 'Approved Actions' : 'Rejected Actions'}
        </h3>
        <button 
          onClick={() => {
            fetchPendingActions();
            fetchHistory();
            fetchStats();
          }}
          className="btn btn-sm btn-ghost gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {!isSuperAdmin && activeTab === 'pending' ? (
        <div className="alert alert-warning">
          <ShieldCheck className="w-5 h-5" />
          <span>Only super admins can approve or reject pending actions.</span>
        </div>
      ) : (
        <>
          {activeTab === 'pending' && renderPendingActions()}
          {activeTab === 'history-approved' && renderHistory()}
          {activeTab === 'history-rejected' && renderHistory()}
        </>
      )}

      {showApproveModal && selectedAction && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Approve Action</h3>
            <p className="py-4 text-base-content/70">
              Are you sure you want to approve this {formatActionType(selectedAction.action_type)} action?
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Note (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Add a note about this approval..."
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedAction(null);
                  setApproveNote('');
                }}
                className="btn btn-ghost"
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                className="btn btn-success"
                disabled={processing}
              >
                {processing ? <span className="loading loading-spinner loading-sm"></span> : <Check className="w-4 h-4 mr-2" />}
                Approve
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowApproveModal(false)}></div>
        </div>
      )}

      {showRejectModal && selectedAction && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Reject Action</h3>
            <p className="py-4 text-base-content/70">
              You are about to reject this {formatActionType(selectedAction.action_type)} action.
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Rejection Reason (required)</span>
              </label>
              <textarea
                className="textarea textarea-bordered textarea-error"
                placeholder="Explain why this action is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedAction(null);
                  setRejectReason('');
                }}
                className="btn btn-ghost"
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="btn btn-error"
                disabled={processing || !rejectReason.trim()}
              >
                {processing ? <span className="loading loading-spinner loading-sm"></span> : <X className="w-4 h-4 mr-2" />}
                Reject
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default ActionApprovalSection;
