import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import AdminModal from './AdminModal';
import Button from '../Button';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  RefreshCw,
  Clock,
  X
} from 'lucide-react';

const IncidentsSection = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', description: '', severity: 'info' });
  const limit = 20;

  useEffect(() => {
    fetchIncidents();
  }, [page, statusFilter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await api.get('/admin/incidents', { params: { status: statusFilter, limit, offset } });
      if (response.data.success) {
        setIncidents(response.data.data.incidents || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!newIncident.title) {
      toast.error('Title is required');
      return;
    }
    try {
      const response = await api.post('/admin/incidents', newIncident);
      if (response.data.success) {
        toast.success('Incident created');
        setShowCreateModal(false);
        setNewIncident({ title: '', description: '', severity: 'info' });
        fetchIncidents();
      }
    } catch (error) {
      toast.error('Failed to create incident');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.post(`/admin/incidents/${id}/acknowledge`);
      toast.success('Incident acknowledged');
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to acknowledge');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.post(`/admin/incidents/${id}/resolve`, { resolution: 'Resolved by admin' });
      toast.success('Incident resolved');
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to resolve');
    }
  };

  const columns = [
    {
      key: 'severity',
      label: 'Severity',
      render: (severity) => {
        const colors = {
          info: 'bg-info/10 text-info',
          warning: 'bg-warning/10 text-warning',
          degraded: 'bg-warning/20 text-warning',
          major: 'bg-error/10 text-error',
          critical: 'bg-error text-white'
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[severity] || colors.info}`}>
            {severity}
          </span>
        );
      }
    },
    {
      key: 'title',
      label: 'Title',
      render: (title, row) => (
        <div>
          <p className="font-bold text-base-content">{title}</p>
          <p className="text-xs text-base-content/50 truncate max-w-xs">{row.description}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => {
        const colors = {
          active: 'bg-error/10 text-error',
          acknowledged: 'bg-warning/10 text-warning',
          resolved: 'bg-success/10 text-success'
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[status] || colors.active}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (date) => (
        <span className="text-xs text-base-content/50">{date ? new Date(date).toLocaleString() : '-'}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status !== 'acknowledged' && (
            <Button variant="outline" size="xs" onClick={() => handleAcknowledge(row.id)}>
              Ack
            </Button>
          )}
          {row.status !== 'resolved' && (
            <Button variant="success" size="xs" onClick={() => handleResolve(row.id)}>
              Resolve
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-base-300 bg-base-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="mr-2" />
          New Incident
        </Button>
      </div>

      <AdminDataTable
        data={incidents}
        columns={columns}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onRefresh={fetchIncidents}
        emptyMessage="No incidents"
        emptyIcon={AlertTriangle}
      />

      <AdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Incident"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateIncident}>Create</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Title</label>
            <input
              type="text"
              value={newIncident.title}
              onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100"
              placeholder="Incident title"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea
              value={newIncident.description}
              onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Severity</label>
            <select
              value={newIncident.severity}
              onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="degraded">Degraded</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default IncidentsSection;
