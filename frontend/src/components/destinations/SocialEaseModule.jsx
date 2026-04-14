/**
 * SocialEaseModule — Social ease + Solo-Vibe tags
 */

import { Users, TreePine, Waves, Mountain, Sparkles, Wifi, Coffee, PartyPopper } from 'lucide-react';

const SOLO_VIBE_TAGS = [
  { id: 'calm', label: 'Calm', icon: TreePine },
  { id: 'social', label: 'Social', icon: PartyPopper },
  { id: 'nature', label: 'Nature', icon: Mountain },
  { id: 'culture', label: 'Culture', icon: Sparkles },
  { id: 'budget', label: 'Budget', icon: Coffee },
  { id: 'digital-nomad', label: 'Digital Nomad', icon: Wifi },
  { id: 'easy-first-solo', label: 'Easy First Solo', icon: Users },
];

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

export default function SocialEaseModule({ destination }) {
  const {
    social_ease_summary,
    solo_vibe_tags,
    meetup_density,
    hostel_culture,
    traveler_personas,
  } = destination || {};

  const vibeTags = parseTags(solo_vibe_tags);
  const parsedPersonas = parseTags(traveler_personas);

  return (
    <section className="rounded-xl bg-base-200 border border-base-300/50 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/60 mb-2">Social Ease</h3>
        {social_ease_summary ? (
          <p className="text-sm text-base-content/70 leading-relaxed">{social_ease_summary}</p>
        ) : (
          <p className="text-sm text-base-content/50">No social ease data available.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold text-base-content/40">Solo-Vibe:</span>
        {SOLO_VIBE_TAGS.filter(tag => vibeTags.includes(tag.id)).map(tag => {
          const TagIcon = tag.icon;
          return (
            <span
              key={tag.id}
              className="px-2.5 py-1 rounded-lg bg-brand-vibrant/10 text-brand-vibrant text-xs font-bold border border-brand-vibrant/20 flex items-center gap-1"
            >
              <TagIcon size={12} /> {tag.label}
            </span>
          );
        })}
        {vibeTags.filter(tag => !SOLO_VIBE_TAGS.find(t => t.id === tag)).map(tag => (
          <span key={tag} className="px-2.5 py-1 rounded-lg bg-brand-vibrant/10 text-brand-vibrant text-xs font-bold border border-brand-vibrant/20">
            {tag.replace(/-/g, ' ')}
          </span>
        ))}
        {!vibeTags.length && <span className="text-xs text-base-content/40">—</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-base-100/50 border border-base-300/30">
          <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 mb-1">
            <Users size={12} /> Meetup Density
          </div>
          <p className="text-sm font-bold text-base-content">
            {meetup_density === 'high' ? 'Very active' : meetup_density === 'medium' ? 'Active' : meetup_density === 'low' ? 'Limited' : '—'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-base-100/50 border border-base-300/30">
          <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 mb-1">
            <Sparkles size={12} /> Hostel Culture
          </div>
          <p className="text-sm font-bold text-base-content">
            {hostel_culture === 'strong' ? 'Strong' : hostel_culture === 'moderate' ? 'Moderate' : hostel_culture === 'weak' ? 'Limited' : '—'}
          </p>
        </div>
      </div>

      {parsedPersonas.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Traveler Personas</h4>
          <div className="flex flex-wrap gap-2">
            {parsedPersonas.map((persona, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-base-100 text-base-content/60 text-xs font-bold border border-base-300/30">
                {persona}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}