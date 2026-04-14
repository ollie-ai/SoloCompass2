import axios from 'axios';
import logger from './logger.js';

// OpenWeatherMap API
// Free tier: 1,000 calls/day
// Docs: https://openweathermap.org/api

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Cache weather data for 30 minutes
const weatherCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCached(key) {
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  weatherCache.delete(key);
  return null;
}

function setCache(key, data) {
  weatherCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Get current weather for a city
 * @param {string} city - City name (e.g., "London,UK")
 * @param {string} apiKey - OpenWeatherMap API key
 */
export async function getCurrentWeather(city, apiKey) {
  const cacheKey = `current:${city}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${OWM_BASE_URL}/weather`, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric' // Celsius
      }
    });

    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temp: Math.round(response.data.main.temp),
      feels_like: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      icon_url: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
      wind_speed: response.data.wind.speed,
      visibility: response.data.visibility,
      sunrise: new Date(response.data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(response.data.sys.sunset * 1000).toLocaleTimeString()
    };

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    logger.error('Weather API Error:', error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Get 5-day forecast for a city
 * @param {string} city - City name
 * @param {string} apiKey - OpenWeatherMap API key
 */
export async function getForecast(city, apiKey) {
  const cacheKey = `forecast:${city}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${OWM_BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
        cnt: 40 // 5 days * 8 (3-hour intervals)
      }
    });

    // Group by day
    const dailyForecasts = {};
    
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!dailyForecasts[dayKey]) {
        dailyForecasts[dayKey] = {
          date: date.toISOString().split('T')[0],
          day_name: date.toLocaleDateString('en-GB', { weekday: 'short' }),
          temps: [],
          conditions: [],
          icons: []
        };
      }
      
      dailyForecasts[dayKey].temps.push(item.main.temp);
      dailyForecasts[dayKey].conditions.push(item.weather[0].description);
      dailyForecasts[dayKey].icons.push(item.weather[0].icon);
    });

    // Simplify each day to min/max temps and most common condition
    const forecast = Object.values(dailyForecasts).slice(0, 5).map(day => {
      const temps = day.temps;
      const conditions = day.conditions;
      
      // Find most common condition
      const conditionCounts = {};
      conditions.forEach(c => {
        conditionCounts[c] = (conditionCounts[c] || 0) + 1;
      });
      const mainCondition = Object.entries(conditionCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      return {
        date: day.date,
        day_name: day.day_name,
        temp_min: Math.round(Math.min(...temps)),
        temp_max: Math.round(Math.max(...temps)),
        condition: mainCondition,
        icon: day.icons[Math.floor(day.icons.length / 2)] // Middle icon
      };
    });

    const result = {
      city: response.data.city.name,
      country: response.data.city.country,
      forecast
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    logger.error('Forecast API Error:', error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Get weather by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} apiKey - OpenWeatherMap API key
 */
export async function getWeatherByCoords(lat, lon, apiKey) {
  const cacheKey = `coords:${lat},${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${OWM_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric'
      }
    });

    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temp: Math.round(response.data.main.temp),
      feels_like: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      icon_url: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
      wind_speed: response.data.wind.speed
    };

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    logger.error('Weather API Error:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Clear cache (useful for testing)
export function clearWeatherCache() {
  weatherCache.clear();
}
