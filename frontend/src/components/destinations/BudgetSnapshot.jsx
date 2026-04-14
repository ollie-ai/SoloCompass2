/**
 * BudgetSnapshot — Budget ranges + currency
 */

import { Link } from 'react-router-dom';
import { Wallet, Bus, CreditCard, Smartphone, ChevronRight, Globe, Info } from 'lucide-react';

function parseBudgetRange(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

export default function BudgetSnapshot({ destination, onCurrencyConvert }) {
  const {
    daily_budget_min,
    daily_budget_max,
    budget_currency,
    transport_ease,
    card_accepted,
    cash_preferred,
    sim_notes,
    esim_available,
    quick_facts,
  } = destination || {};

  const budgetRange = parseBudgetRange(daily_budget_min && daily_budget_max ? [daily_budget_min, daily_budget_max] : null);

  return (
    <section className="rounded-xl bg-base-200 border border-base-300/50 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/60 mb-3">Budget Snapshot</h3>
        
        {budgetRange ? (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-base-content">
              ${budgetRange[0]}
            </span>
            <span className="text-base-content/40">–</span>
            <span className="text-3xl font-black text-base-content">
              ${budgetRange[1]}
            </span>
            <span className="text-sm text-base-content/50 font-bold">/day</span>
          </div>
        ) : (
          <p className="text-sm text-base-content/50">Budget data not available.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-base-100/50 border border-base-300/30">
          <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 mb-1">
            <Bus size={12} /> Transport
          </div>
          <p className="text-sm font-bold text-base-content">
            {transport_ease === 'easy' ? 'Easy' : transport_ease === 'moderate' ? 'Moderate' : 'Challenging'}
          </p>
        </div>
        
        <div className="p-3 rounded-lg bg-base-100/50 border border-base-300/30">
          <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 mb-1">
            <CreditCard size={12} /> Cards
          </div>
          <p className="text-sm font-bold text-base-content">
            {card_accepted === true ? 'Widely accepted' : card_accepted === false ? 'Cash preferred' : 'Mostly cash'}
          </p>
        </div>
      </div>

      {cash_preferred && (
        <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          <p className="text-xs text-yellow-700 font-bold">Cash is king — carry some local currency</p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-base-content/50">
          <Smartphone size={12} /> SIM / eSIM
        </div>
        {esim_available ? (
          <p className="text-sm text-base-content">eSIM available at airports and convenience stores</p>
        ) : (
          <p className="text-sm text-base-content">Local SIM card recommended</p>
        )}
        {sim_notes && <p className="text-xs text-base-content/50">{sim_notes}</p>}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-base-300/30">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-base-content/40" />
          <span className="text-sm font-bold text-base-content">{budget_currency || 'USD'}</span>
        </div>
        <Link
          to="/tools/currency"
          className="text-xs text-brand-vibrant font-bold hover:underline flex items-center gap-1"
        >
          Currency converter <ChevronRight size={10} />
        </Link>
      </div>

      {quick_facts && (
        <div className="p-3 rounded-lg bg-base-100/30 border border-base-300/30 space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-base-content/50 mb-1">
            <Info size={12} /> Quick facts
          </div>
          {Array.isArray(quick_facts) ? (
            quick_facts.map((fact, i) => (
              <p key={i} className="text-xs text-base-content/60">{fact}</p>
            ))
          ) : (
            <p className="text-xs text-base-content/60">{quick_facts}</p>
          )}
        </div>
      )}
    </section>
  );
}