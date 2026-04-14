/**
 * EMPTY STATE TAXONOMY
 * 
 * Different empty states require different treatment:
 * - FIRST_USE: New user, no data yet - show onboarding/guidance
 * - PARTIAL_DATA: Some data exists but incomplete - guide to complete
 * - NO_RESULTS: Search/filter returned nothing - show clear message
 * - UNAVAILABLE: External API/data unavailable - show fallback
 * - ERROR: Failed to load - show retry option
 * - GATED: Feature not available yet - explain why
 * - NOT_YET_BUILT: Placeholder for future feature - minimal footprint
 */

export const EMPTY_STATE_TYPES = {
  FIRST_USE: 'first_use',
  PARTIAL_DATA: 'partial_data',
  NO_RESULTS: 'no_results',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
  GATED: 'gated',
  NOT_YET_BUILT: 'not_yet_built',
}

export const EMPTY_STATE_CONFIG = {
  [EMPTY_STATE_TYPES.FIRST_USE]: {
    showCard: true,
    showFullCard: true,
    illustration: 'sparkles',
    primaryAction: true,
    secondaryAction: true,
    tone: 'encouraging',
    description: 'Get started by adding your first item',
  },
  [EMPTY_STATE_TYPES.PARTIAL_DATA]: {
    showCard: true,
    showFullCard: false,
    illustration: 'warning',
    primaryAction: true,
    secondaryAction: false,
    tone: 'helpful',
    description: 'Complete your setup to see full details',
  },
  [EMPTY_STATE_TYPES.NO_RESULTS]: {
    showCard: true,
    showFullCard: false,
    illustration: 'search',
    primaryAction: false,
    secondaryAction: true,
    tone: 'neutral',
    description: 'No items match your criteria',
  },
  [EMPTY_STATE_TYPES.UNAVAILABLE]: {
    showCard: true,
    showFullCard: true,
    illustration: 'cloud-off',
    primaryAction: false,
    secondaryAction: true,
    tone: 'neutral',
    description: 'Data temporarily unavailable',
  },
  [EMPTY_STATE_TYPES.ERROR]: {
    showCard: true,
    showFullCard: true,
    illustration: 'alert-triangle',
    primaryAction: true,
    secondaryAction: false,
    tone: 'urgent',
    description: 'Failed to load. Please try again.',
  },
  [EMPTY_STATE_TYPES.GATED]: {
    showCard: false,
    showFullCard: false,
    illustration: 'lock',
    primaryAction: false,
    secondaryAction: true,
    tone: 'neutral',
    description: 'Upgrade to access this feature',
  },
  [EMPTY_STATE_TYPES.NOT_YET_BUILT]: {
    showCard: false,
    showFullCard: false,
    illustration: 'construction',
    primaryAction: false,
    secondaryAction: false,
    tone: 'neutral',
    description: 'Coming soon',
  },
}

export const getEmptyStateConfig = (type) => {
  return EMPTY_STATE_CONFIG[type] || EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.FIRST_USE]
}

export const shouldShowWidget = (emptyStateType, hasData) => {
  const config = getEmptyStateConfig(emptyStateType)
  
  if (!config.showCard) return false
  if (hasData) return true
  
  return config.showFullCard
}