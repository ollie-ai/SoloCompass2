import { Client } from '@notionhq/client';
import logger from './logger.js';

let notionClient = null;

export function initNotion() {
  const token = process.env.NOTION_INTEGRATION_TOKEN;
  if (!token) {
    logger.warn('[Notion] No integration token configured');
    return null;
  }
  
  try {
    notionClient = new Client({ auth: token });
    logger.info('[Notion] Client initialized');
    return notionClient;
  } catch (error) {
    logger.error('[Notion] Failed to initialize:', error.message);
    return null;
  }
}

export async function syncCountryToNotion(country, cities = []) {
  if (!notionClient) {
    notionClient = initNotion();
  }
  
  if (!notionClient) {
    logger.warn('[Notion] Cannot sync - client not initialized');
    return null;
  }
  
  try {
    // Find or create parent page
    const search = await notionClient.search({
      filter: { property: 'object', value: 'page' },
      page_size: 5
    });
    
    // For now, just log what would be created
    const pageData = {
      title: `${country.flag_emoji} ${country.name} - Solo Travel Guide`,
      overview: country.overview,
      safety_score: country.solo_safety_score,
      budget_local: country.budget_daily_local,
      budget_tourist: country.budget_daily_tourist,
      emergency: country.emergency_number,
      solo_female_safe: country.solo_female_safe,
      lgbtq_friendly: country.lgbtq_friendly,
      digital_nomad_score: country.digital_nomad_score
    };
    
    logger.info('[Notion] Would sync country:', pageData.title);
    
    // TODO: Actually create pages in Notion using notionClient.pages.create
    // For now this establishes the connection
    
    return pageData;
  } catch (error) {
    logger.error('[Notion] Sync error:', error.message);
    return null;
  }
}

export default { initNotion, syncCountryToNotion };