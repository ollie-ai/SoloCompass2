import db from '../db.js';
import logger from './logger.js';

export async function trackPageView(userId, path, referrer = null) {
  try {
    await db.prepare(`
      INSERT INTO page_views (user_id, path, referrer)
      VALUES ($1, $2, $3)
    `).run(userId || null, path, referrer);
    return true;
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    return false;
  }
}

export async function trackEvent(userId, eventType, properties = {}) {
  try {
    await db.prepare(`
      INSERT INTO events (user_id, event_name, event_data)
      VALUES ($1, $2, $3)
    `).run(userId || null, eventType, JSON.stringify(properties));
    return true;
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    return false;
  }
}

export async function createSession(userId, device = null) {
  try {
    const result = await db.prepare(`
      INSERT INTO analytics_sessions (user_id, device)
      VALUES (?, ?)
    `).run(userId, device);
    return result.lastInsertRowid;
  } catch (error) {
    logger.error('createSession error:', error);
    return null;
  }
}

export async function endSession(sessionId) {
  try {
    await db.prepare(`
      UPDATE analytics_sessions SET end_time = CURRENT_TIMESTAMP WHERE id = ?
    `).run(sessionId);
    return true;
  } catch (error) {
    logger.error('endSession error:', error);
    return false;
  }
}

export async function getStats(period = '7d') {
  const days = parseInt(period) || 7;
  const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString().split('T')[0];

  try {
    const dau = await db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM page_views
      WHERE user_id IS NOT NULL
        AND timestamp > $1
        AND DATE(timestamp) = $2::date
    `).get(dateFilter, today);

    const totalPageViews = await db.prepare(`
      SELECT COUNT(*) as count FROM page_views WHERE timestamp > $1
    `).get(dateFilter);

    const uniqueVisitors = await db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM page_views
      WHERE user_id IS NOT NULL AND timestamp > $1
    `).get(dateFilter);

    const popularPages = await db.prepare(`
      SELECT path, COUNT(*) as views
      FROM page_views
      WHERE timestamp > $1
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `).all(dateFilter);

    const eventCounts = await db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM events
      WHERE timestamp > $1
      GROUP BY event_type
      ORDER BY count DESC
    `).all(dateFilter);

    const tripCreations = await db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE event_type = 'trip_created' AND timestamp > $1
    `).get(dateFilter);

    const dailyActive = await db.prepare(`
      SELECT date(timestamp) as date, COUNT(DISTINCT user_id) as users
      FROM page_views
      WHERE user_id IS NOT NULL AND timestamp > $1
      GROUP BY date(timestamp)
      ORDER BY date DESC
    `).all(dateFilter);

    return {
      dau: dau?.count || 0,
      totalPageViews: totalPageViews?.count || 0,
      uniqueVisitors: uniqueVisitors?.count || 0,
      popularPages: popularPages || [],
      eventCounts: eventCounts || [],
      tripCreations: tripCreations?.count || 0,
      dailyActive: dailyActive || [],
      period: `${days}d`
    };
  } catch (error) {
    logger.error('getStats error:', error);
    return null;
  }
}

export default {
  trackPageView,
  trackEvent,
  createSession,
  endSession,
  getStats
};
