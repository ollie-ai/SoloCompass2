/**
 * OfficialAdvisoryCard — Advisory + entry snapshot
 */

import { ShieldCheck, AlertTriangle, Calendar, FileText, ExternalLink, Syringe, CreditCard, Plane } from 'lucide-react';

const ADVISORY_STANCE = {
  normal: { label: 'Normal travel', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  exercise_caution: { label: 'Exercise caution', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  advise_against: { label: 'Advise against some travel', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  advise_against_all: { label: 'Advise against all travel', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function OfficialAdvisoryCard({ destination }) {
  const {
    advisory_stance,
    advisory_summary,
    advisory_checked_at,
    fcdo_slug,
    entry_requirements,
    visa_required,
    vaccines_required,
    legal_cautions,
    cultural_notes,
  } = destination || {};

  const advisory = advisory_stance ? ADVISORY_STANCE[advisory_stance] : null;
  const checkedDate = formatDate(advisory_checked_at);

  return (
    <section className="rounded-xl bg-base-200 border border-base-300/50 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-base-content/60 mb-1">Official Advisory</h3>
          {advisory && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold ${advisory.color}`}>
              <ShieldCheck size={14} /> {advisory.label}
            </span>
          )}
          {checkedDate && (
            <p className="text-xs text-base-content/40 mt-2 flex items-center gap-1">
              <Calendar size={10} /> Last checked: {checkedDate}
            </p>
          )}
        </div>
        {fcdo_slug && (
          <a
            href={`https://www.gov.uk/foreign-travel-advice/${fcdo_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-vibrant font-bold hover:underline flex items-center gap-1"
          >
            <ExternalLink size={10} /> Full FCDO
          </a>
        )}
      </div>

      {advisory_summary && (
        <p className="text-sm text-base-content/70 leading-relaxed">{advisory_summary}</p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-base-100/50 border border-base-300/30">
          <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 mb-1">
            <Plane size={12} /> Visa
          </div>
          <p className="text-sm font-bold text-base-content">
            {visa_required === true ? 'Required' : visa_required === false ? 'Not required' : 'Check requirements'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-base-100/50 border border-base-300/30">
          <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 mb-1">
            <Syringe size={12} /> Vaccines
          </div>
          <p className="text-sm font-bold text-base-content">
            {vaccines_required === true ? 'Recommended' : vaccines_required === false ? 'Not required' : 'Check requirements'}
          </p>
        </div>
      </div>

      {legal_cautions?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Legal + Cultural Cautions</h4>
          <ul className="space-y-1">
            {legal_cautions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-base-content/70">
                <AlertTriangle size={12} className="text-orange-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cultural_notes?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Cultural Notes</h4>
          <ul className="space-y-1">
            {cultural_notes.map((note, i) => (
              <li key={i} className="text-xs text-base-content/60">{note}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}