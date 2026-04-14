import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Compass, Shield, Briefcase, Check, ArrowRight, Sparkles, MapPin, Calendar, Clock, FileText, DollarSign, Cloud, Plane, Search, Plus, Trash2, Edit } from 'lucide-react';

const features = {
  adventureDNA: {
    icon: Compass,
    title: 'A plan that matches your style',
    description: "Your quiz profile shapes pace, activity mix, and vibe — so your itinerary feels like you.",
    bullets: [
      'Personalized destination recommendations',
      'Itinerary generation with progress feedback',
      'Edit anything: add, remove, and rearrange activities'
    ]
  },
  safety: {
    icon: Shield,
    title: 'Safety tools designed for solo travel',
    description: "Safety isn't an add-on — it's built into the workflow. Use as much (or as little) as you want.",
    bullets: [
      'Scheduled check-ins (with missed check-in monitoring)',
      'Emergency contacts (email + SMS alerts)',
      'SOS button available across the dashboard',
      'Safe haven locator (police, hospitals, embassies)',
      'Safe-Return Timer',
      'Advisories surfaced in context (FCDO)'
    ],
    footnote: 'Alert delivery via Twilio SMS and Resend Email'
  },
  tools: {
    icon: Briefcase,
    title: 'Everything in one trip pack',
    description: 'Reduce travel stress with built-in tools that work together.',
    bullets: [
      'Packing list (templates + progress)',
      'Budget tracker (multi-currency)',
      'Currency converter',
      'Weather widget',
      'Places search',
      'Flight status',
      'PDF export'
    ]
  }
};

const FeatureGrid = () => {
  return (
    <section className="py-20 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {Object.entries(features).map(([key, feature], index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-base-200 rounded-2xl p-8 border border-base-300/50 h-full flex flex-col"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Icon size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-base-content mb-3">
                  {feature.title}
                </h3>
                <p className="text-base-content/80 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, idx) => (
                    <li key={`bullet-${bullet.substring(0, 20)}`} className="flex items-start gap-3 text-sm text-base-content/80">
                      <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                {feature.footnote && (
                  <p className="text-xs text-base-content/40 mt-auto pt-4 border-t border-base-300/50">
                    {feature.footnote}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-200 rounded-full text-sm text-base-content/80">
            <Sparkles size={14} className="text-primary" />
            <span className="font-medium">Roadmap (Early Access):</span>
            <span className="text-base-content/60">Exploring: wearable check-ins, local emergency numbers, offline packs</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

FeatureGrid.propTypes = {};

export default memo(FeatureGrid);
