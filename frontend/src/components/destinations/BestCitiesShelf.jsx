/**
 * BestCitiesShelf — Cities with compare toggle
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, CheckCircle, ArrowUpDown, GitCompare } from 'lucide-react';

function parseCities(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

const SORT_OPTIONS = [
  { id: 'ease', label: 'Ease' },
  { id: 'budget', label: 'Budget' },
  { id: 'social', label: 'Social' },
  { id: 'digital', label: 'Digital Nomad' },
];

const BUDGET_SIGNAL = {
  backpacker: '$',
  budget: '$',
  midrange: '$$',
  comfort: '$$$',
  luxury: '$$$$',
};

export default function BestCitiesShelf({ destination, onCitySelect }) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [sortBy, setSortBy] = useState('ease');

  const { linked_cities } = destination || {};
  const cities = parseCities(linked_cities);

  const toggleCompare = () => {
    setCompareMode(!compareMode);
    if (compareMode) setSelectedCities([]);
  };

  const toggleCitySelect = (cityId) => {
    if (selectedCities.includes(cityId)) {
      setSelectedCities(selectedCities.filter(id => id !== cityId));
    } else if (selectedCities.length < 3) {
      setSelectedCities([...selectedCities, cityId]);
    }
  };

  const sortedCities = [...cities].sort((a, b) => {
    if (sortBy === 'budget') return (BUDGET_SIGNAL[a.budget_signal] || '').localeCompare(BUDGET_SIGNAL[b.budget_signal] || '');
    if (sortBy === 'social') return (b.social_vibe_score || 0) - (a.social_vibe_score || 0);
    if (sortBy === 'digital') return (b.digital_nomad_score || 0) - (a.digital_nomad_score || 0);
    return (b.solo_ease_score || 0) - (a.solo_ease_score || 0);
  });

  if (!cities.length) {
    return (
      <section className="rounded-xl bg-base-200 border border-base-300/50 p-5">
        <h3 className="text-base font-black text-base-content mb-3">Best Cities</h3>
        <p className="text-sm text-base-content/50">No cities linked to this destination yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4" id="cities">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-base-content">Best Cities to Explore</h3>
        <button
          onClick={toggleCompare}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            compareMode
              ? 'bg-brand-vibrant text-white'
              : 'bg-base-200 text-base-content/60 hover:text-base-content'
          }`}
        >
          <GitCompare size={14} /> Compare
        </button>
      </div>

      {compareMode && (
        <div className="p-3 rounded-lg bg-brand-vibrant/5 border border-brand-vibrant/20">
          <p className="text-xs text-brand-vibrant font-bold mb-2">
            Select up to 3 cities to compare ({selectedCities.length}/3)
          </p>
          {selectedCities.length > 0 && (
            <button
              onClick={() => onCitySelect?.(selectedCities)}
              className="text-xs text-brand-vibrant font-bold underline"
            >
              View comparison
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs text-base-content/40 font-bold flex items-center gap-1">
          <ArrowUpDown size={12} /> Sort:
        </span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSortBy(opt.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              sortBy === opt.id
                ? 'bg-brand-vibrant text-white'
                : 'bg-base-200 text-base-content/50 hover:text-base-content'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCities.map((city) => {
          const cityName = city.title || city.name;
          const href = city.slug ? `/destinations/cities/${city.slug}` : `/destinations/${city.id}`;
          const isSelected = selectedCities.includes(city.id);

          return (
            <div
              key={city.id}
              className={`group relative rounded-xl bg-base-200 border border-base-300/50 hover:border-brand-vibrant/30 hover:shadow-lg transition-all ${
                compareMode && isSelected ? 'ring-2 ring-brand-vibrant' : ''
              }`}
            >
              {compareMode && (
                <button
                  onClick={() => toggleCitySelect(city.id)}
                  className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-brand-vibrant border-brand-vibrant text-white'
                      : 'border-base-content/30 bg-base-100/50 hover:border-brand-vibrant'
                  }`}
                >
                  {isSelected && <CheckCircle size={14} />}
                </button>
              )}

              <Link to={href} className="block p-4">
                <div className="flex items-start gap-3 mb-2">
                  <MapPin size={18} className="text-brand-vibrant flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-base-content">{cityName}</h4>
                    {city.why_start_here && (
                      <p className="text-xs text-base-content/50 mt-1 line-clamp-2">{city.why_start_here}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {city.traveler_type_fit && (
                    <span className="px-2 py-0.5 rounded bg-brand-vibrant/10 text-brand-vibrant text-xs font-bold">
                      {city.traveler_type_fit}
                    </span>
                  )}
                  {city.budget_signal && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                      {BUDGET_SIGNAL[city.budget_signal] || city.budget_signal}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-3 text-xs text-brand-vibrant font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  View details <ChevronRight size={12} />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}