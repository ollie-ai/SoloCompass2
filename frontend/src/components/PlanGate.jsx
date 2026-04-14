import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { hasMinimumTier } from '../lib/subscriptionAccess';
import Button from './Button';

const PLAN_LABELS = {
  explorer: 'Explorer',
  guardian: 'Guardian',
  navigator: 'Navigator'
};

/**
 * PlanGate — wraps any UI that requires a minimum subscription tier.
 *
 * Props:
 *   minPlan    – 'explorer' | 'guardian' | 'navigator'
 *   children   – content shown when access is granted
 *   fallback   – optional custom fallback; if omitted, a default upgrade card is shown
 *   title      – optional feature name shown in the upgrade card
 *   description – optional copy shown in the upgrade card
 */
export default function PlanGate({ minPlan = 'guardian', children, fallback, title, description }) {
  const { user } = useAuthStore();

  if (hasMinimumTier(user, minPlan)) {
    return children;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  const planLabel = PLAN_LABELS[minPlan] || minPlan;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-base-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Lock size={18} className="text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-black text-base-content">{planLabel}+ Feature</p>
          {title && <p className="text-xs text-base-content/50">{title}</p>}
        </div>
      </div>
      <p className="text-sm text-base-content/70 mb-5">
        {description || `Upgrade to ${planLabel} or above to unlock this feature.`}
      </p>
      <Link to="/settings?tab=billing">
        <Button size="sm" className="w-full">Upgrade to {planLabel}</Button>
      </Link>
    </div>
  );
}
