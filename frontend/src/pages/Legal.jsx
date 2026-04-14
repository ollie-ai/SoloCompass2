import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Gavel, Scale, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EASE = [0.16, 1, 0.3, 1];

const Legal = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const navigate = useNavigate();

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: Gavel },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'safety', label: 'Safety Guidelines', icon: Shield },
    { id: 'cookies', label: 'Cookie Policy', icon: FileText },
  ];

  const cardClass = 'bg-base-100 rounded-2xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:pb-20 pb-24" style={{ backgroundImage: 'radial-gradient(rgba(16,185,129,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      <div className="mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-base-content/60 hover:text-brand-vibrant font-bold text-sm mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-vibrant/10 text-brand-vibrant text-[10px] font-black uppercase tracking-widest mb-3">
          Compliance
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-base-content leading-tight">Legal & Privacy</h1>
        <p className="text-base-content/60 font-medium mt-2 text-lg">Detailed information about how SoloCompass protects you and your data.</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <div className="space-y-4">
          <div className={`${cardClass} p-3`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                  activeTab === tab.id 
                    ? 'bg-brand-vibrant text-white shadow-md shadow-brand-vibrant/25' 
                    : 'text-base-content/80 hover:bg-base-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} className="shrink-0" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-deep to-slate-800 text-white shadow-xl">
            <h4 className="font-black text-sm mb-2 flex items-center gap-2">
              <Scale size={16} className="text-brand-vibrant" /> Responsible Travel
            </h4>
            <p className="text-[11px] text-base-content/30 font-medium leading-relaxed">
              SoloCompass is designed to empower solo travellers with information. Always exercise personal judgement and follow local authorities' advice.
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ ease: EASE, duration: 0.3 }}
              className={cardClass}
            >
              <div className="p-8 sm:p-10 prose prose-slate max-w-none">
                {activeTab === 'terms' && (
                  <div>
                    <h2 className="text-2xl font-black text-base-content mb-6">Terms of Service</h2>
                    <p className="text-base-content/40 text-xs font-bold uppercase tracking-widest mb-8">Last Updated: April 2026</p>
                    
                    <h3 className="text-lg font-black text-base-content mt-8 mb-4">1. Acceptance of Terms</h3>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      By accessing or using SoloCompass, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services. SoloCompass provides travel planning, safety monitoring, and community connection tools.
                    </p>

                    <h3 className="text-lg font-black text-base-content mt-8 mb-4">2. Safety Features Disclaimer</h3>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      SoloCompass safety features (Check-ins, SOS alerts, Fake Call) are intended as supplementary tools. They are NOT a replacement for emergency services (911, 999, 112). SoloCompass does not guarantee your safety and is not liable for outcomes during your travels.
                    </p>

                    <h3 className="text-lg font-black text-base-content mt-8 mb-4">3. User Conduct</h3>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      You are responsible for all content you post and your interactions with other users. Harassment, stalking, or any form of abuse in the Travel Buddies system will result in immediate permanent account termination.
                    </p>

                    <h3 className="text-lg font-black text-base-content mt-8 mb-4">4. Precise Location Data</h3>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      Some features require precise real-time location data. By enabling these features, you consent to the collection and processing of this data as outlined in our Privacy Policy.
                    </p>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-2xl font-black text-base-content mb-6">Privacy Policy</h2>
                    <p className="text-base-content/40 text-xs font-bold uppercase tracking-widest mb-8">Last Updated: April 2026</p>

                    <h3 className="text-lg font-black text-base-content mt-8 mb-4">1. Data Collection</h3>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      We collect information you provide directly (profile, trips, emergency contacts) and technical data (location, device information). Location data is only used for safety monitoring and is never sold to third parties.
                    </p>

                    <h3 className="text-lg font-black text-base-content mt-8 mb-4">2. Emergency Contact Access</h3>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      When you enable safety monitoring, we may share your current location and status with your designated emergency contacts if a check-in is missed or an SOS is triggered.
                    </p>

                    <h3 className="text-lg font-black text-base-content mt-8 mb-4">3. AI Processing</h3>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      Our AI (Atlas) processes your trip data and Travel DNA to provide personalized recommendations. This data is handled securely and used solely for enhancing your experience.
                    </p>

                    <div className="mt-12 p-6 rounded-xl bg-base-200 border border-base-300/50 italic text-sm text-base-content/60">
                      "Your safety and privacy are the core of SoloCompass. We believe you should always be in control of your data." — The SoloCompass Team
                    </div>
                  </div>
                )}

                {activeTab === 'safety' && (
                  <div>
                    <h2 className="text-2xl font-black text-base-content mb-6">Safety Guidelines</h2>
                    <p className="text-base-content/40 text-xs font-bold uppercase tracking-widest mb-8">Best Practices for Solo Travellers</p>

                    <div className="grid sm:grid-cols-2 gap-6 mt-8">
                      <div className="p-5 rounded-2xl bg-success/10 border border-success/20">
                        <h4 className="font-black text-emerald-800 mb-2">Digital Safety</h4>
                        <ul className="text-sm text-success font-medium space-y-2 list-disc pl-4">
                          <li>Always set up at least two emergency contacts.</li>
                          <li>Keep your Travel DNA updated for better AI alerts.</li>
                          <li>Test the "Fake Call" feature before you leave.</li>
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl bg-warning/10 border border-warning/20">
                        <h4 className="font-black text-warning mb-2">Physical Safety</h4>
                        <ul className="text-sm text-warning font-medium space-y-2 list-disc pl-4">
                          <li>Stay in well-lit, solo-friendly districts.</li>
                          <li>Always trust your intuition.</li>
                          <li>Check local advisories daily.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'cookies' && (
                  <div>
                    <h2 className="text-2xl font-black text-base-content mb-6">Cookie Policy</h2>
                    <p className="text-base-content/40 text-xs font-bold uppercase tracking-widest mb-8">How we use small files to improve your journey.</p>
                    <p className="text-base-content/80 font-medium leading-relaxed">
                      SoloCompass uses cookies solely for authentication and session management. We do not use tracking cookies for advertising. Essential cookies are required to keep you signed in across our planning and safety tools.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Legal;
