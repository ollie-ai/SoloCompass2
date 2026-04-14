import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import AdminModal from './AdminModal';
import Button from '../Button';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Bell, 
  RefreshCw,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  SkipForward
} from 'lucide-react';

const SafetySection = () => {
  const [events, setEvents] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [escalationsLoading, setEscalationsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  
  const [eventsTotal, setEventsTotal] = useState(0);
  const [escalationsTotal, setEscalationsTotal] = useState(0);
  
  const [eventsPage, setEventsPage] = useState(1);
  const [escalationsPage, setEscalationsPage] = useState(1);
  
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideAction, setOverrideAction] = useState('completed');
  
  const limit = 20;

  useEffect(() => {
    fetchEvents();
    fetchEscalations();
  }, [eventsPage, escalationsPage, eventTypeFilter, dateRangeFilter]);

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const offset = (eventsPage - 1) * limit;
      const params = { limit, offset };
      
      if (eventTypeFilter !== 'all') {
        params.event_type = eventTypeFilter;
      }
      
      if (dateRangeFilter !== 'all') {
        const now = new Date();
        let startDate;
        switch (dateRangeFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
            break;
          default:
            break;
        }
        if (startDate) params.start_date = startDate;
      }
      
      const response = await api.get('/admin/safety/events', { params });
      if (response.data.success) {
        setEvents(response.data.data || []);
        setEventsTotal(response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch safety events:', error);
      toast.error('Failed to fetch safety events');
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchEscalations = async () => {
    try {
      setEscalationsLoading(true);
      const offset = (escalationsPage - 1) * limit;
      const response = await api.get('/admin/safety/escalations', { params: { limit, offset } });
      if (response.data.success) {
        setEscalations(response.data.data || []);
        setEscalationsTotal(response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch escalations:', error);
      toast.error('Failed to fetch check-in escalations');
    } finally {
      setEscalationsLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!selectedEscalation) return;
    
    try {
      await api.post(`/admin/check-ins/${selectedEscalation.id}/override`, {
        action: overrideAction
      });
      toast.success(`Check-in marked as ${overrideAction}`);
      setShowOverrideModal(false);
      setSelectedEscalation(null);
      fetchEscalations();
    } catch (error) {
      toast.error('Failed to override check-in status');
    }
  };

  const openOverrideModal = (escalation, action) => {
    setSelectedEscalation(escalation);
    setOverrideAction(action);
    setShowOverrideModal(true);
  };

  const getEventIcon = (eventName) => {
    const icons = {
      sos: ShieldAlert,
      safety_alert: AlertTriangle,
      guardian_notification: Bell,
      check_in_missed: Clock,
      check_in_completed: CheckCircle
    };
    return icons[eventName] || AlertTriangle;
  };

  const getEventTypeLabel = (eventName) => {
    const labels = {
      sos: 'SOS',
      safety_alert: 'Safety Alert',
      guardian_notification: 'Guardian Alert',
      check_in_missed: 'Missed Check-in',
      check_in_completed: 'Check-in Complete'
    };
    return labels[eventName] || eventName;
  };

  const getEventTypeColor = (eventName) => {
    const colors = {
      sos: 'bg-error text-white',
      safety_alert: 'bg-warning text-warning-content',
      guardian_notification: 'bg-info text-info-content',
      check_in_missed: 'bg-error/10 text-error',
      check_in_completed: 'bg-success/10 text-success'
    };
    return colors[eventName] || 'bg-base-300 text-base-content';
  };

  const eventColumns = [
    {
      key: 'event_name',
      label: 'Type',
      render: (eventName) => {
        const EventIcon = getEventIcon(eventName);
        return (
          <div className="flex items-center gap-2">
            <EventIcon size={16} className={eventName === 'sos' ? 'text-error' : 'text-base-content/50'} />
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getEventTypeColor(eventName)}`}>
              {getEventTypeLabel(eventName)}
            </span>
          </div>
        );
      }
    },
    {
      key: 'user_id',
      label: 'User',
      render: (userId, row) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-base-content/50" />
          <span className="text-sm font-mono text-base-content/70">{userId?.slice(0, 8) || '-'}</span>
        </div>
      )
    },
    {
      key: 'trip_id',
      label: 'Trip',
      render: (tripId) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-base-content/50" />
          <span className="text-sm font-mono text-base-content/70">{tripId?.slice(0, 8) || '-'}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (date) => (
        <span className="text-xs text-base-content/50">
          {date ? new Date(date).toLocaleString() : '-'}
        </span>
      )
    },
    {
      key: 'event_data',
      label: 'Details',
      render: (eventData) => (
        <span className="text-xs text-base-content/50 max-w-xs truncate block">
          {eventData ? JSON.stringify(eventData).slice(0, 50) : '-'}
        </span>
      )
    }
  ];

  const escalationColumns = [
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
          status === 'missed' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
        }`}>
          {status}
        </span>
      )
    },
    {
      key: 'user_id',
      label: 'User',
      render: (userId) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-base-content/50" />
          <span className="text-sm font-mono text-base-content/70">{userId?.slice(0, 8) || '-'}</span>
        </div>
      )
    },
    {
      key: 'trip_id',
      label: 'Trip',
      render: (tripId) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-base-content/50" />
          <span className="text-sm font-mono text-base-content/70">{tripId?.slice(0, 8) || '-'}</span>
        </div>
      )
    },
    {
      key: 'scheduled_at',
      label: 'Scheduled',
      render: (date) => (
        <span className="text-xs text-base-content/50">
          {date ? new Date(date).toLocaleString() : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button 
            variant="success" 
            size="xs" 
            onClick={() => openOverrideModal(row, 'completed')}
          >
            <CheckCircle size={12} className="mr-1" />
            Complete
          </Button>
          <Button 
            variant="outline" 
            size="xs" 
            onClick={() => openOverrideModal(row, 'skipped')}
          >
            <SkipForward size={12} className="mr-1" />
            Skip
          </Button>
        </div>
      )
    }
  ];

  const isLoading = eventsLoading || escalationsLoading;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="tabs tabs-boxed bg-base-200">
            <button 
              className={`tab ${activeTab === 'events' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <ShieldAlert size={16} className="mr-2" />
              Safety Events
              <span className="badge badge-sm ml-2">{events.length}</span>
            </button>
            <button 
              className={`tab ${activeTab === 'escalations' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('escalations')}
            >
              <AlertTriangle size={16} className="mr-2" />
              Escalations
              <span className="badge badge-sm badge-error ml-2">{escalations.filter(e => e.status === 'missed').length}</span>
            </button>
          </div>
        </div>
        <Button variant="outline" onClick={() => { fetchEvents(); fetchEscalations(); }}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <select
              value={eventTypeFilter}
              onChange={(e) => { setEventTypeFilter(e.target.value); setEventsPage(1); }}
              className="px-3 py-2 rounded-xl border border-base-300 bg-base-100"
            >
              <option value="all">All Event Types</option>
              <option value="sos">SOS</option>
              <option value="safety_alert">Safety Alert</option>
              <option value="guardian_notification">Guardian Notification</option>
              <option value="check_in_missed">Check-in Missed</option>
              <option value="check_in_completed">Check-in Completed</option>
            </select>
            <select
              value={dateRangeFilter}
              onChange={(e) => { setDateRangeFilter(e.target.value); setEventsPage(1); }}
              className="px-3 py-2 rounded-xl border border-base-300 bg-base-100"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <AdminDataTable
            data={events}
            columns={eventColumns}
            loading={eventsLoading}
            total={eventsTotal}
            page={eventsPage}
            limit={limit}
            onPageChange={setEventsPage}
            onRefresh={fetchEvents}
            emptyMessage="No safety events recorded"
            emptyIcon={ShieldAlert}
          />
        </div>
      )}

      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="alert alert-warning max-w-md">
              <AlertTriangle size={16} />
              <span className="text-sm">
                {escalations.filter(e => e.status === 'missed').length} pending missed check-ins require attention
              </span>
            </div>
          </div>

          <AdminDataTable
            data={escalations}
            columns={escalationColumns}
            loading={escalationsLoading}
            total={escalationsTotal}
            page={escalationsPage}
            limit={limit}
            onPageChange={setEscalationsPage}
            onRefresh={fetchEscalations}
            emptyMessage="No escalations - all check-ins are on track!"
            emptyIcon={CheckCircle}
          />
        </div>
      )}

      <AdminModal
        isOpen={showOverrideModal}
        onClose={() => { setShowOverrideModal(false); setSelectedEscalation(null); }}
        title="Override Check-in Status"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowOverrideModal(false); setSelectedEscalation(null); }}>
              Cancel
            </Button>
            <Button onClick={handleOverride}>
              Confirm Override
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-base-content/70">
            <p>You are about to mark this check-in as:</p>
            <p className="font-bold text-lg mt-2 capitalize">{overrideAction}</p>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Action</span>
            </label>
            <select 
              value={overrideAction} 
              onChange={(e) => setOverrideAction(e.target.value)}
              className="select select-bordered"
            >
              <option value="completed">Mark as Completed</option>
              <option value="missed">Mark as Missed</option>
              <option value="skipped">Skip Check-in</option>
            </select>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default SafetySection;