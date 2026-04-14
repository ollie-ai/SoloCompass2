import { useState } from 'react';
import { MapPin, Navigation, Bus, Train, Footprints, Ship, Loader2, Clock, DollarSign, ExternalLink } from 'lucide-react';
import api from '../lib/api';

const TRAVEL_MODES = [
  { value: 'transit', label: 'Transit', icon: Bus },
  { value: 'walking', label: 'Walking', icon: Footprints },
  { value: 'driving', label: 'Driving', icon: Navigation },
];

const TransitDirections = ({ destination, defaultOrigin }) => {
  const [origin, setOrigin] = useState(defaultOrigin || '');
  const [dest, setDest] = useState(destination || '');
  const [mode, setMode] = useState('transit');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetDirections = async (e) => {
    e.preventDefault();
    if (!origin.trim() || !dest.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/directions', {
        params: {
          origin: origin.trim(),
          destination: dest.trim(),
          mode
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        if (data.routes && data.routes.length > 0) {
          setRoute(data.routes[0]);
        } else {
          setError('No routes found between these locations');
        }
      }
    } catch (err) {
      console.error('Directions error:', err);
      setError(err.response?.data?.message || 'Failed to get directions');
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (travelMode) => {
    switch (travelMode?.toLowerCase()) {
      case 'bus':
      case 'transit':
        return Bus;
      case 'rail':
      case 'train':
      case 'subway':
      case 'tram':
        return Train;
      case 'walking':
        return Footprints;
      case 'ferry':
        return Ship;
      default:
        return Navigation;
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-2 text-brand-vibrant font-black uppercase text-[10px] tracking-[0.2em] mb-4">
        <Navigation size={14} /> Transit Directions
      </div>

      {/* Search Form */}
      <form onSubmit={handleGetDirections} className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Airport, hotel, address..."
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-base-300 focus:border-brand-vibrant focus:ring-2 focus:ring-brand-vibrant/20 outline-none font-bold text-base-content"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-vibrant" size={16} />
            <input
              type="text"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              placeholder="Destination, attraction..."
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-base-300 focus:border-brand-vibrant focus:ring-2 focus:ring-brand-vibrant/20 outline-none font-bold text-base-content"
            />
          </div>
        </div>

        {/* Travel Mode */}
        <div className="flex gap-2">
          {TRAVEL_MODES.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-sm transition-colors ${
                  mode === m.value
                    ? 'bg-brand-vibrant text-white'
                    : 'bg-base-200 text-base-content/80 hover:bg-base-300'
                }`}
              >
                <Icon size={16} /> {m.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={loading || !origin.trim() || !dest.trim()}
            className="w-full py-3 bg-brand-vibrant text-white rounded-xl font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-vibrant/20 active:scale-95 transition-transform"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            Get Directions
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=${mode === 'transit' ? 'transit' : mode === 'walking' ? 'walking' : 'driving'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-base-300 bg-base-100 hover:border-brand-vibrant/40 hover:bg-base-200 transition-all text-sm font-black text-base-content/80"
          >
            <ExternalLink size={16} /> Open Maps
          </a>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-error/10 border-l-4 border-l-red-400 rounded-xl">
          <p className="text-xs text-error font-bold">{error}</p>
        </div>
      )}

      {/* Route Results */}
      {route && route.legs && route.legs.length > 0 && route.legs[0].steps && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-brand-vibrant/5 rounded-xl border border-brand-vibrant/10">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-brand-vibrant" />
              <span className="text-sm font-bold text-base-content/80">
                {route.legs[0].duration}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-base-content/80">
                {route.legs[0].distance}
              </span>
            </div>
            {route.fare && (
              <div className="flex items-center gap-1 text-success">
                <DollarSign size={14} />
                <span className="text-sm font-bold">{route.fare.text}</span>
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {route.legs[0].steps.map((step, index) => {
              const Icon = getTransportIcon(step.travel_mode);
              const isTransit = step.transit_details;

              return (
                <div key={index} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isTransit ? 'bg-brand-vibrant/10 text-brand-vibrant' : 'bg-base-200 text-base-content/40'
                    }`}>
                      <Icon size={14} />
                    </div>
                    {index < route.legs[0].steps.length - 1 && (
                      <div className="w-0.5 h-8 bg-base-300" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-4">
                    {isTransit ? (
                      <div className="p-3 bg-brand-vibrant/5 rounded-xl border border-brand-vibrant/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-brand-vibrant">
                            {step.transit_details.line?.short || step.transit_details.line?.name}
                          </span>
                          {step.transit_details.line?.agency && (
                            <span className="text-xs text-base-content/60">
                              via {step.transit_details.line.agency}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-base-content/80 mb-1">
                          {step.transit_details.departure_stop} → {step.transit_details.arrival_stop}
                        </p>
                        <p className="text-xs text-base-content/40">
                          {step.transit_details.num_stops} stops • {step.duration}
                        </p>
                      </div>
                    ) : (
                      <div className="py-1">
                        <p className="text-sm text-base-content/80">{step.instruction}</p>
                        <p className="text-xs text-base-content/40">{step.duration} • {step.distance}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warnings */}
          {route.warnings && route.warnings.length > 0 && (
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl">
              {route.warnings.map((warning, i) => (
                <p key={`warning-${warning}-${i}`} className="text-xs text-warning">{warning}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransitDirections;
