import axios from 'axios';

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';
const GEOAPIFY_BASE = 'https://api.geoapify.com/v1';

class GeocodingService {
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${GEOAPIFY_BASE}/geocode/search`, {
        params: {
          text: address,
          format: 'json',
          apiKey: GEOAPIFY_KEY,
        },
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          success: true,
          data: {
            lat: result.lat,
            lon: result.lon,
            formatted: result.formatted,
            country: result.country,
            city: result.city || result.town || result.village,
          },
        };
      }
      return { success: false, error: 'No results found' };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { success: false, error: error.message };
    }
  }

  async reverseGeocode(lat, lon) {
    try {
      const response = await axios.get(`${GEOAPIFY_BASE}/geocode/reverse`, {
        params: {
          lat,
          lon,
          format: 'json',
          apiKey: GEOAPIFY_KEY,
        },
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          success: true,
          data: {
            lat: result.lat,
            lon: result.lon,
            formatted: result.formatted,
            country: result.country,
            city: result.city || result.town || result.village,
          },
        };
      }
      return { success: false, error: 'No results found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchPlaces(query, options = {}) {
    try {
      const params = {
        text: query,
        format: 'json',
        apiKey: GEOAPIFY_KEY,
        limit: options.limit || 10,
      };
      
      if (options.near) {
        params.filter = `circle:${options.near.lon},${options.near.lat},${options.near.radius || 10000}`;
      }
      
      const response = await axios.get(`${GEOAPIFY_BASE}/geocode/search`, {
        params,
      });
      
      return {
        success: true,
        data: response.data.results || [],
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const geocoding = new GeocodingService();
export default geocoding;