import 'dotenv/config';
import db from '../src/db.js';
import logger from '../src/services/logger.js';

async function testConnection() {
  try {
    logger.info('[Test] Checking DB connectivity...');
    const result = await db.get('SELECT current_user, now()');
    logger.info('[Test] SUCCESS: Connected to PostgreSQL:', result);
    
    logger.info('[Test] Checking destinations table...');
    const cols = await db.all("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'destinations'");
    logger.info('[Test] Destinations Table Columns:', JSON.stringify(cols, null, 2));
    
    // Check for status column
    const hasStatus = cols.some(c => c.column_name === 'status');
    logger.info(`[Test] Has 'status' column: ${hasStatus}`);
    
    // Try a query that often 500s
    logger.info('[Test] Testing trips fetch...');
    const trips = await db.all('SELECT * FROM trips LIMIT 1');
    logger.info('[Test] Trips fetch sample:', trips);
    
  } catch (error) {
    logger.error('[Test] CRITICAL Connection Failure:', error.stack);
  }
  process.exit(0);
}

testConnection();
