import logger from './logger.js';
import db from '../db.js';

const DEFAULT_NOMAD_SCORES = {
  wifi_reliability: 5,
  coworking_density: 5,
  visa_friendly: 3,
  english_speaking: 5,
  cost_of_living: 5,
  safety: 7,
  overall_score: 5
};

const INFRASTRUCTURE_DEFAULTS = {
  internet_speed_mbps: 25,
  coworking_spaces_count: 10,
  coffee_shops_with_wifi: 20,
  mobile_network_coverage: 95,
  power_outlets_voltage: 220,
  power_plug_type: 'C',
  tap_water_safe: true,
  healthcare_quality: 6
};

export async function getNomadData(countryName) {
  if (!countryName) {
    return createNomadData({});
  }

  const normalized = countryName.toLowerCase().trim();

  const storedNomad = await db.prepare(`
    SELECT * FROM nomad_data 
    WHERE LOWER(country_name) = LOWER(?)
    ORDER BY updated_at DESC
    LIMIT 1
  `).get(countryName);

  if (storedNomad) {
    return createNomadData({
      wifi_reliability: storedNomad.wifi_reliability,
      coworking_density: storedNomad.coworking_density,
      visa_friendly: storedNomad.visa_friendly,
      english_speaking: storedNomad.english_speaking,
      cost_of_living: storedNomad.cost_of_living,
      safety: storedNomad.safety,
      overall_score: storedNomad.overall_score,
      visa_options: storedNomad.visa_options,
      best_cities: storedNomad.best_cities,
      coworking_recs: storedNomad.coworking_recs,
      remote_jobs: storedNomad.remote_jobs
    });
  }

  return createNomadData(getDefaultNomadScores(normalized));
}

function createNomadData(overrides = {}) {
  return {
    wifi_reliability: overrides.wifi_reliability ?? DEFAULT_NOMAD_SCORES.wifi_reliability,
    coworking_density: overrides.coworking_density ?? DEFAULT_NOMAD_SCORES.coworking_density,
    visa_friendly: overrides.visa_friendly ?? DEFAULT_NOMAD_SCORES.visa_friendly,
    english_speaking: overrides.english_speaking ?? DEFAULT_NOMAD_SCORES.english_speaking,
    cost_of_living: overrides.cost_of_living ?? DEFAULT_NOMAD_SCORES.cost_of_living,
    safety: overrides.safety ?? DEFAULT_NOMAD_SCORES.safety,
    overall_score: overrides.overall_score ?? calculateOverallScore(overrides),
    visa_options: overrides.visa_options || getDefaultVisaOptions(overrides),
    best_cities: overrides.best_cities || [],
    coworking_recs: overrides.coworking_recs || [],
    remote_jobs: overrides.remote_jobs || [],
    last_updated: new Date().toISOString(),
    source: 'calculated'
  };
}

function calculateOverallScore(scores) {
  const weights = {
    wifi_reliability: 0.25,
    coworking_density: 0.15,
    visa_friendly: 0.20,
    english_speaking: 0.10,
    cost_of_living: 0.15,
    safety: 0.15
  };

  let total = 0;
  let weightTotal = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const score = scores[key] ?? DEFAULT_NOMAD_SCORES[key] ?? 5;
    total += score * weight;
    weightTotal += weight;
  }

  return Math.round(total / weightTotal);
}

function getDefaultVisaOptions(countryKey) {
  const visaFreeCountries = ['united kingdom', 'united states', 'canada', 'australia', 'new zealand', 'eu'];
  const aseanCountries = ['thailand', 'vietnam', 'indonesia', 'malaysia', 'philippines', 'singapore'];

  if (visaFreeCountries.some(r => countryKey.includes(r))) {
    return [
      { type: 'visa_free', duration: '90 days', countries: ['Schengen', 'UK', 'US', 'Canada', 'Australia'] },
      { type: 'working_holiday', duration: '2 years', countries: ['30+ countries'] }
    ];
  }

  if (aseanCountries.some(r => countryKey.includes(r))) {
    return [
      { type: 'visa_on_arrival', duration: '30 days', available: true },
      { type: 'digital_nomad', duration: 'up to 2 years', countries: ['Indonesia (Bali)', 'Thailand', 'Philippines'] }
    ];
  }

  return [
    { type: 'visa_on_arrival', duration: '30 days', available: true },
    { type: 'tourist_visa', duration: '90 days', available: true }
  ];
}

function getDefaultNomadScores(countryKey) {
  const topNomadCountries = ['portugal', 'spain', 'estonia', 'georgia', 'mexico', 'colombia', 'thailand', 'bali', 'indonesia', 'costa rica'];
  const goodNomadCountries = ['germany', 'netherlands', 'france', 'italy', 'greece', 'croatia', 'czechia', 'hungary', 'poland', 'latvia'];
  const challengingCountries = ['japan', 'south korea', 'china', 'india', 'brazil', 'russia', 'middle east'];

  if (topNomadCountries.some(r => countryKey.includes(r))) {
    return {
      wifi_reliability: 8,
      coworking_density: 8,
      visa_friendly: 7,
      english_speaking: 7,
      cost_of_living: 7,
      safety: 8,
      overall_score: 8
    };
  }

  if (goodNomadCountries.some(r => countryKey.includes(r))) {
    return {
      wifi_reliability: 7,
      coworking_density: 6,
      visa_friendly: 5,
      english_speaking: 6,
      cost_of_living: 6,
      safety: 7,
      overall_score: 6
    };
  }

  if (challengingCountries.some(r => countryKey.includes(r))) {
    return {
      wifi_reliability: 5,
      coworking_density: 4,
      visa_friendly: 3,
      english_speaking: 4,
      cost_of_living: 5,
      safety: 5,
      overall_score: 4
    };
  }

  return DEFAULT_NOMAD_SCORES;
}

export async function getInfrastructureData(countryName) {
  if (!countryName) {
    return createInfrastructureData({});
  }

  const normalized = countryName.toLowerCase().trim();

  const storedInfra = await db.prepare(`
    SELECT * FROM infrastructure_data 
    WHERE LOWER(country_name) = LOWER(?)
    ORDER BY updated_at DESC
    LIMIT 1
  `).get(countryName);

  if (storedInfra) {
    return createInfrastructureData({
      internet_speed_mbps: storedInfra.internet_speed_mbps,
      coworking_spaces_count: storedInfra.coworking_spaces_count,
      coffee_shops_with_wifi: storedInfra.coffee_shops_with_wifi,
      mobile_network_coverage: storedInfra.mobile_network_coverage,
      power_outlets_voltage: storedInfra.power_outlets_voltage,
      power_plug_type: storedInfra.power_plug_type,
      tap_water_safe: storedInfra.tap_water_safe,
      healthcare_quality: storedInfra.healthcare_quality,
      public_transport: storedInfra.public_transport,
      rideshare_availability: storedInfra.rideshare_availability
    });
  }

  return createInfrastructureData(getDefaultInfrastructure(normalized));
}

function createInfrastructureData(overrides = {}) {
  return {
    internet_speed_mbps: overrides.internet_speed_mbps ?? INFRASTRUCTURE_DEFAULTS.internet_speed_mbps,
    coworking_spaces_count: overrides.coworking_spaces_count ?? INFRASTRUCTURE_DEFAULTS.coworking_spaces_count,
    coffee_shops_with_wifi: overrides.coffee_shops_with_wifi ?? INFRASTRUCTURE_DEFAULTS.coffee_shops_with_wifi,
    mobile_network_coverage: overrides.mobile_network_coverage ?? INFRASTRUCTURE_DEFAULTS.mobile_network_coverage,
    power_outlets_voltage: overrides.power_outlets_voltage ?? INFRASTRUCTURE_DEFAULTS.power_outlets_voltage,
    power_plug_type: overrides.power_plug_type ?? INFRASTRUCTURE_DEFAULTS.power_plug_type,
    tap_water_safe: overrides.tap_water_safe ?? INFRASTRUCTURE_DEFAULTS.tap_water_safe,
    healthcare_quality: overrides.healthcare_quality ?? INFRASTRUCTURE_DEFAULTS.healthcare_quality,
    public_transport: overrides.public_transport || 'good',
    rideshare_availability: overrides.rideshare_availability || ['Uber', 'Bolt'],
    last_updated: new Date().toISOString(),
    source: 'calculated'
  };
}

function getDefaultInfrastructure(countryKey) {
  const highInfrastructure = ['united kingdom', 'united states', 'germany', 'japan', 'singapore', 'south korea', 'hong kong', 'netherlands', 'denmark', 'sweden'];
  const midInfrastructure = ['portugal', 'spain', 'france', 'italy', 'greece', 'poland', 'czechia', 'hungary', 'thailand', 'mexico'];

  if (highInfrastructure.some(r => countryKey.includes(r))) {
    return {
      internet_speed_mbps: 100,
      coworking_spaces_count: 50,
      coffee_shops_with_wifi: 100,
      mobile_network_coverage: 99,
      healthcare_quality: 8
    };
  }

  if (midInfrastructure.some(r => countryKey.includes(r))) {
    return {
      internet_speed_mbps: 50,
      coworking_spaces_count: 20,
      coffee_shops_with_wifi: 40,
      mobile_network_coverage: 95,
      healthcare_quality: 6
    };
  }

  return INFRASTRUCTURE_DEFAULTS;
}

export async function updateNomadData(destinationId, nomadData) {
  const { wifi_reliability, coworking_density, visa_friendly, english_speaking, cost_of_living, safety, visa_options, best_cities, coworking_recs } = nomadData;

  const overall_score = calculateOverallScore({
    wifi_reliability,
    coworking_density,
    visa_friendly,
    english_speaking,
    cost_of_living,
    safety
  });

  const existing = await db.prepare('SELECT id FROM nomad_data WHERE destination_id = ?').get(destinationId);

  if (existing) {
    await db.prepare(`
      UPDATE nomad_data SET
        wifi_reliability = ?, coworking_density = ?, visa_friendly = ?, english_speaking = ?,
        cost_of_living = ?, safety = ?, overall_score = ?,
        visa_options = ?, best_cities = ?, coworking_recs = ?,
        updated_at = NOW()
      WHERE id = ?
    `).run(wifi_reliability, coworking_density, visa_friendly, english_speaking,
          cost_of_living, safety, overall_score,
          JSON.stringify(visa_options || []), JSON.stringify(best_cities || []), JSON.stringify(coworking_recs || []),
          existing.id);
  } else {
    await db.prepare(`
      INSERT INTO nomad_data (destination_id, wifi_reliability, coworking_density, visa_friendly, english_speaking, cost_of_living, safety, overall_score, visa_options, best_cities, coworking_recs, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(destinationId, wifi_reliability, coworking_density, visa_friendly, english_speaking,
          cost_of_living, safety, overall_score,
          JSON.stringify(visa_options || []), JSON.stringify(best_cities || []), JSON.stringify(coworking_recs || []));
  }

  logger.info(`[NomadInfrastructure] Updated nomad data for destination ${destinationId}`);

  return { destination_id: destinationId, overall_score, success: true };
}

export async function getAllNomadData() {
  return db.prepare(`
    SELECT n.*, d.name as country_name
    FROM nomad_data n
    JOIN destinations d ON d.id = n.destination_id
    ORDER BY n.overall_score DESC
  `).all();
}

export { DEFAULT_NOMAD_SCORES, INFRASTRUCTURE_DEFAULTS };