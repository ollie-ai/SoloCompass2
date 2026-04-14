/**
 * WIDGET CONTRACT DEFINITIONS
 * 
 * Each dashboard widget should adhere to this contract:
 * - purpose: What question does this answer?
 * - source: Where does the data come from?
 * - refreshCadence: How often to refresh (in minutes)
 * - staleThreshold: When is data considered stale (in minutes)
 * - failureFallback: What to show when data fails
 * - ctaDestination: Where does clicking the widget take user
 * - owner: Which feature/team owns this
 * - visibilityConditions: When to show/hide
 * 
 * This ensures operational consistency across the dashboard.
 */

export const WIDGET_CONTRACTS = {
  // HERO / TRIP STATUS
  TripImageHero: {
    purpose: 'Show trip overview, countdown, and readiness at a glance',
    source: 'Trip data from backend',
    refreshCadence: 60,
    staleThreshold: 60,
    failureFallback: 'Show last known trip info',
    ctaDestination: '/trips/:id',
    owner: 'Trip Management',
    visibilityConditions: 'Always visible when trip exists',
  },

  // TIER 1 - CRITICAL
  NextBestActionCard: {
    purpose: 'Tell user the single most important thing to do next',
    source: 'computeReadiness() from dashboardStateResolver',
    refreshCadence: 5,
    staleThreshold: 10,
    failureFallback: 'Show generic "Review your trip" action',
    ctaDestination: 'Dynamic based on blocker type',
    owner: 'Trip Readiness',
    visibilityConditions: 'Always visible in upcoming/planning states',
  },

  ChecklistCard: {
    purpose: 'Show pre-departure checklist with toggle progress',
    source: 'Trip checklist API',
    refreshCadence: 30,
    staleThreshold: 60,
    failureFallback: 'Show static checklist without save',
    ctaDestination: '/trips/:id?tab=checklist',
    owner: 'Trip Readiness',
    visibilityConditions: 'Visible in upcoming/planning, collapsed after complete',
  },

  AdvisorySummaryWidget: {
    purpose: 'Show travel advisories and safety status for destination',
    source: 'Advisories API',
    refreshCadence: 60,
    staleThreshold: 120,
    failureFallback: 'Show "Monitoring" with safety tips',
    ctaDestination: '/advisories',
    owner: 'Safety',
    visibilityConditions: 'Always visible when destination set',
  },

  LocalEmergencyCard: {
    purpose: 'Show local emergency numbers (police, ambulance, fire)',
    source: 'Safety API / static data',
    refreshCadence: 0,
    staleThreshold: 0,
    failureFallback: 'Show generic international emergency numbers',
    ctaDestination: '/safety',
    owner: 'Safety',
    visibilityConditions: 'Always visible when destination set',
  },

  // TIER 2 - IMPORTANT
  TravelDayPrepCard: {
    purpose: 'Show weather, timezone, insurance, eSIM, transfer status',
    source: 'TimeWeather API + Trip data',
    refreshCadence: 30,
    staleThreshold: 60,
    failureFallback: 'Show each item as "Unable to load"',
    ctaDestination: '/trips/:id?tab=travel',
    owner: 'Trip Management',
    visibilityConditions: 'Visible in upcoming state',
  },

  TripEssentialsCard: {
    purpose: 'Quick access to budget, accommodation, documents',
    source: 'Trip data',
    refreshCadence: 60,
    staleThreshold: 120,
    failureFallback: 'Show items with "Unable to load" status',
    ctaDestination: 'Dynamic per item',
    owner: 'Trip Management',
    visibilityConditions: 'Always visible in upcoming/planning',
  },

  SafetyStatusCard: {
    purpose: 'Show emergency contacts and check-in setup status',
    source: 'Safety API',
    refreshCadence: 30,
    staleThreshold: 60,
    failureFallback: 'Show "Set up your safety profile" prompt',
    ctaDestination: '/safety',
    owner: 'Safety',
    visibilityConditions: 'Visible when trip is upcoming',
  },

  GuardianStatusCard: {
    purpose: 'Show guardian/emergency contact status and quick actions',
    source: 'Emergency contacts API',
    refreshCadence: 30,
    staleThreshold: 60,
    failureFallback: 'Show "Add emergency contacts" prompt',
    ctaDestination: '/safety?tab=contacts',
    owner: 'Safety',
    visibilityConditions: 'Visible when contacts exist or trip upcoming',
  },

  // TIER 3 - CONDITIONAL
  BudgetSnapshotWidget: {
    purpose: 'Show budget spent vs remaining with currency',
    source: 'Trip budget API',
    refreshCadence: 15,
    staleThreshold: 30,
    failureFallback: 'Hide widget entirely',
    ctaDestination: '/trips/:id?tab=budget',
    owner: 'Budget',
    visibilityConditions: 'Only show when budget data exists',
  },

  SafeHavenCard: {
    purpose: 'Show nearby safety resources (police, hospitals)',
    source: 'Safety/Safe Haven API',
    refreshCadence: 60,
    staleThreshold: 120,
    failureFallback: 'Show generic safety resources',
    ctaDestination: '/safety',
    owner: 'Safety',
    visibilityConditions: 'Show in upcoming/live trip when location available',
  },

  WeatherCard: {
    purpose: 'Show detailed weather forecast for destination',
    source: 'Weather API',
    refreshCadence: 30,
    staleThreshold: 60,
    failureFallback: 'Hide widget or show "Weather unavailable"',
    ctaDestination: '/trips/:id?tab=weather',
    owner: 'Trip Management',
    visibilityConditions: 'Show when within 14 days of departure',
  },
}

export const getWidgetContract = (widgetName) => {
  return WIDGET_CONTRACTS[widgetName] || null
}

export const getWidgetRefreshInterval = (widgetName) => {
  const contract = WIDGET_CONTRACTS[widgetName]
  return contract ? contract.refreshCadence * 60 * 1000 : 300000 // default 5 min
}

export const shouldRefreshWidget = (widgetName, lastRefreshed) => {
  const contract = WIDGET_CONTRACTS[widgetName]
  if (!contract) return false
  
  const interval = contract.refreshCadence * 60 * 1000
  const elapsed = Date.now() - new Date(lastRefreshed).getTime()
  
  return elapsed > interval
}