import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeAll } from '../middleware/validate.js';
import logger from '../services/logger.js';

const router = express.Router();

const CATEGORIES = ['documents', 'electronics', 'clothing', 'toiletries', 'medicine', 'essentials', 'activities', 'other'];

// GET /packing-lists/templates - Get available templates
router.get('/templates', async (req, res) => {
  try {
    const { climate, trip_type } = req.query;
    
    let query = 'SELECT id, name, description, climate, trip_type, items, created_at FROM packing_templates WHERE 1=1';
    const params = [];

    if (climate) {
      query += ' AND (climate = ? OR climate = \'mixed\')';
      params.push(climate);
    }

    if (trip_type) {
      query += ' AND (trip_type = ? OR trip_type = \'mixed\')';
      params.push(trip_type);
    }

    query += ' ORDER BY name';
    
    const templates = await db.prepare(query).all(...params);

    const formatted = templates.map(t => {
      let items;
      try {
        items = JSON.parse(t.items || '[]');
      } catch {
        items = [];
      }
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        climate: t.climate,
        tripType: t.trip_type,
        items,
        createdAt: t.created_at
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    logger.error(`[Packing] Failed to fetch templates: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch templates' });
  }
});

// GET /packing-lists/:tripId - Get packing list for a trip
router.get('/:tripId', authenticate, async (req, res) => {
  try {
    const { tripId } = req.params;

    // Get packing list
    let list = await db.prepare(`
      SELECT id, trip_id, name, is_shared, created_at FROM packing_lists 
      WHERE trip_id = ? AND user_id = ?
    `).get(tripId, req.userId);

    if (!list) {
      return res.json({ 
        success: true, 
        data: null 
      });
    }

    // Get items
    const items = await db.prepare(`
      SELECT id, name, category, quantity, is_packed, is_essential, is_custom, notes, created_at FROM packing_items 
      WHERE packing_list_id = ?
      ORDER BY category, is_essential DESC, name
    `).all(list.id);

    const formatted = {
      id: list.id,
      tripId: list.trip_id,
      name: list.name,
      isShared: Boolean(list.is_shared),
      createdAt: list.created_at,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        isPacked: Boolean(i.is_packed),
        isEssential: Boolean(i.is_essential),
        isCustom: Boolean(i.is_custom),
        notes: i.notes,
        createdAt: i.created_at
      }))
    };

    res.json({ success: true, data: formatted });
  } catch (error) {
    logger.error(`[Packing] Failed to fetch list: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch packing list' });
  }
});

// POST /packing-lists - Create new packing list
router.post('/', authenticate, async (req, res) => {
  try {
    const { tripId, name, templateId } = req.body;

    if (!tripId) {
      return res.status(400).json({ success: false, error: 'Trip ID is required' });
    }

    // Verify trip ownership
    const trip = await db.prepare('SELECT id, destination FROM trips WHERE id = ? AND user_id = ?').get(tripId, req.userId);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Check if list already exists
    const existing = await db.prepare('SELECT id FROM packing_lists WHERE trip_id = ? AND user_id = ?').get(tripId, req.userId);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Packing list already exists for this trip' });
    }

    const listName = name || `Packing for ${trip.destination || 'trip'}`;

    // Create list
    const result = await db.prepare(`
      INSERT INTO packing_lists (user_id, trip_id, name) VALUES (?, ?, ?)
    `).run(req.userId, tripId, listName);

    const listId = result.lastInsertRowid;

    // If template provided, use it
    if (templateId) {
      const template = await db.prepare('SELECT id, name, description, climate, trip_type, items FROM packing_templates WHERE id = ?').get(templateId);
      if (template) {
        let items;
        try {
          items = JSON.parse(template.items);
        } catch {
          items = [];
        }
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            await db.prepare(`
              INSERT INTO packing_items (packing_list_id, name, category, quantity, is_essential, is_custom)
              VALUES (?, ?, ?, ?, ?, false)
            `).run(listId, item.name, item.category, item.quantity, item.isEssential || false);
          }
        }
      }
    } else {
      // Insert default essentials
      const defaultItems = [
        { name: 'Passport', category: 'documents', quantity: 1, isEssential: true },
        { name: 'Travel insurance docs', category: 'documents', quantity: 1, isEssential: true },
        { name: 'Phone charger', category: 'electronics', quantity: 1, isEssential: true },
        { name: 'Underwear (days + 1)', category: 'clothing', quantity: 1, isEssential: true },
        { name: 'Toothbrush & paste', category: 'toiletries', quantity: 1, isEssential: true },
        { name: 'Medications', category: 'medicine', quantity: 1, isEssential: true },
        { name: 'Wallet & cards', category: 'essentials', quantity: 1, isEssential: true }
      ];

      for (const item of defaultItems) {
        await db.prepare(`
          INSERT INTO packing_items (packing_list_id, name, category, quantity, is_essential)
          VALUES (?, ?, ?, ?, ?)
        `).run(listId, item.name, item.category, item.quantity, item.isEssential);
      }
    }

    // Fetch and return created list
    const list = await db.prepare('SELECT id, trip_id, name, is_shared, created_at FROM packing_lists WHERE id = ?').get(listId);
    const items = await db.prepare('SELECT id, name, category, quantity, is_packed, is_essential, is_custom, notes FROM packing_items WHERE packing_list_id = ? ORDER BY category').all(listId);

    res.status(201).json({
      success: true,
      data: {
        id: list.id,
        tripId: list.trip_id,
        name: list.name,
        isShared: Boolean(list.is_shared),
        createdAt: list.created_at,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          category: i.category,
          quantity: i.quantity,
          isPacked: Boolean(i.is_packed),
          isEssential: Boolean(i.is_essential),
          isCustom: Boolean(i.is_custom),
          notes: i.notes
        }))
      }
    });
  } catch (error) {
    logger.error(`[Packing] Failed to create list: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to create packing list' });
  }
});

// PUT /packing-lists/:id/items/:itemId - Update item (check off, quantity)
router.put('/:id/items/:itemId', authenticate, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { isPacked, quantity, notes } = req.body;

    // Verify ownership
    const list = await db.prepare('SELECT id, trip_id, name, is_shared, created_at FROM packing_lists WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Packing list not found' });
    }

    const item = await db.prepare('SELECT id FROM packing_items WHERE id = ? AND packing_list_id = ?').get(itemId, id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Build update
    const updates = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];

    if (isPacked !== undefined) {
      updates.push('is_packed = ?');
      params.push(isPacked ? true : false);
    }

    if (quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(Math.max(1, quantity));
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    params.push(itemId);

    await db.prepare(`UPDATE packing_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = await db.prepare('SELECT id, name, category, quantity, is_packed, is_essential, is_custom, notes FROM packing_items WHERE id = ?').get(itemId);

    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        quantity: updated.quantity,
        isPacked: Boolean(updated.is_packed),
        isEssential: Boolean(updated.is_essential),
        isCustom: Boolean(updated.is_custom),
        notes: updated.notes
      }
    });
  } catch (error) {
    logger.error(`[Packing] Failed to update item: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
});

// POST /packing-lists/:id/items - Add custom item
router.post('/:id/items', authenticate, sanitizeAll(['name', 'notes']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category = 'other', quantity = 1, isEssential = false, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    // Verify ownership
    const list = await db.prepare('SELECT id, trip_id, name, is_shared, created_at FROM packing_lists WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Packing list not found' });
    }

    const result = await db.prepare(`
      INSERT INTO packing_items (packing_list_id, name, category, quantity, is_essential, is_custom, notes)
      VALUES (?, ?, ?, ?, ?, true, ?)
    `).run(id, name, category, quantity, isEssential ? true : false, notes || null);

    const item = await db.prepare('SELECT id, name, category, quantity, is_packed, is_essential, is_custom, notes FROM packing_items WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: {
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        isPacked: Boolean(item.is_packed),
        isEssential: Boolean(item.is_essential),
        isCustom: Boolean(item.is_custom),
        notes: item.notes
      }
    });
  } catch (error) {
    logger.error(`[Packing] Failed to add item: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to add item' });
  }
});

// DELETE /packing-lists/:id/items/:itemId - Remove item
router.delete('/:id/items/:itemId', authenticate, async (req, res) => {
  try {
    const { id, itemId } = req.params;

    // Verify ownership
    const list = await db.prepare('SELECT id, trip_id, name, is_shared, created_at FROM packing_lists WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Packing list not found' });
    }

    await db.prepare('DELETE FROM packing_items WHERE id = ? AND packing_list_id = ?').run(itemId, id);

    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    logger.error(`[Packing] Failed to remove item: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to remove item' });
  }
});

// POST /packing-lists/:id/duplicate - Duplicate from previous trip
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceTripId } = req.body;

    if (!sourceTripId) {
      return res.status(400).json({ success: false, error: 'Source trip ID is required' });
    }

    // Verify ownership of target list
    const targetList = await db.prepare('SELECT id, trip_id, name, is_shared, created_at FROM packing_lists WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!targetList) {
      return res.status(404).json({ success: false, error: 'Packing list not found' });
    }

    // Get source list
    const sourceList = await db.prepare('SELECT id, trip_id, name, is_shared, created_at FROM packing_lists WHERE trip_id = ? AND user_id = ?').get(sourceTripId, req.userId);
    if (!sourceList) {
      return res.status(404).json({ success: false, error: 'No packing list found for source trip' });
    }

    // Get source items
    const sourceItems = await db.prepare('SELECT id, name, category, quantity, is_packed, is_essential, is_custom, notes FROM packing_items WHERE packing_list_id = ?').all(sourceList.id);

    // Add items to target list
    for (const item of sourceItems) {
      await db.prepare(`
        INSERT INTO packing_items (packing_list_id, name, category, quantity, is_essential, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, item.name, item.category, item.quantity, item.is_essential, item.notes);
    }

    // Fetch updated list
    const items = await db.prepare('SELECT id, name, category, quantity, is_packed, is_essential, is_custom, notes FROM packing_items WHERE packing_list_id = ? ORDER BY category').all(id);

    res.json({
      success: true,
      data: {
        itemsAdded: sourceItems.length
      }
    });
  } catch (error) {
    logger.error(`[Packing] Failed to duplicate list: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to duplicate list' });
  }
});

// POST /packing-lists/:id/share - Create a share link for a packing list
router.post('/:id/share', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { sharedWithUserId } = req.body;

    const list = await db.prepare('SELECT id, user_id, name, is_shared FROM packing_lists WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Packing list not found' });
    }

    const crypto = await import('crypto');
    const shareToken = crypto.randomBytes(32).toString('hex');

    if (sharedWithUserId) {
      await db.prepare(`
        INSERT INTO packing_list_shares (packing_list_id, shared_with_user_id, share_token)
        VALUES (?, ?, ?)
        ON CONFLICT (packing_list_id, shared_with_user_id) DO UPDATE SET share_token = ?
      `).run(id, sharedWithUserId, shareToken, shareToken);
    }

    await db.run('UPDATE packing_lists SET is_shared = true WHERE id = ?', id);

    const shareUrl = `/packing-lists/shared/${shareToken}`;

    res.json({
      success: true,
      data: { shareToken, shareUrl }
    });
  } catch (error) {
    logger.error(`[Packing] Failed to share list: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to share list' });
  }
});

// GET /packing-lists/shared/:token - Get a shared packing list (public)
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const share = await db.prepare(`
      SELECT pls.*, pl.name, pl.items as list_items, pl.trip_id, u.name as owner_name
      FROM packing_list_shares pls
      JOIN packing_lists pl ON pls.packing_list_id = pl.id
      LEFT JOIN users u ON pl.user_id = u.id
      WHERE pls.share_token = ?
    `).get(token);

    if (!share) {
      return res.status(404).json({ success: false, error: 'Shared list not found' });
    }

    const items = await db.prepare('SELECT * FROM packing_items WHERE packing_list_id = ?').all(share.packing_list_id);

    res.json({
      success: true,
      data: {
        name: share.name,
        ownerName: share.owner_name,
        tripId: share.trip_id,
        items
      }
    });
  } catch (error) {
    logger.error(`[Packing] Failed to fetch shared list: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch shared list' });
  }
});

export default router;
