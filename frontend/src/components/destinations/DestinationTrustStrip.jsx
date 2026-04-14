/**
 * DestinationTrustStrip
 * Top-of-page trust indicators for any destination page.
 * Shows: destination level badge, publication status, advisory stance,
 * advisory check date, content freshness, and source labels.
 * No fake precision — only shows what is available.
 */

import { ShieldCheck, Clock, CheckCircle, AlertTriangle, Globe, RefreshCw, Info } from 'lucide-react';

const ADVISORY_CONFIG = {
  normal: { label: 'Normal travel', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  exercise_caution: { label: 'Exercise caution', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  advise_against: { label: 'Advise against some travel', color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20' },
  advise_against_all: { label: 'Advise against all travel', color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' },
};

const LEVEL_CONFIG = {
  country: { label: 'Country Guide', icon: Globe },
  city: { label: 'City Guide', icon: ShieldCheck },
  region: { label: 'Region Guide', icon: Info },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isContentFresh(freshUntil) {
  if (!freshUntil) return null; // unknown
  return new Date(freshUntil) > new Date();
}

export default function DestinationTrustStrip({ destination }) {
  if (!destination) return null;

  const {
    destination_level,
    publication_status,
    advisory_stance,
    advisory_checked_at,
    advisory_source,
    content_fresh_until,
    source,
  } = destination;

  const advisoryConfig = ADVISORY_CONFIG[advisory_stance] || null;
  const levelConfig = LEVEL_CONFIG[destination_level] || LEVEL_CONFIG.city;
  const LevelIcon = levelConfig.icon;
  const checked = formatDate(advisory_checked_at);
  const freshUntil = formatDate(content_fresh_until);
  const fresh = isContentFresh(content_fresh_until);

  return (
    <div className="w-full bg-base-200/60 border-b border-base-300/50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
        {/* Destination level badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-vibrant/10 border border-brand-vibrant/20 text-brand-vibrant text-xs font-black uppercase tracking-widest">
          <LevelIcon size={12} />
          {levelConfig.label}
        </span>

        {/* Advisory stance */}
        {advisoryConfig && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${advisoryConfig.color}`}>
            {advisory_stance === 'normal' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
            {advisoryConfig.label}
          </span>
        )}

        {/* Advisory check date */}
        {checked && (
          <span className="inline-flex items-center gap-1.5 text-xs text-base-content/50 font-medium">
            <Clock size={12} />
            Advisory checked: {checked}
            {advisory_source && <span className="text-base-content/40">via {advisory_source}</span>}
          </span>
        )}

        {/* Content freshness */}
        {fresh !== null && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
            fresh
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400'
          }`}>
            <RefreshCw size={12} />
            {fresh ? (freshUntil ? `Fresh until ${freshUntil}` : 'Content up to date') : 'Content may be outdated'}
          </span>
        )}

        {/* Source label */}
        {source && (
          <span className="inline-flex items-center gap-1.5 text-xs text-base-content/40 font-medium ml-auto">
            {source === 'ai' ? '✦ AI-assisted research' : source === 'manual' ? '✓ Manually curated' : '✓ Research team'}
          </span>
        )}
      </div>
    </div>
  );
}
