import express from 'express';
import { authenticate, requireAuth } from '../middleware/auth.js';
import db from '../db.js';
import logger from '../services/logger.js';
import cityResearchOrchestrator from '../services/cityResearchOrchestrator.js';

const router = express.Router();

// GET /api/cities - List all cities
router.get('/', async (req, res) => {
  try {
    const { country_id, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT c.*, co.name as country_name, co.code as country_code FROM cities c LEFT JOIN countries co ON c.country_id = co.id';
    const params = [];
    
    if (country_id) {
      query += ' WHERE c.country_id = ?';
      params.push(country_id);
    }
    
    query += ' ORDER BY c.population DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const cities = await db.prepare(query).all(...params);
    res.json({ success: true, data: cities });
  } catch (error) {
    logger.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
});

// GET /api/cities/:slug - Single city by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const city = await db.prepare(`
      SELECT c.*, co.name as country_name, co.code as country_code, co.flag_emoji 
      FROM cities c 
      LEFT JOIN countries co ON c.country_id = co.id 
      WHERE c.slug = ?
    `).get(slug);
    
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    
    res.json({ success: true, data: city });
  } catch (error) {
    logger.error('Error fetching city:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch city' });
  }
});

// POST /api/cities - Add a city
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, country_id, population, slug } = req.body;
    
    if (!name || !country_id) {
      return res.status(400).json({ success: false, message: 'Name and country_id required' });
    }
    
    const citySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const result = await db.prepare(`
      INSERT INTO cities (name, slug, country_id, population, research_status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(name, citySlug, country_id, population || null);
    
    res.json({ success: true, data: { id: result.lastInsertRowid, name, slug: citySlug } });
  } catch (error) {
    logger.error('Error creating city:', error);
    res.status(500).json({ success: false, message: 'Failed to create city' });
  }
});

// POST /api/cities/seed-popular - Seed popular cities for a country
router.post('/seed-popular/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    // Dev bypass - allow seeding in development mode
    if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    
    const country = await db.prepare('SELECT * FROM countries WHERE UPPER(code) = UPPER(?)').get(countryCode.toUpperCase());
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    
    // Popular cities data - would come from AI or external API in production
    const popularCities = {
      JP: [
        { name: 'Tokyo', population: 13960000 },
        { name: 'Osaka', population: 2752000 },
        { name: 'Kyoto', population: 1475000 },
        { name: 'Nagoya', population: 2325000 },
        { name: 'Sapporo', population: 1973000 },
        { name: 'Fukuoka', population: 1559000 },
        { name: 'Hiroshima', population: 1204000 },
        { name: 'Yokohama', population: 3745000 }
      ],
      TH: [
        { name: 'Bangkok', population: 10530000 },
        { name: 'Phuket', population: 416582 },
        { name: 'Chiang Mai', population: 131091 },
        { name: 'Pattaya', population: 320000 },
        { name: 'Koh Samui', population: 60000 }
      ],
      ES: [
        { name: 'Madrid', population: 3223000 },
        { name: 'Barcelona', population: 1620000 },
        { name: 'Seville', population: 688000 },
        { name: 'Valencia', population: 794000 },
        { name: 'Malaga', population: 571000 }
      ],
      IT: [
        { name: 'Rome', population: 2873000 },
        { name: 'Milan', population: 1374000 },
        { name: 'Naples', population: 3085000 },
        { name: 'Florence', population: 382808 },
        { name: 'Venice', population: 261905 }
      ],
      FR: [
        { name: 'Paris', population: 2161000 },
        { name: 'Marseille', population: 870731 },
        { name: 'Lyon', population: 516092 },
        { name: 'Toulouse', population: 471000 },
        { name: 'Nice', population: 342522 }
      ],
      // Add more countries as needed...
    };
    
    const cities = popularCities[countryCode] || [];
    let seeded = 0;
    
    for (const city of cities) {
      const slug = city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      await db.prepare(`
        INSERT INTO cities (name, slug, country_id, population, research_status)
        VALUES (?, ?, ?, ?, 'pending')
        ON CONFLICT(slug) DO UPDATE SET population = EXCLUDED.population
      `).run(city.name, slug, country.id, city.population);
      
      seeded++;
    }
    
    res.json({ success: true, message: `Seeded ${seeded} cities for ${country.name}`, count: seeded });
  } catch (error) {
    logger.error('Error seeding cities:', error);
    res.status(500).json({ success: false, message: 'Failed to seed cities' });
  }
});

// POST /api/cities/research/:id - Research single city
router.post('/research/:id', async (req, res) => {
  try {
    // Dev bypass
    if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    
    const { id } = req.params;
    
    // Run synchronously
    const result = await cityResearchOrchestrator.researchCity(id);
    logger.info(`City research complete:`, result);
    
    res.json({ success: true, message: `Research complete for city ID ${id}`, data: result });
       
  } catch (error) {
    logger.error('Error running city research:', error);
    res.status(500).json({ success: false, message: 'Failed to run research', error: error.message });
  }
});

// POST /api/cities/research-all - Research all pending cities
router.post('/research-all', async (req, res) => {
  try {
    // Dev bypass
    if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    
    res.json({ success: true, message: 'Starting bulk city research...' });
    
    cityResearchOrchestrator.researchAllCities()
      .then(result => logger.info('Bulk city research complete:', result))
      .catch(error => logger.error('Bulk city research failed:', error));
      
  } catch (error) {
    logger.error('Error starting bulk research:', error);
    res.status(500).json({ success: false, message: 'Failed to start research' });
  }
});

export default router;