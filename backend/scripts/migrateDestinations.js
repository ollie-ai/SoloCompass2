import 'dotenv/config';
import db from '../src/db.js';
import logger from '../src/services/logger.js';

async function migrate() {
  logger.info('[Migration] Adding moderation columns to destinations table...');
  
  try {
    // Add status column
    await db.exec(`
      ALTER TABLE destinations 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'live' 
      CHECK (status IN ('pending', 'live', 'flagged'));
    `);
    
    // Add source column
    await db.exec(`
      ALTER TABLE destinations 
      ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
      CHECK (source IN ('manual', 'ai'));
    `);
    
    logger.info('[Migration] Successfully added moderation columns.');
    process.exit(0);
  } catch (err) {
    logger.error(`[Migration] FAILED: ${err.message}`);
    process.exit(1);
  }
}

migrate();
