import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Mail, Send, Eye, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

const EMAIL_TEMPLATES = [
  { 
    id: 'welcome', 
    name: 'Welcome Email', 
    description: 'New user registration welcome email',
    variables: ['name', 'dashboardUrl']
  },
  { 
    id: 'emailVerification', 
    name: 'Email Verification', 
    description: 'Verify user email address',
    variables: ['name', 'verifyUrl']
  },
  { 
    id: 'passwordReset', 
    name: 'Password Reset', 
    description: 'Reset password email',
    variables: ['name', 'resetUrl']
  },
  { 
    id: 'tripConfirmation', 
    name: 'Trip Confirmation', 
    description: 'AI-generated trip itinerary confirmation',
    variables: ['name', 'tripName', 'destination', 'startDate', 'endDate', 'tripUrl', 'itinerary']
  },
  { 
    id: 'safetyCheckIn', 
    name: 'Safety Check-In', 
    description: 'Safety check-in notification to emergency contacts',
    variables: ['travelerName', 'tripName', 'destination', 'checkInUrl', 'emergencyContactName']
  },
  { 
    id: 'emergencyAlert', 
    name: 'Emergency Alert', 
    description: 'Urgent emergency alert to emergency contacts',
    variables: ['travelerName', 'tripName', 'destination', 'emergencyContactName', 'contactPhone', 'message']
  },
  { 
    id: 'weeklyDigest', 
    name: 'Weekly Digest', 
    description: 'Weekly digest with trips, reviews, and suggestions',
    variables: ['name', 'upcomingTrips', 'recentReviews', 'tripSuggestions', 'dashboardUrl']
  }
];

const EmailPreview = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [showHtml, setShowHtml] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(null);

  useEffect(() => {
    loadPreview();
  }, [selectedTemplate]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/emails/preview/${selectedTemplate.id}`);
      if (response.data) {
        setPreviewHtml(response.data.html || '');
        setPreviewText(response.data.text || '');
      }
    } catch (error) {
      toast.error('Failed to load email preview');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSending(true);
      setEmailSent(null);
      const response = await api.post('/admin/emails/test', {
        template: selectedTemplate.id,
        to: testEmail
      });
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success(`Test email sent to ${testEmail}`);
      } else {
        setEmailSent(false);
        toast.error(response.data.error || 'Failed to send test email');
      }
    } catch (error) {
      setEmailSent(false);
      toast.error(error.response?.data?.error || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-brand-vibrant" />
            Email Templates
          </h1>
          <p className="text-gray-600 mt-1">
            Preview and test all email templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-base-100 rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Select Template</h2>
              <div className="space-y-2">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedTemplate.id === template.id
                        ? 'border-brand-vibrant bg-brand-vibrant/5 text-brand-vibrant'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-base-100 rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Variables</h2>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-base-100 rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Send Test Email</h2>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-vibrant focus:border-transparent"
                />
                <button
                  onClick={sendTestEmail}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-brand-vibrant text-white py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? 'Sending...' : 'Send Test Email'}
                </button>
                
                {emailSent !== null && (
                  <div className={`flex items-center gap-2 text-sm ${emailSent ? 'text-green-600' : 'text-error'}`}>
                    {emailSent ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {emailSent ? 'Email sent successfully!' : 'Failed to send email'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-lg shadow">
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  Preview: {selectedTemplate.name}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHtml(true)}
                    className={`px-3 py-1 text-sm rounded ${
                      showHtml 
                        ? 'bg-brand-vibrant text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setShowHtml(false)}
                    className={`px-3 py-1 text-sm rounded ${
                      !showHtml 
                        ? 'bg-brand-vibrant text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Plain Text
                  </button>
                  <button
                    onClick={loadPreview}
                    className="p-2 text-gray-600 hover:text-brand-vibrant hover:bg-gray-100 rounded"
                    title="Refresh preview"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-brand-vibrant animate-spin" />
                  </div>
                ) : showHtml ? (
                  <div 
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }}
                  />
                ) : (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                    {previewText}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
