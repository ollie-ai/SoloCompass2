import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDirections, getTransitDirections, getWalkingDirections, getMultiStopDirections } from '../services/directionsService.js';
import logger from '../services/logger.js';

const router = express.Router();

router.use(authenticate);

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * GET /directions?origin=London&destination=Paris&mode=transit
 * Get directions between two points
 */
router.get('/', async (req, res) => {
  try {
    const { origin, destination, mode, transit_mode, alternatives } = req.query;

    if (!GOOGLE_API_KEY) {
      return res.status(503).json({
        error: 'Google Maps API not configured',
        message: 'GOOGLE_MAPS_API_KEY not set in environment'
      });
    }

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Missing origin or destination',
        message: 'Please provide both "origin" and "destination" parameters'
      });
    }

    const result = await getDirections(origin, destination, GOOGLE_API_KEY, {
      mode: mode || 'transit',
      transit_mode: transit_mode || 'bus|train|rail|subway|tram|ferry',
      alternatives: alternatives === 'true'
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`[Directions] Failed: ${error.message}`);
    res.status(500).json({
      error: 'Directions failed',
      message: error.message
    });
  }
});

/**
 * GET /directions/transit?origin=London&destination=Paris
 * Get transit directions
 */
router.get('/transit', async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!GOOGLE_API_KEY) {
      return res.status(503).json({
        error: 'Google Maps API not configured',
        message: 'GOOGLE_MAPS_API_KEY not set in environment'
      });
    }

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Missing origin or destination',
        message: 'Please provide both "origin" and "destination" parameters'
      });
    }

    const result = await getTransitDirections(origin, destination, GOOGLE_API_KEY);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`[Directions] Transit failed: ${error.message}`);
    res.status(500).json({
      error: 'Transit directions failed',
      message: error.message
    });
  }
});

/**
 * GET /directions/walking?origin=London&destination=Oxford
 * Get walking directions
 */
router.get('/walking', async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!GOOGLE_API_KEY) {
      return res.status(503).json({
        error: 'Google Maps API not configured',
        message: 'GOOGLE_MAPS_API_KEY not set in environment'
      });
    }

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Missing origin or destination',
        message: 'Please provide both "origin" and "destination" parameters'
      });
    }

    const result = await getWalkingDirections(origin, destination, GOOGLE_API_KEY);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`[Directions] Walking failed: ${error.message}`);
    res.status(500).json({
      error: 'Walking directions failed',
      message: error.message
    });
  }
});

/**
 * POST /directions/multi
 * Get directions with multiple stops
 * Body: { "stops": [{ "name": "London", "address": "London, UK" }, ...] }
 */
router.post('/multi', async (req, res) => {
  try {
    const { stops } = req.body;

    if (!GOOGLE_API_KEY) {
      return res.status(503).json({
        error: 'Google Maps API not configured',
        message: 'GOOGLE_MAPS_API_KEY not set in environment'
      });
    }

    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({
        error: 'Invalid stops',
        message: 'Please provide at least 2 stops in an array'
      });
    }

    const result = await getMultiStopDirections(stops, GOOGLE_API_KEY);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`[Directions] Multi-stop failed: ${error.message}`);
    res.status(500).json({
      error: 'Multi-stop directions failed',
      message: error.message
    });
  }
});

export default router;
