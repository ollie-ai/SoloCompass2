import axios from 'axios';
import logger from './logger.js';

// Frankfurter API - Free, no API key required
// Docs: https://www.frankfurter.app/
const FRANKFURTER_BASE_URL = 'https://api.frankfurter.app';

// Cache for 1 hour
const currencyCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getCached(key) {
  const cached = currencyCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  currencyCache.delete(key);
  return null;
}

function setCache(key, data) {
  currencyCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Get exchange rate between two currencies
 * @param {string} from - Source currency (e.g., "GBP")
 * @param {string} to - Target currency (e.g., "EUR")
 */
export async function getExchangeRate(from, to) {
  const cacheKey = `rate:${from}:${to}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(
      `${FRANKFURTER_BASE_URL}/latest`,
      { params: { from, to } }
    );

    const rate = response.data?.rates?.[to];
    
    if (rate === undefined) {
      throw new Error(`Currency ${to} not found in response`);
    }

    const result = {
      from,
      to,
      rate,
      date: response.data?.date
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    logger.error(`[Currency] API Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency
 * @param {string} to - Target currency
 */
export async function convertCurrency(amount, from, to) {
  if (from === to) {
    return { amount, converted: amount, rate: 1, from, to };
  }

  const cacheKey = `convert:${amount}:${from}:${to}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(
      `${FRANKFURTER_BASE_URL}/latest`,
      { params: { amount, from, to } }
    );

    const converted = response.data?.rates?.[to];
    
    if (converted === undefined) {
      throw new Error(`Conversion rate for ${to} not found`);
    }

    const rate = converted / amount;

    const result = {
      amount,
      converted,
      rate,
      from,
      to,
      date: response.data?.date
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    logger.error(`[Currency] Conversion Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

/**
 * Get available currencies
 */
export async function getAvailableCurrencies() {
  const cacheKey = 'currencies:list';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${FRANKFURTER_BASE_URL}/currencies`);
    
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response from currency provider');
    }

    const result = {
      currencies: response.data,
      count: Object.keys(response.data).length
    };

    // Cache for longer (24 hours)
    currencyCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    logger.error(`[Currency] List Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

/**
 * Get historical exchange rate
 * @param {string} from - Source currency
 * @param {string} to - Target currency  
 * @param {string} date - Date in YYYY-MM-DD format
 */
export async function getHistoricalRate(from, to, date) {
  const cacheKey = `historical:${from}:${to}:${date}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(
      `${FRANKFURTER_BASE_URL}/${date}`,
      { params: { from, to } }
    );

    const rate = response.data.rates[to];
    
    const result = {
      from,
      to,
      rate,
      date
    };

    // Cache historical data longer (7 days)
    currencyCache.set(cacheKey, { 
      data: result, 
      timestamp: Date.now() - (CACHE_TTL_MS * 24 * 7) // Make it "expired" so it won't auto-use
    });
    return result;
  } catch (error) {
    logger.error('Historical Rate Error:', error.response?.data || error.message);
    throw error;
  }
}

export function clearCurrencyCache() {
  currencyCache.clear();
}
