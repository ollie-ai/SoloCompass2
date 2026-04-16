import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import db from '../db.js';
import logger from '../services/logger.js';
import { searchPlaces, getPlaceDetails } from '../services/placesService.js';
import { getDirections } from '../services/directionsService.js';
import { fetchFCDOAdvisories } from '../services/fcdoService.js';

const router = express.Router();

const CULTURAL_NORMS = {
  japan: {
    greeting: 'Bow politely; avoid loud conversation on public transport.',
    dining: 'Do not tip; say "itadakimasu" before eating when appropriate.',
    safety: 'Low violent crime, but watch for scam bars in nightlife districts.'
  },
  thailand: {
    greeting: 'Use the wai greeting respectfully.',
    dining: 'Remove shoes where requested; avoid touching heads.',
    safety: 'Tourist scams occur in busy zones; verify transport fares first.'
  }
};

const OFFLINE_FAQ = new Map();
const OFFLINE_PHRASES = new Map();

router.get('/maps/places/search', authenticate, async (req, res) => {
  try {
    const { q, query, lat, lng, radius, type } = req.query;
    const searchQuery = q || query;
    if (!searchQuery) return res.status(400).json({ success: false, error: 'Missing query' });
    const data = await searchPlaces(searchQuery, {
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      radius: radius ? parseInt(radius, 10) : 5000,
      type
    });
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    logger.error(`[v1] place search failed: ${error.message}`);
    res.status(500).json({ success: false, error: 'Place search failed' });
  }
});

router.get('/maps/places/:id', authenticate, async (req, res) => {
  try {
    const data = await getPlaceDetails(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    logger.error(`[v1] place detail failed: ${error.message}`);
    res.status(500).json({ success: false, error: 'Place detail failed' });
  }
});

router.get('/maps/directions', authenticate, async (req, res) => {
  try {
    const { origin, destination, mode, alternatives } = req.query;
    if (!origin || !destination) return res.status(400).json({ success: false, error: 'Missing origin/destination' });
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(503).json({ success: false, error: 'GOOGLE_MAPS_API_KEY not configured' });
    const data = await getDirections(origin, destination, apiKey, {
      mode: mode || 'transit',
      alternatives: alternatives === 'true'
    });
    res.json({ success: true, data });
  } catch (error) {
    logger.error(`[v1] directions failed: ${error.message}`);
    res.status(500).json({ success: false, error: 'Directions failed' });
  }
});

router.get('/content/cultural-norms/:country', optionalAuth, async (req, res) => {
  const country = (req.params.country || '').toLowerCase();
  const norms = CULTURAL_NORMS[country] || {
    greeting: 'Respect local customs and personal space.',
    dining: 'Follow venue etiquette and local norms.',
    safety: 'Use official advisories and local emergency guidance.'
  };
  res.json({
    success: true,
    data: {
      country,
      version: 'v1',
      sections: [
        { type: 'greeting', guidance: norms.greeting },
        { type: 'dining', guidance: norms.dining },
        { type: 'safety', guidance: norms.safety }
      ]
    }
  });
});

router.get('/safety/advisories', authenticate, async (_req, res) => {
  try {
    const advisories = await fetchFCDOAdvisories();
    const mapped = advisories.map((a) => {
      const text = `${a.title || ''} ${a.summary || ''}`.toLowerCase();
      let level = 1;
      if (text.includes('all travel')) level = 4;
      else if (text.includes('against travel')) level = 3;
      else if (text.includes('caution')) level = 2;
      return { ...a, level };
    });
    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    logger.error(`[v1] advisories feed failed: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch advisories' });
  }
});

router.get('/destinations/recommended', authenticate, async (req, res) => {
  try {
    const profile = await db.prepare(`
      SELECT budget_level, preferred_climate, travel_style
      FROM profiles WHERE user_id = ?
    `).get(req.userId);
    let query = `
      SELECT id, name, country, city, image_url, solo_friendly_rating, budget_level, climate
      FROM destinations
      WHERE (publication_status = 'live' OR status = 'live')
    `;
    const params = [];
    if (profile?.budget_level) {
      query += ' AND budget_level = ?';
      params.push(profile.budget_level);
    }
    if (profile?.preferred_climate) {
      query += ' AND climate = ?';
      params.push(profile.preferred_climate);
    }
    if (profile?.travel_style) {
      query += ' AND travel_styles ILIKE ?';
      params.push(`%${profile.travel_style}%`);
    }
    query += ' ORDER BY solo_friendly_rating DESC NULLS LAST LIMIT 10';
    const data = await db.prepare(query).all(...params);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    logger.error(`[v1] recommended destinations failed: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch recommended destinations' });
  }
});

router.get('/offline/faq/:destination', optionalAuth, async (req, res) => {
  const key = (req.params.destination || '').toLowerCase();
  const data = OFFLINE_FAQ.get(key) || [];
  res.json({ success: true, data, count: data.length });
});

router.post('/offline/faq/:destination', authenticate, async (req, res) => {
  const key = (req.params.destination || '').toLowerCase();
  const faq = Array.isArray(req.body?.faq) ? req.body.faq.slice(0, 20) : [];
  OFFLINE_FAQ.set(key, faq);
  res.json({ success: true, data: faq, count: faq.length });
});

router.get('/offline/phrases/:destination', optionalAuth, async (req, res) => {
  const key = (req.params.destination || '').toLowerCase();
  const locale = String(req.query.locale || 'en').toLowerCase();
  const data = OFFLINE_PHRASES.get(`${key}:${locale}`) || [];
  res.json({ success: true, data, count: data.length, locale });
});

router.post('/offline/phrases/:destination', authenticate, async (req, res) => {
  const key = (req.params.destination || '').toLowerCase();
  const locale = String(req.body?.locale || 'en').toLowerCase();
  const phrases = Array.isArray(req.body?.phrases) ? req.body.phrases : [];
  OFFLINE_PHRASES.set(`${key}:${locale}`, phrases);
  res.json({ success: true, data: phrases, count: phrases.length, locale });
});

export default router;
