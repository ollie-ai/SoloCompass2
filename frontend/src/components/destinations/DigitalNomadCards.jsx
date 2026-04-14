/**
 * DigitalNomadCards — 3-up cards for digital nomad readiness
 */

import { Wifi, Globe, MapPin, Coffee, Clock, CreditCard, Battery, Signal } from 'lucide-react';

function ScoreBar({ score, label }) {
  const percentage = typeof score === 'number' ? score : parseInt(score) || 0;
  const color = percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-yellow-500' : percentage >= 40 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-base-content/50 font-bold">{label}</span>
        <span className="font-black text-base-content">{percentage}</span>
      </div>
      <div className="h-2 rounded-full bg-base-300 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function DigitalNomadCards({ destination }) {
  const {
    wifi_score,
    workability,
    visa_stay,
    coworking_culture,
    cafe_culture,
    timezone,
    card_convenience,
  } = destination || {};

  const cards = [
    {
      key: 'wifi',
      title: 'WiFi & Workability',
      icon: Wifi,
      score: wifi_score,
      details: Array.isArray(workability) ? workability : [],
      metrics: [
        { label: 'WiFi Speed', score: wifi_score },
        { label: 'Power', score: workability?.power_sockets != null ? workability.power_sockets : 70 },
        { label: 'Reliability', score: workability?.reliability != null ? workability.reliability : 70 },
      ],
    },
    {
      key: 'visa',
      title: 'Visa & Stay',
      icon: Globe,
      score: visa_stay?.score,
      details: [
        visa_stay?.length ? `Up to ${visa_stay.length} days` : null,
        visa_stay?.visa_on_arrival ? 'Visa on arrival' : null,
        visa_stay?.remote_visa ? 'Remote work visa' : null,
      ].filter(Boolean),
      metrics: [
        { label: 'Visa Ease', score: visa_stay?.score || 50 },
        { label: 'Stay Length', score: visa_stay?.length_score || 50 },
      ],
    },
    {
      key: 'cowork',
      title: 'Coworking & Cafe',
      icon: Coffee,
      score: coworking_culture?.score,
      details: [
        coworking_culture?.coworking_spaces ? `${coworking_culture.coworking_spaces} coworking spaces` : null,
        cafe_culture?.cafe_wifi ? 'Cafes with WiFi' : null,
      ].filter(Boolean),
      metrics: [
        { label: 'Coworking', score: coworking_culture?.score || 50 },
        { label: 'Cafe WiFi', score: cafe_culture?.score || 50 },
      ],
    },
    {
      key: 'timezone',
      title: 'Timezone & Finance',
      icon: Clock,
      score: card_convenience,
      details: [
        timezone ? `UTC${timezone >= 0 ? '+' : ''}${timezone}` : 'UTC time',
        card_convenience === true ? 'Cards widely accepted' : 'Cash preferred',
      ].filter(Boolean),
      metrics: [
        { label: 'Timezone', score: timezone != null ? 80 : 50 },
        { label: 'Card Ease', score: card_convenience === true ? 90 : card_convenience === false ? 40 : 50 },
      ],
    },
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-black text-base-content">Digital Nomad Readiness</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => {
          const CardIcon = card.icon;
          
          return (
            <div key={card.key} className="p-4 rounded-xl bg-base-200 border border-base-300/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-brand-vibrant/10">
                  <CardIcon size={18} className="text-brand-vibrant" />
                </div>
                <span className="font-bold text-base-content">{card.title}</span>
              </div>

              <div className="space-y-2">
                {card.metrics.map((metric) => (
                  <ScoreBar key={metric.label} score={metric.score} label={metric.label} />
                ))}
              </div>

              {card.details.length > 0 && (
                <div className="mt-3 pt-3 border-t border-base-300/30">
                  <ul className="space-y-1">
                    {card.details.map((detail, i) => (
                      <li key={i} className="text-xs text-base-content/60">{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}