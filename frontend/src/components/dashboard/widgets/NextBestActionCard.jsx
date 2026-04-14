import { motion } from 'framer-motion'
import { Shield, FileText, Home, Calendar, MapPin, CheckCircle, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { READINESS_LABELS } from '../../../stores/readinessStore'

const blockerToIcon = {
  missing_core_safety_setup: Shield,
  missing_required_document: FileText,
  no_accommodation: Home,
  no_checkin_setup: Calendar,
  no_destination: MapPin,
  no_dates: Calendar,
}

const blockerToRoute = {
  missing_core_safety_setup: '/safety',
  missing_required_document: '/trips?tab=documents',
  no_accommodation: '/trips?tab=accommodation',
  no_checkin_setup: '/safety?tab=checkins',
  no_destination: '/destinations',
  no_dates: '/trips',
}

const getActionIcon = (blockerType) => {
  const Icon = blockerToIcon[blockerType]
  return Icon || AlertTriangle
}

const getActionRoute = (blockerType) => {
  return blockerToRoute[blockerType] || '/trips'
}

const getPriorityColor = (readinessLabel, blockers) => {
  if (blockers.length === 0 || readinessLabel === READINESS_LABELS.READY) {
    return {
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-600',
      btnBg: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-emerald-700',
    }
  }

  if (readinessLabel === READINESS_LABELS.CRITICAL_BLOCKER) {
    return {
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-600',
      btnBg: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-red-700',
    }
  }

  if (readinessLabel === READINESS_LABELS.NEEDS_ATTENTION) {
    return {
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-600',
      btnBg: 'bg-amber-500 hover:bg-amber-600',
      textColor: 'text-amber-700',
    }
  }

  return {
    bg: 'bg-sky-500/5',
    border: 'border-sky-500/20',
    iconBg: 'bg-sky-500/20',
    iconColor: 'text-sky-600',
    btnBg: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-sky-700',
  }
}

const NextBestActionCard = ({
  nextBestAction = null,
  blockers = [],
  readinessLabel = READINESS_LABELS.CRITICAL_BLOCKER,
  className = ''
}) => {
  const colors = getPriorityColor(readinessLabel, blockers)

  const isReady = blockers.length === 0 || readinessLabel === READINESS_LABELS.READY

  const getActionDescription = () => {
    if (!nextBestAction?.description) {
      if (isReady) return 'Your trip is fully prepared. Review your itinerary before departure.'
      return 'Complete this to unlock your trip readiness score.'
    }
    return nextBestAction.description
  }

  const actionRoute = nextBestAction?.route 
    ? nextBestAction.route 
    : (blockers[0] ? getActionRoute(blockers[0].type) : '/trips')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
          {isReady ? (
            <CheckCircle size={18} className={colors.iconColor} />
          ) : (
            <AlertTriangle size={18} className={colors.iconColor} />
          )}
        </div>
        <h3 className="text-base font-bold text-base-content">Next Best Action</h3>
      </div>

      <div className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
        <div className="flex items-start gap-3">
          {!isReady && blockers[0] && (
            <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
              {(() => {
                const Icon = getActionIcon(blockers[0].type)
                return <Icon size={20} className={colors.iconColor} />
              })()}
            </div>
          )}
          {isReady && (
            <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
              <CheckCircle size={20} className={colors.iconColor} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold ${colors.textColor} mb-1`}>
              {nextBestAction?.title || 'Complete your trip setup'}
            </h4>
            <p className="text-xs text-base-content/60 leading-relaxed">
              {getActionDescription()}
            </p>
          </div>
        </div>
      </div>

      {nextBestAction?.action && (
        <Link 
          to={actionRoute}
          className={`block mt-4 w-full text-center text-sm font-bold text-white ${colors.btnBg} py-2.5 rounded-lg transition-colors shadow-sm`}
        >
          {nextBestAction.action}
        </Link>
      )}

      {isReady && nextBestAction?.route && (
        <Link 
          to={nextBestAction.route}
          className={`block mt-4 w-full text-center text-sm font-bold text-white ${colors.btnBg} py-2.5 rounded-lg transition-colors shadow-sm`}
        >
          Review Trip
        </Link>
      )}
    </motion.div>
  )
}

export default NextBestActionCard