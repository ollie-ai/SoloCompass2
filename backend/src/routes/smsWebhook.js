import express from 'express';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../services/logger.js';

const router = express.Router();

router.post('/sms', async (req, res) => {
  try {
    const { From, Body } = req.body;
    
    if (!From) {
      return res.status(400).json({ error: 'Missing phone number' });
    }

    const normalizedPhone = From.replace('+', '').replace(/\D/g, '');
    
    const contact = await db.get(`
      SELECT ec.*, u.name as user_name
      FROM emergency_contacts ec
      JOIN users u ON ec.user_id = u.id
      WHERE REPLACE(REPLACE(ec.phone, '+', ''), ' ', '') ILIKE ?
    `, `%${normalizedPhone}`);

    if (!contact) {
      logger.info('SMS from unknown number:', From);
      return res.status(200).send('OK');
    }

    const response = Body?.trim().toUpperCase();

    if (response === 'YES' || response === 'CONFIRM') {
      await db.run(`
        UPDATE emergency_contacts 
        SET verified = true, verification_code = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, contact.id);
      
      logger.info(`Contact ${contact.id} verified via SMS`);
      res.status(200).send('Thank you! You are now verified as an emergency contact for SoloCompass.');
      return;
    }

    if (response === 'STOP' || response === 'UNSUBSCRIBE') {
      await db.run(`
        UPDATE emergency_contacts 
        SET notify_on_emergency = false, notify_on_checkin = false, verified = false, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, contact.id);
      
      logger.info(`Contact ${contact.id} opted out via SMS`);
      res.status(200).send('You have been unsubscribed from SoloCompass emergency notifications.');
      return;
    }

    res.status(200).send('Reply YES to verify your phone number, or STOP to unsubscribe.');
  } catch (error) {
    logger.error('SMS webhook error:', error);
    res.status(200).send('OK');
  }
});

export default router;