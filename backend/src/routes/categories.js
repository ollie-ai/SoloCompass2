import express from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sanitizeAll } from '../middleware/validate.js';
import logger from '../services/logger.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    let query = 'SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name ILIKE ? OR description ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const categories = await db.prepare(query).all(...params);

    const countQuery = `SELECT COUNT(*) as total FROM categories ${search ? 'WHERE name ILIKE ? OR description ILIKE ?' : ''}`;
    const countParams = search ? [`%${search}%`, `%${search}%`] : [];
    const { total } = await db.prepare(countQuery).get(...countParams);

    return res.status(200).json({
      data: { categories, total, limit: parseInt(limit), offset: parseInt(offset) },
      message: 'Categories fetched',
      error: null
    });
  } catch (error) {
    logger.error(`[Categories] Failed to get categories: ${error.message}`);
    return res.status(500).json({ data: null, message: 'Failed to get categories', error: 'An unexpected error occurred' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.prepare('SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ?').get(id);

    if (!category) {
      return res.status(404).json({ data: null, message: 'Category not found', error: 'Category not found' });
    }

    return res.status(200).json({
      data: { category },
      message: 'Category fetched',
      error: null
    });
  } catch (error) {
    logger.error(`[Categories] Failed to get category: ${error.message}`);
    return res.status(500).json({ data: null, message: 'Failed to get category', error: 'An unexpected error occurred' });
  }
});

router.get('/:id/resources', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0, status } = req.query;

    const category = await db.prepare('SELECT id, name, slug, description FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ data: null, message: 'Category not found', error: 'Category not found' });
    }

    const isAdmin = req.userRole === 'admin';
    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM resources r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.category_id = ? AND r.deleted_at IS NULL
    `;
    const params = [id];

    if (!isAdmin) {
      query += ' AND r.user_id = ?';
      params.push(req.userId);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const resources = await db.prepare(query).all(...params);

    const countQuery = `
      SELECT COUNT(*) as total FROM resources r
      WHERE r.category_id = ? AND r.deleted_at IS NULL
      ${!isAdmin ? 'AND r.user_id = ?' : ''}
      ${status ? 'AND r.status = ?' : ''}
    `;
    const countParams = [id];
    if (!isAdmin) countParams.push(req.userId);
    if (status) countParams.push(status);
    const { total } = await db.prepare(countQuery).get(...countParams);

    return res.status(200).json({
      data: {
        category,
        resources: resources.map(r => ({
          ...r,
          tags: r.tags ? JSON.parse(r.tags) : []
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      message: 'Category resources fetched',
      error: null
    });
  } catch (error) {
    logger.error(`[Categories] Failed to get resources: ${error.message}`);
    return res.status(500).json({ data: null, message: 'Failed to get category resources', error: 'An unexpected error occurred' });
  }
});

router.post('/', requireAuth, sanitizeAll(['name', 'description']), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ data: null, message: 'Name is required', error: 'Name is required' });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingSlug = await db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existingSlug) {
      return res.status(400).json({ data: null, message: 'Category with similar name already exists', error: 'Category with similar name already exists' });
    }

    const result = await db.prepare(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)'
    ).run(name.trim(), slug, description || null);

    const category = await db.prepare('SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({
      data: { category },
      message: 'Category created',
      error: null
    });
  } catch (error) {
    logger.error(`[Categories] Failed to create: ${error.message}`);
    return res.status(500).json({ data: null, message: 'Failed to create category', error: 'An unexpected error occurred' });
  }
});

router.put('/:id', requireAuth, sanitizeAll(['name', 'description']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ data: null, message: 'Category not found', error: 'Category not found' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      const newSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const slugConflict = await db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(newSlug, id);
      if (slugConflict) {
        return res.status(400).json({ data: null, message: 'Category with similar name already exists', error: 'Category with similar name already exists' });
      }

      updates.push('name = ?', 'slug = ?');
      params.push(name.trim(), newSlug);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const category = await db.prepare('SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ?').get(id);
    return res.status(200).json({
      data: { category },
      message: 'Category updated',
      error: null
    });
  } catch (error) {
    logger.error(`[Categories] Failed to update: ${error.message}`);
    return res.status(500).json({ data: null, message: 'Failed to update category', error: 'An unexpected error occurred' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ data: null, message: 'Category not found', error: 'Category not found' });
    }

    const resourcesInCategory = await db.prepare('SELECT COUNT(*) as count FROM resources WHERE category_id = ? AND deleted_at IS NULL').get(id);
    if (resourcesInCategory.count > 0) {
      return res.status(400).json({ data: null, message: 'Cannot delete category with resources', error: 'Cannot delete category with resources. Move or delete resources first.' });
    }

    await db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return res.status(200).json({ data: null, message: 'Category deleted', error: null });
  } catch (error) {
    logger.error(`[Categories] Failed to delete: ${error.message}`);
    return res.status(500).json({ data: null, message: 'Failed to delete category', error: 'An unexpected error occurred' });
  }
});

export default router;
