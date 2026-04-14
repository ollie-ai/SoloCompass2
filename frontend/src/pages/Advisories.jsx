import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Loading from '../components/Loading';
import Skeleton from '../components/Skeleton';
import { 
  ShieldAlert, ExternalLink, RefreshCw, Info, Globe, MapPin, CheckCircle2, 
  AlertTriangle, AlertCircle, CheckCircle, ChevronRight, Activity, Zap, Search 
} from 'lucide-react';
import Button from '../components/Button';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import DashboardShell from '../components/dashboard/DashboardShell';
import PageHeader from '../components/PageHeader';

const Advisories = () => {
  const [advisories, setAdvisories] = useState([]);
  const [filteredAdvisories, setFilteredAdvisories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState([]);
  const [tripAdvisories, setTripAdvisories] = useState([]);

  const fetchAdvisories = async (isManual = false) => {
    try {
      setRefreshing(true);
      const response = await api.get('/advisories');
      const data = response.data.data || [];
      setAdvisories(data);
      setFilteredAdvisories(data);
      if (isManual) {
        toast.success('Intelligence Feed Synchronized');
      }
    } catch (error) {
      console.error('Failed to fetch advisories:', error);
      if (isManual) toast.error('Failed to sync advisories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      const tripsData = res.data.data?.trips || res.data.data || res.data.trips || [];
      setTrips(tripsData);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000);
    
    fetchAdvisories();
    fetchTrips();
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (trips.length > 0 && advisories.length > 0) {
      const tripDestinations = trips
        .map(t => (t.destination || t.name || '').toLowerCase())
        .filter(Boolean);
      
      const matching = advisories.filter(a => {
        const country = (a.country || '').toLowerCase();
        return tripDestinations.some(dest => country.includes(dest) || dest.includes(country));
      });
      setTripAdvisories(matching);
    } else {
      setTripAdvisories([]);
    }
  }, [trips, advisories]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = advisories.filter(a => 
      a.country?.toLowerCase().includes(query) || 
      a.title?.toLowerCase().includes(query) || 
      a.summary?.toLowerCase().includes(query)
    );
    setFilteredAdvisories(filtered);
  }, [searchQuery, advisories]);

  const getSeverityConfig = (advisory) => {
    const summary = (advisory.summary || '').toLowerCase();
    const title = (advisory.title || '').toLowerCase();
    const text = summary + ' ' + title;

    if (text.includes('avoid') || text.includes('evacuate') || text.includes('danger') || text.includes('critical') || text.includes('war') || text.includes('conflict')) {
      return { color: 'error', bg: 'bg-error/5', badge: 'bg-error/10 text-error border-error/20', label: 'Critical Risk', icon: AlertTriangle };
    }
    if (text.includes('caution') || text.includes('elevated') || text.includes('warning') || text.includes('risk') || text.includes('threat') || text.includes('protest') || text.includes('crime')) {
      return { color: 'warning', bg: 'bg-warning/5', badge: 'bg-warning/10 text-warning border-warning/20', label: 'Caution Required', icon: AlertCircle };
    }
    if (text.includes('normal') || text.includes('safe') || text.includes('low') || text.includes('routine')) {
      return { color: 'success', bg: 'bg-success/5', badge: 'bg-success/10 text-success border-success/20', label: 'Optimal Status', icon: CheckCircle };
    }
    return { color: 'base-content/40', bg: 'bg-white/5', badge: 'bg-white/5 text-base-content/40 border-white/5', label: 'Routine Advisory', icon: Info };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  if (loading) return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-96 font-black" />
            <Skeleton className="h-6 w-72" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={`skeleton-advisory-${i}`} className="glass-card h-48 rounded-3xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-6">
            <div className="glass-card h-64 rounded-3xl animate-pulse" />
            <div className="glass-card h-48 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );

  const globalAdvisories = tripAdvisories.length > 0
    ? filteredAdvisories.filter(a => !tripAdvisories.includes(a))
    : filteredAdvisories;

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <PageHeader 
            title={<>Global <span className="text-gradient">Advisories</span></>}
            subtitle="Real-time security intelligence and official safety guidance from the FCDO."
            badge="Security Intel"
            icon={ShieldAlert}
          />
          <button
            onClick={() => fetchAdvisories(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/5 border border-white/5 text-base-content/80 rounded-2xl font-black text-[11px] uppercase tracking-premium hover:bg-white/10 transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-black/5"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
            {refreshing ? 'Synchronizing Intelligence...' : 'Sync Feed'}
          </button>
        </div>

        {/* Search */}
        <motion.div variants={itemVariants} className="mb-10 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-brand-vibrant">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="FILTER INTELLIGENCE BY COUNTRY OR TOPIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-4 rounded-2xl glass-card border-white/5 focus:ring-2 focus:ring-brand-vibrant/20 focus:border-brand-vibrant outline-none text-[13px] font-black tracking-wide text-base-content placeholder:text-base-content/20 transition-all uppercase"
          />
          {searchQuery && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-vibrant uppercase tracking-premium bg-brand-vibrant/10 px-2 py-1 rounded-lg border border-brand-vibrant/20">
              {filteredAdvisories.length} ENTRIES FOUND
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trip-Relevant Advisories */}
            {tripAdvisories.length > 0 && searchQuery === '' && (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <Activity size={16} className="text-brand-vibrant" />
                  <h2 className="font-outfit font-black text-xs text-base-content/40 uppercase tracking-[0.2em]">Priority Target Missions</h2>
                </div>
                <div className="space-y-4">
                  {tripAdvisories.map((advisory, i) => {
                    const severity = getSeverityConfig(advisory);
                    const SeverityIcon = severity.icon;
                    return (
                      <motion.div
                        key={`trip-${i}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`glass-card rounded-3xl hover:bg-white/[0.02] transition-all border-l-4 border-l-${severity.color} overflow-hidden group`}
                      >
                        <div className="p-6 sm:p-8">
                          <div className="flex flex-wrap items-center gap-3 mb-5">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-premium border ${severity.badge}`}>
                              <SeverityIcon size={12} strokeWidth={2.5} />
                              {severity.label}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-base-content/10"></div>
                            <span className="text-[11px] font-black text-base-content/40 uppercase tracking-widest flex items-center gap-1.5">
                              <MapPin size={12} className="text-brand-vibrant" />
                              {advisory.country}
                            </span>
                          </div>
                          
                          <h3 className="font-outfit font-black text-xl sm:text-2xl text-base-content mb-4 tracking-tight group-hover:text-brand-vibrant transition-colors">{advisory.title}</h3>
                          
                          <div
                            className="text-sm text-base-content/60 font-bold leading-relaxed mb-6 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(advisory.summary) }}
                          />
                          
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-base-content/30 uppercase tracking-premium">Last Intelligence Update</span>
                                <span className="text-[11px] font-black text-base-content/60 uppercase">
                                  {new Date(advisory.updated).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <a
                              href={advisory.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-premium text-[11px] px-6 py-3"
                            >
                              Extraction Brief <ExternalLink size={14} strokeWidth={2.5} />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Global Advisories */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-2 px-1 mb-2">
                <Globe size={16} className="text-base-content/40" />
                <h2 className="font-outfit font-black text-xs text-base-content/40 uppercase tracking-[0.2em]">Global Intelligence Feed</h2>
              </div>
              
              {searchQuery !== '' && filteredAdvisories.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-3xl">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="text-base-content/20" size={32} />
                  </div>
                  <h3 className="font-black text-base-content/60 text-lg mb-2 uppercase tracking-premium">No Intelligence Found</h3>
                  <p className="text-base-content/40 font-bold text-sm uppercase tracking-wide">No advisories matching "{searchQuery}" detected.</p>
                  <button onClick={() => setSearchQuery('')} className="mt-8 px-6 py-3 bg-brand-vibrant/10 text-brand-vibrant font-black text-[11px] hover:bg-brand-vibrant/20 rounded-xl transition-all uppercase tracking-premium border border-brand-vibrant/20">
                    Clear Active Filter
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(searchQuery === '' && tripAdvisories.length > 0 ? globalAdvisories : filteredAdvisories).map((advisory, i) => {
                    const severity = getSeverityConfig(advisory);
                    const SeverityIcon = severity.icon;
                    return (
                      <motion.div
                        key={`global-${i}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`glass-card rounded-2xl hover:bg-white/[0.02] transition-all border-l-4 border-l-${severity.color} overflow-hidden group border-white/5 opacity-80 hover:opacity-100`}
                      >
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-premium border ${severity.badge}`}>
                              <SeverityIcon size={10} strokeWidth={2.5} />
                              {severity.label}
                            </div>
                            <span className="text-[10px] font-black text-base-content/30 uppercase tracking-widest">{advisory.country}</span>
                          </div>
                          
                          <h3 className="font-outfit font-black text-lg text-base-content mb-3 tracking-tight group-hover:text-brand-vibrant transition-colors uppercase">{advisory.title}</h3>
                          
                          <div
                            className="text-xs text-base-content/60 font-bold leading-relaxed mb-5 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(advisory.summary) }}
                          />
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[9px] font-black text-base-content/30 uppercase tracking-premium">
                              SYNCED: {new Date(advisory.updated).toLocaleDateString()}
                            </span>
                            <a
                              href={advisory.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-black text-brand-vibrant uppercase tracking-premium hover:text-success transition-colors"
                            >
                              Intelligence Full Brief <ExternalLink size={12} strokeWidth={2.5} />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sticky Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6 sticky top-28">
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden border-brand-vibrant/20 bg-brand-vibrant/5">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-vibrant/10 blur-2xl rounded-full"></div>
              <ShieldAlert className="text-brand-vibrant mb-6" size={32} strokeWidth={2.5} />
              <h3 className="font-outfit font-black text-lg text-base-content mb-3 uppercase tracking-tight">Active Intel Intelligence</h3>
              <p className="text-sm text-base-content/60 font-bold leading-relaxed mb-6 uppercase tracking-wide opacity-80">
                Official source data synthesized from the UK Foreign, Commonwealth & Development Office (FCDO).
              </p>
              <div className="space-y-4">
                {[
                  'Official Mission Source',
                  'FCDO RSA Logic Integration',
                  'Automated Severity Assessment'
                ].map((tip, i) => (
                  <div key={`tip-advisory-${i}`} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-lg bg-brand-vibrant/10 border border-brand-vibrant/20 flex items-center justify-center shrink-0">
                      <Zap size={10} className="text-brand-vibrant" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black text-base-content/60 uppercase tracking-premium">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <h3 className="font-outfit font-black text-xs text-base-content/40 uppercase tracking-[0.2em] mb-6">Threat Severity Metrics</h3>
              <div className="space-y-5">
                {[
                  { label: 'Critical Risk', desc: 'Avoid all proximity', color: 'bg-error' },
                  { label: 'Caution Required', desc: 'Elevated awareness', color: 'bg-warning' },
                  { label: 'Optimal Status', desc: 'Standard operating procedure', color: 'bg-success' },
                  { label: 'Routine Advisory', desc: 'General intelligence only', color: 'bg-base-content/40' }
                ].map((level, i) => (
                  <div key={`severity-${i}`} className="flex items-start gap-4">
                    <div className={`w-3.5 h-3.5 rounded-full ${level.color} mt-1 shrink-0 shadow-lg shadow-black/10`}></div>
                    <div>
                      <p className="text-[11px] font-black text-base-content uppercase tracking-premium">{level.label}</p>
                      <p className="text-[10px] text-base-content/40 font-bold uppercase tracking-wide">{level.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/5 bg-white/[0.02]">
              <h3 className="font-outfit font-black text-xs text-base-content/40 uppercase tracking-[0.2em] mb-6">Mission Protocols</h3>
              <ul className="space-y-4">
                {[
                  'Register with National Consulate',
                  'Maintain Digital Safe Recovery',
                  'Verify Target Entry Protocols'
                ].map((protocol, i) => (
                  <li key={`protocol-${i}`} className="flex items-start gap-3">
                    <ChevronRight size={14} className="text-brand-vibrant shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-[10px] font-black text-base-content/60 uppercase tracking-premium leading-tight">{protocol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Advisories;

