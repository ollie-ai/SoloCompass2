import logger from './logger.js';
import db from '../db.js';
import { callAI } from './aiOrchestrator.js';
import { getAdvisory, updateAdvisory } from './advisoryIngestionService.js';
import { getBudget } from './budgetNormalizationService.js';
import { getNomadData } from './nomadInfrastructureService.js';
import { checkEligibility, getRequiredFields } from './countryEligibilityService.js';

const WORKFLOW_STATES = {
  DRAFT: 'draft',
  SOURCE_PACK_BUILDING: 'source_pack_building',
  SOURCE_PACK_READY: 'source_pack_ready',
  AI_IN_PROGRESS: 'ai_in_progress',
  NEEDS_REVIEW: 'needs_review',
  APPROVED: 'approved',
  LIVE: 'live',
  PAUSED: 'paused',
  BLOCKED: 'blocked'
};

const TIER1_FIELDS = ['advisory', 'entry_requirements'];
const TIER2_FIELDS = ['currency', 'transport', 'weather', 'internet'];
const TIER3_FIELDS = ['cost', 'nomad', 'accommodations', 'safety'];

async function getDestination(destinationId) {
  return db.prepare('SELECT * FROM destinations WHERE id = ?').get(destinationId);
}

async function getResearchRecord(destinationId) {
  return db.prepare('SELECT * FROM country_research WHERE destination_id = ?').get(destinationId);
}

async function updateResearchState(destinationId, state) {
  await db.prepare(`
    UPDATE country_research 
    SET workflow_state = ?, updated_at = NOW()
    WHERE destination_id = ?
  `).run(state, destinationId);
}

async function initializeResearch(destinationId) {
  const existing = await getResearchRecord(destinationId);
  if (existing) return existing;

  await db.prepare(`
    INSERT INTO country_research (destination_id, workflow_state, completeness_score, created_at, updated_at)
    VALUES (?, ?, 0, NOW(), NOW())
  `).run(destinationId, WORKFLOW_STATES.DRAFT);

  return getResearchRecord(destinationId);
}

async function fetchAllSources(destinationId, countryName) {
  const sources = {
    tier1: {},
    tier2: {},
    tier3: {}
  };

  try {
    const advisory = await getAdvisory(countryName);
    if (advisory) sources.tier1.advisory = advisory;
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to fetch advisory: ${err.message}`);
  }

  try {
    sources.tier1.entry_requirements = await fetchEntryRequirements(countryName);
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to fetch entry reqs: ${err.message}`);
  }

  try {
    const budget = await getBudget(countryName);
    if (budget) sources.tier3.cost = budget;
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to fetch budget: ${err.message}`);
  }

  try {
    const nomad = await getNomadData(countryName);
    if (nomad) sources.tier3.nomad = nomad;
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to fetch nomad data: ${err.message}`);
  }

  return sources;
}

async function fetchEntryRequirements(countryName) {
  return {
    visa_free: true,
    visa_on_arrival: false,
    passport_validity: '6 months',
    vaccinations: []
  };
}

function calculateCompleteness(sources) {
  let filled = 0;
  let total = TIER1_FIELDS.length + TIER2_FIELDS.length + TIER3_FIELDS.length;

  if (sources.tier1?.advisory) filled++;
  if (sources.tier1?.entry_requirements) filled++;

  if (sources.tier2?.currency) filled++;
  if (sources.tier2?.transport) filled++;
  if (sources.tier2?.weather) filled++;

  if (sources.tier3?.cost) filled++;
  if (sources.tier3?.nomad) filled++;

  return Math.round((filled / total) * 100);
}

export async function runFullResearch(destinationId) {
  logger.info(`[CountryResearch] Starting full research for destination ${destinationId}`);

  const destination = await getDestination(destinationId);
  if (!destination) {
    throw new Error(`Destination ${destinationId} not found`);
  }

  const countryName = destination.name;
  const research = await initializeResearch(destinationId);

  await updateResearchState(destinationId, WORKFLOW_STATES.SOURCE_PACK_BUILDING);

  const sources = await fetchAllSources(destinationId, countryName);
  const completeness = calculateCompleteness(sources);

  await db.prepare(`
    UPDATE country_research 
    SET sources = ?, completeness_score = ?, updated_at = NOW()
    WHERE destination_id = ?
  `).run(JSON.stringify(sources), completeness, destinationId);

  await updateResearchState(destinationId, WORKFLOW_STATES.SOURCE_PACK_READY);

  await generateAISummaries(destinationId);

  await updateResearchState(destinationId, WORKFLOW_STATES.NEEDS_REVIEW);

  logger.info(`[CountryResearch] Completed research for ${countryName}, score: ${completeness}%`);

  return {
    destination_id: destinationId,
    country_name: countryName,
    completeness_score: completeness,
    workflow_state: WORKFLOW_STATES.NEEDS_REVIEW
  };
}

export async function getResearchPack(destinationId) {
  const research = await getResearchRecord(destinationId);
  if (!research) {
    return null;
  }

  const destination = await getDestination(destinationId);
  if (!destination) {
    return null;
  }

  const sources = research.sources ? JSON.parse(research.sources) : {};
  const aiSummaries = research.ai_summaries ? JSON.parse(research.ai_summaries) : {};

  const eligibility = await checkEligibility(destinationId);

  const missingSections = [];
  if (!sources.tier1?.advisory) missingSections.push('advisory');
  if (!sources.tier1?.entry_requirements) missingSections.push('entry_requirements');
  if (!sources.tier2?.currency) missingSections.push('currency');
  if (!sources.tier3?.cost) missingSections.push('cost');
  if (!aiSummaries.positioning) missingSections.push('ai_positioning');

  return {
    destination_id: destinationId,
    country_name: destination.name,
    workflow_state: research.workflow_state,
    completeness_score: research.completeness_score,
    tier1_sources: sources.tier1 || {},
    tier2_sources: sources.tier2 || {},
    tier3_sources: sources.tier3 || {},
    ai_summaries: aiSummaries,
    missing_sections: missingSections,
    can_go_live: eligibility.eligible && missingSections.length === 0,
    eligibility_details: eligibility
  };
}

export async function generateAISummaries(destinationId) {
  const destination = await getDestination(destinationId);
  if (!destination) {
    throw new Error(`Destination ${destinationId} not found`);
  }

  await updateResearchState(destinationId, WORKFLOW_STATES.AI_IN_PROGRESS);

  const research = await getResearchRecord(destinationId);
  const sources = research?.sources ? JSON.parse(research.sources) : {};

  const summaries = {};

  try {
    const positioningResult = await callAI('destination_research_section', [], {
      ctx: {
        destination: destination.name,
        type: 'positioning',
        sources: sources.tier1
      },
      maxTokens: 800
    });
    summaries.positioning = {
      content: positioningResult.response,
      source: positioningResult.source,
      generated_at: new Date().toISOString()
    };
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to generate positioning: ${err.message}`);
    summaries.positioning = { content: null, error: err.message };
  }

  try {
    const safetyResult = await callAI('destination_research_section', [], {
      ctx: {
        destination: destination.name,
        type: 'safety',
        sources: sources.tier1
      },
      maxTokens: 600
    });
    summaries.safety = {
      content: safetyResult.response,
      source: safetyResult.source,
      generated_at: new Date().toISOString()
    };
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to generate safety: ${err.message}`);
    summaries.safety = { content: null, error: err.message };
  }

  try {
    const socialResult = await callAI('destination_research_section', [], {
      ctx: {
        destination: destination.name,
        type: 'social',
        sources: sources.tier3
      },
      maxTokens: 600
    });
    summaries.social = {
      content: socialResult.response,
      source: socialResult.source,
      generated_at: new Date().toISOString()
    };
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to generate social: ${err.message}`);
    summaries.social = { content: null, error: err.message };
  }

  await db.prepare(`
    UPDATE country_research 
    SET ai_summaries = ?, updated_at = NOW()
    WHERE destination_id = ?
  `).run(JSON.stringify(summaries), destinationId);

  await updateResearchState(destinationId, WORKFLOW_STATES.SOURCE_PACK_READY);

  return summaries;
}

export async function suggestCities(destinationId, count = 3) {
  const destination = await getDestination(destinationId);
  if (!destination) {
    throw new Error(`Destination ${destinationId} not found`);
  }

  const research = await getResearchRecord(destinationId);
  const sources = research?.sources ? JSON.parse(research.sources) : {};

  const suggestions = [];

  try {
    const result = await callAI('destination_research_section', [], {
      ctx: {
        destination: destination.name,
        type: 'city_suggestions',
        count: count,
        sources: sources.tier2 || {}
      },
      maxTokens: 1000
    });

    const parsed = JSON.parse(result.response);
    for (let i = 0; i < Math.min(count, parsed.cities?.length || 0); i++) {
      const city = parsed.cities[i];
      await db.prepare(`
        INSERT INTO cities (destination_id, name, country_name, is_stub, is_research_suggestion, created_at)
        VALUES (?, ?, ?, 1, 1, NOW())
      `).run(destinationId, city.name, destination.name);

      suggestions.push({
        name: city.name,
        is_stub: true,
        suggested_at: new Date().toISOString()
      });
    }
  } catch (err) {
    logger.warn(`[CountryResearch] Failed to suggest cities: ${err.message}`);
  }

  return suggestions;
}

export async function getResearchStatus(destinationId) {
  const research = await getResearchRecord(destinationId);
  if (!research) {
    return { exists: false };
  }

  return {
    exists: true,
    destination_id: destinationId,
    workflow_state: research.workflow_state,
    completeness_score: research.completeness_score,
    updated_at: research.updated_at
  };
}

export async function approveResearch(destinationId) {
  const eligibility = await checkEligibility(destinationId);
  if (!eligibility.eligible) {
    throw new Error(`Cannot approve: missing ${eligibility.missing.join(', ')}`);
  }

  await updateResearchState(destinationId, WORKFLOW_STATES.APPROVED);
  return { success: true, workflow_state: WORKFLOW_STATES.APPROVED };
}

export async function publishResearch(destinationId) {
  await updateResearchState(destinationId, WORKFLOW_STATES.LIVE);
  return { success: true, workflow_state: WORKFLOW_STATES.LIVE };
}

export async function pauseResearch(destinationId) {
  await updateResearchState(destinationId, WORKFLOW_STATES.PAUSED);
  return { success: true, workflow_state: WORKFLOW_STATES.PAUSED };
}

export async function blockResearch(destinationId, reason) {
  await db.prepare(`
    UPDATE country_research 
    SET workflow_state = ?, blocked_reason = ?, updated_at = NOW()
    WHERE destination_id = ?
  `).run(WORKFLOW_STATES.BLOCKED, reason, destinationId);
  return { success: true, workflow_state: WORKFLOW_STATES.BLOCKED };
}

export { WORKFLOW_STATES, TIER1_FIELDS, TIER2_FIELDS, TIER3_FIELDS };