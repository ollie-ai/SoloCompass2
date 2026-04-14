/**
 * DASHBOARD STATUS VOCABULARY SYSTEM
 * 
 * Separate vocabularies for different status types to avoid mixing:
 * - READINESS: Trip preparation progress
 * - RISK: Safety/advisory severity
 * - DATA_HEALTH: External data freshness
 * - PROGRESS: Task completion state
 */

export const READINESS_STATUS = {
  READY: 'ready',
  NEEDS_ATTENTION: 'needs_attention',
  IN_PROGRESS: 'in_progress',
  CRITICAL_BLOCKER: 'critical_blocker',
}

export const READINESS_LABELS = {
  [READINESS_STATUS.READY]: 'Ready',
  [READINESS_STATUS.NEEDS_ATTENTION]: 'Needs attention',
  [READINESS_STATUS.IN_PROGRESS]: 'In progress',
  [READINESS_STATUS.CRITICAL_BLOCKER]: 'Blocked',
}

export const READINESS_COLORS = {
  ready: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-600',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600',
    textColor: 'text-emerald-700',
  },
  needs_attention: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-600',
    btnBg: 'bg-amber-500 hover:bg-amber-600',
    textColor: 'text-amber-700',
  },
  in_progress: {
    bg: 'bg-sky-500/5',
    border: 'border-sky-500/20',
    iconBg: 'bg-sky-500/20',
    iconColor: 'text-sky-600',
    btnBg: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-sky-700',
  },
  critical_blocker: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-600',
    btnBg: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-red-700',
  },
}

export const RISK_STATUS = {
  ALL_CLEAR: 'all_clear',
  CAUTION: 'caution',
  HIGH_ALERT: 'high_alert',
  SEVERE: 'severe',
}

export const RISK_LABELS = {
  [RISK_STATUS.ALL_CLEAR]: 'All clear',
  [RISK_STATUS.CAUTION]: 'Caution',
  [RISK_STATUS.HIGH_ALERT]: 'High alert',
  [RISK_STATUS.SEVERE]: 'Severe',
}

export const DATA_HEALTH_STATUS = {
  CURRENT: 'current',
  STALE: 'stale',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
  LOADING: 'loading',
}

export const DATA_HEALTH_LABELS = {
  [DATA_HEALTH_STATUS.CURRENT]: 'Up to date',
  [DATA_HEALTH_STATUS.STALE]: 'May be outdated',
  [DATA_HEALTH_STATUS.UNAVAILABLE]: 'Data unavailable',
  [DATA_HEALTH_STATUS.ERROR]: 'Failed to load',
  [DATA_HEALTH_STATUS.LOADING]: 'Loading...',
}

export const TASK_PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
}

export const TASK_PROGRESS_LABELS = {
  [TASK_PROGRESS_STATUS.NOT_STARTED]: 'Not started',
  [TASK_PROGRESS_STATUS.IN_PROGRESS]: 'In progress',
  [TASK_PROGRESS_STATUS.COMPLETE]: 'Complete',
}

export const getDataFreshness = (timestamp, staleThresholdMinutes = 30) => {
  if (!timestamp) return DATA_HEALTH_STATUS.UNAVAILABLE
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < staleThresholdMinutes) return DATA_HEALTH_STATUS.CURRENT
  return DATA_HEALTH_STATUS.STALE
}

export const formatFreshness = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp)
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