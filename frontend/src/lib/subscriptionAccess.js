const PLAN_ORDER = ['explorer', 'guardian', 'navigator'];

export function normalizeSubscriptionTier(user) {
  const tier = user?.subscription_tier || user?.subscription || user?.tier;
  if (!tier) return 'explorer';

  const normalized = String(tier).toLowerCase();
  return PLAN_ORDER.includes(normalized) ? normalized : 'explorer';
}

export function hasMinimumTier(user, requiredTier) {
  const currentIndex = PLAN_ORDER.indexOf(normalizeSubscriptionTier(user));
  const requiredIndex = PLAN_ORDER.indexOf(requiredTier);

  if (requiredIndex === -1) {
    return true;
  }

  return currentIndex >= requiredIndex;
}

export function isExplorerTier(user) {
  return normalizeSubscriptionTier(user) === 'explorer';
}

export function isGuardianPlus(user) {
  return hasMinimumTier(user, 'guardian');
}