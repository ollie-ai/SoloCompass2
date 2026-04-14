import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, CreditCard, X, ChevronRight, Check } from 'lucide-react';

const VerificationModal = ({ isOpen, onClose }) => {
  const tiers = [
    {
      id: 'basic',
      name: 'Tier 1: Basic',
      icon: ShieldCheck,
      color: 'text-slate-400',
      bg: 'bg-slate-50',
      border: 'border-slate-100',
      requirements: ['Email verified', 'Profile photo uploaded'],
      benefits: ['Join buddies list', 'Send connect requests'],
      status: 'Current'
    },
    {
      id: 'verified',
      name: 'Tier 2: Verified',
      icon: UserCheck,
      color: 'text-brand-vibrant',
      bg: 'bg-emerald-50',
      border: 'border-brand-vibrant/20',
      requirements: ['Social media link', 'Phone number verified'],
      benefits: ['Priority in search', 'Trust badge on profile', 'Access to Verified-Only trips'],
      status: 'Unlock'
    },
    {
      id: 'premium',
      name: 'Tier 3: Premium',
      icon: CreditCard,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      requirements: ['ID Verification (Sumsub)', 'SoloCompass+ Subscription'],
      benefits: ['Infinite connections', 'Background check badge', 'Full itinerary planning with Atlas'],
      status: 'Upgrade'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-base-100 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden relative"
          >
            <div className="sticky top-0 bg-base-100 p-6 border-b border-base-300/50 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-black text-base-content">Trust & Verification</h2>
                <p className="text-xs text-base-content/60 font-medium mt-1">Unlock tiers to build trust within the community</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-base-200 rounded-xl transition-colors">
                <X size={20} className="text-base-content/40" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
              <div className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.id} className={`p-5 rounded-2xl border ${tier.border} ${tier.bg} transition-all`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${tier.color}`}>
                          <tier.icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900">{tier.name}</h3>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}>
                            {tier.status}
                          </span>
                        </div>
                      </div>
                      {tier.status === 'Current' ? (
                        <div className="bg-emerald-500 text-white p-1 rounded-full">
                          <Check size={12} />
                        </div>
                      ) : (
                        <button className="text-xs font-black bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm">
                          {tier.id === 'premium' ? 'Get +' : 'Verify'} <ChevronRight size={12} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requirements</h4>
                        <ul className="space-y-1.5">
                          {tier.requirements.map(req => (
                            <li key={req} className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-slate-300" /> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Benefits</h4>
                        <ul className="space-y-1.5">
                          {tier.benefits.map(benefit => (
                            <li key={benefit} className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-emerald-400" /> {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="text-brand-vibrant" size={20} />
                  <h4 className="text-sm font-black">SoloCompass Trust Promise</h4>
                </div>
                <p className="text-[10px] font-medium text-white/60 leading-relaxed">
                  Verification build’s the foundation of a safe solo travel community. High-tier members undergo rigorous checks (including government ID) to ensure everyone on SoloCompass is who they say they are.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VerificationModal;
