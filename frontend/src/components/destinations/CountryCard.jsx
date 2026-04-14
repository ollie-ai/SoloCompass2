/**
 * CountryCard — discovery card for a country-level destination.
 * Shows: country name, advisory stance chip, solo-fit tags, top linked cities, CTA.
 * No fake statistics.
 */

import { Link } from 'react-router-dom';
import { Globe, ChevronRight, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

const ADVISORY_CHIP = {
  normal: { label: 'Travel advice: Normal', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  exercise_caution: { label: 'Exercise caution', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' },
  advise_against: { label: 'Advise against some travel', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' },
  advise_against_all: { label: 'Advise against all travel', color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
};

export default function CountryCard({ destination }) {
  const {
    id,
    slug,
    name,
    title,
    image_url,
    advisory_stance,
    solo_fit_tags,
    linked_cities = [],
    short_summary,
    description,
  } = destination;

  const advisory = advisory_stance ? ADVISORY_CHIP[advisory_stance] : null;
  const displayName = title || name;
  const parsedSoloTags = typeof solo_fit_tags === 'string' ? JSON.parse(solo_fit_tags || '[]') : (solo_fit_tags || []);
  const parsedCities = typeof linked_cities === 'string' ? JSON.parse(linked_cities || '[]') : (linked_cities || []);
  const summary = short_summary || (description?.slice(0, 120) + (description?.length > 120 ? '…' : '')) || '';
  const href = slug ? `/destinations/countries/${slug}` : `/destinations/${id}`;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden border border-base-300/50 hover:border-brand-vibrant/30 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-base-200 flex-shrink-0">
        {image_url ? (
          <img
            src={image_url}
            alt={`${displayName} landscape`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center">
            <Globe size={32} className="text-base-content/20" />
          </div>
        )}
        {/* Level badge - distinct from city */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 rounded-lg bg-brand-vibrant text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
            <Globe size={10} /> COUNTRY
          </span>
        </div>
        {/* Trust indicator on image */}
        {advisory_stance && advisory_stance !== 'normal' && (
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
              advisory_stance === 'exercise_caution' ? 'bg-yellow-500/90 text-white' :
              advisory_stance === 'advise_against' ? 'bg-orange-500/90 text-white' :
              'bg-red-500/90 text-white'
            }`}>
              {advisory_stance === 'exercise_caution' ? '⚠ Caution' :
               advisory_stance === 'advise_against' ? '⚠ Restricted' :
               '⚠ No travel'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-lg font-black text-base-content leading-tight tracking-tight">{displayName}</h3>

        {/* Advisory chip */}
        {advisory && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold self-start ${advisory.color}`}>
            {advisory_stance === 'normal' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
            {advisory.label}
          </span>
        )}

        {/* Summary */}
        {summary && (
          <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2">{summary}</p>
        )}

        {/* Solo-fit tags */}
        {parsedSoloTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {parsedSoloTags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-lg bg-brand-vibrant/10 text-brand-vibrant text-xs font-bold">
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Top linked cities preview */}
        {parsedCities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-base-content/40 font-medium flex items-center gap-1">
              <MapPin size={11} /> Cities:
            </span>
            {parsedCities.slice(0, 3).map((city) => (
              <span key={city.id || city.name} className="text-xs text-base-content/60 font-bold">
                {city.title || city.name}{parsedCities.indexOf(city) < Math.min(parsedCities.length, 3) - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Link
            to={href}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-brand-vibrant/10 hover:bg-brand-vibrant hover:text-white text-brand-vibrant font-black text-sm transition-all group/cta"
          >
            <span>Explore country</span>
            <ChevronRight size={16} className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
