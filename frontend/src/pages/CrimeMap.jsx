import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { 
  ArrowLeft, MapPin, Shield, AlertTriangle, 
  RefreshCw, Loader, Clock, Map, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

export default function CrimeMap() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [crimes, setCrimes] = useState([]);
  const [safetyScore, setSafetyScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      toast.error('Geolocation not supported');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(loc);
        await fetchCrimeData(loc);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        toast.error('Could not get location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchCrimeData = async (loc) => {
    setLoading(true);
    try {
      const res = await api.get('/safety/crime', {
        params: {
          lat: loc.lat,
          lng: loc.lng
        }
      });

      if (res.data.success) {
        setCrimes(res.data.data.crimes || []);
        setSafetyScore(res.data.data.score);
      }
    } catch (err) {
      console.error('Failed to fetch crime data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const crimeTypeLabels = {
    robbery: 'Robbery',
    burglary: 'Burglary',
    assault: 'Assault',
    vehicle: 'Vehicle Crime',
    anti_social: 'Anti-Social Behaviour',
    other: 'Other'
  };

  return (
    <>
      <SEO 
        title="Crime Map - SoloCompass" 
        description="View local crime data and safety information for your area."
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
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Shield className="text-blue-500" size={20} />
              </div>
              <h1 className="text-2xl font-black text-base-content">Crime Map</h1>
            </div>
            <p className="text-base-content/60 text-sm">
              View local crime data and safety information for your area.
            </p>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-base-content/60 mb-1 uppercase">Current Location</label>
            <div className="p-3 bg-base-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-brand-vibrant" />
                <span className="text-sm font-medium">
                  {locationLoading 
                    ? 'Getting location...' 
                    : location 
                      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                      : 'Location not available'}
                </span>
              </div>
              <button 
                onClick={requestLocation}
                disabled={locationLoading}
                className="text-xs text-brand-vibrant hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-colors ${
                viewMode === 'list' 
                  ? 'bg-brand-vibrant text-white' 
                  : 'bg-base-200 text-base-content/60'
              }`}
            >
              <List size={14} className="inline mr-1" /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-colors ${
                viewMode === 'map' 
                  ? 'bg-brand-vibrant text-white' 
                  : 'bg-base-200 text-base-content/60'
              }`}
            >
              <Map size={14} className="inline mr-1" /> Map
            </button>
          </div>

          {/* Summary */}
          {safetyScore !== null && (
            <div className="mb-6 p-4 bg-base-200 rounded-xl">
              <p className="text-xs font-bold text-base-content/40 uppercase mb-2">Area Safety Score</p>
              <div className="flex items-center gap-3">
                <p className={`text-3xl font-black ${getScoreColor(safetyScore)}`}>
                  {safetyScore}
                </p>
                <p className="text-sm text-base-content/60">
                  {safetyScore >= 80 ? 'Low crime area' : safetyScore >= 60 ? 'Moderate crime area' : 'Higher crime area'}
                </p>
              </div>
            </div>
          )}

          {/* Crime Data */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader size={24} className="animate-spin mx-auto mb-2 text-brand-vibrant" />
              <p className="text-sm text-base-content/60">Loading crime data...</p>
            </div>
          ) : viewMode === 'list' ? (
            <div>
              <label className="block text-xs font-bold text-base-content/60 mb-3 uppercase">
                Recent Incidents ({crimes.length})
              </label>
              
              {crimes.length === 0 ? (
                <div className="p-8 bg-base-200 rounded-xl text-center">
                  <Shield size={32} className="text-success mx-auto mb-2" />
                  <p className="text-sm text-base-content/80">No recent crimes reported in this area.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {crimes.slice(0, 20).map((crime, i) => (
                    <div key={i} className="p-3 bg-base-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-base-content">
                            {crimeTypeLabels[crime.category] || crime.category || 'Unknown'}
                          </p>
                          <p className="text-xs text-base-content/60 mt-1">{crime.location}</p>
                        </div>
                        <span className="text-xs text-base-content/40">
                          {crime.date ? new Date(crime.date).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-base-200 rounded-xl text-center">
              <Map size={32} className="text-base-content/40 mx-auto mb-2" />
              <p className="text-sm text-base-content/60">Map view requires Google Maps API key</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-3 bg-base-200 rounded-xl">
            <p className="text-xs text-base-content/60">
              <strong className="text-base-content/80">Note:</strong> Crime data is based on publicly reported incidents and may not reflect all crime. Use this as a guide and always stay aware of your surroundings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}