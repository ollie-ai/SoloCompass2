import { READINESS_LABELS } from '../stores/readinessStore';

export function resolveDashboardState(trips) {
  if (!trips?.length) return { state: "no_trips", trip: null }
  
  const now = new Date()
  now.setHours(0,0,0,0)
  
  const live = trips.find(t => {
    if (!t.start_date || !t.end_date) return false
    const start = new Date(t.start_date)
    const end = new Date(t.end_date)
    end.setHours(23,59,59,999)
    return now >= start && now <= end
  })
  if (live) return { state: "live_trip", trip: live }
  
  const upcoming = trips.find(t => {
    if (!t.start_date) return false
    const start = new Date(t.start_date)
    return (t.status === "confirmed" || t.status === "upcoming") && start > now
  })
  if (upcoming) return { state: "upcoming", trip: upcoming }
  
  const planning = trips.find(t => t.status === "planning" || t.status === "draft")
  if (planning) return { state: "planning", trip: planning }
  
  const completed = trips.find(t => t.end_date && new Date(t.end_date) < now)
  if (completed) return { state: "completed", trip: completed }
  
  return { state: "no_trips", trip: null }
}

export function getTripCountdown(trip) {
  if (!trip?.start_date) return null
  const now = new Date()
  const start = new Date(trip.start_date)
  const diff = start - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return null
  if (days === 0) return { text: "Today", days: 0 }
  if (days === 1) return { text: "Tomorrow", days: 1 }
  return { text: `${days} days`, days }
}

export function computeStats(trips, alerts) {
  const now = new Date()
  const completed = trips.filter(t => t.end_date && new Date(t.end_date) < now).length
  const countries = [...new Set(trips.map(t => t.destination).filter(Boolean))]
  
  let travelLevel = "Bronze"
  if (completed >= 5) travelLevel = "Platinum"
  else if (completed >= 3) travelLevel = "Gold"
  else if (completed >= 1) travelLevel = "Silver"
  
  return {
    totalTrips: trips.length,
    countriesVisited: countries.length,
    activeAlerts: alerts?.length || 0,
    travelLevel,
    completedTrips: completed,
    buddyRequests: 0
  }
}

export const READINESS_THRESHOLDS = {
  ready: 85,
  inProgress: 60,
  needsAttention: 30,
}

export function getReadinessStatus(percentage) {
  if (percentage >= READINESS_THRESHOLDS.ready) return READINESS_LABELS.READY
  if (percentage >= READINESS_THRESHOLDS.inProgress) return READINESS_LABELS.IN_PROGRESS
  if (percentage >= READINESS_THRESHOLDS.needsAttention) return READINESS_LABELS.NEEDS_ATTENTION
  return READINESS_LABELS.CRITICAL_BLOCKER
}

export function computeReadiness(checklistState, tripData = {}) {
  const items = checklistState || {}
  const completedCount = Object.values(items).filter(Boolean).length
  const totalCount = 4
  const percentage = Math.round((completedCount / totalCount) * 100)
  
  const blockers = []
  if (!items.packing) blockers.push({ type: 'packing', label: 'Packing list incomplete' })
  if (!items.contacts) blockers.push({ type: 'contacts', label: 'Emergency contacts not confirmed' })
  if (!items.checkins) blockers.push({ type: 'checkins', label: 'Check-ins not scheduled' })
  if (!items.documents) blockers.push({ type: 'documents', label: 'Documents not saved' })
  
  const daysUntil = tripData?.start_date 
    ? Math.ceil((new Date(tripData.start_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  let urgency = 'low'
  if (daysUntil !== null) {
    if (daysUntil <= 0) urgency = 'high'
    else if (daysUntil <= 3) urgency = 'high'
    else if (daysUntil <= 7) urgency = 'medium'
  }
  
  if (percentage < 75 && urgency === 'high') {
    urgency = 'critical'
  }
  
  return {
    percentage,
    completedCount,
    totalCount,
    status: getReadinessStatus(percentage),
    urgency,
    blockers,
    isReady: percentage >= READINESS_THRESHOLDS.needsAttention,
  }
}
