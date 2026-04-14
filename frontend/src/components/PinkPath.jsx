import { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import api from '../lib/api';

const SafetyScoreBadge = ({ score }) => {
  const getColor = () => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-error';
  };

  const getLabel = () => {
    if (score >= 75) return 'Safe';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Caution';
    return 'High Risk';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getColor()}`}>
        {score}
      </div>
      <span className="text-sm font-medium text-base-content/80">{getLabel()}</span>
    </div>
  );
};

const SafeRouteCard = ({ route, onSelect, selected }) => {
  return (
    <div 
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected ? 'border-brand-vibrant bg-brand-vibrant/10' : 'border-base-300 hover:border-brand-vibrant/50'
      }`}
      onClick={() => onSelect(route)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-base-content">{route.name || 'Alternative Route'}</h4>
        <SafetyScoreBadge score={route.safetyScore} />
      </div>
      <div className="flex gap-4 text-sm text-base-content/60">
        <span>⏱ {route.duration}</span>
        <span>📍 {route.distance}</span>
        {route.crimeCount !== undefined && (
          <span className={route.crimeCount > 20 ? 'text-error' : 'text-green-600'}>
            ⚠ {route.crimeCount} crimes nearby
          </span>
        )}
      </div>
      {route.segments && (
        <div className="mt-3 flex gap-1">
          {route.segments.slice(0, 10).map((seg, i) => (
            <div 
              key={`segment-${seg.safetyScore}-${i}`} 
              className={`h-1 flex-1 rounded-full ${
                seg.safetyScore >= 70 ? 'bg-green-400' :
                seg.safetyScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SafeHavenMarker = ({ haven, onCall }) => {
  const getIcon = () => {
    switch (haven.type) {
      case 'police': return '🚔';
      case 'hospital': return '🏥';
      case 'embassy': return '🏛️';
      case 'hotel': return '🏨';
      default: return '📍';
    }
  };

  const getPhoneUrl = (phone) => {
    if (!phone) return null;
    const clean = phone.replace(/[^0-9+]/g, '');
    return `tel:${clean}`;
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-3 border border-base-300 max-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{getIcon()}</span>
        <span className="font-semibold text-sm">{haven.name}</span>
      </div>
      <p className="text-xs text-base-content/60 mb-2">{haven.type}</p>
      {haven.phone && (
        <button 
          onClick={() => onCall(haven.phone)}
          className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg flex items-center justify-center gap-1"
        >
          📞 Call {haven.phone}
        </button>
      )}
    </div>
  );
};

export const PinkPathMap = ({ origin, destination, onRouteSelect }) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [safetyData, setSafetyData] = useState(null);
  const [currentOrigin, setCurrentOrigin] = useState(origin);
  const [currentDest, setCurrentDest] = useState(destination);

  useEffect(() => {
    const handleRefresh = (e) => {
      setCurrentOrigin(e.detail?.origin);
      setCurrentDest(e.detail?.destination);
    };

    window.addEventListener('refreshPinkPath', handleRefresh);
    return () => window.removeEventListener('refreshPinkPath', handleRefresh);
  }, []);

  useEffect(() => {
    if (currentOrigin?.lat && currentDest?.lat) {
      fetchSafeRoutes();
    }
  }, [currentOrigin, currentDest]);

  const fetchSafeRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [directionsRes, safetyRes] = await Promise.all([
        api.get(`/directions/walking?origin=${currentOrigin.lat},${currentOrigin.lng}&destination=${currentDest.lat},${currentDest.lng}`),
        api.get(`/safety/score?lat=${(currentOrigin.lat + currentDest.lat)/2}&lng=${(currentOrigin.lng + currentDest.lng)/2}`)
      ]);

      if (directionsRes.data?.data?.routes) {
        const routes = directionsRes.data.data.routes || [];
        const scoredRoutes = await Promise.all(
          routes.map(async (route) => {
            const scoreRes = await api.post('/safety/route-score', {
              route,
              timeOfDay: new Date().getHours()
            });
            return {
              ...route,
              safetyScore: scoreRes.data?.data?.overallScore || 70
            };
          })
        );
        setRoutes(scoredRoutes.sort((a, b) => b.safetyScore - a.safetyScore));
      }
      setSafetyData(safetyRes.data?.data);
    } catch (err) {
      console.error('Pink Path error:', err);
      setError('Unable to calculate safe routes');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    if (onRouteSelect) onRouteSelect(route);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-vibrant"></div>
        <p className="mt-2 text-base-content/60">Calculating safest routes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {safetyData && (
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
             <div className="w-16 h-16 rounded-full border-4 border-pink-500 animate-ping"></div>
          </div>
          <h3 className="font-black text-base-content mb-3 uppercase tracking-widest text-xs flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
             Pink Path Safety Analysis
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <SafetyScoreBadge score={safetyData.score} />
            {safetyData.factors && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-black uppercase tracking-wider text-base-content/60">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-base-300"></div>
                   Crime Density: <span className="text-base-content">{safetyData.factors.crimeDensity}%</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-base-300"></div>
                   Time Risk: <span className="text-base-content">{safetyData.factors.timeRisk}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulated Agentic Map Route */}
      <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group/map">
         <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         <svg className="w-full h-full relative z-10" viewBox="0 0 400 200">
            {/* The Pink Path */}
            <path 
               d="M 50 150 Q 150 50, 200 150 T 350 50" 
               fill="none" 
               stroke="#ec4899" 
               strokeWidth="4" 
               strokeDasharray="8,8"
               className="animate-[dash_10s_linear_infinite]"
            />
            {/* Safety Checkpoints */}
            <circle cx="50" cy="150" r="6" fill="#10b981" className="animate-pulse" />
            <circle cx="120" cy="110" r="5" fill="#10b981" />
            <circle cx="200" cy="150" r="5" fill="#f59e0b" />
            <circle cx="280" cy="90" r="5" fill="#10b981" />
            <circle cx="350" cy="50" r="6" fill="#ec4899" />
            
            {/* Labels */}
            <text x="45" y="175" fill="white" className="text-[10px] font-black uppercase tracking-widest opacity-60">Origin</text>
            <text x="320" y="35" fill="#ec4899" className="text-[10px] font-black uppercase tracking-widest">Safe Haven</text>
         </svg>

         <div className="absolute top-4 left-4 p-3 bg-slate-800/80 backdrop-blur-md rounded-xl border border-white/5 text-white">
            <div className="text-[9px] font-black uppercase tracking-widest text-pink-400 mb-1">AI Routing</div>
            <p className="text-xs font-bold font-mono">CALCULATING_SAFE_PATH...</p>
         </div>

         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 w-full px-6 max-w-sm">
            <button 
               onClick={fetchSafeRoutes}
               className="flex-1 py-4 bg-brand-vibrant text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-vibrant/20 flex items-center justify-center gap-2 group/btn"
            >
               Recalculate <Navigation size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
         </div>
      </div>

      {routes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-black text-base-content uppercase tracking-widest text-[10px] mb-2 px-2">Mission Intelligence: Optimized Routes</h4>
          <div className="grid gap-3">
            {routes.map((route, i) => (
              <SafeRouteCard 
                key={`route-${route.name || i}`}
                route={route}
                selected={selectedRoute === route}
                onSelect={handleRouteSelect}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-error text-center p-6 bg-error/10 rounded-xl border border-error/20 font-bold">{error}</div>
      )}
    </div>
  );
};

export const SafeHavenLocator = ({ lat, lng }) => {
  const [safeHavens, setSafeHavens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRefresh = (e) => {
      const newLat = e.detail?.lat || lat;
      const newLng = e.detail?.lng || lng;
      if (newLat && newLng) {
        findSafeHavens(newLat, newLng);
      }
    };

    window.addEventListener('refreshSafeHaven', handleRefresh);
    
    if (lat && lng) {
      findSafeHavens(lat, lng);
    }

    return () => window.removeEventListener('refreshSafeHaven', handleRefresh);
  }, [lat, lng]);

  const findSafeHavens = async (latVal, lngVal) => {
    setLoading(true);
    try {
      const res = await api.get(`/safety/safe-haven?lat=${latVal}&lng=${lngVal}`);
      setSafeHavens(res.data?.data || []);
    } catch (err) {
      console.error('Safe haven error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    window.location.href = phone;
  };

  if (loading) {
    return <div className="p-4 text-center text-base-content/60">Finding safe havens...</div>;
  }

  if (safeHavens.length === 0) {
    return <div className="p-4 text-center text-base-content/60">No safe havens found nearby</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-base-content/80">🏛️ Nearest Safe Havens</h4>
      {safeHavens.slice(0, 5).map((haven, i) => (
        <SafeHavenMarker key={`haven-${haven.name}-${i}`} haven={haven} onCall={handleCall} />
      ))}
    </div>
  );
};

export default { PinkPathMap, SafeHavenLocator, SafetyScoreBadge };
