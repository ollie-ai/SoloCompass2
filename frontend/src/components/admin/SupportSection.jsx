import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import AdminModal from './AdminModal';
import Button from '../Button';
import { 
  Headphones, 
  RefreshCw,
  Mail,
  User,
  Calendar,
  Eye,
  MessageSquare,
  Zap,
  Trash2,
  Edit
} from 'lucide-react';

const SupportSection = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [cannedResponses, setCannedResponses] = useState([]);
  const [cannedLoading, setCannedLoading] = useState(false);
  const [cannedCategory, setCannedCategory] = useState('all');
  const [selectedCanned, setSelectedCanned] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchTickets();
    checkAdminLevel();
  }, [page, statusFilter]);

  const checkAdminLevel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setIsSuperAdmin(decoded.admin_level === 'super_admin');
      }
    } catch (e) {
      setIsSuperAdmin(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const params = { limit, offset };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await api.get('/admin/support/tickets', { params });
      if (response.data.success) {
        let ticketsData = response.data.data.tickets || [];
        
        if (dateRange.start || dateRange.end) {
          ticketsData = ticketsData.filter(ticket => {
            const ticketDate = new Date(ticket.created_at);
            const start = dateRange.start ? new Date(dateRange.start) : null;
            const end = dateRange.end ? new Date(dateRange.end) : null;
            if (start && ticketDate < start) return false;
            if (end && ticketDate > end) return false;
            return true;
          });
        }
        
        setTickets(ticketsData);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCannedResponses = async (category = 'all') => {
    try {
      setCannedLoading(true);
      const params = { limit: 100, offset: 0 };
      if (category !== 'all') {
        params.category = category;
      }
      const response = await api.get('/admin/support/canned-responses', { params });
      if (response.data.success) {
        setCannedResponses(response.data.data.cannedResponses || []);
      }
    } catch (error) {
      console.error('Failed to fetch canned responses:', error);
    } finally {
      setCannedLoading(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleQuickReply = (ticket) => {
    setSelectedTicket(ticket);
    setShowCannedModal(true);
    fetchCannedResponses();
  };

  const handleCannedSelect = (canned) => {
    setSelectedCanned(canned);
    
    const variables = canned.variables || [];
    let body = canned.body || '';
    let subject = canned.subject || '';
    
    const ticketData = selectedTicket?.event_data || {};
    const userId = selectedTicket?.user_id;
    
    variables.forEach(v => {
      const regex = new RegExp(`{{${v}}}`, 'g');
      let value = '';
      
      switch (v) {
        case 'user_name':
          value = ticketData.name || 'User';
          break;
        case 'email':
          value = ticketData.email || '';
          break;
        case 'user_id':
          value = userId || '';
          break;
        case 'ticket_id':
          value = selectedTicket?.id || '';
          break;
        case 'destination':
          value = ticketData.destination || '';
          break;
        case 'reset_link':
          value = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5176'}/reset-password`;
          break;
        case 'help_url':
          value = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5176'}/help`;
          break;
        case 'profile_url':
          value = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5176'}/settings`;
          break;
        case 'billing_details':
          value = 'No billing issues found.';
          break;
        case 'plan_name':
          value = 'Premium';
          break;
        case 'start_date':
          value = new Date().toLocaleDateString();
          break;
        case 'next_billing':
          value = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
          break;
        case 'benefits':
          value = '- Unlimited trips\n- Priority support\n- Advanced safety features';
          break;
        case 'safety_url':
          value = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5176'}/safety-info`;
          break;
        case 'tips_url':
          value = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5176'}/help`;
          break;
        case 'guides_url':
          value = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5176'}/destinations`;
          break;
        default:
          value = `[${v}]`;
      }
      
      body = body.replace(regex, value);
      subject = subject.replace(regex, value);
    });
    
    setReplySubject(subject);
    setReplyBody(body);
    setShowCannedModal(false);
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      setSending(true);
      
      const response = await api.post('/admin/support/reply', {
        ticketId: selectedTicket?.id,
        subject: replySubject,
        body: replyBody,
        userId: selectedTicket?.user_id,
        email: selectedTicket?.event_data?.email
      });

      if (response.data.success) {
        toast.success('Reply sent successfully');
        setShowReplyModal(false);
        setReplySubject('');
        setReplyBody('');
        setSelectedCanned(null);
      } else {
        toast.error(response.data.error || 'Failed to send reply');
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleClearDateFilter = () => {
    setDateRange({ start: '', end: '' });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      open: 'bg-error/10 text-error',
      pending: 'bg-warning/10 text-warning',
      resolved: 'bg-success/10 text-success'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[status] || statusColors.open}`}>
        {status || 'open'}
      </span>
    );
  };

  const getUserDisplay = (ticket) => {
    if (ticket.user_id) {
      return (
        <div className="flex items-center gap-2">
          <User size={14} className="text-base-content/40" />
          <span className="font-medium text-base-content">User #{ticket.user_id}</span>
        </div>
      );
    }
    const email = ticket.event_data?.email || 'Unknown';
    return (
      <div className="flex items-center gap-2">
        <Mail size={14} className="text-base-content/40" />
        <span className="text-base-content/70">{email}</span>
      </div>
    );
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_, row) => getUserDisplay(row)
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (subject, row) => {
        const sub = row.event_data?.subject || subject || 'No subject';
        return (
          <div>
            <p className="font-bold text-base-content max-w-xs truncate">{sub}</p>
            {row.event_data?.description && (
              <p className="text-xs text-base-content/50 truncate max-w-xs">
                {row.event_data.description.substring(0, 50)}...
              </p>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const status = row.event_data?.status || 'open';
        return getStatusBadge(status);
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (date) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-base-content/40" />
          <span className="text-xs text-base-content/50">
            {date ? new Date(date).toLocaleString() : '-'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex gap-1">
          <Button variant="outline" size="xs" onClick={() => handleViewTicket(row)}>
            <Eye size={14} className="mr-1" />
            View
          </Button>
          <Button variant="primary" size="xs" onClick={() => handleQuickReply(row)}>
            <Zap size={14} className="mr-1" />
            Reply
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-base-300 bg-base-100"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/50">From:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/50">To:</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm"
            />
          </div>
          
          {(dateRange.start || dateRange.end) && (
            <Button variant="ghost" size="xs" onClick={handleClearDateFilter}>
              Clear Dates
            </Button>
          )}
        </div>

        <Button onClick={fetchTickets}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <AdminDataTable
        data={tickets}
        columns={columns}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onRefresh={fetchTickets}
        emptyMessage="No support tickets"
        emptyIcon={Headphones}
      />

      {/* Ticket Detail Modal */}
      <AdminModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Ticket Details"
        size="lg"
        footer={
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>Close</Button>
            <Button variant="primary" onClick={() => {
              setShowDetailModal(false);
              handleQuickReply(selectedTicket);
            }}>
              <Zap size={16} className="mr-2" />
              Quick Reply
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                  Ticket ID
                </label>
                <p className="text-base-content font-mono text-sm">{selectedTicket.id}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                  Status
                </label>
                {getStatusBadge(selectedTicket.event_data?.status)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                User
              </label>
              {getUserDisplay(selectedTicket)}
            </div>

            <div>
              <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                Subject
              </label>
              <p className="text-base-content font-medium">
                {selectedTicket.event_data?.subject || 'No subject'}
              </p>
            </div>

            {selectedTicket.event_data?.description && (
              <div>
                <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                  Description
                </label>
                <div className="bg-base-200 rounded-lg p-3 text-sm text-base-content/80 whitespace-pre-wrap">
                  {selectedTicket.event_data.description}
                </div>
              </div>
            )}

            {selectedTicket.event_data?.email && !selectedTicket.user_id && (
              <div>
                <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                  Contact Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-base-content/40" />
                  <span className="text-base-content">{selectedTicket.event_data.email}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                  Event Type
                </label>
                <p className="text-base-content text-sm font-mono">{selectedTicket.event_name}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                  Created At
                </label>
                <p className="text-base-content text-sm">
                  {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Canned Response Selector Modal */}
      <AdminModal
        isOpen={showCannedModal}
        onClose={() => setShowCannedModal(false)}
        title="Select Quick Reply Template"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-base-content">Category:</label>
            <select
              value={cannedCategory}
              onChange={(e) => {
                setCannedCategory(e.target.value);
                fetchCannedResponses(e.target.value);
              }}
              className="px-3 py-2 rounded-xl border border-base-300 bg-base-100"
            >
              <option value="all">All Categories</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>

          {cannedLoading ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : cannedResponses.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              No canned responses found
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cannedResponses.map((canned) => (
                <div
                  key={canned.id}
                  className="p-4 rounded-lg border border-base-300 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => handleCannedSelect(canned)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-base-content">{canned.title}</span>
                    <span className={`badge badge-sm ${
                      canned.category === 'billing' ? 'badge-warning' :
                      canned.category === 'technical' ? 'badge-info' :
                      canned.category === 'account' ? 'badge-success' :
                      'badge-ghost'
                    }`}>
                      {canned.category}
                    </span>
                  </div>
                  {canned.subject && (
                    <p className="text-sm text-base-content/60 mb-1">{canned.subject}</p>
                  )}
                  <p className="text-xs text-base-content/40 truncate">
                    {canned.body?.substring(0, 80)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminModal>

      {/* Reply Modal */}
      <AdminModal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setSelectedCanned(null);
          setReplyBody('');
          setReplySubject('');
        }}
        title={selectedCanned ? `Reply: ${selectedCanned.title}` : 'Send Reply'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowReplyModal(false);
                setShowCannedModal(true);
              }}
            >
              <MessageSquare size={16} className="mr-2" />
              Change Template
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendReply}
              disabled={sending}
            >
              {sending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Mail size={16} className="mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Subject
            </label>
            <input
              type="text"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100"
              placeholder="Enter subject line"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Message
            </label>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 min-h-[200px]"
              placeholder="Enter your reply message"
            />
          </div>

          {selectedCanned?.variables?.length > 0 && (
            <div className="bg-info/10 rounded-lg p-3">
              <p className="text-xs font-medium text-info mb-1">Available variables:</p>
              <div className="flex flex-wrap gap-1">
                {selectedCanned.variables.map((v) => (
                  <span key={v} className="badge badge-sm badge-outline">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedTicket && (
            <div className="bg-base-200 rounded-lg p-3">
              <p className="text-xs font-bold text-base-content/50 uppercase mb-2">Ticket Info</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-base-content/50">User:</span>
                  <span className="ml-2 text-base-content">{getUserDisplay(selectedTicket)}</span>
                </div>
                {selectedTicket.event_data?.email && (
                  <div>
                    <span className="text-base-content/50">Email:</span>
                    <span className="ml-2 text-base-content">{selectedTicket.event_data.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-base-content/50">Ticket ID:</span>
                  <span className="ml-2 text-base-content font-mono text-xs">{selectedTicket.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
};

export default SupportSection;