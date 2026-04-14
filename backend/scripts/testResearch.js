import 'dotenv/config';
import researchService from '../src/services/researchService.js';
import db from '../src/db.js';
import logger from '../src/services/logger.js';

async function test() {
  const city = 'Kyoto, Japan';
  logger.info(`[Test] Researching ${city}...`);
  
  const result = await researchService.researchDestination(city);
  
  if (result.success) {
    logger.info(`[Test] SUCCESS: ${result.data.name} created with status ${result.data.status}`);
    
    // Check DB
    const dest = await db.prepare("SELECT * FROM destinations WHERE name = 'Kyoto' OR name LIKE '%Kyoto%'").get();
    if (dest) {
      logger.info(`[Test] DB VERIFIED: Found ${dest.name} with status ${dest.status}`);
    } else {
      logger.error(`[Test] DB FAILURE: Destination not found in DB.`);
    }
  } else {
    logger.error(`[Test] FAILURE: ${result.error}`);
  }
  process.exit(0);
}

test();
