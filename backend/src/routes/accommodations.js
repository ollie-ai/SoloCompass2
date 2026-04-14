import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { sanitizeAll } from '../middleware/validate.js';
import db from '../db.js';
import logger from '../services/logger.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg } });
  }
  next();
};

const VALID_TYPES = ['hotel', 'airbnb', 'hostel', 'other'];

const accommodationValidation = {
  create: [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').optional().isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
    body('check_in_date').optional().isISO8601().withMessage('Check-in date must be a valid ISO date'),
    body('check_out_date').optional().isISO8601().withMessage('Check-out date must be a valid ISO date'),
  ],
  update: [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('type').optional().isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
    body('check_in_date').optional().isISO8601().withMessage('Check-in date must be a valid ISO date'),
    body('check_out_date').optional().isISO8601().withMessage('Check-out date must be a valid ISO date'),
  ],
};

router.get('/:tripId/accommodation', requireAuth, async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
    }

    const accommodation = await db.prepare('SELECT id, trip_id, name, type, address, check_in_date, check_out_date, confirmation_number, notes, cost, currency, created_at, updated_at FROM accommodations WHERE trip_id = ?').get(tripId);

    res.json({ success: true, data: accommodation || null });
  } catch (error) {
    logger.error('[Accommodation] Get error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch accommodation' } });
  }
});

router.post('/:tripId/accommodation', requireAuth, sanitizeAll(['name', 'address', 'notes']), accommodationValidation.create, handleValidationErrors, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, type, address, check_in_date, check_out_date, confirmation_number, notes, cost, currency } = req.body;

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
    }

    const existing = await db.prepare('SELECT id FROM accommodations WHERE trip_id = ?').get(tripId);
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Accommodation already exists for this trip. Use PUT to update.' } });
    }

    const result = await db.prepare(`
      INSERT INTO accommodations (trip_id, name, type, address, check_in_date, check_out_date, confirmation_number, notes, cost, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tripId, name, type || 'other', address || null, check_in_date || null, check_out_date || null, confirmation_number || null, notes || null, cost || null, currency || 'USD');

    const accommodation = await db.prepare('SELECT id, trip_id, name, type, address, check_in_date, check_out_date, confirmation_number, notes, cost, currency, created_at, updated_at FROM accommodations WHERE id = ?').get(result.lastInsertRowid);

    logger.info(`[Accommodation] Created accommodation ${accommodation.id} for trip ${tripId}`);
    res.status(201).json({ success: true, data: accommodation });
  } catch (error) {
    logger.error('[Accommodation] Create error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create accommodation' } });
  }
});

router.put('/:tripId/accommodation', requireAuth, sanitizeAll(['name', 'address', 'notes']), accommodationValidation.update, handleValidationErrors, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, type, address, check_in_date, check_out_date, confirmation_number, notes, cost, currency } = req.body;

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
    }

    const existing = await db.prepare('SELECT id FROM accommodations WHERE trip_id = ?').get(tripId);
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Accommodation not found. Use POST to create.' } });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (check_in_date !== undefined) { updates.push('check_in_date = ?'); params.push(check_in_date); }
    if (check_out_date !== undefined) { updates.push('check_out_date = ?'); params.push(check_out_date); }
    if (confirmation_number !== undefined) { updates.push('confirmation_number = ?'); params.push(confirmation_number); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (cost !== undefined) { updates.push('cost = ?'); params.push(cost); }
    if (currency !== undefined) { updates.push('currency = ?'); params.push(currency); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No fields to update' } });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(tripId);

    await db.prepare(`UPDATE accommodations SET ${updates.join(', ')} WHERE trip_id = ?`).run(...params);

    const accommodation = await db.prepare('SELECT id, trip_id, name, type, address, check_in_date, check_out_date, confirmation_number, notes, cost, currency, created_at, updated_at FROM accommodations WHERE trip_id = ?').get(tripId);

    logger.info(`[Accommodation] Updated accommodation ${accommodation.id} for trip ${tripId}`);
    res.json({ success: true, data: accommodation });
  } catch (error) {
    logger.error('[Accommodation] Update error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update accommodation' } });
  }
});

router.delete('/:tripId/accommodation', requireAuth, async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
    }

    const result = await db.prepare('DELETE FROM accommodations WHERE trip_id = ?').run(tripId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Accommodation not found' } });
    }

    logger.info(`[Accommodation] Deleted accommodation for trip ${tripId}`);
    res.json({ success: true, message: 'Accommodation deleted' });
  } catch (error) {
    logger.error('[Accommodation] Delete error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete accommodation' } });
  }
});

export default router;