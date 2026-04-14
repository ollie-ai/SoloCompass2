import { useEffect, useRef } from 'react';

const GoogleMap = ({ lat, lng, zoom = 12, title }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Wait for window.google to be available if not already
    if (!window.google || !mapRef.current) {
        const timer = setInterval(() => {
            if (window.google && mapRef.current) {
                clearInterval(timer);
                initMap();
            }
        }, 100);
        return () => clearInterval(timer);
    } else {
        initMap();
    }

    function initMap() {
      if (mapInstanceRef.current || !lat || !lng) return;

      const latVal = parseFloat(lat);
      const lngVal = parseFloat(lng);

      if (isNaN(latVal) || isNaN(lngVal)) return;

      const position = { lat: latVal, lng: lngVal };
      
      try {
        const google = window.google;
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: zoom,
          styles: [
            {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
            },
            {
              "featureType": "landscape",
              "elementType": "geometry",
              "stylers": [{ "color": "#f5f5f5" }]
            },
            {
               "featureType": "water",
               "elementType": "geometry",
               "stylers": [{ "color": "#e9e9e9" }]
            }
          ],
          disableDefaultUI: true,
          zoomControl: true,
        });

        new google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: title,
          animation: google.maps.Animation.DROP
        });
      } catch (e) {
          console.error('Google Map Init Error:', e);
      }
    }
  }, [lat, lng, zoom, title]);

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-inner border border-base-300/50 bg-base-200">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="glass-card px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-base-content border border-white/50 shadow-lg bg-base-100/70 backdrop-blur-sm">
           Live Satellite Feed
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;
