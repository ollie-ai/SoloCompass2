import axios from 'axios';
import logger from './logger.js';

const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';
const ORS_KEY = process.env.OPENROUTESERVICE_API_KEY || '';

const GOOGLE_BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const directionsCache = new Map();

function getCached(key) {
  const cached = directionsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
  directionsCache.delete(key);
  return null;
}

function setCache(key, data) {
  directionsCache.set(key, { data, timestamp: Date.now() });
}

const ORS_MODE_MAP = {
  transit: 'driving-car',
  walking: 'foot-walking',
  driving: 'driving-car',
  cycling: 'cycling-regular',
};

function parseORSSteps(features) {
  if (!features || features.length === 0) return [];
  const leg = features[0];
  if (!leg || !leg.segments || leg.segments.length === 0) return [];

  const steps = [];
  for (const segment of leg.segments) {
    for (const step of (segment.steps || [])) {
      steps.push({
        instruction: (step.instruction || '').replace(/<[^>]*>/g, ''),
        distance: step.distance ? `${(step.distance / 1000).toFixed(1)} km` : null,
        duration: step.duration ? `${Math.round(step.duration / 60)} min` : null,
        travel_mode: step.type || 'unknown',
        start_location: step.way_points ? step.way_points[0] : null,
        end_location: step.way_points ? step.way_points[1] : null,
      });
    }
  }
  return steps;
}

async function getORSDirections(origin, destination, mode = 'walking') {
  if (!ORS_KEY) throw new Error('OpenRouteService API key not configured');

  const orsMode = ORS_MODE_MAP[mode] || 'foot-walking';
  const url = `${ORS_BASE_URL}/${orsMode}`;

  const response = await axios.post(url, {
    coordinates: [origin, destination],
  }, {
    headers: {
      Authorization: ORS_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.data || !response.data.features || response.data.features.length === 0) {
    return { status: 'ZERO_RESULTS', routes: [], message: 'No routes found' };
  }

  const feature = response.data.features[0];
  const summary = feature.properties?.summary || {};
  const bbox = response.data.bbox || null;

  return {
    status: 'OK',
    source: 'openrouteservice',
    routes: [{
      summary: feature.geometry?.coordinates || [],
      legs: [{
        distance: summary.distance ? `${(summary.distance / 1000).toFixed(1)} km` : null,
        distance_value: summary.distance || 0,
        duration: summary.duration ? `${Math.round(summary.duration / 60)} min` : null,
        duration_value: Math.round(summary.duration || 0),
        start_address: origin.join(','),
        end_address: destination.join(','),
        steps: parseORSSteps(response.data.features),
      }],
      fare: null,
      bounds: bbox,
      warnings: ['Powered by OpenRouteService (OpenStreetMap)'],
    }],
  };
}

async function getGoogleDirections(origin, destination, mode = 'transit') {
  if (!GOOGLE_KEY) throw new Error('Google Maps API key not configured');

  const params = {
    origin: Array.isArray(origin) ? origin.join(',') : origin,
    destination: Array.isArray(destination) ? destination.join(',') : destination,
    mode,
    key: GOOGLE_KEY,
  };

  if (mode === 'transit') {
    params.transit_mode = 'bus|train|rail|subway|tram|ferry';
    params.departure_time = 'now';
  }

  const response = await axios.get(GOOGLE_BASE_URL, { params });

  if (response.data.status !== 'OK') {
    if (response.data.status === 'ZERO_RESULTS') {
      return { status: 'ZERO_RESULTS', routes: [], message: 'No routes found' };
    }
    throw new Error(response.data.error_message || `Google Directions error: ${response.data.status}`);
  }

  return {
    status: 'OK',
    source: 'google',
    routes: response.data.routes.map(route => ({
      summary: route.overview_polyline?.points || '',
      legs: route.legs.map(leg => ({
        distance: leg.distance?.text || null,
        distance_value: leg.distance?.value || 0,
        duration: leg.duration?.text || null,
        duration_value: leg.duration?.value || 0,
        departure_time: leg.departure_time?.text || null,
        arrival_time: leg.arrival_time?.text || null,
        start_address: leg.start_address || '',
        end_address: leg.end_address || '',
        steps: (leg.steps || []).map(step => ({
          instruction: (step.html_instructions || '').replace(/<[^>]*>/g, ''),
          instruction_html: step.html_instructions || '',
          distance: step.distance?.text || null,
          duration: step.duration?.text || null,
          travel_mode: step.travel_mode || 'unknown',
          transit_details: step.transit ? {
            line: step.transit.line?.name || null,
            line_short: step.transit.line?.short_name || null,
            agency: step.transit.line?.agencies?.[0]?.name || null,
            departure_stop: step.transit.departure_stop?.name || null,
            arrival_stop: step.transit.arrival_stop?.name || null,
            num_stops: step.transit.num_stops || 0,
          } : null,
          start_location: step.start_location || null,
          end_location: step.end_location || null,
        })),
      })),
      fare: route.fare ? {
        currency: route.fare.currency,
        value: route.fare.value,
        text: route.fare.text,
      } : null,
      bounds: route.bounds || null,
      warnings: route.warnings || [],
    })),
  };
}

export async function getDirections(origin, destination, _apiKey, options = {}) {
  const { mode = 'walking', transit_mode, alternatives, waypoints, optimize } = options;

  const cacheKey = `directions:${JSON.stringify(origin)}:${JSON.stringify(destination)}:${mode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    let result;

    if (ORS_KEY) {
      result = await getORSDirections(origin, destination, mode);
    } else if (GOOGLE_KEY) {
      result = await getGoogleDirections(origin, destination, mode);
    } else {
      return {
        status: 'ERROR',
        routes: [],
        message: 'No directions API configured. Set OPENROUTESERVICE_API_KEY or GOOGLE_MAPS_API_KEY.',
      };
    }

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    logger.error(`[Directions] Error: ${error.message}`);
    throw error;
  }
}

export async function getTransitDirections(origin, destination, _apiKey) {
  return getDirections(origin, destination, null, { mode: 'walking' });
}

export async function getWalkingDirections(origin, destination, _apiKey) {
  return getDirections(origin, destination, null, { mode: 'walking' });
}

export async function getDrivingDirections(origin, destination, _apiKey) {
  return getDirections(origin, destination, null, { mode: 'driving' });
}

export async function getMultiStopDirections(stops, _apiKey) {
  if (!stops || stops.length < 2) throw new Error('At least 2 stops required');
  const origin = stops[0].address;
  const destination = stops[stops.length - 1].address;

  if (ORS_KEY) {
    return getORSDirections(origin, destination, 'driving');
  } else if (GOOGLE_KEY) {
    const waypoints = stops.slice(1, -1).map(s => s.address);
    return getDirections(origin, destination, null, { mode: 'driving', waypoints, optimize: true });
  } else {
    throw new Error('No directions API configured');
  }
}

export function clearDirectionsCache() {
  directionsCache.clear();
}
