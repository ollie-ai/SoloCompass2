import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../db.js';
import logger from '../services/logger.js';

const router = express.Router({ mergeParams: true });

const VALID_ITEM_KEYS = ['packing', 'contacts', 'checkins', 'documents'];

function formatChecklistItem(item) {
  return {
    id: item.id,
    userId: item.user_id,
    tripId: item.trip_id,
    itemKey: item.item_key,
    completed: Boolean(item.completed),
    completedAt: item.completed_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

router.get('/:tripId', authenticate, async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const items = await db.prepare(`
      SELECT id, user_id, trip_id, item_key, completed, completed_at, created_at, updated_at
      FROM trip_checklist_items
      WHERE user_id = ? AND trip_id = ?
      ORDER BY created_at ASC
    `).all(req.userId, tripId);

    const checklistState = {
      packing: false,
      contacts: false,
      checkins: false,
      documents: false,
    };

    for (const item of items) {
      if (item.item_key === 'packing') checklistState.packing = Boolean(item.completed);
      if (item.item_key === 'contacts') checklistState.contacts = Boolean(item.completed);
      if (item.item_key === 'checkins') checklistState.checkins = Boolean(item.completed);
      if (item.item_key === 'documents') checklistState.documents = Boolean(item.completed);
    }

    res.json({
      success: true,
      data: {
        items: items.map(formatChecklistItem),
        state: checklistState
      }
    });
  } catch (error) {
    logger.error('Get checklist error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch checklist' });
  }
});

router.post('/:tripId', authenticate, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { itemKey, completed } = req.body;

    if (!itemKey || !VALID_ITEM_KEYS.includes(itemKey)) {
      return res.status(400).json({
        success: false,
        error: `Invalid item key. Must be one of: ${VALID_ITEM_KEYS.join(', ')}`
      });
    }

    const trip = await db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const existing = await db.prepare(`
      SELECT id, user_id, trip_id, item_key, completed, completed_at, created_at, updated_at
      FROM trip_checklist_items
      WHERE user_id = ? AND trip_id = ? AND item_key = ?
    `).get(req.userId, tripId, itemKey);

    let item;
    if (existing) {
      const completedAt = completed ? new Date().toISOString() : null;
      await db.prepare(`
        UPDATE trip_checklist_items
        SET completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(completed, completedAt, existing.id);

      item = await db.prepare('SELECT id, user_id, trip_id, item_key, completed, completed_at, created_at, updated_at FROM trip_checklist_items WHERE id = ?').get(existing.id);
    } else {
      const completedAt = completed ? new Date().toISOString() : null;
      const result = await db.prepare(`
        INSERT INTO trip_checklist_items (user_id, trip_id, item_key, completed, completed_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.userId, tripId, itemKey, completed, completedAt);

      item = await db.prepare('SELECT id, user_id, trip_id, item_key, completed, completed_at, created_at, updated_at FROM trip_checklist_items WHERE id = ?').get(result.lastInsertRowid);
    }

    logger.info(`Checklist item ${item.completed ? 'completed' : 'uncompleted'}: ${itemKey} for trip ${tripId}`);

    res.json({
      success: true,
      data: formatChecklistItem(item)
    });
  } catch (error) {
    logger.error('Update checklist error:', error);
    res.status(500).json({ success: false, error: 'Failed to update checklist' });
  }
});

router.put('/:tripId/:itemId', authenticate, async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const { completed } = req.body;

    const item = await db.prepare(`
      SELECT id, user_id, trip_id, item_key, completed, completed_at, created_at, updated_at
      FROM trip_checklist_items
      WHERE id = ? AND user_id = ? AND trip_id = ?
    `).get(itemId, req.userId, tripId);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Checklist item not found' });
    }

    const completedAt = completed ? new Date().toISOString() : null;
    await db.prepare(`
      UPDATE trip_checklist_items
      SET completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(completed, completedAt, itemId);

    const updated = await db.prepare('SELECT id, user_id, trip_id, item_key, completed, completed_at, created_at, updated_at FROM trip_checklist_items WHERE id = ?').get(itemId);

    res.json({
      success: true,
      data: formatChecklistItem(updated)
    });
  } catch (error) {
    logger.error('Update checklist item error:', error);
    res.status(500).json({ success: false, error: 'Failed to update checklist item' });
  }
});

router.delete('/:tripId/:itemId', authenticate, async (req, res) => {
  try {
    const { tripId, itemId } = req.params;

    const item = await db.prepare(`
      SELECT id, user_id, trip_id, item_key, completed, completed_at, created_at, updated_at
      FROM trip_checklist_items
      WHERE id = ? AND user_id = ? AND trip_id = ?
    `).get(itemId, req.userId, tripId);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Checklist item not found' });
    }

    await db.prepare('DELETE FROM trip_checklist_items WHERE id = ?').run(itemId);

    logger.info(`Checklist item deleted: ${item.item_key} for trip ${tripId}`);

    res.json({
      success: true,
      message: 'Checklist item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete checklist item error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete checklist item' });
  }
});

export default router;
