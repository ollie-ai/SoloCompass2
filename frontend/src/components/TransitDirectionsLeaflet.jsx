import { useState } from 'react';
import { Navigation, Footprints, Car, Train, ArrowRight } from 'lucide-react';
import { routing } from '../services/routing';

const TRAVEL_MODES = [
  { id: 'walking', label: 'Walk', icon: Footprints, color: 'emerald' },
  { id: 'driving', label: 'Drive', icon: Car, color: 'blue' },
  { id: 'public', label: 'Transit', icon: Train, color: 'purple' },
];

export default function TransitDirectionsLeaflet({ 
  origin, 
  destination, 
  className = '' 
}) {
  const [mode, setMode] = useState('walking');
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDirections = async () => {
    if (!origin?.lat || !destination?.lat) {
      setError('Please select both origin and destination on the map');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await routing.getDirections(
        { lat: origin.lat, lon: origin.lon },
        { lat: destination.lat, lon: destination.lon },
        mode
      );

      if (result.success) {
        setDirections(result.data);
      } else {
        setError('Could not find directions. Try a different mode.');
      }
    } catch (err) {
      setError('Failed to get directions. Please try again.');
    }
    
    setLoading(false);
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        {TRAVEL_MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                mode === m.id
                  ? `bg-${m.color}-500 text-white`
                  : 'bg-base-200 text-base-content/80 hover:bg-base-300'
              }`}
            >
              <Icon size={18} />
              {m.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={getDirections}
        disabled={loading || !origin?.lat || !destination?.lat}
        className="w-full py-3 rounded-xl bg-brand-vibrant text-white font-bold hover:bg-brand-vibrant/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Navigation size={18} />
        {loading ? 'Getting directions...' : 'Get Directions'}
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
          {error}
        </div>
      )}

      {directions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-base-200">
            <div>
              <p className="text-sm text-base-content/60">Distance</p>
              <p className="text-lg font-bold">{formatDistance(directions.distance)}</p>
            </div>
            <div className="w-px h-10 bg-base-300" />
            <div>
              <p className="text-sm text-base-content/60">Duration</p>
              <p className="text-lg font-bold">{formatDuration(directions.duration)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {directions.steps?.map((step, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl bg-base-100 border border-base-300">
                <div className="flex flex-col items-center">
                  <span className="w-6 h-6 rounded-full bg-brand-vibrant/10 text-brand-vibrant text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {idx < (directions.steps?.length || 0) - 1 && (
                    <div className="w-0.5 flex-1 bg-base-300 my-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{step.instruction}</p>
                  <p className="text-xs text-base-content/60 mt-1">
                    {formatDistance(step.distance)} • {formatDuration(step.duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <a
            href={`https://www.openstreetmap.org/directions?route=${encodeURIComponent(
              JSON.stringify(directions.geometry)
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-base-300 text-sm font-bold hover:bg-base-200 transition-colors"
          >
            Open in OpenStreetMap <ArrowRight size={16} />
          </a>
        </div>
      )}
    </div>
  );
}