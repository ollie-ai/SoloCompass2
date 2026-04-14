import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCurrentWeather, getForecast, getWeatherByCoords } from '../services/weatherService.js';
import logger from '../services/logger.js';

const router = express.Router();

router.use(authenticate);

// Get OpenWeatherMap API key from environment
const OWM_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

/**
 * GET /weather/:city
 * Get current weather for a city
 */
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!OWM_API_KEY) {
      return res.status(500).json({
        error: 'Weather API not configured',
        message: 'OpenWeatherMap API key not set in environment'
      });
    }

    const weather = await getCurrentWeather(city, OWM_API_KEY);
    res.json({ success: true, data: weather });
  } catch (error) {
    logger.error(`[Weather] Fetch failed for ${req.params.city}: ${error.response?.data || error.message}`);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'City not found',
        message: `Could not find weather data for "${req.params.city}"`
      });
    }
    
    res.status(500).json({
      error: 'Weather fetch failed',
      message: error.response?.data?.message || 'Failed to fetch weather data'
    });
  }
});

/**
 * GET /weather/forecast/:city
 * Get 5-day weather forecast for a city
 */
router.get('/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!OWM_API_KEY) {
      return res.status(500).json({
        error: 'Weather API not configured',
        message: 'OpenWeatherMap API key not set in environment'
      });
    }

    const forecast = await getForecast(city, OWM_API_KEY);
    res.json({ success: true, data: forecast });
  } catch (error) {
    logger.error(`[Weather] Forecast fetch failed for ${req.params.city}: ${error.response?.data || error.message}`);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'City not found',
        message: `Could not find forecast data for "${req.params.city}"`
      });
    }
    
    res.status(500).json({
      error: 'Forecast fetch failed',
      message: error.response?.data?.message || 'Failed to fetch forecast data'
    });
  }
});

/**
 * GET /weather/coords
 * Get weather by coordinates
 */
router.get('/coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'lat and lon query parameters are required'
      });
    }
    
    if (!OWM_API_KEY) {
      return res.status(500).json({
        error: 'Weather API not configured',
        message: 'OpenWeatherMap API key not set in environment'
      });
    }

    const weather = await getWeatherByCoords(parseFloat(lat), parseFloat(lon), OWM_API_KEY);
    res.json({ success: true, data: weather });
  } catch (error) {
    logger.error(`[Weather] Coords fetch failed: ${error.response?.data || error.message}`);
    
    res.status(500).json({
      error: 'Weather fetch failed',
      message: error.response?.data?.message || 'Failed to fetch weather data'
    });
  }
});

export default router;
