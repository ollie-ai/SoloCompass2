import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Loader2, Shield, ArrowRight } from 'lucide-react'
import api from '../lib/api'

const GuardianAcknowledge = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const acknowledge = async () => {
      try {
        const res = await api.post(`/guardian/acknowledge/${token}`)
        setData(res.data)
        setStatus('success')
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to acknowledge')
        setStatus('error')
      }
    }
    if (token) acknowledge()
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-vibrant mx-auto mb-4" />
          <p className="text-base-content/60">Processing your acknowledgement...</p>
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
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-base-content mb-2">Unable to Acknowledge</h1>
          <p className="text-base-content/60 mb-6">{error}</p>
          <p className="text-sm text-base-content/40 mb-6">
            This may happen if the link has expired or was already processed.
          </p>
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
        className="max-w-md w-full bg-gradient-to-br from-emerald-500/5 to-sky-500/5 rounded-2xl border border-emerald-500/20 shadow-lg p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-emerald-500" />
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4 -mt-16 relative z-10"
        >
          <CheckCircle className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-emerald-600 mb-2">Guardian Confirmed</h1>
        <p className="text-base-content/70 mb-6">
          Thank you for acknowledging! You are now a confirmed travel guardian for {data?.userName || 'this traveler'}.
        </p>

        <div className="bg-emerald-500/10 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-bold text-emerald-700 mb-2">What this means:</h3>
          <ul className="text-sm text-emerald-700/80 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              You'll receive notifications if they miss a scheduled check-in
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              In an emergency, you may be contacted with their last known location
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              You don't need to take any action unless contacted
            </li>
          </ul>
        </div>

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

export default GuardianAcknowledge
