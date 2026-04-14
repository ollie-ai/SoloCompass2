/**
 * SourceLabel — Component to show source type
 */

import { useState } from 'react';
import { ShieldCheck, CheckCircle, Sparkles, Users, Building2, Info } from 'lucide-react';

const SOURCE_CONFIG = {
  official: {
    label: 'Official',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: Building2,
    bg: 'bg-emerald-500',
  },
  verified: {
    label: 'Verified',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: ShieldCheck,
    bg: 'bg-blue-500',
  },
  ai: {
    label: 'AI',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Sparkles,
    bg: 'bg-purple-500',
    description: 'AI-assisted research — verify with official sources',
  },
  community: {
    label: 'Community',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: Users,
    bg: 'bg-orange-500',
    description: 'Community-contributed content',
  },
  partner: {
    label: 'Partner',
    color: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    icon: Building2,
    bg: 'bg-pink-500',
    description: 'Partner-provided information',
  },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function SourceLabel({ type, label, lastChecked, showTooltip = true }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const config = SOURCE_CONFIG[type] || SOURCE_CONFIG.ai;
  const Icon = config.icon;
  const checkedDate = formatDate(lastChecked);

  if (!type) {
    if (label) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-bold bg-base-200 text-base-content/60 border-base-300/30">
          {label}
        </span>
      );
    }
    return null;
  }

  return (
    <div className="relative inline-flex">
      <button
        onClick={() => showTooltip && setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${config.color} ${
          showTooltip ? 'hover:opacity-80' : ''
        }`}
      >
        <Icon size={12} />
        {label || config.label}
        {checkedDate && showTooltip && (
          <span className="text-[10px] opacity-60 ml-1">{checkedDate}</span>
        )}
      </button>

      {showTooltip && showDetails && config.description && (
        <div className="absolute z-50 left-0 top-full mt-2 w-48 p-2 rounded-lg bg-base-100 border border-base-300/50 shadow-xl">
          <p className="text-xs text-base-content/70">{config.description}</p>
          {checkedDate && (
            <p className="text-[10px] text-base-content/40 mt-1">Last checked: {checkedDate}</p>
          )}
        </div>
      )}
      
      {showTooltip && !showDetails && config.description && (
        <div className="absolute z-50 left-0 top-full mt-1 w-48 p-2 rounded-lg bg-base-100 border border-base-300/50 shadow-xl hidden group-hover:block">
          <p className="text-xs text-base-content/70">{config.description}</p>
        </div>
      )}
    </div>
  );
}