import express from 'express';
import { authenticate } from '../middleware/auth.js';
import logger from '../services/logger.js';

const router = express.Router();

router.post('/purchase', authenticate, async (req, res) => {
  try {
    const { country, dataPlan, phoneNumber } = req.body;
    
    logger.info(`[eSIM] Purchase request from user ${req.userId}: ${country}, plan: ${dataPlan}`);
    
    res.json({
      success: false,
      error: {
        code: 'COMING_SOON',
        message: 'eSIM purchase is coming soon! We are integrating with eSIM providers.',
        estimatedLaunch: 'Q2 2026'
      }
    });
  } catch (error) {
    logger.error(`[eSIM] Purchase failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process eSIM request' }
    });
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        available: false,
        providers: [],
        message: 'eSIM service is coming soon!'
      }
    });
  } catch (error) {
    logger.error(`[eSIM] Status check failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to check eSIM status' }
    });
  }
});

export default router;