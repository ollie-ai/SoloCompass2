import { memo } from 'react';
import PropTypes from 'prop-types';
import { Shield, Users, Lock, Compass, Calendar, Bell, Globe, Briefcase, MessageCircle, Wifi } from 'lucide-react';

const capabilityChips = [
  { icon: Shield, label: 'Clear escalation logic', type: 'trust' },
  { icon: Users, label: 'You control emergency contacts', type: 'trust' },
  { icon: Wifi, label: 'Works offline', type: 'trust' },
  { icon: Lock, label: 'Privacy-first controls', type: 'trust' },
  { icon: Compass, label: 'Travel DNA quiz', type: 'capability' },
  { icon: Calendar, label: 'Day-by-day timeline', type: 'capability' },
  { icon: Bell, label: 'Manual check-ins + SOS', type: 'capability' },
  { icon: Globe, label: 'Official travel advisories', type: 'capability' },
  { icon: Briefcase, label: 'Trip tools bundle', type: 'capability' },
  { icon: MessageCircle, label: 'AI chat assistant', type: 'capability' },
];

const CapabilityChips = () => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Chips are display-only, but this makes them keyboard accessible
    }
  };

  return (
    <section className="py-10 bg-base-200 border-y border-base-300/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {capabilityChips.map((chip, index) => {
              const Icon = chip.icon;
              return (
                <div
                  key={index}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    chip.type === 'trust'
                      ? 'bg-base-200 text-base-content/80 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                      : 'bg-success/10 text-success border border-success/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  }`}
                  tabIndex={0}
                  role="button"
                  onKeyDown={handleKeyDown}
                >
                  <Icon size={14} className={chip.type === 'capability' ? 'text-success' : ''} />
                  {chip.label}
                </div>
              );
            })}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-base-100 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

CapabilityChips.propTypes = {};

export default memo(CapabilityChips);
