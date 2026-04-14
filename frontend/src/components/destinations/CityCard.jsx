/**
 * CityCard — discovery card for a city-level destination.
 * Shows: city name, parent country, summary, best-for tags, safety chip, CTA.
 * No fake statistics.
 */

import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, ShieldCheck, AlertTriangle } from 'lucide-react';

const SAFETY_CHIP = {
  high: { label: 'Generally Safe', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Exercise Caution', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' },
  low: { label: 'High Caution', color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
};

export default function CityCard({ destination }) {
  const {
    id,
    slug,
    name,
    title,
    image_url,
    country,
    safety_rating,
    best_for_tags,
    short_summary,
    description,
    destination_level,
  } = destination;

  const safetyChip = safety_rating ? SAFETY_CHIP[safety_rating] : null;
  const displayName = title || name;
  const parsedTags = typeof best_for_tags === 'string' ? JSON.parse(best_for_tags || '[]') : (best_for_tags || []);
  const summary = short_summary || (description?.slice(0, 110) + (description?.length > 110 ? '…' : '')) || '';
  const href = slug ? `/destinations/cities/${slug}` : `/destinations/${id}`;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden border border-base-300/50 hover:border-brand-vibrant/30 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-32 overflow-hidden bg-base-200 flex-shrink-0">
        {image_url ? (
          <img
            src={image_url}
            alt={`${displayName} cityscape`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center">
            <MapPin size={28} className="text-base-content/20" />
          </div>
        )}
        {/* Level badge */}
        <div className="absolute top-3 left-3 flex gap-1">
          <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
            <MapPin size={10} /> CITY
          </span>
          {country && (
            <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-bold">
              {country}
            </span>
          )}
        </div>
        {/* Trust indicator on image */}
        {safety_rating && safety_rating !== 'high' && (
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
              safety_rating === 'medium' ? 'bg-yellow-500/90 text-white' :
              'bg-red-500/90 text-white'
            }`}>
              {safety_rating === 'medium' ? '⚠ Caution' : '⚠ High risk'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="text-base font-black text-base-content leading-tight tracking-tight">{displayName}</h3>
        </div>

        {/* Safety chip */}
        {safetyChip && (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-bold self-start ${safetyChip.color}`}>
            {safety_rating === 'high' ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
            {safetyChip.label}
          </span>
        )}

        {/* Summary */}
        {summary && (
          <p className="text-xs text-base-content/60 leading-relaxed line-clamp-2">{summary}</p>
        )}

        {/* Best-for tags */}
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {parsedTags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-lg bg-base-200 text-base-content/60 text-xs font-bold border border-base-300/50">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Link
            to={href}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-base-200 hover:bg-brand-vibrant hover:text-white text-base-content/70 font-black text-xs transition-all group/cta border border-base-300/50 hover:border-brand-vibrant"
          >
            <span>View city</span>
            <ChevronRight size={14} className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
