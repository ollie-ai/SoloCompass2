import express from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { premiumOnly } from '../middleware/paywall.js';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { getAffiliateLinksForDestination } from '../services/affiliateService.js';
import logger from '../services/logger.js';
import * as countryResearchService from '../services/countryResearchService.js';
import * as countryEligibilityService from '../services/countryEligibilityService.js';
import * as advisoryIngestionService from '../services/advisoryIngestionService.js';

const router = express.Router();

const safeJsonParse = (str, fallbackVal = []) => {
  if (!str) return fallbackVal;
  try { return JSON.parse(str); } catch { return fallbackVal; }
};

// Get all destinations with optional filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      country, 
      budget_level, 
      climate, 
      travel_style,
      solo_friendly_min,
      search,
      filter,
      level,
      limit = 20, 
      offset = 0 
    } = req.query;

    let query = `SELECT 
      id, 
      COALESCE(title, name) as title,
      name, 
      slug, 
      destination_level, 
      parent_destination_id,
      country, 
      city, 
      description, 
      highlights, 
      travel_styles, 
      budget_level, 
      climate, 
      best_months, 
      safety_rating, 
      solo_friendly_rating, 
      image_url, 
      publication_status, 
      safety_gate_status, 
      manual_review_status,
      advisory_stance, 
      content_fresh_until, 
      research_status,
      fcdo_slug,
      short_summary,
      ideal_trip_length,
      solo_fit_tags,
      best_for_tags,
      source,
      status, 
      created_at
    FROM destinations WHERE 1=1`;
    
    const params = [];

    // Handle level filter (country/city)
    if (level && level !== 'all') {
      query += ' AND destination_level = ?';
      params.push(level);
    }

    // Handle filter parameter for status-based filtering
    if (filter) {
      switch (filter) {
        case 'draft':
          query += ` AND (publication_status = 'draft' OR publication_status IS NULL)`;
          break;
        case 'in_progress':
          query += ` AND research_status = 'in_progress'`;
          break;
        case 'pending_review':
          query += ` AND manual_review_status = 'pending'`;
          break;
        case 'live':
          query += ` AND publication_status = 'live' 
                   AND safety_gate_status = 'pass' 
                   AND manual_review_status = 'approved'
                   AND (content_fresh_until IS NULL OR content_fresh_until > NOW())`;
          break;
        case 'paused':
          query += ` AND publication_status = 'paused'`;
          break;
        case 'blocked':
          query += ` AND publication_status = 'blocked'`;
          break;
        case 'stale':
          query += ` AND (content_fresh_until IS NOT NULL AND content_fresh_until <= NOW())`;
          break;
        case 'needs_review':
          query += ` AND (
            (safety_gate_status = 'unchecked') OR 
            (manual_review_status IN ('pending', 'rejected')) OR
            (content_fresh_until IS NOT NULL AND content_fresh_until <= NOW())
          )`;
          break;
        case 'research_in_progress':
          query += ` AND research_status = 'in_progress'`;
          break;
        case 'publish_ready':
          query += ` AND publication_status = 'draft' 
                   AND safety_gate_status = 'pass' 
                   AND manual_review_status = 'approved'`;
          break;
        case 'research_failed':
          query += ` AND research_status = 'failed'`;
          break;
        case 'research_not_started':
          query += ` AND (research_status IS NULL OR research_status = 'not_started')`;
          break;
        case 'research_complete':
          query += ` AND research_status = 'complete'`;
          break;
        default:
          // Apply full gating for non-admins
          if (req.userRole !== 'admin') {
            query += ` AND publication_status = 'live' 
                     AND safety_gate_status = 'pass' 
                     AND manual_review_status = 'approved'
                     AND (content_fresh_until IS NULL OR content_fresh_until > NOW())`;
          }
      }
    } else if (req.userRole !== 'admin') {
      // No filter - apply full gating for non-admins
      query += ` AND publication_status = 'live' 
               AND safety_gate_status = 'pass' 
               AND manual_review_status = 'approved'
               AND (content_fresh_until IS NULL OR content_fresh_until > NOW())`;
    }

    if (search) {
      query += ' AND (name ILIKE ? OR country ILIKE ? OR city ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }

    if (budget_level) {
      query += ' AND budget_level = ?';
      params.push(budget_level);
    }

    if (climate) {
      query += ' AND climate = ?';
      params.push(climate);
    }

    if (travel_style) {
      query += ' AND travel_styles ILIKE ?';
      params.push(`%${travel_style}%`);
    }

    if (solo_friendly_min) {
      query += ' AND solo_friendly_rating >= ?';
      params.push(parseInt(solo_friendly_min));
    }

    // Sorting logic
    const sort = req.query.sort || 'popularity';
    const sortMap = {
      popularity: 'solo_friendly_rating DESC',
      safety: "CASE safety_rating WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC, solo_friendly_rating DESC",
      name: 'name ASC',
      newest: 'created_at DESC'
    };
    const safeSortClause = sortMap[sort] || sortMap.popularity;

    query += ` ORDER BY ${safeSortClause}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const destinations = await db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM destinations WHERE 1=1';
    const countParams = [];
    
    // Apply level filter to count query
    if (level && level !== 'all') {
      countQuery += ' AND destination_level = ?';
      countParams.push(level);
    }
    
    // Apply filter to count query as well
    if (filter) {
      switch (filter) {
        case 'draft':
          countQuery += ` AND (publication_status = 'draft' OR publication_status IS NULL)`;
          break;
        case 'in_progress':
          countQuery += ` AND research_status = 'in_progress'`;
          break;
        case 'pending_review':
          countQuery += ` AND manual_review_status = 'pending'`;
          break;
        case 'live':
          countQuery += ` AND publication_status = 'live' 
                        AND safety_gate_status = 'pass' 
                        AND manual_review_status = 'approved'
                        AND (content_fresh_until IS NULL OR content_fresh_until > NOW())`;
          break;
        case 'paused':
          countQuery += ` AND publication_status = 'paused'`;
          break;
        case 'blocked':
          countQuery += ` AND publication_status = 'blocked'`;
          break;
        case 'stale':
          countQuery += ` AND (content_fresh_until IS NOT NULL AND content_fresh_until <= NOW())`;
          break;
        case 'needs_review':
          countQuery += ` AND (
            (safety_gate_status = 'unchecked') OR 
            (manual_review_status IN ('pending', 'rejected')) OR
            (content_fresh_until IS NOT NULL AND content_fresh_until <= NOW())
          )`;
          break;
        case 'research_in_progress':
          countQuery += ` AND research_status = 'in_progress'`;
          break;
        default:
          if (req.userRole !== 'admin') {
            countQuery += ` AND publication_status = 'live' 
                          AND safety_gate_status = 'pass' 
                          AND manual_review_status = 'approved'
                          AND (content_fresh_until IS NULL OR content_fresh_until > NOW())`;
          }
      }
    } else if (req.userRole !== 'admin') {
      countQuery += ` AND publication_status = 'live' 
                    AND safety_gate_status = 'pass' 
                    AND manual_review_status = 'approved'
                    AND (content_fresh_until IS NULL OR content_fresh_until > NOW())`;
    }
    if (search) { countQuery += ' AND (name ILIKE ? OR country ILIKE ? OR city ILIKE ?)'; countParams.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (country) { countQuery += ' AND country = ?'; countParams.push(country); }
    if (budget_level) { countQuery += ' AND budget_level = ?'; countParams.push(budget_level); }
    if (climate) { countQuery += ' AND climate = ?'; countParams.push(climate); }
    if (travel_style) { countQuery += ' AND travel_styles ILIKE ?'; countParams.push(`%${travel_style}%`); }
    if (solo_friendly_min) { countQuery += ' AND solo_friendly_rating >= ?'; countParams.push(parseInt(solo_friendly_min)); }
    
    const { total } = await db.prepare(countQuery).get(...countParams);

    // Parse JSON fields
    const parsedDestinations = destinations.map(dest => ({
      ...dest,
      highlights: safeJsonParse(dest.highlights, []),
      travel_styles: safeJsonParse(dest.travel_styles, []),
      best_months: safeJsonParse(dest.best_months, [])
    }));

    res.json({
      success: true,
      data: parsedDestinations,
      total,
      count: parsedDestinations.length
    });
  } catch (error) {
    logger.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations'
    });
  }
});

// Get destination by ID or by name
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    let destination;
    const isNumeric = /^\d+$/.test(id);
    
    if (isNumeric) {
      destination = await db.prepare(`SELECT 
        id, name, country, city, description, highlights, travel_styles, 
        budget_level, climate, best_months, safety_rating, solo_friendly_rating, 
        image_url, latitude, longitude, emergency_contacts, safety_intelligence,
        status, source, created_at, updated_at
      FROM destinations WHERE id = ?`).get(id);
    } else {
      destination = await db.prepare(`SELECT 
        id, name, country, city, description, highlights, travel_styles, 
        budget_level, climate, best_months, safety_rating, solo_friendly_rating, 
        image_url, latitude, longitude, emergency_contacts, safety_intelligence,
        status, source, created_at, updated_at
      FROM destinations WHERE LOWER(name) = LOWER(?) OR LOWER(country) = LOWER(?)`).get(id, id);
    }

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Security: Check status for non-admins
    if (req.userRole !== 'admin' && destination.status !== 'live') {
      return res.status(403).json({
        success: false,
        message: 'Destination is pending moderation'
      });
    }

    // Parse JSON fields
    const parsedDestination = {
      ...destination,
      highlights: safeJsonParse(destination.highlights, []),
      travel_styles: safeJsonParse(destination.travel_styles, []),
      best_months: safeJsonParse(destination.best_months, []),
      emergency_contacts: safeJsonParse(destination.emergency_contacts, {}),
      safety_intelligence: safeJsonParse(destination.safety_intelligence, '')
    };

    res.json({
      success: true,
      data: parsedDestination
    });
  } catch (error) {
    logger.error('Error fetching destination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destination'
    });
  }
});

// Get destination by slug - returns full schema including new trust fields
router.get('/by-slug/:slug', authenticate, async (req, res) => {
  try {
    const { slug } = req.params;

    const destination = await db.prepare(`
      SELECT 
        id, 
        COALESCE(title, name) as title,
        name,
        slug, 
        destination_level, 
        parent_destination_id,
        country, 
        city, 
        description, 
        highlights, 
        travel_styles, 
        best_months, 
        short_summary, 
        why_solo_travellers,
        budget_level, 
        climate, 
        image_url, 
        latitude, longitude, 
        region as region_name,
        region,
        timezone, 
        primary_city,
        safety_rating, 
        solo_friendly_rating,
        publication_status, 
        safety_gate_status, 
        manual_review_status,
        advisory_stance, 
        advisory_checked_at, 
        advisory_source, 
        advisory_summary,
        content_fresh_until, 
        research_status,
        research_workflow_state,
        research_completeness_score,
        source_label,
        launch_cities,
        emergency_contacts, 
        safety_intelligence,
        common_risks, 
        safer_areas_summary, 
        areas_extra_caution,
        after_dark_guidance, 
        transport_safety_notes, 
        women_solo_notes,
        fcdo_slug,
        solo_fit_tags,
        best_for_tags,
        arrival_tips,
        local_etiquette_notes,
        lgbtq_notes,
        neighbourhood_shortlist,
        ideal_trip_length,
        ai_card_summary,
        ai_safety_brief,
        ai_solo_suitability,
        ai_arrival_checklist,
        ai_neighbourhood_guidance,
        ai_after_dark,
        ai_common_friction,
        ai_quick_facts,
        ai_fallback_summary,
        source, 
        created_at, 
        updated_at
      FROM destinations 
      WHERE slug = ?
    `).get(slug);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Security: Check full gating for non-admins
    if (req.userRole !== 'admin') {
      const isEligible = 
        destination.publication_status === 'live' &&
        destination.safety_gate_status === 'pass' &&
        destination.manual_review_status === 'approved' &&
        (!destination.content_fresh_until || new Date(destination.content_fresh_until) > new Date());
      
      if (!isEligible) {
        return res.status(403).json({
          success: false,
          message: 'Destination is not publicly available'
        });
      }
    }

    // Build content_blocks structure for frontend
    const content_blocks = {
      card_summary: destination.ai_card_summary ? { content: destination.ai_card_summary } : null,
      solo_suitability: destination.ai_solo_suitability ? { content: destination.ai_solo_suitability } : null,
      safety_brief: destination.ai_safety_brief ? { content: destination.ai_safety_brief } : null,
      friction_points: destination.ai_common_friction ? { content: destination.ai_common_friction } : null,
      quick_facts: destination.ai_quick_facts ? { content: destination.ai_quick_facts } : null,
      arrival_checklist: destination.ai_arrival_checklist ? { content: destination.ai_arrival_checklist } : null,
      neighbourhood_guidance: destination.ai_neighbourhood_guidance ? { content: destination.ai_neighbourhood_guidance } : null,
      after_dark: destination.ai_after_dark ? { content: destination.ai_after_dark } : null,
    };

    // Parse JSON fields
    const parsedDestination = {
      ...destination,
      highlights: safeJsonParse(destination.highlights, []),
      travel_styles: safeJsonParse(destination.travel_styles, []),
      best_months: safeJsonParse(destination.best_months, []),
      emergency_contacts: safeJsonParse(destination.emergency_contacts, {}),
      safety_intelligence: safeJsonParse(destination.safety_intelligence, ''),
      solo_fit_tags: safeJsonParse(destination.solo_fit_tags, []),
      best_for_tags: safeJsonParse(destination.best_for_tags, []),
      content_blocks,
    };

    // If this is a country, fetch linked cities
    if (destination.destination_level === 'country') {
      const linkedCities = await db.prepare(`
        SELECT id, slug, name, city, image_url, solo_friendly_rating, safety_rating
        FROM destinations 
        WHERE parent_destination_id = ? OR (country = ? AND destination_level = 'city')
        ORDER BY solo_friendly_rating DESC
        LIMIT 20
      `).all(destination.id, destination.country);
      parsedDestination.linked_cities = linkedCities;
    }

    res.json({
      success: true,
      data: parsedDestination
    });
  } catch (error) {
    logger.error('Error fetching destination by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destination'
    });
  }
});

// POST /api/destinations/:id/run-research - Run AI research for a destination
router.post('/:id/run-research', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await countryResearchService.runFullResearch(parseInt(id));
    res.json(result);
  } catch (error) {
    logger.error('Error running research:', error);
    res.status(500).json({ success: false, message: 'Failed to run research' });
  }
});

// GET /:id/research-pack - Get full research pack for admin review
router.get('/:id/research-pack', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pack = await countryResearchService.getResearchPack(parseInt(id));
    res.json({ success: true, data: pack });
  } catch (error) {
    logger.error('Error fetching research pack:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch research pack' });
  }
});

// GET /:id/eligibility - Check if destination can go live
router.get('/:id/eligibility', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const eligibility = await countryEligibilityService.checkEligibility(parseInt(id));
    res.json({ success: true, data: eligibility });
  } catch (error) {
    logger.error('Error checking eligibility:', error);
    res.status(500).json({ success: false, message: 'Failed to check eligibility' });
  }
});

// POST /:id/publish - Publish with eligibility check
router.post('/:id/publish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await countryResearchService.publishDestination(parseInt(id));
    res.json(result);
  } catch (error) {
    logger.error('Error publishing destination:', error);
    res.status(500).json({ success: false, message: 'Failed to publish destination' });
  }
});

// POST /:id/generate-ai - Generate AI summaries only
router.post('/:id/generate-ai', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await countryResearchService.generateAISummaries(parseInt(id));
    res.json(result);
  } catch (error) {
    logger.error('Error generating AI summaries:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI summaries' });
  }
});

// POST /:id/suggest-cities - Suggest cities for a country
router.post('/:id/suggest-cities', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { count = 3 } = req.body;
    const result = await countryResearchService.suggestCities(parseInt(id), count);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error suggesting cities:', error);
    res.status(500).json({ success: false, message: 'Failed to suggest cities' });
  }
});

// PUT /:id/advisory - Update advisory data (manual input)
router.put('/:id/advisory', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const advisoryData = req.body;
    const result = await advisoryIngestionService.updateAdvisory(parseInt(id), advisoryData);
    res.json(result);
  } catch (error) {
    logger.error('Error updating advisory:', error);
    res.status(500).json({ success: false, message: 'Failed to update advisory' });
  }
});

// POST /api/destinations/:id/approve - Approve/reject destination for publication
router.post('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await db.prepare(`
      UPDATE destinations 
      SET manual_review_status = ?,
          reviewer = ?,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, req.userId, id);

    // Auto-publish if approved
    if (status === 'approved') {
      await db.prepare(`
        UPDATE destinations 
        SET publication_status = 'live',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND safety_gate_status = 'pass'
      `).run(id);
    }

    res.json({ success: true, message: `Destination ${status}` });
  } catch (error) {
    logger.error('Error approving destination:', error);
    res.status(500).json({ success: false, message: 'Failed to approve destination' });
  }
});

// POST /api/destinations/:id/run-safety-gate - Run safety gate check
router.post('/:id/run-safety-gate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get destination
    const destination = await db.prepare('SELECT * FROM destinations WHERE id = ?').get(id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // Run safety gate logic - check advisory status
    let safetyGateStatus = 'pass';
    
    // Check advisory stance
    if (destination.advisory_stance === 'advise_against_all') {
      safetyGateStatus = 'fail';
    } else if (destination.advisory_stance === 'advise_against') {
      // Could be pass or fail depending on other factors
      safetyGateStatus = 'pass'; // Still pass but with caution
    }

    await db.prepare(`
      UPDATE destinations 
      SET safety_gate_status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(safetyGateStatus, id);

    res.json({ success: true, safety_gate_status: safetyGateStatus });
  } catch (error) {
    logger.error('Error running safety gate:', error);
    res.status(500).json({ success: false, message: 'Failed to run safety gate' });
  }
});

// Get recommended destinations based on user preferences
router.get('/recommendations/me', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user preferences (may not exist if user hasn't taken quiz)
    let profile = null;
    try {
      profile = await db.prepare(`SELECT 
      budget_level, preferred_climate, travel_style
    FROM profiles WHERE user_id = ?`).get(userId);
    } catch (profileError) {
      // Profile table might not have data yet, continue without profile
      logger.warn('No profile found for user:', userId);
    }

    let query = `SELECT 
      id, name, country, city, description, highlights, travel_styles, 
      budget_level, climate, best_months, safety_rating, solo_friendly_rating, 
      image_url, status, created_at
    FROM destinations WHERE 1=1`;
    const params = [];
    
    // Recommendations only from live data
    if (req.userRole !== 'admin') {
      query += " AND status = 'live'";
    }
    
    const basedOn = {};

    // Filter by user preferences if available
    if (profile) {
      if (profile.budget_level) {
        query += ' AND budget_level = ?';
        params.push(profile.budget_level);
        basedOn.budget_level = profile.budget_level;
      }

      if (profile.preferred_climate) {
        query += ' AND climate = ?';
        params.push(profile.preferred_climate);
        basedOn.preferred_climate = profile.preferred_climate;
      }

      if (profile.travel_style) {
        query += ' AND travel_styles ILIKE ?';
        params.push(`%${profile.travel_style}%`);
        basedOn.travel_style = profile.travel_style;
      }
    }

    // Always prioritize solo-friendly destinations
    query += ' ORDER BY solo_friendly_rating DESC';
    query += ' LIMIT 10';

    let destinations = await db.prepare(query).all(...params);

    // FALLBACK: If no destinations match specific style/climate/budget, get general top solo destinations
    if (destinations.length === 0) {
      logger.info('No matches for preferences, falling back to top solo-friendly destinations');
      let fallbackQuery = `SELECT 
      id, name, country, city, description, highlights, travel_styles, 
      budget_level, climate, best_months, safety_rating, solo_friendly_rating, 
      image_url, status, created_at
    FROM destinations WHERE 1=1`;
      if (req.userRole !== 'admin') {
        fallbackQuery += " AND status = 'live'";
      }
      fallbackQuery += " ORDER BY solo_friendly_rating DESC LIMIT 10";
      destinations = await db.prepare(fallbackQuery).all();
    }

    // Parse JSON fields
    const parsedDestinations = destinations.map(dest => ({
      ...dest,
      highlights: safeJsonParse(dest.highlights, []),
      travel_styles: safeJsonParse(dest.travel_styles, []),
      best_months: safeJsonParse(dest.best_months, [])
    }));

    res.json({
      success: true,
      data: parsedDestinations,
      count: parsedDestinations.length,
      based_on: basedOn
    });
  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

// Get all unique countries for filtering
router.get('/filters/countries', authenticate, async (req, res) => {
  try {
    const countries = await db.prepare('SELECT DISTINCT country FROM destinations ORDER BY country').all();
    
    res.json({
      success: true,
      data: countries.map(c => c.country)
    });
  } catch (error) {
    logger.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries'
    });
  }
});

// Get all unique travel styles for filtering
router.get('/filters/styles', authenticate, async (req, res) => {
  try {
    const styles = await db.prepare('SELECT DISTINCT travel_styles FROM destinations').all();
    
    // Extract unique styles from JSON arrays
    const uniqueStyles = new Set();
    styles.forEach(row => {
      if (row.travel_styles) {
        const parsed = safeJsonParse(row.travel_styles, []);
        parsed.forEach(style => uniqueStyles.add(style));
      }
    });

    res.json({
      success: true,
      data: Array.from(uniqueStyles).sort()
    });
  } catch (error) {
    logger.error('Error fetching travel styles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travel styles'
    });
  }
});

// Specific limiter for AI Q&A
const aiQueryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { success: false, message: 'Too many intelligence queries. SoloCompass Pro allows up to 50/hour.' }
});

// Destination Q&A Assistant with Affiliate Injection
router.post('/:id/query', authenticate, premiumOnly, aiQueryLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.body;
    
    // Fetch destination data to provide context to the LLM
    const destination = await db.prepare(`SELECT 
      id, name, country, city, description, highlights, travel_styles, 
      budget_level, climate, best_months, safety_rating, solo_friendly_rating, 
      image_url, latitude, longitude, emergency_contacts, safety_intelligence,
      status, source, created_at, updated_at
    FROM destinations WHERE id = ?`).get(id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const affiliateLinks = getAffiliateLinksForDestination(destination.name);
    
    // Using LiteLLM directly or through AI abstraction. 
    // For MVP, we'll perform a direct simple LiteLLM call here since it's a specific UI feature.
    const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://localhost:4000';
    const LITELLM_MODEL = process.env.LITELLM_MODEL || 'gpt-4o';
    const LITELLM_API_KEY = process.env.LITELLM_API_KEY;

    if (!LITELLM_API_KEY) {
      return res.json({
        success: true,
        data: {
          response: `To find the best verified hotels in ${destination.name}, check our [partner deals here](${affiliateLinks.hotels}). For safety, stick to the central districts!`
        }
      });
    }

    // Call LiteLLM
    const systemPrompt = `You are the SoloCompass AI intelligence agent for ${destination.name}. 
    Provide concise, solo-traveler focused advice. Give precise neighborhood names and safety tips.
    If the user asks for hotels or places to stay, ALWAYS include this markdown link exactly as written: [Check local hotel deals](${affiliateLinks.hotels})
    If the user asks for tours, activities, or things to do, ALWAYS include this markdown link exactly as written: [Find local tours](${affiliateLinks.tours})
    If the user asks for flights, include: [Check flight prices](${affiliateLinks.flights})
    Keep your response under 4 paragraphs. Use standard markdown.`;

    const llmResponse = await axios.post(`${LITELLM_BASE_URL}/v1/chat/completions`, {
      model: LITELLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${LITELLM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiText = llmResponse.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        response: aiText
      }
    });

  } catch (error) {
    logger.error('Destination Query Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to query intelligence agent' });
  }
});

// Create new destination (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { 
      name, country, city, description, image_url, 
      latitude, longitude, safety_rating, budget_level, 
      solo_friendly_rating, climate, highlights, travel_styles, best_months 
    } = req.body;

    const result = await db.prepare(`
      INSERT INTO destinations (
        name, country, city, description, image_url, 
        latitude, longitude, safety_rating, budget_level, 
        solo_friendly_rating, climate, highlights, travel_styles, 
        best_months, emergency_contacts, safety_intelligence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, country, city, description, image_url,
      latitude, longitude, safety_rating, budget_level,
      solo_friendly_rating, climate, 
      JSON.stringify(highlights || []), 
      JSON.stringify(travel_styles || []), 
      JSON.stringify(best_months || []),
      JSON.stringify(req.body.emergency_contacts || { police: '112', ambulance: '112', fire: '112' }),
      req.body.safety_intelligence || ''
    );

    res.status(201).json({
      success: true,
      message: 'Destination created',
      id: result.lastInsertRowid
    });
  } catch (error) {
    logger.error('Error creating destination:', error);
    res.status(500).json({ success: false, message: 'Failed to create destination' });
  }
});

// Update destination (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, country, city, description, image_url, 
      latitude, longitude, safety_rating, budget_level, 
      solo_friendly_rating, climate, highlights, travel_styles, best_months,
      slug, destination_level, parent_destination_id,
      publication_status, safety_gate_status, manual_review_status,
      short_summary, why_solo_travellers, arrival_tips, local_etiquette_notes,
      lgbtq_notes, women_solo_notes, after_dark_guidance, neighbourhood_shortlist,
      ideal_trip_length, ai_card_summary, ai_safety_brief, ai_solo_suitability,
      ai_arrival_checklist, ai_neighbourhood_guidance, ai_after_dark, ai_common_friction,
      ai_quick_facts, ai_fallback_summary
    } = req.body;

    await db.prepare(`
      UPDATE destinations SET 
        name = ?, country = ?, city = ?, description = ?, image_url = ?, 
        latitude = ?, longitude = ?, safety_rating = ?, budget_level = ?, 
        solo_friendly_rating = ?, climate = ?, highlights = ?, 
        travel_styles = ?, best_months = ?, 
        emergency_contacts = ?, safety_intelligence = ?,
        slug = ?, destination_level = ?, parent_destination_id = ?,
        publication_status = ?, safety_gate_status = ?, manual_review_status = ?,
        short_summary = ?, why_solo_travellers = ?, arrival_tips = ?, local_etiquette_notes = ?,
        lgbtq_notes = ?, women_solo_notes = ?, after_dark_guidance = ?, neighbourhood_shortlist = ?,
        ideal_trip_length = ?, ai_card_summary = ?, ai_safety_brief = ?, ai_solo_suitability = ?,
        ai_arrival_checklist = ?, ai_neighbourhood_guidance = ?, ai_after_dark = ?, ai_common_friction = ?,
        ai_quick_facts = ?, ai_fallback_summary = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, country, city, description, image_url,
      latitude, longitude, safety_rating, budget_level,
      solo_friendly_rating, climate, 
      JSON.stringify(highlights || []), 
      JSON.stringify(travel_styles || []), 
      JSON.stringify(best_months || []),
      JSON.stringify(req.body.emergency_contacts || { police: '112', ambulance: '112', fire: '112' }),
      req.body.safety_intelligence || '',
      slug || null, destination_level || 'city', parent_destination_id || null,
      publication_status || 'draft', safety_gate_status || 'unchecked', manual_review_status || 'pending',
      short_summary || '', why_solo_travellers || '', arrival_tips || '', local_etiquette_notes || '',
      lgbtq_notes || '', women_solo_notes || '', after_dark_guidance || '', neighbourhood_shortlist || '',
      ideal_trip_length || '', ai_card_summary || '', ai_safety_brief || '', ai_solo_suitability || '',
      ai_arrival_checklist || '', ai_neighbourhood_guidance || '', ai_after_dark || '', ai_common_friction || '',
      ai_quick_facts || '', ai_fallback_summary || '',
      id
    );

    res.json({ success: true, message: 'Destination updated' });
  } catch (error) {
    logger.error('Error updating destination:', error);
    res.status(500).json({ success: false, message: 'Failed to update destination' });
  }
});

// Delete destination (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.prepare('DELETE FROM destinations WHERE id = ?').run(id);
    res.json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    logger.error('Error deleting destination:', error);
    res.status(500).json({ success: false, message: 'Failed to delete destination' });
  }
});

export default router;
