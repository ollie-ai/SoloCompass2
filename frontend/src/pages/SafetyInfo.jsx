import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { trackEvent } from '../lib/telemetry';
import { useEffect } from 'react';
import { 
  Shield, ShieldCheck, AlertTriangle, Phone, MapPin, 
  Bell, FileText, ArrowRight, CheckCircle2,
  Globe, Clock, Lock, MessageSquare, User, AlertOctagon, Navigation
} from 'lucide-react';

const safetyTools = [
  {
    icon: Clock,
    title: 'Scheduled Check-ins',
    description: 'Set regular check-in intervals. If you miss one, SoloCompass escalates in steps — reminder, grace period, then alerts to your contacts.',
  },
  {
    icon: User,
    title: 'Emergency Contacts',
    description: 'Choose who gets notified if something goes wrong. You decide who, when, and what information they receive.',
  },
  {
    icon: Bell,
    title: 'Travel Advisories',
    description: 'Real-time FCDO advisories matched to your destinations, with severity ratings so you can assess risk at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe Return Timer',
    description: 'Set a timer for late-night returns. If you don\'t confirm safety by the deadline, your contacts are notified.',
  },
  {
    icon: AlertOctagon,
    title: 'SOS',
    description: 'One-tap emergency alert that shares your location with your emergency contacts immediately.',
  },
  {
    icon: Navigation,
    title: 'Safe Haven Locator',
    description: 'Find nearby safe locations — embassies, hospitals, police stations — even offline.',
  },
];

const escalationSteps = [
  { step: 1, title: 'Check-in due', desc: 'You receive a reminder before your scheduled check-in time.' },
  { step: 2, title: 'Grace period', desc: 'If you miss the check-in, you have a grace period to confirm you\'re safe.' },
  { step: 3, title: 'Contact alert', desc: 'If you don\'t respond, your chosen emergency contacts are notified with your last known location.' },
];

const SafetyInfo = () => {
  useEffect(() => {
    trackEvent('page_view', { page: 'safety_info' });
  }, []);

  const handleCTAClick = (cta) => {
    trackEvent('cta_click', { location: cta, page: 'safety_info' });
  };

  return (
    <>
      <SEO 
        title="Safety - SoloCompass" 
        description="Learn how SoloCompass helps solo travellers stay safe with check-ins, emergency contacts, and real-time advisories."
      />
      
      <div className="min-h-screen bg-mesh pt-20">
        {/* Hero */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block px-4 py-1.5 bg-success/20/50 text-success text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-success/30">
                Security & Trust
              </span>
              <h1 className="text-4xl lg:text-7xl font-black text-base-content mb-6 leading-[1.1] tracking-tight font-outfit">
                Travel with more
                <span className="text-gradient block mt-2">confidence.</span>
              </h1>
              <p className="text-xl text-base-content/60 mb-10 leading-relaxed font-medium font-inter">
                SoloCompass gives you practical, high-trust safety tools — check-ins, emergency escalation, and real-time advisories — so you can plan and travel with total clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  onClick={() => handleCTAClick('hero_safety')}
                  className="btn-brand btn-lg rounded-xl font-bold px-8 gap-2"
                >
                  Explore safety features <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/features" 
                  onClick={() => handleCTAClick('hero_features')}
                  className="btn-brand-outline btn-lg rounded-xl font-bold px-8 gap-2"
                >
                  <Shield size={20} /> Try the demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How the safety layer works */}
        <section className="py-20 bg-base-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-base-content mb-4">
                How the safety layer works
              </h2>
              <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
                Three steps from setup to peace of mind. You decide who gets notified and when.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
              {[
                { step: 1, icon: User, title: 'Add emergency contacts', desc: 'Choose who should be notified if you miss a check-in. You can add multiple contacts.' },
                { step: 2, icon: Clock, title: 'Schedule check-ins', desc: 'Set intervals that work for your trip — every few hours, daily, or custom.' },
                { step: 3, icon: ShieldCheck, title: 'Travel with confidence', desc: 'Confirm you\'re safe with one tap. If you miss a check-in, your contacts are alerted.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <Icon size={28} className="text-success" />
                    </div>
                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-vibrant text-white text-sm font-black mb-3">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-black text-base-content mb-2">{item.title}</h3>
                    <p className="text-base-content/80 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Escalation flow */}
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-black text-base-content mb-6 text-center">What happens if you miss a check-in</h3>
              <div className="space-y-4">
                {escalationSteps.map((step) => (
                  <div key={step.step} className="flex gap-4 p-5 bg-base-200 rounded-xl border border-base-300">
                    <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-brand-vibrant">{step.step}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content">{step.title}</h4>
                      <p className="text-sm text-base-content/80 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-base-content/60 text-center mt-6 font-medium">
                You can cancel escalation at any point if you're safe. Alerts only trigger if you fail to respond.
              </p>
            </div>
          </div>
        </section>

        {/* Core safety tools */}
        <section className="py-20 bg-base-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-base-content mb-4">
                Core safety tools
              </h2>
              <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
                Every tool is designed to give you control — not to replace your own judgement.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safetyTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={index} className="p-6 rounded-2xl border border-base-300 bg-base-100">
                    <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-black text-base-content mb-2">{tool.title}</h3>
                    <p className="text-base-content/80 leading-relaxed text-sm">{tool.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust and boundaries */}
        <section className="py-20 bg-base-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-black text-base-content mb-4">
                What SoloCompass does — and doesn't — guarantee
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-success/10 border border-success/20">
                <h3 className="font-black text-emerald-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-success" /> What we do
                </h3>
                <ul className="space-y-2">
                  {[
                    'Provide planning tools and safety workflows',
                    'Surface official travel advisories (FCDO)',
                    'Notify your chosen contacts if you miss a check-in',
                    'Help you find safe havens and emergency services',
                    'Let you export or delete your data at any time',
                  ].map((item) => (
                    <li key={`do-${item}`} className="flex items-start gap-2 text-sm text-success">
                      <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-warning/10 border border-warning/20">
                <h3 className="font-black text-warning mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-warning" /> What we don't do
                </h3>
                <ul className="space-y-2">
                  {[
                    'Guarantee your safety or replace emergency services',
                    'Monitor your location in real-time without your consent',
                    'Contact emergency services on your behalf',
                    'Provide medical, legal, or travel advice',
                    'Share your data with third parties',
                  ].map((item) => (
                    <li key={`dont-${item}`} className="flex items-start gap-2 text-sm text-warning">
                      <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-sm text-base-content/60 text-center mt-8 font-medium">
              You decide who gets notified and when. SoloCompass is a planning tool, not an emergency service.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-base-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-black text-base-content mb-6">
              Set up your safety layer
            </h2>
            <p className="text-lg text-base-content/80 mb-10">
              It takes less than 5 minutes to add contacts and schedule your first check-in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                onClick={() => handleCTAClick('footer_signup')}
                className="btn-brand btn-lg rounded-xl font-bold px-8 gap-2"
              >
                Get Started Free <ArrowRight size={20} />
              </Link>
              <Link 
                to="/help" 
                onClick={() => handleCTAClick('footer_help')}
                className="btn-brand-outline btn-lg rounded-xl font-bold px-8 gap-2"
              >
                <MessageSquare size={20} /> Need help?
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SafetyInfo;
