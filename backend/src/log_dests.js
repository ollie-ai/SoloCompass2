import db from './db.js';
import logger from './services/logger.js';

async function logDestinations() {
  try {
    const all = await db.all('SELECT id, name, status, country FROM destinations');
    logger.info(`ALL DESTINATIONS: ${JSON.stringify(all, null, 2)}`);
  } catch (err) {
    logger.error(`FAILED TO LOG DESTINATIONS: ${err.message}`);
  }
}

setTimeout(logDestinations, 5000);
