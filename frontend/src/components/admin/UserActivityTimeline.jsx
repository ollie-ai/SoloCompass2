import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  Clock,
  User,
  Plane,
  Shield,
  Users,
  RefreshCw,
  Filter,
  Calendar,
  MapPin,
  MessageCircle,
  LogIn,
  LogOut,
  FileText,
  Bell,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const activityConfig = {
  user_registered: { icon: User, color: 'bg-success', label: 'Registered' },
  user_login: { icon: LogIn, color: 'bg-primary', label: 'Logged In' },
  user_logout: { icon: LogOut, color: 'bg-base-300', label: 'Logged Out' },
  user_profile_updated: { icon: User, color: 'bg-warning', label: 'Profile Updated' },
  trip_created: { icon: Plane, color: 'bg-primary', label: 'Trip Created' },
  trip_updated: { icon: MapPin, color: 'bg-info', label: 'Trip Updated' },
  trip_completed: { icon: Plane, color: 'bg-success', label: 'Trip Completed' },
  trip_deleted: { icon: Plane, color: 'bg-error', label: 'Trip Deleted' },
  itinerary_generated: { icon: FileText, color: 'bg-primary', label: 'Itinerary Generated' },
  checkin_completed: { icon: Shield, color: 'bg-success', label: 'Safety Check-in' },
  checkin_missed: { icon: Shield, color: 'bg-error', label: 'Check-in Missed' },
  checkin_sos: { icon: Bell, color: 'bg-error', label: 'SOS Triggered' },
  buddy_request: { icon: Users, color: 'bg-info', label: 'Buddy Request' },
  buddy_accepted: { icon: Users, color: 'bg-success', label: 'Buddy Accepted' },
  buddy_declined: { icon: Users, color: 'bg-warning', label: 'Buddy Declined' },
  review_submitted: { icon: MessageCircle, color: 'bg-warning', label: 'Review Submitted' },
  ai_chat_message: { icon: MessageCircle, color: 'bg-secondary', label: 'AI Chat' },
  advisory_notification: { icon: Bell, color: 'bg-warning', label: 'Travel Advisory' },
  client_error: { icon: Bell, color: 'bg-error', label: 'Client Error' }
};

const activityCategories = [
  { value: '', label: 'All Activities' },
  { value: 'login', label: 'Logins' },
  { value: 'trip', label: 'Trips' },
  { value: 'checkin', label: 'Check-ins' },
  { value: 'buddy', label: 'Buddies' },
  { value: 'profile', label: 'Profile' },
  { value: 'ai', label: 'AI Chat' },
  { value: 'error', label: 'Errors' }
];

const dateRangeOptions = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' }
];

const UserActivityTimeline = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [buddyRequests, setBuddyRequests] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activityType, setActivityType] = useState('');
  const [days, setDays] = useState(30);
  const limit = 30;
  const offset = (page - 1) * limit;

  useEffect(() => {
    if (user?.id) {
      fetchActivity();
    }
  }, [user?.id, page, activityType, days]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/user-activity/${user.id}`, {
        params: { limit, offset, type: activityType, days }
      });
      
      if (response.data.success) {
        setActivities(response.data.data.events || []);
        setTrips(response.data.data.trips || []);
        setBuddyRequests(response.data.data.buddyRequests || []);
        setCheckins(response.data.data.checkins || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch user activity');
    } finally {
      setLoading(false);
    }
  };

  const enrichedActivities = useMemo(() => {
    const items = [];
    
    // Add events from the events table
    activities.forEach(event => {
      const config = activityConfig[event.event_name] || { 
        icon: Activity, 
        color: 'bg-base-300', 
        label: event.event_name 
      };
      let details = '';
      try {
        const data = JSON.parse(event.event_data || '{}');
        if (data.destination) details = data.destination;
        else if (data.tripId) details = `Trip #${data.tripId}`;
        else if (data.status) details = data.status;
      } catch (e) {}
      
      items.push({
        id: `event-${event.id}`,
        type: 'event',
        eventName: event.event_name,
        icon: config.icon,
        color: config.color,
        label: config.label,
        timestamp: event.timestamp,
        details
      });
    });

    // Add trips
    trips.forEach(trip => {
      items.push({
        id: `trip-${trip.id}`,
        type: 'trip',
        eventName: trip.status === 'completed' ? 'trip_completed' : 'trip_created',
        icon: Plane,
        color: trip.status === 'completed' ? 'bg-success' : 'bg-primary',
        label: trip.status === 'completed' ? 'Trip Completed' : 'Trip Created',
        timestamp: trip.status === 'completed' ? trip.updated_at : trip.created_at,
        details: trip.destination || trip.name
      });
    });

    // Add buddy requests
    buddyRequests.forEach(request => {
      const isAccepted = request.status === 'accepted';
      const isDeclined = request.status === 'declined';
      const isSent = request.direction === 'sent';
      
      items.push({
        id: `buddy-${request.id}`,
        type: 'buddy',
        eventName: isAccepted ? 'buddy_accepted' : isDeclined ? 'buddy_declined' : 'buddy_request',
        icon: Users,
        color: isAccepted ? 'bg-success' : isDeclined ? 'bg-warning' : 'bg-info',
        label: isAccepted ? 'Buddy Accepted' : isDeclined ? 'Buddy Declined' : 'Buddy Request',
        timestamp: request.created_at,
        details: isSent 
          ? `Sent to ${request.buddy_name}` 
          : `From ${request.buddy_name}`,
        extra: request.message
      });
    });

    // Add safety check-ins
    checkins.forEach(checkin => {
      const isMissed = checkin.status === 'missed';
      const isCompleted = checkin.status === 'completed';
      const isSos = checkin.status === 'sos';
      
      items.push({
        id: `checkin-${checkin.id}`,
        type: 'checkin',
        eventName: isSos ? 'checkin_sos' : isMissed ? 'checkin_missed' : 'checkin_completed',
        icon: Shield,
        color: isSos || isMissed ? 'bg-error' : 'bg-success',
        label: isSos ? 'SOS Triggered' : isMissed ? 'Check-in Missed' : 'Safety Check-in',
        timestamp: checkin.completed_at || checkin.scheduled_time,
        details: checkin.location || 'No location',
        extra: checkin.trip_id ? `Trip #${checkin.trip_id}` : ''
      });
    });

    // Sort by timestamp descending
    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [activities, trips, buddyRequests, checkins]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-base-200/30 rounded-xl border border-base-300">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-base-content/50" />
          <span className="text-xs font-black uppercase tracking-widest text-base-content/60">Filter:</span>
        </div>
        
        <select
          value={activityType}
          onChange={(e) => { setActivityType(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-sm font-medium"
        >
          {activityCategories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        <select
          value={days}
          onChange={(e) => { setDays(parseInt(e.target.value)); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-sm font-medium"
        >
          {dateRangeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          onClick={fetchActivity}
          className="ml-auto p-2 hover:bg-base-100 rounded-lg transition-all text-base-content/50 hover:text-primary"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="animate-spin text-primary" size={32} />
        </div>
      ) : enrichedActivities.length === 0 ? (
        <div className="text-center p-12">
          <Clock size={48} className="mx-auto mb-2 text-base-content/30" />
          <p className="text-base-content/50 font-medium">No activity recorded</p>
          <p className="text-base-content/30 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-base-300/30 to-transparent" />

          <div className="space-y-4">
            {enrichedActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative flex gap-4"
                >
                  {/* Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl ${activity.color} flex items-center justify-center shadow-lg border-2 border-base-100`}>
                    <IconComponent size={18} className="text-base-100" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm text-base-content">
                        {activity.label}
                      </span>
                      <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-wider">
                        {activity.type}
                      </span>
                    </div>
                    
                    {activity.details && (
                      <p className="text-sm text-base-content/70 mb-1">{activity.details}</p>
                    )}
                    
                    {activity.extra && (
                      <p className="text-xs text-base-content/50 italic mb-1 truncate">{activity.extra}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-[10px] text-base-content/40">
                      <Clock size={10} />
                      <span title={formatFullTimestamp(activity.timestamp)}>
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-base-300">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-base-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-100"
          >
            Previous
          </button>
          <span className="text-sm text-base-content/60 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-base-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-100"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-base-300">
        <div className="p-3 bg-base-200/30 rounded-xl text-center">
          <p className="text-2xl font-black text-primary">{trips.length}</p>
          <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">Trips</p>
        </div>
        <div className="p-3 bg-base-200/30 rounded-xl text-center">
          <p className="text-2xl font-black text-success">{checkins.filter(c => c.status === 'completed').length}</p>
          <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">Check-ins</p>
        </div>
        <div className="p-3 bg-base-200/30 rounded-xl text-center">
          <p className="text-2xl font-black text-info">{buddyRequests.length}</p>
          <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">Buddies</p>
        </div>
        <div className="p-3 bg-base-200/30 rounded-xl text-center">
          <p className="text-2xl font-black text-base-content/60">
            {activities.filter(a => a.event_name === 'user_login').length}
          </p>
          <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">Logins</p>
        </div>
      </div>
    </div>
  );
};

export default UserActivityTimeline;