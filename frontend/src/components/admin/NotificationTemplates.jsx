import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Edit2, 
  Save, 
  X, 
  Send, 
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewVars, setPreviewVars] = useState({});
  const [testRecipient, setTestRecipient] = useState('');
  const [testVars, setTestVars] = useState({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/notifications/templates');
      if (response.data.success) {
        setTemplates(response.data.data.templates || []);
        setTypes(response.data.data.types || []);
      }
    } catch (error) {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate({ ...template });
    setPreviewVars(getPreviewVarsForType(template.notification_type));
    setTestVars({});
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      setSaving(true);
      await api.put(`/admin/notifications/templates/${editingTemplate.id}`, {
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        variables: editingTemplate.variables,
        is_active: editingTemplate.is_active
      });
      toast.success('Template saved');
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!editingTemplate || !testRecipient) {
      toast.error('Please enter a test recipient');
      return;
    }
    try {
      setTesting(true);
      const response = await api.post('/admin/notifications/templates/test', {
        templateId: editingTemplate.id,
        recipient: testRecipient,
        testVars
      });
      if (response.data.success) {
        toast.success('Test notification sent!');
      } else {
        toast.error(response.data.error || 'Failed to send test');
      }
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const getPreviewVarsForType = (notificationType) => {
    const previewMap = {
      welcome: { name: 'Alex', dashboardUrl: 'https://solocompass.app/dashboard', unsubscribeUrl: 'https://solocompass.app/settings', year: '2026' },
      email_verification: { name: 'Alex', verifyUrl: 'https://solocompass.app/verify?token=abc123' },
      password_reset: { name: 'Alex', resetUrl: 'https://solocompass.app/reset-password?token=abc123' },
      trip_reminder: { name: 'Alex', tripName: 'Tokyo Adventure', destination: 'Tokyo, Japan', startDate: 'April 15, 2026', daysUntil: '5', tripUrl: 'https://solocompass.app/trips/123' },
      itinerary_ready: { name: 'Alex', tripName: 'Tokyo Adventure', destination: 'Tokyo, Japan', startDate: 'April 15, 2026', endDate: 'April 22, 2026', itineraryUrl: 'https://solocompass.app/trips/123/itinerary' },
      itinerary_failed: { name: 'Alex', tripName: 'Tokyo Adventure', errorMessage: 'Unable to generate itinerary due to high demand.', tripUrl: 'https://solocompass.app/trips/123' },
      booking_change: { name: 'Alex', tripName: 'Tokyo Adventure', bookingType: 'Flight', changeDetails: 'Departure time changed', confirmationNumber: 'ABC123', tripUrl: 'https://solocompass.app/trips/123' },
      safety_advisory: { name: 'Alex', destination: 'Tokyo, Japan', advisoryTitle: 'Weather Alert', advisoryContent: 'Heavy rain expected.', advisoryUrl: 'https://solocompass.app/advisories/123' },
      buddy_request: { name: 'Alex', senderName: 'Sarah', tripName: 'Tokyo Adventure', destination: 'Tokyo, Japan', message: 'Hey! Would love to explore together!', requestUrl: 'https://solocompass.app/buddies/requests' },
      buddy_accepted: { name: 'Alex', senderName: 'Sarah', tripName: 'Tokyo Adventure', destination: 'Tokyo, Japan', profileUrl: 'https://solocompass.app/profile/sarah' },
      subscription_upgraded: { name: 'Alex', planName: 'Premium', dashboardUrl: 'https://solocompass.app/dashboard' },
      payment_failed: { name: 'Alex', amount: '$9.99', failureReason: 'Card expired', paymentUrl: 'https://solocompass.app/settings/billing' },
      checkin_reminder: { name: 'Alex', destination: 'Tokyo, Japan', checkinUrl: 'https://solocompass.app/safety/checkin' },
      sos_alert: { travelerName: 'Alex Johnson', destination: 'Tokyo, Japan', lastLocation: 'Shinjuku Station', emergencyContact: 'Sarah' },
      safe_checkin_sent: { travelerName: 'Alex Johnson', destination: 'Tokyo, Japan', location: 'Shibuya, Tokyo' }
    };
    return previewMap[notificationType] || {};
  };

  const replaceVariables = (template, vars) => {
    let result = template;
    Object.entries(vars || {}).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-base-content tracking-tight">Notification Templates</h3>
          <p className="text-xs text-base-content/50 mt-1">Manage email and SMS notification templates</p>
        </div>
        <button
          onClick={fetchTemplates}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-base-300 text-xs font-bold hover:bg-base-200 transition-all"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {editingTemplate ? (
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-base-300 bg-base-200/30 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-black text-base-content">
                Edit: {editingTemplate.notification_type}
              </h4>
              <p className="text-xs text-base-content/50 capitalize">{editingTemplate.type} Template</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-base-300 text-xs font-bold hover:bg-base-200 transition-all"
              >
                <Eye size={14} />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => setEditingTemplate(null)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-base-300 text-xs font-bold hover:bg-base-200 transition-all"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {editingTemplate.type === 'email' && (
              <div>
                <label className="block text-xs font-black text-base-content/60 uppercase tracking-widest mb-2">Subject</label>
                <input
                  type="text"
                  value={editingTemplate.subject || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-base-300 bg-base-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-base-content/60 uppercase tracking-widest mb-2">
                {editingTemplate.type === 'email' ? 'Body (HTML with {{variable}} placeholders)' : 'Body (SMS with {{variable}} placeholders)'}
              </label>
              {previewMode ? (
                <div className="border border-base-300 rounded-xl p-4 bg-base-200/30 max-h-96 overflow-auto">
                  {editingTemplate.type === 'email' ? (
                    <div dangerouslySetInnerHTML={{ __html: replaceVariables(editingTemplate.body, previewVars) }} />
                  ) : (
                    <pre className="text-sm text-base-content whitespace-pre-wrap font-mono">
                      {replaceVariables(editingTemplate.body, previewVars)}
                    </pre>
                  )}
                </div>
              ) : (
                <textarea
                  value={editingTemplate.body || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2.5 rounded-xl border border-base-300 bg-base-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm font-mono"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-base-content/60 uppercase tracking-widest mb-2">Variables</label>
              <div className="flex flex-wrap gap-2">
                {(editingTemplate.variables || []).map((v) => (
                  <span key={v} className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingTemplate.is_active}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <label htmlFor="is_active" className="text-sm font-bold text-base-content">Active</label>
            </div>

            <div className="border-t border-base-300 pt-6 mt-6">
              <h5 className="text-sm font-black text-base-content mb-4">Send Test Notification</h5>
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Test recipient email/phone"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-base-300 bg-base-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm font-medium"
                />
                <button
                  onClick={handleTest}
                  disabled={testing || !testRecipient}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success text-white text-sm font-bold hover:bg-success/90 transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                  {testing ? 'Sending...' : 'Send Test'}
                </button>
              </div>
              <p className="text-xs text-base-content/50 mt-2">
                Preview variables will be replaced with test values. For emails, a test email will be sent. For SMS, shows preview.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-base-200 text-base-content/40 text-[10px] font-black uppercase tracking-widest border-b border-base-300">
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Notification</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Variables</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300/50">
                {templates.length > 0 ? templates.map((template) => (
                  <tr key={template.id} className="hover:bg-base-200/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {template.type === 'email' ? (
                          <Mail size={16} className="text-primary" />
                        ) : (
                          <MessageSquare size={16} className="text-success" />
                        )}
                        <span className="text-xs font-bold text-base-content capitalize">{template.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm text-base-content">{template.notification_type.replace(/_/g, ' ')}</p>
                        {template.type === 'email' && (
                          <p className="text-[10px] text-base-content/50 truncate max-w-xs">{template.subject}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-base-200 text-[10px] font-bold text-base-content/70 rounded capitalize">
                        {template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(template.variables || []).slice(0, 3).map((v) => (
                          <span key={v} className="px-1.5 py-0.5 bg-base-200 text-[10px] font-mono text-base-content/60 rounded">
                            {v}
                          </span>
                        ))}
                        {(template.variables || []).length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-base-content/40">+{template.variables.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {template.is_active ? (
                        <span className="flex items-center gap-1 text-success text-xs font-bold">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-base-content/40 text-xs font-bold">
                          <AlertCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 hover:bg-base-100 hover:shadow-lg rounded-xl transition-all text-base-content/40 hover:text-primary"
                        title="Edit Template"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-base-content/40 font-bold">
                      No templates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;