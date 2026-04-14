import axios from 'axios';

const ORS_KEY = import.meta.env.VITE_OPENROUTESERVICE_API_KEY || '';
const ORS_BASE = 'https://api.openrouteservice.org';
const OSRM_BASE = 'https://router.project-osrm.org';

class RoutingService {
  async getDirections(start, end, mode = 'driving') {
    if (ORS_KEY) {
      return this.getDirectionsORS(start, end, mode);
    }
    return this.getDirectionsOSRM(start, end, mode);
  }

  async getDirectionsORS(start, end, mode) {
    try {
      const modeMap = {
        driving: 'driving-car',
        walking: 'foot-walking',
        cycling: 'cycling-regular',
        public: 'public-transport',
      };
      
      const response = await axios.get(`${ORS_BASE}/v2/directions/${modeMap[mode] || 'driving-car'}`, {
        params: {
          api_key: ORS_KEY,
          start: `${start.lon},${start.lat}`,
          end: `${end.lon},${end.lat}`,
        },
      });
      
      if (response.data.features && response.data.features.length > 0) {
        const route = response.data.features[0];
        return {
          success: true,
          data: {
            geometry: route.geometry,
            distance: route.properties.segments[0].distance,
            duration: route.properties.segments[0].duration,
            steps: route.properties.segments[0].steps.map(step => ({
              instruction: step.instruction,
              distance: step.distance,
              duration: step.duration,
            })),
          },
        };
      }
      return { success: false, error: 'No route found' };
    } catch (error) {
      return this.getDirectionsOSRM(start, end, mode);
    }
  }

  async getDirectionsOSRM(start, end, mode) {
    try {
      const profile = mode === 'walking' ? 'foot' : mode === 'cycling' ? 'bike' : 'car';
      const response = await axios.get(`${OSRM_BASE}/route/v1/${profile}/${start.lon},${start.lat};${end.lon},${end.lat}`, {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true,
        },
      });

      if (response.data.code === 'Ok' && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const steps = route.legs[0].steps.map(step => ({
          instruction: step.maneuver?.modifier ? `${step.maneuver.modifier}: ${step.name || 'Continue'}` : step.name || 'Continue',
          distance: step.distance,
          duration: step.duration,
        }));

        return {
          success: true,
          data: {
            geometry: route.geometry,
            distance: route.distance,
            duration: route.duration,
            steps,
          },
        };
      }
      return { success: false, error: 'No route found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getWalkingRoute(start, end) {
    return this.getDirections(start, end, 'walking');
  }

  async getDrivingRoute(start, end) {
    return this.getDirections(start, end, 'driving');
  }

  async getIsochrones(lat, lon, options = {}) {
    if (!ORS_KEY) {
      return { success: false, error: 'Isochrones require OpenRouteService API key' };
    }
    try {
      const response = await axios.post(
        `${ORS_BASE}/v2/isochrones/driving-car`,
        {
          location: [lon, lat],
          range: [options.rangeSeconds || 900],
          range_type: 'time',
        },
        {
          params: { api_key: ORS_KEY },
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const routing = new RoutingService();
export default routing;