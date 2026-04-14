import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getAmazonSearchUrl, 
  getViatorSearchUrl, 
  getAgodaHotelUrl, 
  getAviasalesFlightUrl, 
  getSafetyWingUrl,
  getAffiliateLinksForDestination,
  getAffiliateLinksForTrip,
  getAffiliateStatus 
} from '../services/affiliateService.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /affiliates/status
 * Get affiliate configuration status
 */
router.get('/status', (req, res) => {
  const status = getAffiliateStatus();
  res.json({ success: true, data: status });
});

/**
 * GET /affiliates/amazon?query=travel+accessories
 * Get Amazon search URL with affiliate tag
 */
router.get('/amazon', (req, res) => {
  const { query, category } = req.query;
  
  if (!query) {
    return res.status(400).json({
      error: 'Missing query',
      message: 'Please provide a "query" parameter'
    });
  }

  const url = getAmazonSearchUrl(query, category);
  res.json({ success: true, data: { url, query, category } });
});

/**
 * GET /affiliates/viator?query= tours &location=London
 * Get Viator search URL
 */
router.get('/viator', (req, res) => {
  const { query, location } = req.query;
  
  if (!query) {
    return res.status(400).json({
      error: 'Missing query',
      message: 'Please provide a "query" parameter'
    });
  }

  const url = getViatorSearchUrl(query, location);
  res.json({ success: true, data: { url, query, location } });
});

/**
 * GET /affiliates/agoda?city=London
 * Get Agoda hotel search URL
 */
router.get('/agoda', (req, res) => {
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({
      error: 'Missing city',
      message: 'Please provide a "city" parameter'
    });
  }

  const url = getAgodaHotelUrl(city);
  res.json({ success: true, data: { url, city } });
});

/**
 * GET /affiliates/aviasales?origin=LON&destination=PAR&date=2026-04-15
 * Get Aviasales flight URL
 */
router.get('/aviasales', (req, res) => {
  const { origin, destination, date } = req.query;
  
  if (!origin || !destination) {
    return res.status(400).json({
      error: 'Missing parameters',
      message: 'Please provide both "origin" and "destination" parameters'
    });
  }

  const url = getAviasalesFlightUrl(origin, destination, date);
  res.json({ success: true, data: { url, origin, destination, date } });
});

/**
 * GET /affiliates/safetywing
 * Get SafetyWing insurance URL
 */
router.get('/safetywing', (req, res) => {
  const url = getSafetyWingUrl();
  res.json({ success: true, data: { url } });
});

/**
 * GET /affiliates/destination?city=London
 * Get all affiliate links for a destination
 */
router.get('/destination', (req, res) => {
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({
      error: 'Missing city',
      message: 'Please provide a "city" parameter'
    });
  }

  const links = getAffiliateLinksForDestination(city);
  res.json({ success: true, data: links });
});

/**
 * POST /affiliates/trip
 * Get all affiliate links for a trip
 * Body: { "destination": "Paris", "departure": { "from": "LHR", "date": "2026-04-15" }, "return": { "date": "2026-04-20" } }
 */
router.post('/trip', (req, res) => {
  const trip = req.body;
  
  if (!trip || !trip.destination) {
    return res.status(400).json({
      error: 'Invalid trip data',
      message: 'Please provide trip data with at least a destination'
    });
  }

  const links = getAffiliateLinksForTrip(trip);
  res.json({ success: true, data: links });
});

export default router;
