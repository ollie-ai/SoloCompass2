import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { 
  ArrowLeft, MapPin, Navigation, Shield, AlertTriangle, 
  Clock, Zap, Car, Footprints, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

export default function PinkPath() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [safetyScore, setSafetyScore] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState(22);
  const [method, setMethod] = useState('walking');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (err) => {
        toast.error('Could not get location');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFindRoute = async () => {
    if (!startLocation || !endLocation.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    setLoading(true);
    try {
      const directionsRes = await api.get('/directions', {
        params: {
          origin: `${startLocation.lat},${startLocation.lng}`,
          destination: endLocation,
          mode: method
        }
      });

      if (directionsRes.data?.routes?.[0]?.geometry) {
        const route = directionsRes.data.routes[0].geometry;
        setRouteData(route);

        setScoring(true);
        try {
          const scoreRes = await api.post('/safety/route-score', {
            route: route,
            timeOfDay: parseInt(timeOfDay)
          });

          if (scoreRes.data.success) {
            setSafetyScore(scoreRes.data.data);
          }
        } catch (scoreErr) {
          console.error('Scoring failed:', scoreErr);
        } finally {
          setScoring(false);
        }
      }
    } catch (err) {
      console.error('Route finding failed:', err);
      toast.error('Could not find route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <>
      <SEO 
        title="Pink Path - SoloCompass" 
        description="Find the safest walking route to your destination."
      />
      
      <div className="min-h-screen bg-base-100 pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <button 
            onClick={() => navigate('/safety')}
            className="flex items-center gap-2 text-base-content/60 hover:text-base-content mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Safety</span>
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                <MapPin className="text-rose-500" size={20} />
              </div>
              <h1 className="text-2xl font-black text-base-content">Pink Path</h1>
            </div>
            <p className="text-base-content/60 text-sm">
              Find the safest walking route to your destination, even at night.
            </p>
          </div>

          {/* Current Location */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-base-content/60 mb-1 uppercase">Your Location</label>
            <div className="p-3 bg-base-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-brand-vibrant" />
                <span className="text-sm font-medium">
                  {startLocation 
                    ? `${startLocation.lat.toFixed(4)}, ${startLocation.lng.toFixed(4)}`
                    : locationLoading 
                      ? 'Getting location...' 
                      : 'Location not available'}
                </span>
              </div>
              <button 
                onClick={requestLocation}
                disabled={locationLoading}
                className="text-xs text-brand-vibrant hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-base-content/60 mb-1 uppercase">Destination</label>
            <input
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="Enter address or place..."
              className="w-full p-3 bg-base-200 border border-base-300 rounded-xl text-sm"
            />
          </div>

          {/* Options */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-base-content/60 mb-1 uppercase">Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full p-3 bg-base-200 border border-base-300 rounded-xl text-sm"
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-base-content/60 mb-1 uppercase">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-3 bg-base-200 border border-base-300 rounded-xl text-sm"
              >
                <option value="walking">Walking</option>
                <option value="driving">Driving</option>
              </select>
            </div>
          </div>

          {/* Find Route Button */}
          <button
            onClick={handleFindRoute}
            disabled={loading || !startLocation || !endLocation}
            className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Navigation size={18} />
            )}
            Find Safest Route
          </button>

          {/* Safety Score */}
          {(safetyScore || scoring) && (
            <div className="mt-8">
              <label className="block text-xs font-bold text-base-content/60 mb-3 uppercase">Safety Assessment</label>
              
              {scoring ? (
                <div className="p-6 bg-base-200 rounded-xl text-center">
                  <Loader size={24} className="animate-spin mx-auto mb-2" />
                  <p className="text-sm text-base-content/60">Analyzing route safety...</p>
                </div>
              ) : safetyScore && (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="p-6 bg-base-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-base-content/40 uppercase mb-1">Overall Safety Score</p>
                    <p className={`text-4xl font-black ${getScoreColor(safetyScore.overallScore)}`}>
                      {safetyScore.overallScore}
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">/ 100</p>
                  </div>

                  {/* Factors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-base-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-warning" />
                        <span className="text-xs font-bold text-base-content/60">Lighting</span>
                      </div>
                      <p className="text-lg font-black text-base-content">{safetyScore.lighting?.score || '—'}</p>
                    </div>
                    <div className="p-3 bg-base-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={14} className="text-success" />
                        <span className="text-xs font-bold text-base-content/60">Crime Level</span>
                      </div>
                      <p className="text-lg font-black text-base-content">{safetyScore.crime?.score || '—'}</p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {safetyScore.warnings?.length > 0 && (
                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-warning" />
                        <span className="text-xs font-bold text-warning uppercase">Consider</span>
                      </div>
                      <ul className="space-y-1">
                        {safetyScore.warnings.map((warning, i) => (
                          <li key={i} className="text-xs text-base-content/80">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-3 bg-base-200 rounded-xl">
            <p className="text-xs text-base-content/60">
              <strong className="text-base-content/80">Note:</strong> This tool provides route safety suggestions based on available data. Always trust your instincts and stay aware of your surroundings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}