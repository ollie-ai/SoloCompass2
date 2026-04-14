import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import LeafletMap from './LeafletMap';
import { geocoding } from '../services/geocoding';
import api from '../lib/api';

const PLACE_TYPES = [
  { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { value: 'hotel', label: 'Hotels', icon: '🏨' },
  { value: 'attraction', label: 'Attractions', icon: '🎯' },
  { value: 'bar', label: 'Bars & Nightlife', icon: '🍺' },
  { value: 'cafe', label: 'Cafes', icon: '☕' },
  { value: 'museum', label: 'Museums', icon: '🏛️' },
  { value: 'park', label: 'Parks', icon: '🌳' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
];

export default function PlacesSearchLeaflet({ 
  destination, 
  onSelect = () => {}, 
  height = '400px',
  className = '' 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (destination) {
      geocodeDestination();
    }
  }, [destination]);

  const geocodeDestination = async () => {
    const result = await geocoding.geocodeAddress(destination);
    if (result.success) {
      setMapCenter([result.data.lat, result.data.lon]);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/places/search`, {
        params: { query: query.trim(), near: destination },
      });
      
      if (response.data.data) {
        setResults(response.data.data);
        updateMarkers(response.data.data);
      }
    } catch (error) {
      const geoResult = await geocoding.searchPlaces(`${query} ${destination}`);
      if (geoResult.success) {
        setResults(geoResult.data);
        updateMarkers(geoResult.data);
      }
    }
    setLoading(false);
  };

  const updateMarkers = (places) => {
    if (!Array.isArray(places)) return;
    setMarkers(places.map((place, idx) => ({
      id: place.place_id || idx,
      position: [place.lat || place.latitude, place.lon || place.longitude],
      title: place.name,
      description: place.address || place.formatted,
      type: 'default',
    })));
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setMapCenter([place.lat || place.latitude, place.lon || place.longitude]);
    onSelect(place);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search restaurants, hotels, attractions..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-base-100 border border-base-300 focus:border-brand-vibrant focus:ring-2 focus:ring-brand-vibrant/20 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-brand-vibrant text-white font-bold hover:bg-brand-vibrant/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLACE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setQuery(type.label);
              setTimeout(handleSearch, 100);
            }}
            className="px-3 py-1.5 rounded-lg bg-base-200 hover:bg-base-300 text-sm font-medium transition-colors"
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="text-center py-8 text-base-content/60">
              Search for places near your destination
            </div>
          )}
          
          {results.map((place) => (
            <button
              key={place.place_id || place.id}
              onClick={() => handleSelectPlace(place)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedPlace?.place_id === place.place_id
                  ? 'border-brand-vibrant bg-brand-vibrant/5'
                  : 'border-base-300 hover:border-base-300/70 bg-base-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-base-content/40 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{place.name}</h4>
                  <p className="text-xs text-base-content/60 truncate">
                    {place.address || place.formatted || place.vicinity}
                  </p>
                  {place.rating && (
                    <span className="text-xs text-warning font-medium">
                      ★ {place.rating}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <LeafletMap
          center={mapCenter}
          markers={markers}
          selectedMarker={selectedPlace}
          onMarkerClick={handleSelectPlace}
          height={height}
          className="lg:h-[400px]"
        />
      </div>
    </div>
  );
}