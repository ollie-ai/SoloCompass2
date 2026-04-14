import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Database, Zap, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const SystemPulse = () => {
  const [status, setStatus] = useState('loading'); // loading, healthy, degraded, offline
  const [details, setDetails] = useState(null);
  const { isAuthenticated } = useAuthStore();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data.status === 'ok') {
          setStatus('healthy');
          setDetails(res.data);
        } else {
          setStatus('degraded');
        }
      } catch (err) {
        setStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const statusColors = {
    loading: 'bg-slate-400',
    healthy: 'bg-success/100',
    degraded: 'bg-warning/100',
    offline: 'bg-rose-500'
  };

  const statusLabels = {
    loading: 'Syncing...',
    healthy: 'Mission Control: Operational',
    degraded: 'System Latency Detected',
    offline: 'Mission Control Offline'
  };

  return (
    <div className="fixed bottom-6 right-24 z-[50] flex items-center gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            className="bg-neutral text-neutral-content px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 backdrop-blur-xl text-xs font-bold flex flex-col gap-2 min-w-[180px]"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-white/60">System Status</span>
              <span className={`w-2 h-2 rounded-full ${statusColors[status]}`}></span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={12} className={details?.db ? 'text-brand-vibrant' : 'text-base-content/60'} />
              <span>Database: {details?.db ? 'Primary' : 'Connecting'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className={details?.secrets ? 'text-brand-vibrant' : 'text-base-content/60'} />
              <span>Security Vault: {details?.secrets ? 'Sealed' : 'Bypassed'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className={status === 'healthy' ? 'text-brand-vibrant' : 'text-base-content/60'} />
              <span>API Gateway: {status === 'healthy' ? 'Latching' : 'Retry'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2.5 px-3 py-2 bg-base-100/80 backdrop-blur-md border border-base-300 rounded-full shadow-lg hover:shadow-xl transition-all group"
      >
        <div className="relative flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${statusColors[status]} ${status === 'healthy' ? 'animate-pulse' : ''}`}></div>
          {status === 'healthy' && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-success/100 animate-ping opacity-30"></div>
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/60 group-hover:text-base-content dark:group-hover:text-white transition-colors">
          {statusLabels[status]}
        </span>
        <Activity size={12} className="text-base-content/30 group-hover:text-brand-vibrant transition-colors" />
      </motion.button>
    </div>
  );
};

export default SystemPulse;
