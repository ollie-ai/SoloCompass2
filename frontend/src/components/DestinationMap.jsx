import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import LeafletMap from './LeafletMap';
import { geocoding } from '../services/geocoding';

export default function DestinationMap({ destination, className = '' }) {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (destination?.name) {
      geocodeDestination();
    }
  }, [destination]);

  const geocodeDestination = async () => {
    setLoading(true);
    const result = await geocoding.geocodeAddress(destination.name);
    if (result.success) {
      setCenter([result.data.lat, result.data.lon]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={`h-64 bg-base-200 rounded-xl animate-pulse ${className}`}>
        <div className="flex items-center justify-center h-full">
          <span className="text-base-content/40">Loading map...</span>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className={`h-64 bg-base-200 rounded-xl ${className}`}>
        <div className="flex flex-col items-center justify-center h-full text-base-content/40">
          <MapPin size={32} />
          <p className="mt-2">Map unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <LeafletMap
      center={center}
      zoom={12}
      markers={[
        {
          id: destination.id || destination.name,
          position: center,
          title: destination.name,
          description: destination.country,
        },
      ]}
      height="256px"
      className={className}
    />
  );
}