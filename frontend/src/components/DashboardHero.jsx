import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, AlertTriangle, Shield, FileCheck, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReadinessStore, READINESS_LABELS, getReadinessColor } from '../stores/readinessStore'

const formatCountdown = (startDate) => {
  if (!startDate) return null
  
  const now = new Date()
  const tripDate = new Date(startDate)
  const diffTime = tripDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return { text: 'Trip passed', type: 'past' }
  if (diffDays === 0) return { text: 'Today!', type: 'today' }
  if (diffDays === 1) return { text: '1 day away', type: 'imminent' }
  if (diffDays <= 7) return { text: `${diffDays} days away`, type: 'week' }
  if (diffDays <= 30) return { text: `${Math.ceil(diffDays / 7)} weeks away`, type: 'month' }
  return { text: `${Math.ceil(diffDays / 30)} months away`, type: 'future' }
}

const formatTimeAgo = (date) => {
  if (!date) return null
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 5) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const getReadinessSummary = (label, blockers, checklist) => {
  if (label === READINESS_LABELS.CRITICAL_BLOCKER && blockers.length > 0) {
    return `⚠️ ${blockers[0].message}`
  }
  if (label === READINESS_LABELS.NEEDS_ATTENTION) {
    const incompleteCount = checklist.filter(c => !c.completed).length
    return `⚡ ${incompleteCount} items need your attention`
  }
  if (label === READINESS_LABELS.IN_PROGRESS) {
    const completedCount = checklist.filter(c => c.completed).length
    return `📋 ${completedCount} essentials complete, more to do`
  }
  if (label === READINESS_LABELS.READY) {
    return '✓ Your trip is ready to go!'
  }
  return 'Start setting up your trip'
}

const getCountdownColor = (type) => {
  switch (type) {
    case 'today':
    case 'imminent':
      return 'text-red-500'
    case 'week':
      return 'text-amber-500'
    case 'month':
      return 'text-blue-500'
    default:
      return 'text-base-content/60'
  }
}

const DashboardHero = ({ className = '' }) => {
  const {
    currentTrip,
    readinessScore,
    readinessLabel,
    blockers,
    nextBestAction,
    checklist,
    lastUpdated,
    isLoading,
    error
  } = useReadinessStore()

  if (isLoading) {
    return (
      <div className="relative bg-base-100 rounded-2xl border border-base-content/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-brand-vibrant"></span>
        </div>
      </div>
    )
  }

  if (error || !currentTrip) {
    return (
      <div className="relative bg-base-100 rounded-2xl border border-base-content/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] overflow-hidden p-8">
        <div className="flex flex-col items-center text-center gap-3">
          <AlertCircle className="w-8 h-8 text-base-content/40" />
          <p className="text-base-content/60 font-medium">No upcoming trip found</p>
          <Link to="/trips/new">
            <button className="btn btn-primary btn-sm">Plan a Trip</button>
          </Link>
        </div>
      </div>
    )
  }

  const countdown = formatCountdown(currentTrip.start_date)
  const readinessSummary = getReadinessSummary(readinessLabel, blockers, checklist)
  const completedEssentials = checklist.filter(item => item.completed).length
  const essentialsTotal = checklist.length

  const labelColor = {
    [READINESS_LABELS.READY]: 'emerald',
    [READINESS_LABELS.IN_PROGRESS]: 'blue',
    [READINESS_LABELS.NEEDS_ATTENTION]: 'amber',
    [READINESS_LABELS.CRITICAL_BLOCKER]: 'red',
  }[readinessLabel] || 'slate'

  const freshnessNote = lastUpdated ? `Data refreshed ${formatTimeAgo(lastUpdated)}` : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative bg-base-100 rounded-2xl border border-base-content/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-vibrant/5 via-transparent to-brand-accent/5 pointer-events-none" />
      
      {readinessLabel === READINESS_LABELS.CRITICAL_BLOCKER && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-amber-500" />
      )}
      
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 p-5 lg:p-7">
        <motion.div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-brand-vibrant" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-base-content tracking-tight leading-tight truncate">
                {currentTrip.name || 'Upcoming Trip'}
              </h1>
              {currentTrip.destination && (
                <p className="text-sm text-base-content/60 font-medium mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-vibrant" />
                  {currentTrip.destination}
                </p>
              )}
            </div>
          </div>

          {countdown && (
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className={getCountdownColor(countdown.type)} />
              <span className={`text-sm font-bold ${getCountdownColor(countdown.type)}`}>
                {countdown.text}
              </span>
            </div>
          )}

          <p className={`text-sm font-medium mb-5 ${getReadinessColor(readinessLabel)}`}>
            {readinessSummary}
          </p>

          <div className="flex flex-wrap gap-3">
            {nextBestAction && (
              <Link to={nextBestAction.route} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all
                    ${readinessLabel === READINESS_LABELS.CRITICAL_BLOCKER 
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25' 
                      : readinessLabel === READINESS_LABELS.NEEDS_ATTENTION
                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/25'
                        : readinessLabel === READINESS_LABELS.IN_PROGRESS
                          ? 'bg-brand-vibrant text-white hover:bg-brand-vibrant/90 shadow-brand-vibrant/25'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/25'
                    }`}
                >
                  {nextBestAction.action}
                </motion.button>
              </Link>
            )}
            <Link to={`/trips/${currentTrip.id}`} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-base-200 border border-base-content/10 text-base-content hover:bg-base-300 transition-all">
                View Trip
              </button>
            </Link>
          </div>

          {freshnessNote && (
            <p className="text-xs text-base-content/40 mt-4 flex items-center gap-1.5">
              <Clock size={10} />
              {freshnessNote}
            </p>
          )}
        </motion.div>

        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-4 border border-base-content/5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border
                ${labelColor === 'emerald' ? 'bg-success/10 text-success border-success/20' : 
                  labelColor === 'blue' ? 'bg-info/10 text-info border-info/20' :
                  labelColor === 'amber' ? 'bg-warning/10 text-warning border-warning/20' :
                  'bg-error/10 text-error border-error/20'}`}
              >
                {readinessLabel === READINESS_LABELS.READY && <CheckCircle size={12} className="animate-pulse" />}
                {readinessLabel === READINESS_LABELS.CRITICAL_BLOCKER && <AlertTriangle size={12} />}
                {readinessLabel}
              </span>
            </div>

            {readinessScore > 0 && (
              <div className="text-center">
                <div className="text-3xl font-black text-base-content">{readinessScore}%</div>
                <p className="text-xs text-base-content/50 font-bold uppercase tracking-wider">Readiness</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/60 font-medium flex items-center gap-2">
                  <FileCheck size={14} className="text-brand-vibrant" />
                  Essentials
                </span>
                <span className="font-bold text-base-content">
                  {completedEssentials}/{essentialsTotal}
                </span>
              </div>

              <div className="w-full h-1.5 bg-base-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedEssentials / essentialsTotal) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    readinessLabel === READINESS_LABELS.CRITICAL_BLOCKER ? 'bg-red-500' :
                    readinessLabel === READINESS_LABELS.NEEDS_ATTENTION ? 'bg-amber-500' :
                    'bg-brand-vibrant'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm border-t border-base-content/5 pt-3">
              <span className="text-base-content/60 font-medium flex items-center gap-2">
                <Shield size={14} className="text-emerald-500" />
                Safety
              </span>
              <span className={`font-bold ${currentTrip.emergency_contacts?.length ? 'text-emerald-500' : 'text-amber-500'}`}>
                {currentTrip.emergency_contacts?.length ? 'Configured' : 'Pending'}
              </span>
            </div>

            {blockers.length > 0 && (
              <div className="flex items-center justify-between text-sm border-t border-base-content/5 pt-3">
                <span className="text-base-content/60 font-medium flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  Blockers
                </span>
                <span className="font-bold text-amber-500">{blockers.length}</span>
              </div>
            )}

            {nextBestAction && (
              <div className="pt-2 border-t border-base-content/5">
                <p className="text-xs text-base-content/50 mb-1">Next action:</p>
                <p className="text-sm font-bold text-base-content flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-brand-vibrant" />
                  {nextBestAction.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardHero