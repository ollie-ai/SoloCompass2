import db from '../db.js';

export async function searchResources(query, options = {}) {
  const { userId, isAdmin = false, limit = 20, offset = 0 } = options;
  
  if (!query || query.trim().length === 0) {
    return { resources: [], total: 0, limit, offset };
  }

  const searchTerm = `%${query.trim()}%`;
  
  let whereClause = 'WHERE r.deleted_at IS NULL';
  const params = [];

  if (!isAdmin) {
    whereClause += ' AND r.user_id = ?';
    params.push(userId);
  }

  const searchConditions = `
    OR r.name LIKE ?
    OR r.description LIKE ?
    OR r.tags LIKE ?
    OR r.type LIKE ?
  `;
  
  whereClause += searchConditions;
  const searchParams = [searchTerm, searchTerm, searchTerm, searchTerm];
  params.push(...searchParams);

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM resources r
    ${whereClause}
  `;
  
  const { total } = db.prepare(countQuery).get(...params);

  const resourcesQuery = `
    SELECT r.*, c.name as category_name, c.slug as category_slug
    FROM resources r
    LEFT JOIN categories c ON r.category_id = c.id
    ${whereClause}
    ORDER BY 
      CASE 
        WHEN r.name LIKE ? THEN 1
        WHEN r.description LIKE ? THEN 2
        WHEN r.tags LIKE ? THEN 3
        ELSE 4
      END,
      r.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const queryParams = [...params, searchTerm, searchTerm, searchTerm, limit, offset];
  const resources = db.prepare(resourcesQuery).all(...queryParams);

  return {
    resources: resources.map(r => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : []
    })),
    total,
    limit,
    offset
  };
}

export function searchUsers(query, options = {}) {
  const { role, limit = 20, offset = 0 } = options;
  
  if (!query || query.trim().length === 0) {
    return { users: [], total: 0, limit, offset };
  }

  const searchTerm = `%${query.trim()}%`;
  
  let whereClause = 'WHERE 1=1';
  const params = [];

  whereClause += ' AND (u.email LIKE ? OR u.name LIKE ?)';
  params.push(searchTerm, searchTerm);

  if (role) {
    whereClause += ' AND u.role = ?';
    params.push(role);
  }

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM users u
    ${whereClause}
  `;
  
  const { total } = db.prepare(countQuery).get(...params);

  const usersQuery = `
    SELECT u.id, u.email, u.name, u.role, u.created_at, u.updated_at,
           p.avatar_url, p.bio, p.company
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const users = db.prepare(usersQuery).all(...params, limit, offset);

  return { users, total, limit, offset };
}

export function searchCategories(query, options = {}) {
  const { limit = 20, offset = 0 } = options;
  
  if (!query || query.trim().length === 0) {
    return { categories: [], total: 0, limit, offset };
  }

  const searchTerm = `%${query.trim()}%`;
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM categories
    WHERE name LIKE ? OR description LIKE ?
  `;
  
  const { total } = db.prepare(countQuery).get(searchTerm, searchTerm);

  const categoriesQuery = `
    SELECT c.*, 
           (SELECT COUNT(*) FROM resources r WHERE r.category_id = c.id AND r.deleted_at IS NULL) as resource_count
    FROM categories c
    WHERE c.name LIKE ? OR c.description LIKE ?
    ORDER BY c.name ASC
    LIMIT ? OFFSET ?
  `;
  
  const categories = db.prepare(categoriesQuery).all(searchTerm, searchTerm, limit, offset);

  return { categories, total, limit, offset };
}