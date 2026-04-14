import axios from 'axios';
import logger from './logger.js';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const venueCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCached(key) {
  const cached = venueCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  venueCache.delete(key);
  return null;
}

function setCache(key, data) {
  venueCache.set(key, { data, timestamp: Date.now() });
}

async function runOverpassQuery(query) {
  try {
    const response = await axios.post(OVERPASS_URL, query, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data.elements || [];
  } catch (error) {
    logger.error('Overpass API Error:', error.message);
    return [];
  }
}

export async function get24HourVenues(lat, lng, radius = 2000) {
  const cacheKey = `24hr:${lat}:${lng}:${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    [out:json][timeout:25];
    (
      node["opening_hours"="24/7"](around:${radius},${lat},${lng});
      node["opening_hours:wg"="24/7"](around:${radius},${lat},${lng});
      way["opening_hours"="24/7"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  const venues = await runOverpassQuery(query);
  const mapped = mapVenueData(venues);
  setCache(cacheKey, mapped);
  return mapped;
}

export async function getLateNightVenues(lat, lng, radius = 2000) {
  const cacheKey = `latenight:${lat}:${lng}:${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    [out:json][timeout:25];
    (
      node["shop"~"convenience|supermarket"](around:${radius},${lat},${lng});
      node["amenity"~"fast_food|restaurant|bar|pub|nightclub"](around:${radius},${lat},${lng});
      way["shop"~"convenience|supermarket"](around:${radius},${lat},${lng});
      way["amenity"~"fast_food|restaurant|bar|pub|nightclub"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  const venues = await runOverpassQuery(query);
  const mapped = mapVenueData(venues);
  setCache(cacheKey, mapped);
  return mapped;
}

export async function getEmergencyServices(lat, lng, radius = 5000) {
  const cacheKey = `emergency:${lat}:${lng}:${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"police"](around:${radius},${lat},${lng});
      node["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lng});
      node["emergency"="yes"](around:${radius},${lat},${lng});
      way["amenity"~"police"](around:${radius},${lat},${lng});
      way["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  const services = await runOverpassQuery(query);
  const mapped = mapEmergencyServices(services);
  setCache(cacheKey, mapped);
  return mapped;
}

export async function getPoliceStations(lat, lng, radius = 10000) {
  const cacheKey = `police:${lat}:${lng}:${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="police"](around:${radius},${lat},${lng});
      way["amenity"="police"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  const stations = await runOverpassQuery(query);
  const mapped = mapEmergencyServices(stations);
  setCache(cacheKey, mapped);
  return mapped;
}

export async function getHospitals(lat, lng, radius = 10000) {
  const cacheKey = `hospitals:${lat}:${lng}:${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"hospital|clinic"](around:${radius},${lat},${lng});
      way["amenity"~"hospital|clinic"](around:${radius},${lat},${lng});
      node["healthcare"~"hospital"](around:${radius},${lat},${lng});
      way["healthcare"~"hospital"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  const hospitals = await runOverpassQuery(query);
  const mapped = mapEmergencyServices(hospitals);
  setCache(cacheKey, mapped);
  return mapped;
}

export async function getStreetLighting(lat, lng, radius = 1000) {
  const cacheKey = `lighting:${lat}:${lng}:${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    [out:json][timeout:25];
    (
      node["highway"="street_lamp"](around:${radius},${lat},${lng});
      way["highway"="street_lamp"](around:${radius},${lat},${lng});
    );
    out count;
  `;

  const result = await runOverpassQuery(query);
  const count = Array.isArray(result) ? result.length : 0;
  
  setCache(cacheKey, { count });
  return { count };
}

function mapVenueData(elements) {
  return elements.map(el => ({
    id: el.id,
    name: el.tags?.name || 'Unnamed Venue',
    type: getVenueType(el.tags),
    lat: el.lat || (el.center?.lat),
    lon: el.lon || (el.center?.lon),
    openingHours: el.tags?.opening_hours || null,
    address: el.tags?.['addr:street'] ? 
      `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim() : null
  })).filter(v => v.lat && v.lon);
}

function mapEmergencyServices(elements) {
  return elements.map(el => ({
    id: el.id,
    name: el.tags?.name || getDefaultName(el.tags),
    type: getEmergencyType(el.tags),
    lat: el.lat || (el.center?.lat),
    lon: el.lon || (el.center?.lon),
    phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
    address: el.tags?.['addr:street'] ? 
      `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim() : null,
    openingHours: el.tags?.opening_hours || null
  })).filter(s => s.lat && s.lon);
}

function getVenueType(tags) {
  if (tags?.shop) return tags.shop;
  if (tags?.amenity === 'fast_food') return 'fast_food';
  if (tags?.amenity === 'restaurant') return 'restaurant';
  if (tags?.amenity === 'bar') return 'bar';
  if (tags?.amenity === 'pub') return 'pub';
  if (tags?.amenity === 'nightclub') return 'nightclub';
  return 'venue';
}

function getEmergencyType(tags) {
  if (tags?.amenity === 'police') return 'police';
  if (tags?.amenity === 'hospital') return 'hospital';
  if (tags?.amenity === 'clinic') return 'clinic';
  if (tags?.healthcare === 'hospital') return 'hospital';
  return 'emergency';
}

function getDefaultName(tags) {
  if (tags?.amenity === 'police') return 'Police Station';
  if (tags?.amenity === 'hospital') return 'Hospital';
  if (tags?.amenity === 'clinic') return 'Medical Clinic';
  return 'Emergency Service';
}

export function clearVenueCache() {
  venueCache.clear();
}