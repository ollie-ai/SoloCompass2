import { motion } from 'framer-motion';
import { CreditCard, Download, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import BillingHistory from '../BillingHistory';
import TokenDashboard from '../TokenDashboard';
import CurrentPlanCard from '../billing/CurrentPlanCard';
import { UpgradeButton } from '../billing/UpgradeButton';
import { BillingPortalLink } from '../billing/BillingPortalLink';

const EASE = [0.16, 1, 0.3, 1];
const cardClass = "glass-card p-6 rounded-3xl border border-base-300/50";

const BillingTab = ({
  subscriptionStatus,
  loadingSubscription,
  handleCancelSubscription,
  navigate,
  saving,
  exporting,
  handleExportData,
  handleDeleteAccount,
}) => {
  return (
    <motion.div
      key="billing"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ ease: EASE, duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-black text-base-content">Billing & Data</h2>
        <p className="text-base-content/60 font-medium text-sm mt-1">Manage your subscription, download your data, or delete your account.</p>
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-xl font-black text-base-content flex items-center gap-2">
          <CreditCard size={20} className="text-brand-vibrant" /> Subscription & Data
        </h2>
        <p className="text-base-content/60 font-medium text-sm">Manage your plan, billing history, and personal data archive.</p>
      </div>

      <CurrentPlanCard />

      {subscriptionStatus?.isPremium && (
        <div className="flex gap-3 flex-wrap">
          <BillingPortalLink portalUrl={subscriptionStatus?.stripePortalUrl} />
          {!subscriptionStatus?.stripeStatus?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              disabled={loadingSubscription}
              className="px-4 py-2 rounded-xl font-bold text-sm border border-base-300 text-error hover:bg-error/10 disabled:opacity-50 transition-all"
            >
              {loadingSubscription ? 'Cancelling...' : 'Cancel subscription'}
            </button>
          )}
        </div>
      )}

      {!subscriptionStatus?.isPremium && (
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-base-200/50 border border-base-300/50">
          <p className="text-sm font-bold text-base-content/60">Upgrade to unlock all features</p>
          <div className="flex gap-3 flex-wrap">
            <UpgradeButton plan="guardian" size="md">Upgrade to Guardian — £4.99/mo</UpgradeButton>
            <UpgradeButton plan="navigator" size="md" variant="outline">Navigator — £9.99/mo</UpgradeButton>
          </div>
          <p className="text-xs text-base-content/40 font-medium">Guardian: Unlimited AI, scheduled check-ins, Safe-Return Timer. Navigator: Everything + AI safety advice & priority support.</p>
        </div>
      )}

      <BillingHistory />

      <TokenDashboard onUpgrade={() => navigate('/?upgrade=guardian')} />

      <div className={cardClass}>
        <div className="p-5 border-b border-base-300/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <Download size={16} />
            </div>
            <div>
              <h3 className="text-base font-black text-base-content">Data Portability</h3>
              <p className="text-xs text-base-content/60 font-medium">Download a complete archive of your travel data, preferences, and account information.</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-base-content/80 font-medium mb-4">
            Your export includes trip data, itinerary, safety settings, and profile information.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="inline-flex items-center gap-2 bg-brand-vibrant text-white shadow-md shadow-brand-vibrant/25 hover:bg-green-600 disabled:opacity-50 rounded-xl font-bold px-5 py-2.5 text-sm transition-all"
          >
            <Download size={14} /> {exporting ? 'Generating archive...' : 'Download my data archive'}
          </button>
          <p className="text-xs text-base-content/40 font-medium mt-4">
            Your data is retained for the duration of your account. After deletion, all data is permanently removed within 30 days.
          </p>
        </div>
      </div>

      <div className="bg-error/5 p-6 rounded-2xl border-2 border-red-500/10">
        <h3 className="text-base font-black text-error mb-4 flex items-center gap-2">
          <Trash2 size={18} /> Account Termination
        </h3>

        <div className="p-4 rounded-xl bg-base-100 border border-red-500/15 mb-4">
          <div className="flex gap-3">
            <AlertTriangle className="text-error shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-black text-red-900 mb-1">Permanently Delete Account</h4>
              <p className="text-sm text-error leading-relaxed font-medium">
                Once you delete your account, there is no going back. All itineraries, safety data, and account information will be wiped immediately.
              </p>
              <p className="text-xs text-error/80 font-medium mt-2">
                We recommend downloading your data archive before deleting.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-base-content/60 font-medium mb-3">
          Deleting your account permanently removes your trips, preferences, and associated account data.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <button
            onClick={handleDeleteAccount}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-[10px] uppercase tracking-widest"
          >
            {saving ? <RotateCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {saving ? 'Processing...' : 'Delete My Account'}
          </button>
          <p className="text-[10px] text-base-content/40 font-bold italic">
            Wait! Have you downloaded your data archive yet?
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BillingTab;
