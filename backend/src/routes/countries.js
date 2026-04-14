import express from 'express';
import { authenticate, requireAuth } from '../middleware/auth.js';
import db from '../db.js';
import logger from '../services/logger.js';
import researchOrchestrator from '../services/researchOrchestrator.js';
import notionSync from '../services/notionSync.js';

const router = express.Router();

// DEV ONLY: Create destination entry from research
router.post('/create-destination/:code', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const { code } = req.params;
    const country = await db.prepare('SELECT * FROM countries WHERE UPPER(code) = UPPER(?)').get(code.toUpperCase());
    if (!country) return res.status(404).json({ error: 'Country not found' });
    
    // Check if destination already exists
    const existing = await db.prepare('SELECT id FROM destinations WHERE name = ?').get(country.name);
    if (existing) return res.json({ success: true, message: 'Destination already exists' });
    
    // Create destination from research
    await db.query(`
      INSERT INTO destinations (name, city, country, description, highlights, safety_rating, budget_level, climate, best_months, image_url, latitude, longitude, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      country.name,
      country.capital_city || 'Capital',
      country.name,
      country.overview || `${country.name} is a great solo travel destination.`,
      country.best_regions_for_solo ? JSON.stringify(JSON.parse(country.best_regions_for_solo).slice(0, 5)) : '[]',
      country.solo_safety_score >= 7 ? 'high' : country.solo_safety_score >= 4 ? 'medium' : 'low',
      'mid',
      'temperural',
      '["April","May","June","September","October","November"]',
      country.hero_image,
      35.6762, // default Tokyo coords
      139.6503
    ]);
    
    res.json({ success: true, message: `Created destination for ${country.name}` });
  } catch (error) {
    logger.error('Error creating destination:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to sync research to Notion (if configured)
const syncToNotion = async (country) => {
  if (!process.env.NOTION_API_KEY) {
    logger.info('[Notion] No API key configured, skipping sync');
    return;
  }
  // Notion sync logic would go here
  logger.info('[Notion] Would sync:', country.name);
};

// GET /api/countries - List all countries
router.get('/', async (req, res) => {
  try {
    const { region, research_status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM countries';
    const params = [];
    const conditions = [];
    
    if (region) {
      conditions.push('region = ?');
      params.push(region);
    }
    if (research_status) {
      conditions.push('research_status = ?');
      params.push(research_status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const countries = await db.prepare(query).all(...params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM countries';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const total = await db.prepare(countQuery).get(...params.slice(0, -2)).total;
    
    res.json({
      success: true,
      data: countries,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    logger.error('Error fetching countries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch countries' });
  }
});

// GET /api/countries/:code - Single country by code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const country = await db.prepare('SELECT * FROM countries WHERE UPPER(code) = UPPER(?)').get(code.toUpperCase());
    
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    
    // Also fetch cities in this country
    const cities = await db.prepare(
      'SELECT id, name, slug, population, solo_score FROM cities WHERE country_id = ? ORDER BY population DESC'
    ).all(country.id);
    
    res.json({
      success: true,
      data: { ...country, cities }
    });
  } catch (error) {
    logger.error('Error fetching country:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch country' });
  }
});

// GET /api/countries/:code/cities - Cities in a country
router.get('/:code/cities', async (req, res) => {
  try {
    const { code } = req.params;
    const country = await db.prepare('SELECT id FROM countries WHERE UPPER(code) = UPPER(?)').get(code.toUpperCase());
    
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    
    const cities = await db.prepare(
      'SELECT * FROM cities WHERE country_id = ? ORDER BY population DESC'
    ).all(country.id);
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    logger.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
});

// GET /api/countries/filters/regions - List all regions
router.get('/filters/regions', async (req, res) => {
  try {
    const regions = await db.prepare('SELECT DISTINCT region FROM countries WHERE region IS NOT NULL ORDER BY region').all();
    
    res.json({
      success: true,
      data: regions.map(r => r.region)
    });
  } catch (error) {
    logger.error('Error fetching regions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch regions' });
  }
});

// POST /api/countries/:code/review - Review and approve country
router.post('/:code/review', requireAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const { status, notes } = req.body; // status: approved, rejected
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const result = await db.prepare(`
      UPDATE countries 
      SET publication_status = ?, 
          reviewed_by = ?, 
          reviewed_at = CURRENT_TIMESTAMP,
          notes_for_internal_review = COALESCE(notes_for_internal_review || CHAR(13) || CHAR(10), ?)
      WHERE UPPER(code) = UPPER(?)
    `).run(status, req.userId, notes || '', code.toUpperCase());
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    
    res.json({ success: true, message: `Country ${status}` });
  } catch (error) {
    logger.error('Error reviewing country:', error);
    res.status(500).json({ success: false, message: 'Failed to review country' });
  }
});

// GET /api/countries/research/queue - Get research queue
router.get('/research/queue', async (req, res) => {
  try {
    const pending = await db.prepare(
      "SELECT COUNT(*) as count FROM countries WHERE research_status = 'pending'"
    ).get();
    
    const processing = await db.prepare(
      "SELECT COUNT(*) as count FROM countries WHERE research_status = 'processing'"
    ).get();
    
    const completed = await db.prepare(
      "SELECT COUNT(*) as count FROM countries WHERE research_status = 'completed'"
    ).get();
    
    const pendingReview = await db.prepare(
      "SELECT COUNT(*) as count FROM countries WHERE publication_status = 'pending_review'"
    ).get();
    
    res.json({
      success: true,
      data: {
        pending: pending.count,
        processing: processing.count,
        completed: completed.count,
        pendingReview: pendingReview.count,
        total: pending.count + processing.count + completed.count
      }
    });
  } catch (error) {
    logger.error('Error fetching research queue:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch queue' });
  }
});

// POST /api/countries/seed - Seed countries
router.post('/seed', async (req, res) => {
  try {
    // Always allow seeding in development mode
    // In production, this would require admin authentication
    if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Country data to seed
    const countriesData = [
      { code: 'JP', name: 'Japan', region: 'Asia', subregion: 'Eastern Asia', flag_emoji: '🇯🇵', currency: 'JPY', currency_symbol: '¥', language: 'Japanese', timezone: 'Asia/Tokyo', calling_code: '+81' },
      { code: 'TH', name: 'Thailand', region: 'Asia', subregion: 'South-Eastern Asia', flag_emoji: '🇹🇭', currency: 'THB', currency_symbol: '฿', language: 'Thai', timezone: 'Asia/Bangkok', calling_code: '+66' },
      { code: 'ES', name: 'Spain', region: 'Europe', subregion: 'Southern Europe', flag_emoji: '🇪🇸', currency: 'EUR', currency_symbol: '€', language: 'Spanish', timezone: 'Europe/Madrid', calling_code: '+34' },
      { code: 'IT', name: 'Italy', region: 'Europe', subregion: 'Southern Europe', flag_emoji: '🇮🇹', currency: 'EUR', currency_symbol: '€', language: 'Italian', timezone: 'Europe/Rome', calling_code: '+39' },
      { code: 'FR', name: 'France', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇫🇷', currency: 'EUR', currency_symbol: '€', language: 'French', timezone: 'Europe/Paris', calling_code: '+33' },
      { code: 'DE', name: 'Germany', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇩🇪', currency: 'EUR', currency_symbol: '€', language: 'German', timezone: 'Europe/Berlin', calling_code: '+49' },
      { code: 'GB', name: 'United Kingdom', region: 'Europe', subregion: 'Northern Europe', flag_emoji: '🇬🇧', currency: 'GBP', currency_symbol: '£', language: 'English', timezone: 'Europe/London', calling_code: '+44' },
      { code: 'US', name: 'United States', region: 'Americas', subregion: 'Northern America', flag_emoji: '🇺🇸', currency: 'USD', currency_symbol: '$', language: 'English', timezone: 'America/New_York', calling_code: '+1' },
      { code: 'AU', name: 'Australia', region: 'Oceania', subregion: 'Australia and New Zealand', flag_emoji: '🇦🇺', currency: 'AUD', currency_symbol: '$', language: 'English', timezone: 'Australia/Sydney', calling_code: '+61' },
      { code: 'CA', name: 'Canada', region: 'Americas', subregion: 'Northern America', flag_emoji: '🇨🇦', currency: 'CAD', currency_symbol: '$', language: 'English', timezone: 'America/Toronto', calling_code: '+1' },
      { code: 'MX', name: 'Mexico', region: 'Americas', subregion: 'Central America', flag_emoji: '🇲🇽', currency: 'MXN', currency_symbol: '$', language: 'Spanish', timezone: 'America/Mexico_City', calling_code: '+52' },
      { code: 'BR', name: 'Brazil', region: 'Americas', subregion: 'South America', flag_emoji: '🇧🇷', currency: 'BRL', currency_symbol: 'R$', language: 'Portuguese', timezone: 'America/Sao_Paulo', calling_code: '+55' },
      { code: 'AR', name: 'Argentina', region: 'Americas', subregion: 'South America', flag_emoji: '🇦🇷', currency: 'ARS', currency_symbol: '$', language: 'Spanish', timezone: 'America/Argentina/Buenos_Aires', calling_code: '+54' },
      { code: 'NL', name: 'Netherlands', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇳🇱', currency: 'EUR', currency_symbol: '€', language: 'Dutch', timezone: 'Europe/Amsterdam', calling_code: '+31' },
      { code: 'BE', name: 'Belgium', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇧🇪', currency: 'EUR', currency_symbol: '€', language: 'Dutch', timezone: 'Europe/Brussels', calling_code: '+32' },
      { code: 'PT', name: 'Portugal', region: 'Europe', subregion: 'Southern Europe', flag_emoji: '🇵🇹', currency: 'EUR', currency_symbol: '€', language: 'Portuguese', timezone: 'Europe/Lisbon', calling_code: '+351' },
      { code: 'GR', name: 'Greece', region: 'Europe', subregion: 'Southern Europe', flag_emoji: '🇬🇷', currency: 'EUR', currency_symbol: '€', language: 'Greek', timezone: 'Europe/Athens', calling_code: '+30' },
      { code: 'HR', name: 'Croatia', region: 'Europe', subregion: 'Southern Europe', flag_emoji: '🇭🇷', currency: 'EUR', currency_symbol: '€', language: 'Croatian', timezone: 'Europe/Zagreb', calling_code: '+385' },
      { code: 'PL', name: 'Poland', region: 'Europe', subregion: 'Eastern Europe', flag_emoji: '🇵🇱', currency: 'PLN', currency_symbol: 'zł', language: 'Polish', timezone: 'Europe/Warsaw', calling_code: '+48' },
      { code: 'CZ', name: 'Czech Republic', region: 'Europe', subregion: 'Eastern Europe', flag_emoji: '🇨🇿', currency: 'CZK', currency_symbol: 'Kč', language: 'Czech', timezone: 'Europe/Prague', calling_code: '+420' },
      { code: 'HU', name: 'Hungary', region: 'Europe', subregion: 'Eastern Europe', flag_emoji: '🇭🇺', currency: 'HUF', currency_symbol: 'Ft', language: 'Hungarian', timezone: 'Europe/Budapest', calling_code: '+36' },
      { code: 'AT', name: 'Austria', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇦🇹', currency: 'EUR', currency_symbol: '€', language: 'German', timezone: 'Europe/Vienna', calling_code: '+43' },
      { code: 'CH', name: 'Switzerland', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇨🇭', currency: 'CHF', currency_symbol: 'Fr', language: 'German', timezone: 'Europe/Zurich', calling_code: '+41' },
      { code: 'SE', name: 'Sweden', region: 'Europe', subregion: 'Northern Europe', flag_emoji: '🇸🇪', currency: 'SEK', currency_symbol: 'kr', language: 'Swedish', timezone: 'Europe/Stockholm', calling_code: '+46' },
      { code: 'NO', name: 'Norway', region: 'Europe', subregion: 'Northern Europe', flag_emoji: '🇳🇴', currency: 'NOK', currency_symbol: 'kr', language: 'Norwegian', timezone: 'Europe/Oslo', calling_code: '+47' },
      { code: 'DK', name: 'Denmark', region: 'Europe', subregion: 'Northern Europe', flag_emoji: '🇩🇰', currency: 'DKK', currency_symbol: 'kr', language: 'Danish', timezone: 'Europe/Copenhagen', calling_code: '+45' },
      { code: 'FI', name: 'Finland', region: 'Europe', subregion: 'Northern Europe', flag_emoji: '🇫🇮', currency: 'EUR', currency_symbol: '€', language: 'Finnish', timezone: 'Europe/Helsinki', calling_code: '+358' },
      { code: 'IE', name: 'Ireland', region: 'Europe', subregion: 'Northern Europe', flag_emoji: '🇮🇪', currency: 'EUR', currency_symbol: '€', language: 'English', timezone: 'Europe/Dublin', calling_code: '+353' },
      { code: 'SG', name: 'Singapore', region: 'Asia', subregion: 'South-Eastern Asia', flag_emoji: '🇸🇬', currency: 'SGD', currency_symbol: '$', language: 'English', timezone: 'Asia/Singapore', calling_code: '+65' },
      { code: 'MY', name: 'Malaysia', region: 'Asia', subregion: 'South-Eastern Asia', flag_emoji: '🇲🇾', currency: 'MYR', currency_symbol: 'RM', language: 'Malay', timezone: 'Asia/Kuala_Lumpur', calling_code: '+60' },
      { code: 'ID', name: 'Indonesia', region: 'Asia', subregion: 'South-Eastern Asia', flag_emoji: '🇮🇩', currency: 'IDR', currency_symbol: 'Rp', language: 'Indonesian', timezone: 'Asia/Jakarta', calling_code: '+62' },
      { code: 'VN', name: 'Vietnam', region: 'Asia', subregion: 'South-Eastern Asia', flag_emoji: '🇻🇳', currency: 'VND', currency_symbol: '₫', language: 'Vietnamese', timezone: 'Asia/Ho_Chi_Minh', calling_code: '+84' },
      { code: 'PH', name: 'Philippines', region: 'Asia', subregion: 'South-Eastern Asia', flag_emoji: '🇵🇭', currency: 'PHP', currency_symbol: '₱', language: 'Filipino', timezone: 'Asia/Manila', calling_code: '+63' },
      { code: 'IN', name: 'India', region: 'Asia', subregion: 'South-Central Asia', flag_emoji: '🇮🇳', currency: 'INR', currency_symbol: '₹', language: 'Hindi', timezone: 'Asia/Kolkata', calling_code: '+91' },
      { code: 'CN', name: 'China', region: 'Asia', subregion: 'Eastern Asia', flag_emoji: '🇨🇳', currency: 'CNY', currency_symbol: '¥', language: 'Mandarin', timezone: 'Asia/Shanghai', calling_code: '+86' },
      { code: 'KR', name: 'South Korea', region: 'Asia', subregion: 'Eastern Asia', flag_emoji: '🇰🇷', currency: 'KRW', currency_symbol: '₩', language: 'Korean', timezone: 'Asia/Seoul', calling_code: '+82' },
      { code: 'TW', name: 'Taiwan', region: 'Asia', subregion: 'Eastern Asia', flag_emoji: '🇹🇼', currency: 'TWD', currency_symbol: 'NT$', language: 'Chinese', timezone: 'Asia/Taipei', calling_code: '+886' },
      { code: 'HK', name: 'Hong Kong', region: 'Asia', subregion: 'Eastern Asia', flag_emoji: '🇭🇰', currency: 'HKD', currency_symbol: '$', language: 'Chinese', timezone: 'Asia/Hong_Kong', calling_code: '+852' },
      { code: 'AE', name: 'United Arab Emirates', region: 'Asia', subregion: 'Western Asia', flag_emoji: '🇦🇪', currency: 'AED', currency_symbol: 'د.إ', language: 'Arabic', timezone: 'Asia/Dubai', calling_code: '+971' },
      { code: 'SA', name: 'Saudi Arabia', region: 'Asia', subregion: 'Western Asia', flag_emoji: '🇸🇦', currency: 'SAR', currency_symbol: 'ر.س', language: 'Arabic', timezone: 'Asia/Riyadh', calling_code: '+966' },
      { code: 'EG', name: 'Egypt', region: 'Africa', subregion: 'Northern Africa', flag_emoji: '🇪🇬', currency: 'EGP', currency_symbol: 'E£', language: 'Arabic', timezone: 'Africa/Cairo', calling_code: '+20' },
      { code: 'MA', name: 'Morocco', region: 'Africa', subregion: 'Northern Africa', flag_emoji: '🇲🇦', currency: 'MAD', currency_symbol: 'د.م.', language: 'Arabic', timezone: 'Africa/Casablanca', calling_code: '+212' },
      { code: 'ZA', name: 'South Africa', region: 'Africa', subregion: 'Southern Africa', flag_emoji: '🇿🇦', currency: 'ZAR', currency_symbol: 'R', language: 'English', timezone: 'Africa/Johannesburg', calling_code: '+27' },
      { code: 'KE', name: 'Kenya', region: 'Africa', subregion: 'Eastern Africa', flag_emoji: '🇰🇪', currency: 'KES', currency_symbol: 'KSh', language: 'Swahili', timezone: 'Africa/Nairobi', calling_code: '+254' },
      { code: 'NZ', name: 'New Zealand', region: 'Oceania', subregion: 'Australia and New Zealand', flag_emoji: '🇳🇿', currency: 'NZD', currency_symbol: '$', language: 'English', timezone: 'Pacific/Auckland', calling_code: '+64' },
      { code: 'CO', name: 'Colombia', region: 'Americas', subregion: 'South America', flag_emoji: '🇨🇴', currency: 'COP', currency_symbol: '$', language: 'Spanish', timezone: 'America/Bogota', calling_code: '+57' },
      { code: 'PE', name: 'Peru', region: 'Americas', subregion: 'South America', flag_emoji: '🇵🇪', currency: 'PEN', currency_symbol: 'S/.', language: 'Spanish', timezone: 'America/Lima', calling_code: '+51' },
      { code: 'CL', name: 'Chile', region: 'Americas', subregion: 'South America', flag_emoji: '🇨🇱', currency: 'CLP', currency_symbol: '$', language: 'Spanish', timezone: 'America/Santiago', calling_code: '+56' },
      { code: 'CR', name: 'Costa Rica', region: 'Americas', subregion: 'Central America', flag_emoji: '🇨🇷', currency: 'CRC', currency_symbol: '₡', language: 'Spanish', timezone: 'America/Costa_Rica', calling_code: '+506' },
      // Add more as needed...
    ];
    
    const insertStmt = await db.prepare(`
      INSERT INTO countries (code, name, slug, region, subregion, flag_emoji, currency, currency_symbol, language, timezone, calling_code, research_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      ON CONFLICT(code) DO UPDATE SET
        name = EXCLUDED.name,
        region = EXCLUDED.region,
        subregion = EXCLUDED.subregion,
        flag_emoji = EXCLUDED.flag_emoji,
        currency = EXCLUDED.currency,
        currency_symbol = EXCLUDED.currency_symbol,
        language = EXCLUDED.language,
        timezone = EXCLUDED.timezone,
        calling_code = EXCLUDED.calling_code
    `);
    
    let seeded = 0;
    for (const country of countriesData) {
      const slug = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
      await insertStmt.run(
        country.code,
        country.name,
        slug,
        country.region,
        country.subregion,
        country.flag_emoji,
        country.currency,
        country.currency_symbol,
        country.language,
        country.timezone,
        country.calling_code
      );
      seeded++;
    }
    
    logger.info(`✅ Seeded ${seeded} countries`);
    res.json({ success: true, message: `Seeded ${seeded} countries`, count: seeded });
  } catch (error) {
    logger.error('Error seeding countries:', error);
    res.status(500).json({ success: false, message: 'Failed to seed countries' });
  }
});

// POST /api/countries/research/:code - Research single country
router.post('/research/:code', async (req, res) => {
  // Dev bypass
  if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
}
  try {
    const { code } = req.params;
    
    logger.info(`[Research] Received request for ${code}`);
    
    // Run research synchronously and return result
    const result = await researchOrchestrator.researchCountry(code.toUpperCase());
    logger.info(`[Research] Completed for ${code}:`, result);
    
    // Try to sync to Notion
    try {
      const country = await db.prepare('SELECT * FROM countries WHERE UPPER(code) = UPPER(?)').get(code.toUpperCase());
      if (country) {
        await notionSync.syncCountryToNotion(country);
      }
    } catch (notionError) {
      logger.warn('[Notion] Sync failed:', notionError.message);
    }
    
    res.json({ success: true, message: `Research complete for ${code}`, data: result });
       
  } catch (error) {
    logger.error('Error running research:', error);
    res.status(500).json({ success: false, message: 'Failed to run research', error: error.message });
  }
});

// POST /api/countries/research-all - Research all pending countries
router.post('/research-all', async (req, res) => {
  // Dev bypass
  if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }
  try {
    res.json({ success: true, message: 'Starting bulk research...' });
    
    researchOrchestrator.researchAllCountries()
      .then(result => {
        logger.info('Bulk research complete:', result);
      })
      .catch(error => {
        logger.error('Bulk research failed:', error);
      });
      
  } catch (error) {
    logger.error('Error starting bulk research:', error);
    res.status(500).json({ success: false, message: 'Failed to start research' });
  }
});

// GET /api/countries/:code/export - Export country research as markdown
router.get('/:code/export', async (req, res) => {
  try {
    const { code } = req.params;
    const country = await db.prepare('SELECT * FROM countries WHERE UPPER(code) = UPPER(?)').get(code.toUpperCase());
    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });
    
    const cities = await db.prepare('SELECT * FROM cities WHERE country_id = ?').all(country.id);
    
    let md = `# ${country.flag_emoji} ${country.name} - Solo Travel Guide\n\n`;
    md += `**Region:** ${country.region} | **Safety Score:** ${country.solo_safety_score}/10 | **Solo Rating:** ${country.solo_friendly_rating}\n\n`;
    md += `## Overview\n${country.overview}\n\n`;
    md += `## Safety\n${country.safety_overview}\n\n`;
    md += `### Best Regions for Solo Travelers\n${country.best_regions_for_solo}\n\n`;
    md += `### Areas to Avoid\n${country.regions_to_avoid}\n\n`;
    md += `## Budget (${country.currency_symbol})\n- **Local:** ${country.budget_daily_local}/day\n- **Tourist:** ${country.budget_daily_tourist}/day\n- **Accommodation:** ${country.budget_accommodation}/night\n- **Food:** ${country.budget_food}/meal\n\n`;
    md += `## Emergency Numbers\n- **Emergency:** ${country.emergency_number}\n- **Police:** ${country.police_number}\n- **Ambulance:** ${country.ambulance_number}\n\n`;
    md += `## Solo Traveler Notes\n- **Female Solo Travelers:** ${country.solo_female_safe ? '✅ Safe' : '⚠️ Caution'}\n- **LGBTQ+ Friendly:** ${country.lgbtq_friendly ? '✅ Yes' : '⚠️ Caution'}\n- **Digital Nomad Score:** ${country.digital_nomad_score}/10\n- **Nightlife Safety:** ${country.nightlife_safety}\n\n`;
    md += `## Transportation\n${country.transport_tips}\n\n`;
    md += `## Cultural Etiquette\n${country.cultural_etiquette}\n\n`;
    md += `## Common Scams\n${country.common_scams}\n\n`;
    md += `## Local Customs\n${country.local_customs}\n\n`;
    md += `---\n\n# Cities in ${country.name}\n\n`;
    
    for (const city of cities) {
      md += `## ${city.name}\n`;
      md += `**Population:** ${city.population}\n`;
      md += `**Solo Score:** ${city.solo_score}/10\n`;
      if (city.overview) md += `\n${city.overview}\n`;
      if (city.best_neighborhoods_for_solo) md += `\n### Best Neighborhoods\n${city.best_neighborhoods_for_solo}\n`;
      if (city.areas_to_avoid) md += `\n### Areas to Avoid\n${city.areas_to_avoid}\n`;
      if (city.transport_tips) md += `\n### Transportation\n${city.transport_tips}\n`;
      if (city.emergency_info) md += `\n### Emergency\n${city.emergency_info}\n`;
      if (city.avg_daily_budget) md += `\n### Budget: ¥${city.avg_daily_budget}/day\n`;
      md += `\n---\n\n`;
    }
    
    res.json({ success: true, markdown: md });
  } catch (error) {
    logger.error('Error exporting country:', error);
    res.status(500).json({ success: false, message: 'Failed to export' });
  }
});

export default router;