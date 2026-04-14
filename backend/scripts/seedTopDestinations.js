import 'dotenv/config';
import researchService from '../src/services/researchService.js';
import db from '../src/db.js';
import logger from '../src/services/logger.js';

// Top solo traveler destinations for 2026 launch seeding
const TOP_DESTINATIONS = [
  'Tokyo, Japan',
  'Reykjavik, Iceland',
  'Kyoto, Japan',
  'Rhodes, Greece',
  'Chiang Mai, Thailand',
  'Porto, Portugal',
  'Copenhagen, Denmark',
  'Hanoi, Vietnam',
  'Split, Croatia',
  'Ljubljana, Slovenia',
  'Verona, Italy',
  'Ghent, Belgium',
  'Fukuoka, Japan',
  'Edinburgh, Scotland',
  'Bilbao, Spain',
  'Tallinn, Estonia',
  'Bern, Switzerland',
  'Innsbruck, Austria',
  'Helsinki, Finland',
  'Stockholm, Sweden'
];

async function seed() {
  logger.info(`[Production Seed] Starting bulk research for ${TOP_DESTINATIONS.length} destinations...`);
  
  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;

  for (const city of TOP_DESTINATIONS) {
    try {
      logger.info(`[Production Seed] Researching: ${city}...`);
      const result = await researchService.researchDestination(city);
      
      if (result.success) {
        successCount++;
        logger.info(`[Production Seed] SUCCESS: ${city} added to moderation queue.`);
      } else {
        failureCount++;
        logger.error(`[Production Seed] FAILED: ${city} - ${result.error}`);
      }
    } catch (err) {
      failureCount++;
      logger.error(`[Production Seed] CRITICAL FAILURE for ${city}: ${err.message}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.info(`[Production Seed] COMPLETED in ${duration}s. Success: ${successCount}, Failures: ${failureCount}`);
  logger.info(`[Production Seed] All items are now in the Admin Moderation Queue for review.`);
  
  process.exit(0);
}

seed();
