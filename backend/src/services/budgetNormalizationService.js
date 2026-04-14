import logger from './logger.js';
import db from '../db.js';

const CURRENCY_MAP = {
  'united kingdom': 'GBP',
  'united states': 'USD',
  'australia': 'AUD',
  'canada': 'CAD',
  'japan': 'JPY',
  'european union': 'EUR',
  'eu': 'EUR',
  'switzerland': 'CHF',
  'norway': 'NOK',
  'sweden': 'SEK',
  'denmark': 'DKK',
  'new zealand': 'NZD',
  'south africa': 'ZAR',
  'india': 'INR',
  'thailand': 'THB',
  'vietnam': 'VND',
  'indonesia': 'IDR',
  'mexico': 'MXN',
  'brazil': 'BRL',
  'argentina': 'ARS',
  'china': 'CNY',
  'south korea': 'KRW',
  'singapore': 'SGD',
  'hong kong': 'HKD',
  'uae': 'AED',
  'turkey': 'TRY',
  'egypt': 'EGP',
  'morocco': 'MAD',
  'kenya': 'KES',
  'nigeria': 'NGN',
  'philippines': 'PHP',
  'malaysia': 'MYR',
  'colombia': 'COP',
  'chile': 'CLP',
  'peru': 'PEN'
};

const DEFAULT_BUDGET_ESTIMATES = {
  backpacker: { min: 25, max: 40, currency: 'USD' },
  comfort: { min: 50, max: 100, currency: 'USD' },
  luxury: { min: 150, max: 300, currency: 'USD' }
};

export async function getBudget(countryName) {
  if (!countryName) {
    return createBudgetData(null, {});
  }

  const normalized = countryName.toLowerCase().trim();
  const currencyCode = getCurrencyCode(normalized);

  const storedBudget = await db.prepare(`
    SELECT * FROM budgets 
    WHERE LOWER(country_name) = LOWER(?)
    ORDER BY updated_at DESC
    LIMIT 1
  `).get(countryName);

  if (storedBudget) {
    return createBudgetData(currencyCode, {
      backpacker: { min: storedBudget.backpacker_min, max: storedBudget.backpacker_max },
      comfort: { min: storedBudget.comfort_min, max: storedBudget.comfort_max },
      luxury: { min: storedBudget.luxury_min, max: storedBudget.luxury_max },
      currency: storedBudget.currency,
      accommodation: storedBudget.accommodation_estimate,
      food: storedBudget.food_estimate,
      transport: storedBudget.transport_estimate
    });
  }

  return createBudgetData(currencyCode, getDefaultBudgetForRegion(normalized));
}

function createBudgetData(currency, overrides = {}) {
  const base = {
    currency: currency || 'USD',
    last_updated: new Date().toISOString()
  };

  const backpacker = calculateDailyRange(
    overrides.backpacker?.min ?? DEFAULT_BUDGET_ESTIMATES.backpacker.min,
    overrides.backpacker?.max ?? DEFAULT_BUDGET_ESTIMATES.backpacker.max
  );

  const comfort = calculateDailyRange(
    overrides.comfort?.min ?? DEFAULT_BUDGET_ESTIMATES.comfort.min,
    overrides.comfort?.max ?? DEFAULT_BUDGET_ESTIMATES.comfort.max
  );

  const luxury = calculateDailyRange(
    overrides.luxury?.min ?? DEFAULT_BUDGET_ESTIMATES.luxury.min,
    overrides.luxury?.max ?? DEFAULT_BUDGET_ESTIMATES.luxury.max
  );

  return {
    ...base,
    daily: {
      backpacker,
      comfort,
      luxury
    },
    monthly: {
      backpacker: { min: backpacker.min * 30, max: backpacker.max * 30 },
      comfort: { min: comfort.min * 30, max: comfort.max * 30 },
      luxury: { min: luxury.min * 30, max: luxury.max * 30 }
    },
    accommodation: overrides.accommodation || null,
    food: overrides.food || null,
      transport: overrides.transport || null,
    source: 'calculated'
  };
}

export function calculateDailyRange(backpacker, comfort) {
  const backpackerMax = backpacker * 1.5;

  return {
    min: Math.round(backpacker),
    max: Math.round(backpackerMax)
  };
}

export function getCurrencyCode(countryName) {
  if (!countryName) return 'USD';

  const normalized = countryName.toLowerCase().trim();

  for (const [key, currency] of Object.entries(CURRENCY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return currency;
    }
  }

  return 'USD';
}

function getDefaultBudgetForRegion(countryKey) {
  const highCostRegions = ['united kingdom', 'united states', 'switzerland', 'norway', 'denmark', 'australia', 'new zealand', 'japan', 'singapore', 'hong kong'];
  const midCostRegions = ['canada', 'eu', 'france', 'germany', 'italy', 'spain', 'portugal', 'greece', 'south korea', 'uae'];
  const lowCostRegions = ['thailand', 'vietnam', 'indonesia', 'india', 'philippines', 'malaysia', 'colombia', 'peru', 'bolivia', 'nicaragua', 'guatemala'];

  if (highCostRegions.some(r => countryKey.includes(r))) {
    return {
      backpacker: { min: 50, max: 80 },
      comfort: { min: 100, max: 200 },
      luxury: { min: 250, max: 500 }
    };
  }

  if (midCostRegions.some(r => countryKey.includes(r))) {
    return {
      backpacker: { min: 35, max: 60 },
      comfort: { min: 70, max: 130 },
      luxury: { min: 180, max: 350 }
    };
  }

  if (lowCostRegions.some(r => countryKey.includes(r))) {
    return {
      backpacker: { min: 15, max: 30 },
      comfort: { min: 35, max: 70 },
      luxury: { min: 100, max: 200 }
    };
  }

  return {
    backpacker: { min: 25, max: 45 },
    comfort: { min: 50, max: 100 },
    luxury: { min: 150, max: 300 }
  };
}

export async function updateBudget(destinationId, budgetData) {
  const { backpacker_min, backpacker_max, comfort_min, comfort_max, luxury_min, luxury_max, currency, accommodation, food, transport } = budgetData;

  const existing = await db.prepare('SELECT id FROM budgets WHERE destination_id = ?').get(destinationId);

  if (existing) {
    await db.prepare(`
      UPDATE budgets SET
        backpacker_min = ?, backpacker_max = ?,
        comfort_min = ?, comfort_max = ?,
        luxury_min = ?, luxury_max = ?,
        currency = ?, accommodation_estimate = ?, food_estimate = ?, transport_estimate = ?,
        updated_at = NOW()
      WHERE id = ?
    `).run(backpacker_min, backpacker_max, comfort_min, comfort_max, luxury_min, luxury_max,
           currency, accommodation, food, transport, existing.id);
  } else {
    await db.prepare(`
      INSERT INTO budgets (destination_id, backpacker_min, backpacker_max, comfort_min, comfort_max, luxury_min, luxury_max, currency, accommodation_estimate, food_estimate, transport_estimate, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(destinationId, backpacker_min, backpacker_max, comfort_min, comfort_max, luxury_min, luxury_max,
           currency, accommodation, food, transport);
  }

  logger.info(`[BudgetNormalization] Updated budget for destination ${destinationId}`);

  return { destination_id: destinationId, success: true };
}

export async function getAllBudgets() {
  return db.prepare(`
    SELECT b.*, d.name as country_name
    FROM budgets b
    JOIN destinations d ON d.id = b.destination_id
    ORDER BY d.name ASC
  `).all();
}

export function convertCurrency(amount, fromCurrency, toCurrency) {
  const RATES = {
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    AUD: 1.53,
    CAD: 1.36,
    JPY: 149.5,
    CHF: 0.88,
    NZD: 1.63,
    INR: 83.12
  };

  const fromRate = RATES[fromCurrency] || 1;
  const toRate = RATES[toCurrency] || 1;

  const usdAmount = amount / fromRate;
  return Math.round(usdAmount * toRate * 100) / 100;
}

export { CURRENCY_MAP, DEFAULT_BUDGET_ESTIMATES };