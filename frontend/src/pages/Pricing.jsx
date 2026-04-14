import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { trackEvent } from '../lib/telemetry';
import { useEffect, useState } from 'react';
import { Check, ArrowRight, Shield, Sparkles, Users, Calendar, MessageSquare, Bell, Globe, HelpCircle, Compass, ChevronDown, Lock } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

const plans = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: { monthly: 0, annual: 0 },
    tagline: 'Try SoloCompass and build your first plan.',
    badge: null,
    popular: false,
    features: [
      { text: 'Travel DNA quiz profile', included: true, category: 'Planning' },
      { text: 'Create trips (up to 2 active)', included: true, category: 'Planning' },
      { text: '1 AI itinerary per month', included: true, category: 'AI' },
      { text: 'Edit itinerary activities', included: true, category: 'Planning' },
      { text: 'Manual safety check-ins + SOS', included: true, category: 'Safety' },
      { text: 'Official advisories (FCDO)', included: true, category: 'Safety' },
      { text: 'Scheduled check-ins + missed alerts', included: false, category: 'Safety' },
      { text: 'Safe-Return Timer', included: false, category: 'Safety' },
      { text: 'AI destination chat', included: false, category: 'AI' },
      { text: 'Travel Buddy matching', included: false, category: 'Community' },
    ]
  },
  {
    id: 'guardian',
    name: 'Guardian',
    price: { monthly: 4.99, annual: 3.99 },
    tagline: 'For repeat planners who want the safety layer.',
    badge: 'Most Popular',
    popular: true,
    features: [
      { text: 'Travel DNA quiz profile', included: true, category: 'Planning' },
      { text: 'Create trips (unlimited)', included: true, category: 'Planning' },
      { text: 'Unlimited AI itineraries (fair use)', included: true, category: 'AI' },
      { text: 'Edit itinerary activities', included: true, category: 'Planning' },
      { text: 'Manual safety check-ins + SOS', included: true, category: 'Safety' },
      { text: 'Scheduled check-ins + missed alerts', included: true, category: 'Safety' },
      { text: 'Safe-Return Timer', included: true, category: 'Safety' },
      { text: 'Safe haven locator', included: true, category: 'Safety' },
      { text: 'Official advisories (FCDO)', included: true, category: 'Safety' },
      { text: 'AI destination chat', included: false, category: 'AI' },
      { text: 'Travel Buddy matching', included: false, category: 'Community' },
    ]
  },
  {
    id: 'navigator',
    name: 'Navigator',
    price: { monthly: 9.99, annual: 7.99 },
    tagline: 'For power users and deeper AI guidance.',
    badge: 'Founding Price',
    popular: false,
    features: [
      { text: 'Travel DNA quiz profile', included: true, category: 'Planning' },
      { text: 'Create trips (unlimited)', included: true, category: 'Planning' },
      { text: 'Unlimited AI itineraries (fair use)', included: true, category: 'AI' },
      { text: 'Edit itinerary activities', included: true, category: 'Planning' },
      { text: 'Manual safety check-ins + SOS', included: true, category: 'Safety' },
      { text: 'Scheduled check-ins + missed alerts', included: true, category: 'Safety' },
      { text: 'Safe-Return Timer', included: true, category: 'Safety' },
      { text: 'Safe haven locator', included: true, category: 'Safety' },
      { text: 'Official advisories (FCDO)', included: true, category: 'Safety' },
      { text: 'AI destination chat + guide', included: true, category: 'AI' },
      { text: 'AI safety advice', included: true, category: 'AI' },
      { text: 'Travel Buddy matching', included: true, category: 'Community' },
    ]
  }
];

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription from Settings > Billing & Data. Your premium features continue until the end of your billing period.' },
  { q: 'Can I switch plans?', a: 'Yes. Upgrade or downgrade at any time. Changes take effect at your next billing cycle.' },
  { q: 'What happens to my data if I leave?', a: 'You can export your data before cancelling. After account deletion, all data is permanently removed within 30 days.' },
  { q: 'Is the free tier really free?', a: 'Yes. Explorer includes trip planning, 1 AI itinerary per month, and basic safety features — no credit card required.' },
  { q: 'Do you offer refunds?', a: 'Refunds are available within 7 days of purchase. Contact support@solocompass.co.uk with your order details.' },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    trackEvent('page_view', { page: 'pricing' });
  }, []);

  const handleCTAClick = (plan) => {
    trackEvent('pricing_cta_click', { plan });
  };

  return (
    <>
      <SEO 
        title="Pricing - SoloCompass" 
        description="Choose the SoloCompass plan that fits how you travel. Start free with Explorer, or upgrade to Guardian or Navigator for unlimited AI and advanced safety."
      />
      
      <div className="min-h-screen bg-mesh pt-20">
        {/* Hero */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 bg-brand-vibrant/10 text-brand-vibrant text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-brand-vibrant/20"
            >
              Precision Navigation
            </motion.span>
            <h1 className="text-4xl lg:text-6xl font-[800] text-base-content mb-6 leading-[1.1] tracking-tight font-outfit">
              Choose the plan that fits
              <span className="text-gradient block mt-2">how you travel.</span>
            </h1>
            <p className="text-xl text-base-content/60 max-w-2xl mx-auto font-medium">
              Start free. Upgrade for unlimited AI and mission-critical safety tools.
            </p>
          </div>
        </section>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-6 mb-16 relative z-10">
          <span className={`text-sm font-black uppercase tracking-widest ${!isAnnual ? 'text-base-content' : 'text-base-content/40'}`}>Monthly</span>
          <Switch.Root
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="w-14 h-8 bg-base-300 rounded-full relative data-[state=checked]:bg-brand-vibrant transition-all cursor-pointer shadow-inner"
          >
            <Switch.Thumb className="block w-6 h-6 bg-base-100 rounded-full shadow-lg transition-transform translate-x-1 will-change-transform data-[state=checked]:translate-x-[30px]" />
          </Switch.Root>
          <div className="flex flex-col">
            <span className={`text-sm font-black uppercase tracking-widest ${isAnnual ? 'text-base-content' : 'text-base-content/40'}`}>
              Annual
            </span>
            <span className="text-[10px] text-emerald-500 font-bold bg-success/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20">Save 20%</span>
          </div>
        </div>

        {/* Plan Cards */}
        <section className="pb-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative flex flex-col ${
                    plan.popular ? 'z-20' : 'z-10'
                  }`}
                >
                  <div className={`flex-1 glass-card p-0 flex flex-col h-full ${
                    plan.popular ? 'border-brand-vibrant/40 ring-4 ring-brand-vibrant/5 scale-105 md:scale-110 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.15)] bg-base-100/95' : 'bg-base-100/80'
                  }`}>
                    {plan.badge && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] z-30 shadow-sm ${
                        plan.popular ? 'bg-gradient-to-r from-brand-vibrant to-emerald-500 text-white' : 'bg-base-200 text-base-content/60'
                      }`}>
                        {plan.badge}
                      </div>
                    )}

                    <div className="p-8 pb-4">
                      <div className="flex items-center gap-3 mb-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          plan.id === 'navigator' ? 'bg-indigo-500/10 text-indigo-500' :
                          plan.id === 'guardian' ? 'bg-brand-vibrant/10 text-brand-vibrant' :
                          'bg-slate-500/10 text-base-content/60'
                        }`}>
                          {plan.id === 'navigator' ? <Sparkles size={18} /> : 
                           plan.id === 'guardian' ? <Shield size={18} /> : 
                           <Compass size={18} />}
                        </div>
                        <h3 className="text-2xl font-black text-base-content font-outfit uppercase tracking-wider">{plan.name}</h3>
                      </div>
                      <p className="text-sm text-base-content/60 font-medium h-10 mb-8 leading-relaxed">{plan.tagline}</p>
                      
                      <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-[900] text-base-content font-outfit">£{isAnnual ? plan.price.annual : plan.price.monthly}</span>
                          <span className="text-base-content/40 font-bold uppercase text-sm tracking-widest">/mo</span>
                        </div>
                        {isAnnual && plan.price.annual > 0 && (
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2">Billed £{(plan.price.annual * 12).toFixed(2)} annually</p>
                        )}
                      </div>

                      <Link
                        to={plan.price.monthly === 0 ? '/register' : `/register?plan=${plan.id}`}
                        onClick={() => handleCTAClick(plan.id)}
                        className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                          plan.price.monthly === 0
                            ? 'bg-base-200 text-base-content/80 hover:bg-base-300 border-2 border-transparent'
                            : 'bg-brand-deep text-white hover:bg-black shadow-xl shadow-brand-deep/20 border-2 border-brand-deep'
                        }`}
                      >
                        {plan.price.monthly === 0 ? 'Start Free' : `Join ${plan.name}`}
                        {plan.price.monthly > 0 && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                      </Link>
                    </div>

                    <div className="p-8 pt-4">
                      <p className="text-[10px] font-black uppercase text-base-content/40 tracking-[0.2em] mb-6">Key Capabilities</p>
                      <ul className="space-y-4">
                        {plan.features.map((feature, i) => (
                          <li key={`feature-${i}`} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-base-content/80' : 'text-base-content/30'}`}>
                            {feature.included ? (
                              <div className="w-5 h-5 bg-brand-vibrant/10 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                                <Check size={12} className="text-brand-vibrant stroke-[4px]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 bg-base-200 rounded-full flex items-center justify-center mt-0.5 shrink-0 opacity-50">
                                <span className="text-[8px] font-black text-base-content/40">—</span>
                              </div>
                            )}
                            <span className="font-medium">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 bg-base-100/40">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-black text-base-content font-outfit mb-4 uppercase tracking-wider">Deep Feature Index</h2>
                <p className="text-base-content/60 font-medium">Verify every tool available in your journey.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-base-300">
                      <th className="py-4 text-xs font-black uppercase tracking-[0.2em] text-base-content/40">Feature</th>
                      <th className="py-4 text-xs font-black uppercase tracking-[0.2em] text-base-content/40 px-4">Explorer</th>
                      <th className="py-4 text-xs font-black uppercase tracking-[0.2em] text-brand-vibrant px-4">Guardian</th>
                      <th className="py-4 text-xs font-black uppercase tracking-[0.2em] text-indigo-500 px-4">Navigator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'Active Trips', ex: '2', gu: 'Unlimited', na: 'Unlimited' },
                      { name: 'AI Itineraries /mo', ex: '1', gu: 'Unlimited*', na: 'Unlimited*' },
                      { name: 'Safety Center App', ex: '✅', gu: '✅', na: '✅' },
                      { name: 'SOS Emergency Slider', ex: '✅', gu: '✅', na: '✅' },
                      { name: 'Scheduled Check-ins', ex: 'Manual', gu: 'Automated', na: 'Automated' },
                      { name: 'Safe-Return Timer', ex: '—', gu: '✅', na: '✅' },
                      { name: 'AI Destination Chat', ex: '—', gu: '—', na: '✅' },
                      { name: 'Travel Buddy Matching', ex: '—', gu: '—', na: '✅' },
                      { name: 'Flight Status Tracking', ex: '—', gu: '✅', na: '✅' },
                      { name: 'Data Portability', ex: '✅', gu: '✅', na: '✅' },
                    ].map((row, i) => (
                      <tr key={`comparison-row-${i}`} className="hover:bg-base-200/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-base-content/80">{row.name}</td>
                        <td className="py-4 text-xs font-medium text-base-content/60 px-4">{row.ex}</td>
                        <td className="py-4 text-xs font-black text-brand-vibrant px-4">{row.gu}</td>
                        <td className="py-4 text-xs font-black text-indigo-500 px-4">{row.na}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-8 text-[10px] text-base-content/40 font-medium text-center uppercase tracking-widest">*Fair usage policy applies to high-token AI requests.</p>
           </div>
        </section>

        {/* Questions */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-vibrant/5 -z-10" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl lg:text-3xl font-[900] font-outfit text-base-content tracking-tight">Got questions? We've got answers.</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={`faq-${i}`} className="group bg-base-100 rounded-2xl border border-base-300/60 shadow-sm transition-all hover:border-brand-vibrant/20">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-base-content list-none outline-none">
                    <span className="flex items-center gap-3">
                      <HelpCircle size={18} className="text-brand-vibrant" />
                      {faq.q}
                    </span>
                    <ChevronDown size={18} className="text-base-content/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-sm text-base-content/60 font-medium leading-relaxed border-t border-base-300/50 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative z-10 overflow-hidden">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-brand-deep rounded-3xl p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-vibrant/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/10 blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <h2 className="text-3xl lg:text-5xl font-[900] text-white font-outfit mb-6 tracking-tight relative z-10">
              Ready to plan your next <br className="hidden sm:block" />
              <span className="text-gradient">solo adventure</span>?
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-lg mx-auto relative z-10">
              Join 15,000+ solo travellers planning safer, smarter trips every day.
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="btn-brand text-lg px-8 py-4"
              >
                Secure Your Spot
              </Link>
              <Link
                to="/features"
                className="btn-brand-white text-lg px-8 py-4"
              >
                Explore Features
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
               <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest">
                 <Shield size={14} /> Encrypted
               </div>
               <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest">
                 <Lock size={14} /> Secure Payment
               </div>
               <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest">
                 <Calendar size={14} /> Cancel Anytime
               </div>
            </div>
           </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
