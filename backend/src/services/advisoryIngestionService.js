import logger from './logger.js';
import db from '../db.js';

const ADVISORY_LEVELS = {
  1: { label: 'normal', color: 'green', risk: 'low' },
  2: { label: 'exercise_normal_precautions', color: 'yellow', risk: 'low' },
  3: { label: 'reconsider_travel', color: 'orange', risk: 'medium' },
  4: { label: 'avoid_all_but_essential', color: 'red', risk: 'high' },
  5: { label: 'do_not_travel', color: 'darkred', risk: 'very_high' }
};

const FCDO_LEVEL_MAP = {
  'normal': 1,
  'exercise normal precautions': 2,
  'reconsider travel': 3,
  'avoid all but essential travel': 4,
  'do not travel': 5
};

const US_STATE_LEVEL_MAP = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  'Do not travel': 5
};

async function getAdvisoryByDestinationId(destinationId) {
  return db.prepare(`
    SELECT * FROM advisories 
    WHERE destination_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `).get(destinationId);
}

async function getAdvisoryByCountryName(countryName) {
  return db.prepare(`
    SELECT a.*, d.id as destination_id, d.name as country_name
    FROM advisories a
    JOIN destinations d ON d.id = a.destination_id
    WHERE LOWER(d.name) = LOWER(?)
    ORDER BY a.updated_at DESC
    LIMIT 1
  `).get(countryName);
}

export async function getAdvisory(countryName) {
  let advisory = await getAdvisoryByCountryName(countryName);

  if (!advisory) {
    logger.info(`[AdvisoryIngestion] No advisory found for ${countryName}, checking destination direct`);
    const destination = db.prepare('SELECT * FROM destinations WHERE LOWER(name) = LOWER(?)').get(countryName);
    if (destination) {
      advisory = await getAdvisoryByDestinationId(destination.id);
    }
  }

  if (!advisory) {
    return createEmptyAdvisory(countryName);
  }

  return normalizeAdvisoryData(advisory);
}

function createEmptyAdvisory(countryName) {
  return {
    country_name: countryName,
    level: 1,
    label: 'normal',
    color: 'green',
    risk: 'low',
    last_updated: null,
    source: 'manual',
    content: null,
    warnings: []
  };
}

function normalizeAdvisoryData(advisory) {
  return {
    country_name: advisory.country_name,
    level: advisory.level || normalizeAdvisoryLevel(advisory.fcdo_level || advisory.level),
    label: advisory.label || ADVISORY_LEVELS[advisory.level]?.label || 'normal',
    color: advisory.color || ADVISORY_LEVELS[advisory.level]?.color || 'green',
    risk: advisory.risk || ADVISORY_LEVELS[advisory.level]?.risk || 'low',
    last_updated: advisory.last_updated || advisory.updated_at,
    source: advisory.source || 'manual',
    content: advisory.content || advisory.summary || advisory.description,
    warnings: advisory.warnings || [],
    url: advisory.url || advisory.source_url,
    fcdo_updated: advisory.fcdo_updated,
    us_state_updated: advisory.us_state_updated
  };
}

export function normalizeAdvisoryLevel(fcdoLevel) {
  if (!fcdoLevel) return 1;

  const normalized = String(fcdoLevel).toLowerCase().trim();

  if (FCDO_LEVEL_MAP[normalized]) {
    return FCDO_LEVEL_MAP[normalized];
  }

  if (US_STATE_LEVEL_MAP[normalized]) {
    return US_STATE_LEVEL_MAP[normalized];
  }

  if (typeof fcdoLevel === 'number') {
    return Math.min(Math.max(fcdoLevel, 1), 5);
  }

  logger.warn(`[AdvisoryIngestion] Unknown advisory level: ${fcdoLevel}, defaulting to 1`);
  return 1;
}

export async function updateAdvisory(destinationId, advisoryData) {
  const { level, content, warnings, url, source } = advisoryData;

  const normalizedLevel = normalizeAdvisoryLevel(level);

  const existing = await getAdvisoryByDestinationId(destinationId);

  if (existing) {
    await db.prepare(`
      UPDATE advisories
      SET level = ?, content = ?, warnings = ?, url = ?, source = ?,
          updated_at = NOW()
      WHERE id = ?
    `).run(normalizedLevel, content, JSON.stringify(warnings || []), url, source || 'manual', existing.id);
  } else {
    await db.prepare(`
      INSERT INTO advisories (destination_id, level, content, warnings, url, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(destinationId, normalizedLevel, content, JSON.stringify(warnings || []), url, source || 'manual');
  }

  logger.info(`[AdvisoryIngestion] Updated advisory for destination ${destinationId}, level: ${normalizedLevel}`);

  return {
    destination_id: destinationId,
    level: normalizedLevel,
    updated: true
  };
}

export async function bulkUpdateAdvisories(updates) {
  const results = [];

  for (const update of updates) {
    try {
      const result = await updateAdvisory(update.destination_id, update);
      results.push(result);
    } catch (err) {
      logger.error(`[AdvisoryIngestion] Failed to update advisory for ${update.destination_id}: ${err.message}`);
      results.push({ destination_id: update.destination_id, error: err.message });
    }
  }

  return results;
}

export async function getAllAdvisories() {
  return db.prepare(`
    SELECT a.*, d.name as country_name
    FROM advisories a
    JOIN destinations d ON d.id = a.destination_id
    ORDER BY a.level DESC, d.name ASC
  `).all();
}

export async function getHighRiskAdvisories() {
  return db.prepare(`
    SELECT a.*, d.name as country_name
    FROM advisories a
    JOIN destinations d ON d.id = a.destination_id
    WHERE a.level >= 4
    ORDER BY a.level DESC, a.updated_at DESC
  `).all();
}

export { ADVISORY_LEVELS };