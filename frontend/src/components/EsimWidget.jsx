import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Globe, Clock, ExternalLink, X, CheckCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

const POPULAR_DESTINATIONS = [
  { country: 'Japan', code: 'JP', price: 14.99, data: '3GB', days: 30 },
  { country: 'France', code: 'FR', price: 9.99, data: '3GB', days: 30 },
  { country: 'Italy', code: 'IT', price: 9.99, data: '3GB', days: 30 },
  { country: 'Spain', code: 'ES', price: 9.99, data: '3GB', days: 30 },
  { country: 'Germany', code: 'DE', price: 9.99, data: '3GB', days: 30 },
  { country: 'Thailand', code: 'TH', price: 12.99, data: '3GB', days: 30 },
  { country: 'USA', code: 'US', price: 19.99, data: '3GB', days: 30 },
  { country: 'Australia', code: 'AU', price: 16.99, data: '3GB', days: 30 },
];

const isInternationalDestination = (destination) => {
  if (!destination) return false;
  const ukDestinations = ['United Kingdom', 'London', 'UK', 'England', 'Scotland', 'Wales'];
  const usDestinations = ['United States', 'USA', 'America', 'US'];
  
  const destLower = destination.toLowerCase();
  return !ukDestinations.some(d => destLower.includes(d.toLowerCase())) &&
         !usDestinations.some(d => destLower.includes(d.toLowerCase()));
};

const EsimWidget = ({ destination, compact = false, tripId }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const isInternational = isInternationalDestination(destination);

  if (!isInternational) {
    return null;
  }

  const handlePurchase = async (plan) => {
    setSelectedPlan(plan);
    setLoading(true);

    try {
      const response = await api.post('/esim/purchase', {
        destination: plan.country,
        code: plan.code,
        plan: plan.data,
        days: plan.days,
        tripId: tripId
      });

      if (response.data.success) {
        setPurchased(true);
      }
    } catch (err) {
      console.error('eSIM purchase error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-200 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Wifi size={20} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="font-bold text-base-content text-sm">Need Data?</p>
            <p className="text-xs text-base-content/60">Get a local eSIM</p>
          </div>
        </div>
        <ExternalLink size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
      </button>
    );
  }

  return (
    <>
      <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-indigo-100">
        <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em] mb-4">
          <Wifi size={14} /> Stay Connected
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-base-100 border border-indigo-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Globe size={24} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base-content">Local eSIM Data</h4>
              <p className="text-sm text-base-content/60 mb-3">
                Stay connected with affordable local data plans. No roaming fees, instant activation.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                View Plans <ExternalLink size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {POPULAR_DESTINATIONS.slice(0, 4).map(dest => (
              <div key={dest.code} className="p-3 rounded-lg bg-base-100 border border-base-300/50">
                <p className="font-bold text-base-content text-xs">{dest.country}</p>
                <p className="text-indigo-600 font-black text-sm">£{dest.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-brand-deep/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-base-100 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-base-300/50 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Wifi size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-base-content">eSIM Data Plans</h2>
                  <p className="text-sm text-base-content/60">Stay connected while traveling</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowModal(false); setPurchased(false); setSelectedPlan(null); }}
                className="w-10 h-10 rounded-xl bg-base-100 shadow-sm border border-base-300/50 flex items-center justify-center text-base-content/40 hover:text-base-content transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {purchased ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-success" />
                  </div>
                  <h3 className="text-xl font-black text-base-content mb-2">Order Placed!</h3>
                  <p className="text-base-content/60 mb-6">
                    Your eSIM for {selectedPlan?.country} has been ordered. You'll receive an email with activation instructions shortly.
                  </p>
                  <button
                    onClick={() => { setShowModal(false); setPurchased(false); setSelectedPlan(null); }}
                    className="px-6 py-3 rounded-xl bg-brand-deep text-white font-black"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-warning" />
                      <span className="font-black text-warning text-xs uppercase tracking-wider">In Development</span>
                    </div>
                    <p className="text-sm text-warning">
                      We're finalizing partnerships with eSIM providers. Real purchasing will be available soon. For now, this preview shows the kind of local data options your trip would benefit from.
                    </p>
                  </div>

                  <p className="text-sm text-base-content/60 mb-4">
                    Showing pricing for popular destinations. Your destination: <span className="font-bold text-base-content">{destination}</span>
                  </p>

                  <div className="space-y-3">
                    {POPULAR_DESTINATIONS.map(dest => (
                      <div 
                        key={dest.code} 
                        className="flex items-center justify-between p-4 rounded-xl border border-base-300 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center text-lg font-black text-base-content/80">
                            {dest.code}
                          </div>
                          <div>
                            <p className="font-bold text-base-content">{dest.country}</p>
                            <p className="text-xs text-base-content/60">{dest.data} · {dest.days} days</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-black text-indigo-600 text-lg">£{dest.price}</p>
                          <button
                            onClick={() => handlePurchase(dest)}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {loading && selectedPlan?.code === dest.code ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              'Demo Purchase'
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-base-300/50">
                    <p className="text-xs text-base-content/60 text-center mb-4">
                      Are you an eSIM provider interested in partnering with SoloCompass?
                    </p>
                    <a 
                      href="/partnerships"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-base-300 text-base-content/80 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    >
                      Partner with Us <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default EsimWidget;
export { isInternationalDestination };
