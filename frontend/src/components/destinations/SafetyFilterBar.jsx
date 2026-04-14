/**
 * SafetyFilterBar — trust-aware filters for the destination explore page.
 * Allows filtering by: destination level, advisory stance, travel style, budget.
 */

import { Globe, MapPin, ShieldCheck, Search, X } from 'lucide-react';

const LEVEL_OPTIONS = [
  { value: 'all', label: 'All destinations' },
  { value: 'country', label: 'Countries', icon: Globe },
  { value: 'city', label: 'Cities', icon: MapPin },
];

const ADVISORY_OPTIONS = [
  { value: 'all', label: 'All advisories' },
  { value: 'normal', label: 'Normal travel', color: 'text-emerald-600' },
  { value: 'exercise_caution', label: 'Exercise caution', color: 'text-yellow-600' },
];

const BUDGET_OPTIONS = [
  { value: 'all', label: 'Any budget' },
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'luxury', label: 'Luxury' },
];

export default function SafetyFilterBar({ filters, onChange }) {
  const { search = '', level = 'all', advisory = 'all', budget = 'all' } = filters;

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const hasActiveFilters = level !== 'all' || advisory !== 'all' || budget !== 'all' || search;

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input
          type="text"
          placeholder="Search destinations…"
          value={search}
          onChange={(e) => update('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-base-200 border border-base-300/50 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-brand-vibrant/40 focus:bg-base-100 transition-all font-medium"
          aria-label="Search destinations"
        />
        {search && (
          <button
            onClick={() => update('search', '')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Level toggle */}
        <div className="flex gap-1 p-1 bg-base-200 rounded-xl border border-base-300/50">
          {LEVEL_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => update('level', value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                level === value
                  ? 'bg-brand-vibrant text-white shadow-sm'
                  : 'text-base-content/60 hover:text-base-content hover:bg-base-100'
              }`}
              aria-pressed={level === value}
            >
              {Icon && <Icon size={12} />}
              {label}
            </button>
          ))}
        </div>

        {/* Advisory filter */}
        <select
          value={advisory}
          onChange={(e) => update('advisory', e.target.value)}
          className="px-3 py-2 rounded-xl bg-base-200 border border-base-300/50 text-xs font-bold text-base-content/70 focus:outline-none focus:border-brand-vibrant/40 transition-all"
          aria-label="Filter by advisory"
        >
          {ADVISORY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Budget filter */}
        <select
          value={budget}
          onChange={(e) => update('budget', e.target.value)}
          className="px-3 py-2 rounded-xl bg-base-200 border border-base-300/50 text-xs font-bold text-base-content/70 focus:outline-none focus:border-brand-vibrant/40 transition-all"
          aria-label="Filter by budget"
        >
          {BUDGET_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ search: '', level: 'all', advisory: 'all', budget: 'all' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-base-content/50 hover:text-base-content hover:bg-base-200 transition-all"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
