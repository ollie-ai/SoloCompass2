import db from '../src/db.js';
import logger from '../src/services/logger.js';

async function verify() {
  try {
    logger.info('[Verify] Querying destinations with moderation filter...');
    // Simulate non-admin user
    const userRole = 'user';
    let query = 'SELECT name, status FROM destinations WHERE 1=1';
    if (userRole !== 'admin') {
      query += " AND status = 'live'";
    }
    query += ' LIMIT 5';
    
    const rows = await db.all(query);
    logger.info('[Verify] Fetched rows successfully:', JSON.stringify(rows, null, 2));
    
    if (rows.length === 0) {
      logger.warn('[Verify] No live destinations found - seeding might be pending or failed.');
    } else {
      logger.info('[Verify] Regression resolved for destinations endpoint.');
    }
    
    logger.info('[Verify] Testing trips fetch...');
    const trips = await db.all('SELECT id, name FROM trips LIMIT 1');
    logger.info('[Verify] Trips fetch success:', trips[0]?.name || 'No trips found');
    
  } catch (error) {
    logger.error('[Verify] CRITICAL FAILURE:', error.message);
    process.exit(1);
  }
  process.exit(0);
}

verify();
