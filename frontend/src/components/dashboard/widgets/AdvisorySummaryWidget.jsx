import { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, Globe, AlertCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAdvisories } from '../../../lib/api'
import StatusBadge from '../StatusBadge'

const formatTimeAgo = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const checkSeverity = (advisories) => {
  if (!advisories?.length) return 'clear'
  
  const severeTerms = ['terror', 'attack', 'war', 'hostile', 'extreme', 'critical', 'evacuation']
  const cautionTerms = ['advisory', 'caution', 'warning', 'risk', 'exercise', 'reconsider']
  
  for (const advisory of advisories) {
    const text = `${advisory.summary || ''} ${advisory.title || ''}`.toLowerCase()
    if (severeTerms.some(term => text.includes(term))) return 'severe'
    if (cautionTerms.some(term => text.includes(term))) return 'caution'
  }
  return 'caution'
}

const checkSourceConflict = (advisories) => {
  if (!advisories?.length || advisories.length < 2) return false
  const sources = new Set(advisories.map(a => a.source?.toLowerCase()).filter(Boolean))
  return sources.size > 1
}

const AdvisorySummaryWidget = memo(function AdvisorySummaryWidget({ destination, className = "" }) {
  const [advisories, setAdvisories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  useEffect(() => {
    const fetchAdvisories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getAdvisories()
        const data = response.data || response
        
        if (destination && data.length) {
          const filtered = data.filter(a => 
            a.country?.toLowerCase() === destination.toLowerCase()
          )
          setAdvisories(filtered)
        } else {
          setAdvisories(data.slice(0, 5))
        }
        
        setLastRefreshed(response.last_refreshed || new Date().toISOString())
      } catch (err) {
        console.error('[AdvisorySummaryWidget] Fetch error:', err)
        setError(err.message || 'Failed to load advisories')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAdvisories()
  }, [destination])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`dashboard-widget ${className}`}
      >
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 size={18} className="animate-spin text-base-content/40" />
          <span className="text-sm text-base-content/40">Loading advisories...</span>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`dashboard-widget ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
            <AlertCircle size={20} className="text-base-content/40" />
          </div>
          <div>
            <p className="text-sm font-bold text-base-content">Advisories unavailable</p>
            <p className="text-xs text-base-content/40 font-medium">Check back later</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const severity = checkSeverity(advisories)
  const hasConflict = checkSourceConflict(advisories)
  const timeAgo = formatTimeAgo(lastRefreshed)

  if (!advisories.length) {
    const safetyTips = [
      "Always share your itinerary with a trusted contact.",
      "Keep digital copies of important documents.",
      "Download offline maps for your destination.",
      "Register with your embassy for extended trips.",
      "Check travel insurance coverage before departure.",
    ]
    const randomTip = safetyTips[Math.floor(Math.random() * safetyTips.length)]
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`dashboard-widget ${className}`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} className="text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-emerald-600 mb-0.5">All Clear</p>
            <p className="text-sm text-base-content/70">No active travel advisories for your destination.</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-sky-500/5 to-emerald-500/5 rounded-xl p-3 mb-3">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-sky-500">i</span>
            </div>
            <p className="text-xs text-base-content/60 leading-relaxed">
              {randomTip}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-600 font-semibold">Monitoring active</span>
          </div>
          {timeAgo && (
            <p className="text-[10px] text-base-content/30">Checked {timeAgo}</p>
          )}
        </div>
      </motion.div>
    )
  }

  const isSevere = severity === 'severe'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${isSevere ? 'border-l-4 border-l-error' : 'border-l-4 border-l-warning'} ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isSevere ? (
            <AlertTriangle size={18} className="text-error animate-pulse" />
          ) : (
            <Globe size={18} className="text-warning" />
          )}
          <h3 className="text-sm font-bold text-base-content">Travel Advisories</h3>
        </div>
        <StatusBadge 
          status={isSevere ? "high_alert" : "advisory_active"} 
          timestamp={lastRefreshed}
        />
      </div>

      <div className="space-y-2 mb-2">
        {advisories.slice(0, 3).map((advisory) => (
          <motion.div
            key={advisory.id || advisory.country}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              to={`/advisories?country=${encodeURIComponent(advisory.country || '')}`}
              className="flex items-center justify-between p-2.5 rounded-lg bg-base-200 hover:bg-base-300 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSevere ? 'bg-error' : 'bg-warning'}`} />
                <span className="text-sm font-bold text-base-content truncate">{advisory.country}</span>
              </div>
              <span className="text-[10px] font-bold text-base-content/40 group-hover:text-brand-vibrant transition-colors flex-shrink-0">View</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {advisories[0]?.summary && (
        <p className="text-xs text-base-content/70 mb-2 line-clamp-2 pl-1">
          {advisories[0].summary}
        </p>
      )}

      {advisories[0]?.source && (
        <p className="text-[10px] text-base-content/40 pl-1">
          Source: {advisories[0].source}
        </p>
      )}

      {hasConflict && (
        <p className="text-[10px] text-warning mt-2 pl-1 flex items-center gap-1">
          <AlertCircle size={10} />
          Sources differ
        </p>
      )}

      {timeAgo && (
        <p className="text-[10px] text-base-content/30 mt-2 pl-1">
          Updated {timeAgo}
        </p>
      )}
    </motion.div>
  );
});

AdvisorySummaryWidget.propTypes = {
  destination: PropTypes.string,
  className: PropTypes.string,
};

AdvisorySummaryWidget.defaultProps = {
  className: "",
};

export default AdvisorySummaryWidget
