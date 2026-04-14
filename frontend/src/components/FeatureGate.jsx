import { memo } from 'react';
import PropTypes from 'prop-types';
import { FEATURES, FEATURE_LABELS } from '../config/features';
import { Lock } from 'lucide-react';

function FeatureGate({ 
  feature, 
  children, 
  showComingSoon = true,
  adminPreview = false 
}) {
  const isEnabled = FEATURES[feature];
  const featureLabel = FEATURE_LABELS[feature] || feature;

  if (isEnabled || adminPreview) {
    return <>{children}</>;
  }

  if (!showComingSoon) {
    return null;
  }

  return (
    <div className="relative group cursor-not-allowed">
      <div className="absolute inset-0 bg-base-200/80 backdrop-blur-[1px] rounded-xl z-10 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-full border border-base-300">
          <Lock size={14} className="text-base-content/40" />
          <span className="text-xs font-black uppercase tracking-widest text-base-content/60">
            Coming Soon
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-base-content/40 max-w-[200px] text-center">
          {featureLabel} feature is under development
        </p>
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
}

FeatureGate.propTypes = {
  feature: PropTypes.string.isRequired,
  children: PropTypes.node,
  showComingSoon: PropTypes.bool,
  adminPreview: PropTypes.bool,
};

FeatureGate.defaultProps = {
  children: null,
  showComingSoon: true,
  adminPreview: false,
};

export default memo(FeatureGate);
