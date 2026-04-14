/**
 * RegionalDifferences — Regional variation summary
 */

import { useState } from 'react';
import { MapPin, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react';

const TOGGLE_OPTIONS = [
  { id: 'solo_ease', label: 'Solo Travel Ease' },
  { id: 'budget', label: 'Budget' },
  { id: 'transport', label: 'Transport' },
];

const EASE_CONFIG = {
  easy: { label: 'Easy', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle },
  moderate: { label: 'Moderate', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertTriangle },
  complex: { label: 'Complex', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: AlertTriangle },
  unsupported: { label: 'Not supported', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
};

function parseRegions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

export default function RegionalDifferences({ destination }) {
  const [view, setView] = useState('solo_ease');
  const [expanded, setExpanded] = useState({});

  const { regions, regional_summary } = destination || {};
  const regionList = parseRegions(regions);

  if (!regionList.length) {
    return (
      <section className="rounded-xl bg-base-200 border border-base-300/50 p-5">
        <h3 className="text-base font-black text-base-content mb-3">Regional Differences</h3>
        <p className="text-sm text-base-content/50">No regional data available for this destination.</p>
      </section>
    );
  }

  const toggleView = (newView) => {
    setView(newView);
    setExpanded({});
  };

  const toggleExpand = (regionId) => {
    setExpanded(prev => ({ ...prev, [regionId]: !prev[regionId] }));
  };

  return (
    <section className="rounded-xl bg-base-200 border border-base-300/50 p-5 space-y-4">
      <div>
        <h3 className="text-base font-black text-base-content mb-2">Regional Differences</h3>
        {regional_summary && <p className="text-sm text-base-content/70 leading-relaxed">{regional_summary}</p>}
      </div>

      <div className="flex gap-2">
        {TOGGLE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => toggleView(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === opt.id
                ? 'bg-brand-vibrant text-white'
                : 'bg-base-100 text-base-content/50 hover:text-base-content'
            }`}
          >
            {view === opt.id ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} {opt.label}
          </button>
        ))}
      </div>

      {regionList.length > 0 && (
        <div className="space-y-3">
          {regionList.map((region) => {
            const easeInfo = region.solo_ease ? EASE_CONFIG[region.solo_ease] : null;
            const EaseIcon = easeInfo?.icon || MapPin;
            const isExpanded = expanded[region.id];

            return (
              <div key={region.id} className="rounded-lg bg-base-100/50 border border-base-300/30 overflow-hidden">
                <button
                  onClick={() => toggleExpand(region.id)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-base-content/40" />
                    <div>
                      <span className="font-bold text-base-content">{region.name}</span>
                      {easeInfo && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${easeInfo.color}`}>
                          <EaseIcon size={10} className="inline mr-1" />
                          {easeInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isExpanded && region.notes && (
                  <div className="px-3 pb-3 text-sm text-base-content/60">{region.notes}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}