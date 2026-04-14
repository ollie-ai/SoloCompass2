import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [51.505, -0.09];
const DEFAULT_ZOOM = 13;

const createCustomIcon = (color = '#10b981') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const DEFAULT_ICON = createCustomIcon('#10b981');
const ACTIVE_ICON = createCustomIcon('#3b82f6');
const YOUR_LOCATION_ICON = createCustomIcon('#f97316');

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      if (setPosition) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position ? <Marker position={position} icon={YOUR_LOCATION_ICON} /> : null;
}

export default function LeafletMap({
  center,
  zoom = DEFAULT_ZOOM,
  markers = [],
  selectedMarker = null,
  onMarkerClick = () => {},
  onMapClick = null,
  height = '400px',
  interactive = true,
  showZoomControls = true,
  className = '',
}) {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(center || DEFAULT_CENTER);

  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      setMapCenter(center);
    }
  }, [center]);

  return (
    <div className={`rounded-xl overflow-hidden border border-base-300 ${className}`} style={{ height }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={showZoomControls}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {onMapClick && (
          <MapClickHandler onClick={onMapClick} />
        )}
        
        <MapController center={mapCenter} zoom={zoom} />
        
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={marker.position || marker.latlng}
            icon={
              marker.type === 'active' ? ACTIVE_ICON :
              marker.type === 'user' ? YOUR_LOCATION_ICON :
              marker.id === selectedMarker?.id ? ACTIVE_ICON :
              DEFAULT_ICON
            }
            eventHandlers={{
              click: () => onMarkerClick(marker),
            }}
          >
            {marker.popup && (
              <Popup>
                <div className="min-w-[150px]">
                  <h3 className="font-bold text-sm">{marker.title}</h3>
                  {marker.description && (
                    <p className="text-xs text-base-content/80 mt-1">{marker.description}</p>
                  )}
                  {marker.link && (
                    <a href={marker.link} className="text-xs text-blue-600 hover:underline mt-1 block">
                      See location details →
                    </a>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

export { createCustomIcon };