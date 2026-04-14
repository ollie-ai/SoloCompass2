import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Shield, Compass, ArrowRight } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

const plans = {
  explorer: {
    name: 'Explorer',
    price: { monthly: 0, annual: 0 },
    tagline: 'Try SoloCompass and build your first plan.',
    badge: null,
    features: [
      { text: 'Travel DNA quiz profile', included: true },
      { text: 'Create trips + itinerary timeline (up to 2 active trips)', included: true },
      { text: '1 AI itinerary per month', included: true },
      { text: 'Edit itinerary activities', included: true },
      { text: 'Packing list + budget tools', included: true },
      { text: 'Manual safety check-ins + SOS', included: true },
      { text: 'Scheduled check-ins + missed alerts', included: false },
      { text: 'Safe-Return Timer', included: false },
      { text: 'Safe haven locator', included: false },
      { text: 'Official advisories (FCDO)', included: true },
      { text: 'AI destination chat', included: false },
      { text: 'AI safety advice', included: false },
    ]
  },
  guardian: {
    name: 'Guardian',
    price: { monthly: 4.99, annual: 3.99 },
    tagline: 'For repeat planners who want the safety layer.',
    badge: 'Most Popular',
    popular: true,
    features: [
      { text: 'Travel DNA quiz profile', included: true },
      { text: 'Create trips + itinerary timeline (unlimited)', included: true },
      { text: 'Unlimited AI itineraries (fair use)', included: true },
      { text: 'Edit itinerary activities', included: true },
      { text: 'Packing list + budget tools', included: true },
      { text: 'Manual safety check-ins + SOS', included: true },
      { text: 'Scheduled check-ins + missed alerts', included: true },
      { text: 'Safe-Return Timer', included: true },
      { text: 'Safe haven locator', included: true },
      { text: 'Official advisories (FCDO)', included: true },
      { text: 'AI destination chat', included: false },
      { text: 'AI safety advice', included: false },
    ]
  },
  navigator: {
    name: 'Navigator',
    price: { monthly: 9.99, annual: 7.99 },
    tagline: 'For power users and deeper AI guidance.',
    badge: 'Founding Price',
    features: [
      { text: 'Travel DNA quiz profile', included: true },
      { text: 'Create trips + itinerary timeline (unlimited)', included: true },
      { text: 'Unlimited AI itineraries (fair use)', included: true },
      { text: 'Edit itinerary activities', included: true },
      { text: 'Packing list + budget tools', included: true },
      { text: 'Manual safety check-ins + SOS', included: true },
      { text: 'Scheduled check-ins + missed alerts', included: true },
      { text: 'Safe-Return Timer', included: true },
      { text: 'Safe haven locator', included: true },
      { text: 'Official advisories (FCDO)', included: true },
      { text: 'AI destination chat + guide', included: true },
      { text: 'AI safety advice', included: true },
    ]
  }
};

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-20 bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-base-content mb-4">
            Choose the plan that fits how often you travel
          </h2>
          <p className="text-lg text-base-content/80">
            Start free, upgrade when you're ready.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-base-content' : 'text-base-content/60'}`}>Monthly</span>
          <Switch.Root
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="w-11 h-6 bg-base-300 rounded-full relative data-[state=checked]:bg-primary transition-colors cursor-pointer"
          >
            <Switch.Thumb className="block w-5 h-5 bg-base-100 rounded-full shadow-md transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
          <span className={`text-sm font-medium ${isAnnual ? 'text-base-content' : 'text-base-content/60'}`}>
            Annual
            <span className="ml-2 text-xs text-primary font-bold">Save 20%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Object.entries(plans).map(([key, plan], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-base-100 rounded-2xl border-2 ${
                plan.popular ? 'border-primary shadow-xl scale-105 z-10' : 'border-base-300 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  plan.popular ? 'bg-primary text-white' : 'bg-base-200 text-base-content/80'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-base-content mb-2">{plan.name}</h3>
                <p className="text-sm text-base-content/60 mb-4">{plan.tagline}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-black text-base-content">
                    £{isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-base-content/60 font-medium">/mo</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('faq')}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    plan.price.monthly === 0
                      ? 'bg-base-200 text-base-content/80 hover:bg-base-300'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                  }`}
                >
                  {plan.price.monthly === 0 ? 'Start Free' : `Get ${plan.name}`}
                  {plan.price.monthly > 0 && <ArrowRight size={16} />}
                </motion.button>
              </div>

              <div className="px-6 pb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={`feature-${feature.text.substring(0, 25)}`} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <Check size={16} className="text-primary flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-base-content/30 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-base-content/80' : 'text-base-content/40'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10 space-y-2">
          <p className="text-sm text-base-content/60">Cancel anytime • Secure checkout via Stripe</p>
          <p className="text-sm text-base-content/60">Export or delete your data anytime</p>
          <p className="text-xs text-base-content/40 mt-2">Founding Explorer status: priority feedback & roadmap input</p>
        </div>
      </div>
    </section>
  );
};

PricingSection.propTypes = {};

export default memo(PricingSection);
