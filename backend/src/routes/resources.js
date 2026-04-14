import express from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, sanitizeAll } from '../middleware/validate.js';
import { resourceValidation } from '../middleware/validate.js';
import { searchResources } from '../services/search.js';
import logger from '../services/logger.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { 
      search, 
      type, 
      category_id, 
      status, 
      tags,
      limit = 50, 
      offset = 0,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const userId = req.userId;
    const isAdmin = req.userRole === 'admin';

    const validSortFields = ['created_at', 'updated_at', 'name'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    let query = `
      SELECT r.id, r.user_id, r.name, r.type, r.description, r.data, r.category_id, r.status, r.tags, r.created_at, r.updated_at, c.name as category_name, c.slug as category_slug
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.deleted_at IS NULL
    `;
    const params = [];

    if (!isAdmin) {
      query += ' AND r.user_id = ?';
      params.push(userId);
    }

    if (search) {
      query += ' AND (r.name ILIKE ? OR r.description ILIKE ? OR r.tags ILIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (type) {
      query += ' AND r.type = ?';
      params.push(type);
    }

    if (category_id) {
      query += ' AND r.category_id = ?';
      params.push(parseInt(category_id));
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim());
      for (const tag of tagList) {
        query += ' AND r.tags ILIKE ?';
        params.push(`%${tag}%`);
      }
    }

    query += ` ORDER BY r.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const resources = await db.prepare(query).all(...params);

    const countQuery = `
      SELECT COUNT(*) as total FROM resources r
      WHERE r.deleted_at IS NULL
      ${!isAdmin ? 'AND r.user_id = ?' : ''}
      ${search ? 'AND (r.name ILIKE ? OR r.description ILIKE ? OR r.tags ILIKE ?)' : ''}
      ${type ? 'AND r.type = ?' : ''}
      ${category_id ? 'AND r.category_id = ?' : ''}
      ${status ? 'AND r.status = ?' : ''}
    `;
    
    const countParams = [];
    if (!isAdmin) countParams.push(userId);
    if (search) {
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (type) countParams.push(type);
    if (category_id) countParams.push(parseInt(category_id));
    if (status) countParams.push(status);

    const { total } = await db.prepare(countQuery).get(...countParams);

    res.json({ 
      resources: resources.map(r => ({
        ...r,
        tags: r.tags ? JSON.parse(r.tags) : []
      })), 
      total, 
      limit: parseInt(limit), 
      offset: parseInt(offset) 
    });
  } catch (error) {
    logger.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await searchResources(q, {
      userId: req.userId,
      isAdmin: req.userRole === 'admin',
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(results);
  } catch (error) {
    logger.error('Search resources error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/deleted', requireAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const isAdmin = req.userRole === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const resources = await db.prepare(`
      SELECT r.id, r.user_id, r.name, r.type, r.description, r.data, r.category_id, r.status, r.tags, r.created_at, r.updated_at, r.deleted_at, c.name as category_name, u.name as user_name, u.email as user_email
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.deleted_at IS NOT NULL
      ORDER BY r.deleted_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));

    const { total } = await db.prepare('SELECT COUNT(*) as total FROM resources WHERE deleted_at IS NOT NULL').get();

    res.json({ resources, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    logger.error('Get deleted resources error:', error);
    res.status(500).json({ error: 'Failed to get deleted resources' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userRole === 'admin';

    let query = `
      SELECT r.id, r.user_id, r.name, r.type, r.description, r.data, r.category_id, r.status, r.tags, r.created_at, r.updated_at, c.name as category_name, c.slug as category_slug
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `;
    const params = [id];

    if (!isAdmin) {
      query += ' AND r.user_id = ? AND r.deleted_at IS NULL';
      params.push(req.userId);
    } else {
      query += ' AND r.deleted_at IS NULL';
    }

    const resource = await db.prepare(query).get(...params);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ 
      resource: {
        ...resource,
        tags: resource.tags ? JSON.parse(resource.tags) : []
      }
    });
  } catch (error) {
    logger.error('Get resource error:', error);
    res.status(500).json({ error: 'Failed to get resource' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, type, description, data, category_id, status, tags } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const validStatuses = ['draft', 'published', 'archived'];
    const resourceStatus = status && validStatuses.includes(status) ? status : 'draft';
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;
    
    const result = await db.prepare(`
      INSERT INTO resources (user_id, name, type, description, data, category_id, status, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.userId, 
      name.trim(), 
      type || null, 
      description || null, 
      data ? JSON.stringify(data) : null,
      category_id || null,
      resourceStatus,
      tagsJson
    );

    const resource = await db.prepare('SELECT id, user_id, name, type, description, data, category_id, status, tags, created_at, updated_at FROM resources WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ 
      resource: {
        ...resource,
        tags: resource.tags ? JSON.parse(resource.tags) : []
      }
    });
  } catch (error) {
    logger.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

router.put('/:id', requireAuth, sanitizeAll(['name', 'type', 'description']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, data, category_id, status, tags, restore } = req.body;
    const isAdmin = req.userRole === 'admin';

    const existing = await db.prepare(
      'SELECT id, user_id, name, type, description, data, category_id, status, tags, created_at, updated_at, deleted_at FROM resources WHERE id = ?' + (isAdmin ? '' : ' AND user_id = ?')
    ).get(id, ...(isAdmin ? [] : [req.userId]));

    if (!existing) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (restore && existing.deleted_at && isAdmin) {
      await db.prepare('UPDATE resources SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
      const resource = await db.prepare('SELECT id, user_id, name, type, description, data, category_id, status, tags, created_at, updated_at, deleted_at FROM resources WHERE id = ?').get(id);
      return res.json({ 
        resource: {
          ...resource,
          tags: resource.tags ? JSON.parse(resource.tags) : []
        }
      });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (data !== undefined) {
      updates.push('data = ?');
      params.push(JSON.stringify(data));
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id || null);
    }
    if (status !== undefined) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (validStatuses.includes(status)) {
        updates.push('status = ?');
        params.push(status);
      }
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(tags && Array.isArray(tags) ? JSON.stringify(tags) : null);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      await db.prepare(`UPDATE resources SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const resource = await db.prepare('SELECT id, user_id, name, type, description, data, category_id, status, tags, created_at, updated_at, deleted_at FROM resources WHERE id = ?').get(id);
    res.json({ 
      resource: {
        ...resource,
        tags: resource.tags ? JSON.parse(resource.tags) : []
      }
    });
  } catch (error) {
    logger.error('Update resource error:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    const isAdmin = req.userRole === 'admin';

    const existing = await db.prepare(
      'SELECT * FROM resources WHERE id = ?' + (isAdmin ? '' : ' AND user_id = ?')
    ).get(id, ...(isAdmin ? [] : [req.userId]));

    if (!existing) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (permanent === 'true' && isAdmin) {
      await db.prepare('DELETE FROM resources WHERE id = ?').run(id);
      return res.json({ message: 'Resource permanently deleted' });
    }

    if (existing.deleted_at) {
      return res.status(400).json({ error: 'Resource already deleted' });
    }

    await db.prepare('UPDATE resources SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ message: 'Resource moved to trash' });
  } catch (error) {
    logger.error('Delete resource error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

router.post('/:id/restore', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userRole === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const existing = await db.prepare('SELECT id, user_id, name, type, description, data, category_id, status, tags, created_at, updated_at, deleted_at FROM resources WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!existing.deleted_at) {
      return res.status(400).json({ error: 'Resource is not deleted' });
    }

    await db.prepare('UPDATE resources SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    const resource = await db.prepare('SELECT id, user_id, name, type, description, data, category_id, status, tags, created_at, updated_at, deleted_at FROM resources WHERE id = ?').get(id);
    res.json({ 
      message: 'Resource restored',
      resource: {
        ...resource,
        tags: resource.tags ? JSON.parse(resource.tags) : []
      }
    });
  } catch (error) {
    logger.error('Restore resource error:', error);
    res.status(500).json({ error: 'Failed to restore resource' });
  }
});

export default router;