import express from 'express';
import { fetchFCDOAdvisories } from '../services/fcdoService.js';
import { authenticate } from '../middleware/auth.js';
import { sendAdvisoryNotification } from '../services/notificationService.js';
import db from '../db.js';
import logger from '../services/logger.js';
import { getEmergencyNumbers, getEmergencyNumbersByCountryName, getAllEmergencyNumbers } from '../data/emergencyNumbers.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const advisories = await fetchFCDOAdvisories();
    
    const trips = await db.prepare(`
      SELECT * FROM trips WHERE user_id = ? AND status IN ('planning', 'confirmed')
    `).all(req.userId);

    const tripCountries = new Set(trips.map(t => t.destination?.toLowerCase()));

    for (const advisory of advisories) {
      if (!tripCountries.has(advisory.country?.toLowerCase())) continue;

      const existing = await db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND type = 'advisory' AND title = ? 
        ORDER BY created_at DESC LIMIT 1
      `).get(req.userId, `Advisory: ${advisory.country}`);

      if (!existing) {
        const matchingTrip = trips.find(t => t.destination?.toLowerCase() === advisory.country?.toLowerCase());
        await sendAdvisoryNotification(req.userId, { ...advisory, tripId: matchingTrip?.id });
      }
    }
    
    res.json({
      success: true,
      count: advisories.length,
      data: advisories,
      source: 'https://www.gov.uk/foreign-travel-advice.atom',
      last_refreshed: new Date().toISOString(),
      authenticated: !!req.userId
    });
  } catch (error) {
    logger.error(`[Advisories] Failed to fetch: ${error.message}`);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch travel advisories' } });
  }
});



router.get('/emergency-numbers/:countryCode?', async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    if (countryCode) {
      const numbers = getEmergencyNumbers(countryCode) || getEmergencyNumbersByCountryName(countryCode);
      if (!numbers) {
        return res.json({ success: true, data: null, message: 'No emergency numbers found for this country' });
      }
      return res.json({ success: true, data: numbers });
    }
    
    res.json({ success: true, data: getAllEmergencyNumbers() });
  } catch (error) {
    logger.error(`[Emergency Numbers] Failed to fetch: ${error.message}`);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch emergency numbers' } });
  }
});

export default router;
