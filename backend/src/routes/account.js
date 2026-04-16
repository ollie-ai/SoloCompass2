import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import logger from '../services/logger.js';
import { deleteUserAccountCascade, generateUserDataExport } from '../services/dataExport.js';

const router = express.Router();

router.use(requireAuth);

router.get('/data-export', async (req, res) => {
  try {
    const exportPayload = await generateUserDataExport(req.userId);
    const json = JSON.stringify(exportPayload, null, 2);
    const filename = `solocompass-data-export-${req.userId}-${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(json);
  } catch (error) {
    logger.error(`[Account] Data export failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate account data export' }
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    await deleteUserAccountCascade(req.userId);
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      data: { message: 'Account and associated data deleted' }
    });
  } catch (error) {
    logger.error(`[Account] Deletion failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' }
    });
  }
});

export default router;
