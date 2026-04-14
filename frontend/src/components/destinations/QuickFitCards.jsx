/**
 * QuickFitCards — 4-up cards showing quick solo travel assessment
 */

import { ChevronRight } from 'lucide-react';

function getColorClass(score) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getBgClass(score) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function getLabel(budgetFeel) {
  if (budgetFeel === 'backpacker' || budgetFeel === 'budget') return 'Budget';
  if (budgetFeel === 'midrange') return 'Mid-range';
  if (budgetFeel === 'comfort') return 'Comfort';
  if (budgetFeel === 'luxury') return 'Luxury';
  return 'Varies';
}

function getRange(budgetFeel) {
  if (budgetFeel === 'backpacker' || budgetFeel === 'budget') return '$';
  if (budgetFeel === 'midrange') return '$$';
  if (budgetFeel === 'comfort') return '$$$';
  if (budgetFeel === 'luxury') return '$$$$';
  return '$$';
}

function getDesc(score) {
  if (score >= 80) return 'Excellent for solo';
  if (score >= 60) return 'Good for solo';
  if (score >= 40) return 'Moderate challenge';
  return 'Higher challenge';
}

export default function QuickFitCards({ destination, onCardClick }) {
  const data = destination || {};
  
  const cards = [
    { key: 'solo_travel_fit', label: 'Solo Travel Fit', value: data.solo_travel_fit, section: 'overview' },
    { key: 'budget_feel', label: 'Budget Feel', value: data.budget_feel, section: 'budget' },
    { key: 'social_ease', label: 'Social Ease', value: data.social_ease, section: 'social' },
    { key: 'digital_nomad_ready', label: 'Digital Nomad', value: data.digital_nomad_ready, section: 'remote' },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const rawValue = card.value;
        const numValue = parseInt(rawValue);
        const isNumber = !isNaN(numValue);
        const isBudget = card.key === 'budget_feel';

        return (
          <button
            key={card.key}
            onClick={() => onCardClick?.(card.section)}
            className="group p-4 rounded-xl bg-base-200 border border-base-300/50 hover:border-brand-vibrant/30 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
                {card.label}
              </span>
              <ChevronRight size={14} className="text-base-content/30 group-hover:text-brand-vibrant transition-colors -rotate-90 lg:rotate-0" />
            </div>
            {isNumber ? (
              isBudget ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-base-content">{getLabel(rawValue)}</span>
                  <span className="text-sm font-bold text-base-content/50">{getRange(rawValue)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative w-11 h-11">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-base-200" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset={113 - (numValue / 100) * 113} strokeLinecap="round" className={getColorClass(numValue)} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-xs">{numValue}</span>
                  </div>
                </div>
              )
            ) : <div className="text-2xl font-black text-base-content/40">—</div>}
            <div className="mt-3 text-xs text-base-content/50">
              {isNumber ? getDesc(numValue) : 'Tap to see details'}
            </div>
          </button>
        );
      })}
    </section>
  );
}