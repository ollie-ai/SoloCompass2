import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getExchangeRate, convertCurrency, getAvailableCurrencies, getHistoricalRate } from '../services/currencyService.js';
import logger from '../services/logger.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /currency/rate?from=GBP&to=EUR
 * Get exchange rate between two currencies
 */
router.get('/rate', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Both "from" and "to" query parameters are required (e.g., ?from=GBP&to=EUR)'
      });
    }

    const rate = await getExchangeRate(from.toUpperCase(), to.toUpperCase());
    res.json({ success: true, data: rate });
  } catch (error) {
    logger.error(`[Currency] Rate lookup failed: ${error.response?.data || error.message}`);

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Currency not found',
        message: 'One or both currencies are not supported'
      });
    }

    res.status(500).json({
      error: 'Currency lookup failed',
      message: error.response?.data?.message || 'Failed to fetch exchange rate'
    });
  }
});

/**
 * POST /currency/convert
 * Convert amount between currencies
 * Body: { "amount": 100, "from": "GBP", "to": "EUR" }
 */
router.post('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Body must include "amount", "from", and "to"'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    const result = await convertCurrency(amount, from.toUpperCase(), to.toUpperCase());
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`[Currency] Conversion failed: ${error.response?.data || error.message}`);

    res.status(500).json({
      error: 'Conversion failed',
      message: error.response?.data?.message || 'Failed to convert currency'
    });
  }
});

/**
 * GET /currency/list
 * Get list of available currencies
 */
router.get('/list', async (req, res) => {
  try {
    const result = await getAvailableCurrencies();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`[Currency] List fetch failed: ${error.response?.data || error.message}`);

    res.status(500).json({
      error: 'Failed to fetch currencies',
      message: error.response?.data?.message || 'Failed to get available currencies'
    });
  }
});

/**
 * GET /currency/history?from=GBP&to=EUR&date=2026-01-15
 * Get historical exchange rate
 */
router.get('/history', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Query must include "from", "to", and "date" (YYYY-MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    const rate = await getHistoricalRate(from.toUpperCase(), to.toUpperCase(), date);
    res.json({ success: true, data: rate });
  } catch (error) {
    logger.error(`[Currency] Historical rate lookup failed: ${error.response?.data || error.message}`);

    res.status(500).json({
      error: 'Historical rate lookup failed',
      message: error.response?.data?.message || 'Failed to fetch historical rate'
    });
  }
});

export default router;
