import logger from './logger.js';
import db from '../db.js';

const REQUIRED_FIELDS = [
  { key: 'advisory', tier: 1, name: 'Travel Advisory', required: true },
  { key: 'entry_requirements', tier: 1, name: 'Entry Requirements', required: true },
  { key: 'currency', tier: 2, name: 'Currency Information', required: false },
  { key: 'weather', tier: 2, name: 'Weather/Climate', required: false },
  { key: 'transport', tier: 2, name: 'Transportation', required: false },
  { key: 'cost', tier: 3, name: 'Cost Estimates', required: false },
  { key: 'nomad', tier: 3, name: 'Nomad Infrastructure', required: false },
  { key: 'positioning_ai', tier: 'ai', name: 'AI Positioning Summary', required: true },
  { key: 'safety_ai', tier: 'ai', name: 'AI Safety Summary', required: false }
];

const WARNING_CONDITIONS = [
  { key: 'advisory_level_high', condition: 'Advisory level is 4 or 5', severity: 'high' },
  { key: 'missing_cost_data', condition: 'Missing cost estimates', severity: 'medium' },
  { key: 'missing_nomad_data', condition: 'Missing nomad infrastructure data', severity: 'low' },
  { key: 'outdated_advisory', condition: 'Advisory not updated in 90 days', severity: 'medium' }
];

async function getDestination(destinationId) {
  return db.prepare('SELECT * FROM destinations WHERE id = ?').get(destinationId);
}

async function getResearchRecord(destinationId) {
  return db.prepare('SELECT * FROM country_research WHERE destination_id = ?').get(destinationId);
}

async function getAdvisoryRecord(destinationId) {
  return db.prepare('SELECT * FROM advisories WHERE destination_id = ? ORDER BY updated_at DESC LIMIT 1').get(destinationId);
}

export async function checkEligibility(destinationId) {
  const destination = await getDestination(destinationId);
  if (!destination) {
    return { eligible: false, missing: ['destination_not_found'], warnings: ['Destination does not exist'] };
  }

  const research = await getResearchRecord(destinationId);
  if (!research) {
    return { eligible: false, missing: ['research_record'], warnings: [] };
  }

  const missing = [];
  const warnings = [];
  const sources = research.sources ? JSON.parse(research.sources) : {};
  const aiSummaries = research.ai_summaries ? JSON.parse(research.ai_summaries) : {};

  if (!sources.tier1?.advisory) {
    missing.push({ key: 'advisory', name: 'Travel Advisory' });
  }

  if (!sources.tier1?.entry_requirements) {
    missing.push({ key: 'entry_requirements', name: 'Entry Requirements' });
  }

  if (!sources.tier2?.currency) {
    warnings.push({ key: 'missing_currency', condition: 'Missing currency information', severity: 'low' });
  }

  if (!sources.tier3?.cost) {
    warnings.push({ key: 'missing_cost_data', condition: 'Missing cost estimates', severity: 'medium' });
  }

  if (!aiSummaries.positioning?.content) {
    missing.push({ key: 'positioning_ai', name: 'AI Positioning Summary' });
  }

  const advisory = await getAdvisoryRecord(destinationId);
  if (advisory) {
    if (advisory.level >= 4) {
      warnings.push({ key: 'advisory_level_high', condition: `Advisory level is ${advisory.level} (${advisory.label || 'high risk'})`, severity: 'high' });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    if (new Date(advisory.updated_at) < ninetyDaysAgo) {
      warnings.push({ key: 'outdated_advisory', condition: 'Advisory not updated in 90 days', severity: 'medium' });
    }
  } else if (missing.length === 0) {
    warnings.push({ key: 'no_advisory', condition: 'No advisory record found', severity: 'medium' });
  }

  const workflowState = research.workflow_state;
  const validStates = ['needs_review', 'approved', 'live', 'paused'];
  if (!validStates.includes(workflowState)) {
    if (missing.length === 0) {
      warnings.push({ key: 'workflow_not_ready', condition: `Workflow state is ${workflowState}`, severity: 'low' });
    }
  }

  const eligible = missing.length === 0;

  return {
    eligible,
    missing: missing.map(m => m.key),
    missing_details: missing,
    warnings: warnings.map(w => w.key),
    warning_details: warnings,
    can_approve: eligible && warnings.filter(w => w.severity === 'high').length === 0,
    can_publish: eligible && research.workflow_state === 'approved'
  };
}

export function getRequiredFields() {
  return REQUIRED_FIELDS.map(f => ({
    key: f.key,
    tier: f.tier,
    name: f.name,
    required: f.required
  }));
}

export async function getEligibilityDetails(destinationId) {
  const eligibility = await checkEligibility(destinationId);

  const destination = await getDestination(destinationId);
  const research = await getResearchRecord(destinationId);

  return {
    destination: destination ? { id: destination.id, name: destination.name } : null,
    research: research ? { state: research.workflow_state, score: research.completeness_score } : null,
    eligibility: eligibility,
    recommendations: generateRecommendations(eligibility)
  };
}

function generateRecommendations(eligibility) {
  const recommendations = [];

  if (eligibility.missing.includes('advisory')) {
    recommendations.push({
      priority: 'critical',
      action: 'Import or create travel advisory data',
      route: '/api/advisories'
    });
  }

  if (eligibility.missing.includes('entry_requirements')) {
    recommendations.push({
      priority: 'high',
      action: 'Add entry requirements (visa, passport validity)',
      route: '/api/destinations'
    });
  }

  if (eligibility.missing.includes('positioning_ai')) {
    recommendations.push({
      priority: 'high',
      action: 'Run AI summary generation',
      action_route: 'generateAISummaries()'
    });
  }

  const highWarnings = eligibility.warning_details?.filter(w => w.severity === 'high') || [];
  for (const warning of highWarnings) {
    recommendations.push({
      priority: 'high',
      action: warning.condition,
      warning: true
    });
  }

  return recommendations;
}

export async function getEligibilitySummary() {
  const allDestinations = db.prepare(`
    SELECT d.id, d.name, cr.workflow_state, cr.completeness_score
    FROM destinations d
    LEFT JOIN country_research cr ON cr.destination_id = d.id
    WHERE d.is_active = 1
    ORDER BY d.name ASC
  `).all();

  const summary = {
    total: allDestinations.length,
    by_state: {},
    eligible_for_review: 0,
    eligible_for_publish: 0,
    needs_work: 0
  };

  for (const dest of allDestinations) {
    const state = dest.workflow_state || 'draft';
    summary.by_state[state] = (summary.by_state[state] || 0) + 1;

    const eligibility = await checkEligibility(dest.id);
    if (eligibility.eligible && state === 'needs_review') {
      summary.eligible_for_review++;
    }
    if (eligibility.eligible && state === 'approved') {
      summary.eligible_for_publish++;
    }
    if (!eligibility.eligible || eligibility.missing.length > 0) {
      summary.needs_work++;
    }
  }

  return summary;
}

export async function canGoLive(destinationId) {
  const eligibility = await checkEligibility(destinationId);
  const research = await getResearchRecord(destinationId);

  return {
    can_go_live: eligibility.eligible && research?.workflow_state === 'approved',
    reasons: {
      has_all_required: eligibility.eligible,
      is_approved: research?.workflow_state === 'approved',
      no_high_warnings: eligibility.warning_details?.filter(w => w.severity === 'high').length === 0
    },
    eligibility
  };
}

export { REQUIRED_FIELDS, WARNING_CONDITIONS };