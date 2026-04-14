import axios from 'axios';
import logger from './logger.js';

const policeApiBase = 'https://data.police.uk/api';

const crimeCache = new Map();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCached(key) {
  const cached = crimeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  crimeCache.delete(key);
  return null;
}

function setCache(key, data) {
  crimeCache.set(key, { data, timestamp: Date.now() });
}

export async function getCrimeData(lat, lng, date = '2025-01') {
  const cacheKey = `crime:${lat}:${lng}:${date}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${policeApiBase}/crimes-at-location`, {
      params: {
        lat,
        lng,
        date
      }
    });

    const crimes = response.data || [];
    setCache(cacheKey, crimes);
    return crimes;
  } catch (error) {
    logger.error('Crime API Error:', error.message);
    return [];
  }
}

export async function getStreetLevelCrime(lat, lng, radius = 1000) {
  const cacheKey = `street:${lat}:${lng}:${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${policeApiBase}/crimes-street/all`, {
      params: {
        lat,
        lng,
        distance: radius
      }
    });

    const crimes = response.data || [];
    setCache(cacheKey, crimes);
    return crimes;
  } catch (error) {
    logger.error('Street Crime API Error:', error.message);
    return [];
  }
}

export async function getNeighborhoodCrime(neighborhoodId) {
  if (!neighborhoodId) return null;

  const cacheKey = `neighborhood:${neighborhoodId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${policeApiBase}/${neighborhoodId}/outcomes`);
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    logger.error('Neighborhood Crime Error:', error.message);
    return null;
  }
}

export async function getNeighborhoodsForLocation(lat, lng) {
  try {
    const response = await axios.get(`${policeApiBase}/locator`, {
      params: { lat, lng }
    });
    return response.data;
  } catch (error) {
    logger.error('Neighborhood Locator Error:', error.message);
    return null;
  }
}

export async function getAllNeighborhoods(forceId) {
  if (!forceId) return [];
  try {
    const response = await axios.get(`${policeApiBase}/forces/${forceId}/neighbourhoods`);
    return response.data;
  } catch (error) {
    logger.error('Get Neighborhoods Error:', error.message);
    return [];
  }
}

export async function getNeighborhoodDetails(forceId, neighborhoodId) {
  if (!forceId || !neighborhoodId) return null;
  try {
    const response = await axios.get(`${policeApiBase}/forces/${forceId}/neighbourhoods/${neighborhoodId}`);
    return response.data;
  } catch (error) {
    logger.error('Neighborhood Details Error:', error.message);
    return null;
  }
}

export function clearCrimeCache() {
  crimeCache.clear();
}