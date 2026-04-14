import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const SubscriptionBanner = () => {
  const { user } = useAuthStore();
  
  if (!user || !user.is_premium || !user.premium_expires_at) return null;

  const expiryDate = new Date(user.premium_expires_at);
  const now = new Date();
  const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  // Only show if trial/subscription is ending in the next 7 days
  if (diffDays > 7 || diffDays < 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="overflow-hidden mb-6"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Zap size={120} />
        </div>
        
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-base-100/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Your Premium access is ending soon</h3>
              <p className="text-white/80 font-medium text-sm">
                Only {diffDays} {diffDays === 1 ? 'day' : 'days'} left to enjoy unlimited AI itineraries and safety tools.
              </p>
            </div>
          </div>
          
          <Link 
            to="/settings" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-base-100 text-orange-600 rounded-xl font-black text-sm hover:bg-orange-50 transition-all shadow-sm group"
          >
            Manage Subscription
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionBanner;
