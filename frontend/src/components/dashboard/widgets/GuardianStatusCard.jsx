import { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle, Clock, AlertTriangle, Send, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

const GuardianStatusCard = memo(function GuardianStatusCard({ contacts = [], tripId, compact = false, showHeading = true, className = '' }) {
  const [guardianStatus, setGuardianStatus] = useState({ confirmed: [], pending: [], totalConfirmed: 0, totalPending: 0 })
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(null)

  useEffect(() => {
    fetchGuardianStatus()
  }, [tripId])

  const fetchGuardianStatus = async () => {
    try {
      const url = tripId ? `/guardian/status?tripId=${tripId}` : '/guardian/status'
      const res = await api.get(url)
      if (res.data?.data) {
        setGuardianStatus(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching guardian status:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendGuardianRequest = async (contactId) => {
    setSendingRequest(contactId)
    try {
      await api.post('/guardian/send-request', { contactId, tripId })
      toast.success('Guardian request sent!')
      fetchGuardianStatus()
    } catch (err) {
      console.error('Error sending guardian request:', err)
      toast.error('Failed to send guardian request')
    } finally {
      setSendingRequest(null)
    }
  }

  const cancelRequest = async (requestId) => {
    try {
      await api.delete(`/guardian/request/${requestId}`)
      toast.success('Request cancelled')
      fetchGuardianStatus()
    } catch (err) {
      toast.error('Failed to cancel request')
    }
  }

  const availableContacts = Array.isArray(contacts) 
    ? contacts.filter(c => !guardianStatus.confirmed.some(g => g.contactId === c.id))
    : []

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-base-content/40" />
        ) : guardianStatus.totalConfirmed > 0 ? (
          <div className="flex items-center gap-1 text-emerald-500">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{guardianStatus.totalConfirmed} confirmed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Needs setup</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${className || ''}`}
    >
      {showHeading && (
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-base-content">Guardian Status</h3>
            <p className="text-sm text-base-content/60">Verified guardians for your trip</p>
          </div>
        </div>
      </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-base-content/40" />
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {guardianStatus.confirmed.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmed Guardians</p>
                {guardianStatus.confirmed.map((guardian) => (
                  <div key={guardian.id} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-700">{guardian.contactName}</span>
                    {guardian.tripName && (
                      <span className="text-xs text-emerald-600/70">for {guardian.tripName}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {guardianStatus.pending.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting Response</p>
                {guardianStatus.pending.map((pending) => (
                  <div key={pending.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-amber-700">{pending.contactName}</span>
                    </div>
                    <button
                      onClick={() => cancelRequest(pending.id)}
                      className="p-1 hover:bg-amber-500/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {availableContacts.length > 0 && (
            <div className="border-t border-base-content/10 pt-4">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2">
                Send Guardian Request
              </p>
              <div className="space-y-2">
                {availableContacts.slice(0, 3).map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => sendGuardianRequest(contact.id)}
                    disabled={sendingRequest === contact.id}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-base-200 hover:bg-base-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-base-content/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-base-content/60">
                          {contact.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-base-content">{contact.name}</p>
                        <p className="text-xs text-base-content/50">{contact.relationship}</p>
                      </div>
                    </div>
                    {sendingRequest === contact.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-base-content/40" />
                    ) : (
                      <Send className="w-4 h-4 text-sky-500" />
                    )}
                  </button>
                ))}
              </div>
              {availableContacts.length > 3 && (
                <p className="text-xs text-base-content/40 text-center mt-2">
                  +{availableContacts.length - 3} more contacts available
                </p>
              )}
            </div>
          )}

          {guardianStatus.totalConfirmed === 0 && availableContacts.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-base-content/60">No emergency contacts to send requests to.</p>
              <a href="/safety" className="text-sm text-sky-500 hover:underline mt-1 inline-block">
                Add emergency contacts first
              </a>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
});

GuardianStatusCard.propTypes = {
  contacts: PropTypes.array,
  tripId: PropTypes.string,
  compact: PropTypes.bool,
  showHeading: PropTypes.bool,
  className: PropTypes.string,
};

GuardianStatusCard.defaultProps = {
  contacts: [],
  compact: false,
  showHeading: true,
  className: '',
};

export default GuardianStatusCard
