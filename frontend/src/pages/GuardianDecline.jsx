import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, Loader2, ArrowRight } from 'lucide-react'
import api from '../lib/api'

const GuardianDecline = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    const decline = async () => {
      try {
        await api.post(`/guardian/decline/${token}`)
        setStatus('success')
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to decline')
        setStatus('error')
      }
    }
    if (token) decline()
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-base-content/40 mx-auto mb-4" />
          <p className="text-base-content/60">Processing your response...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-base-100 rounded-2xl border border-base-content/10 shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-base-content/40" />
          </div>
          <h1 className="text-2xl font-bold text-base-content mb-2">Unable to Process</h1>
          <p className="text-base-content/60 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-vibrant text-white font-bold rounded-xl hover:bg-brand-vibrant/90 transition-colors"
          >
            Go to SoloCompass
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-base-100 rounded-2xl border border-base-content/10 shadow-lg p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-base-content/60" />
        </div>

        <h1 className="text-2xl font-bold text-base-content mb-2">Guardian Request Declined</h1>
        <p className="text-base-content/60 mb-6">
          You have declined the guardian request. The traveler has been notified and may reach out to you through other means if needed.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-vibrant text-white font-bold rounded-xl hover:bg-brand-vibrant/90 transition-colors"
        >
          Close
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    </div>
  )
}

export default GuardianDecline
