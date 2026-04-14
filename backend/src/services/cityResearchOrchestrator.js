import db from '../db.js';
import logger from '../services/logger.js';
import axios from 'axios';

function normalizeEndpoint(url) {
  if (!url) return null;
  let normalized = url.replace(/azure\.comopenai/gi, 'azure.com');
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  return normalized.replace(/\/$/, '');
}

const AZURE_CONFIG = {
  endpoint: normalizeEndpoint(process.env.AZURE_OPENAI_ENDPOINT),
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
};

class CityResearchOrchestrator {
  constructor() {
    this.rateLimitDelay = 1000;
  }

  async callAI(prompt, retries = 0) {
    try {
      const baseUrl = AZURE_CONFIG.endpoint?.endsWith('/') ? AZURE_CONFIG.endpoint : AZURE_CONFIG.endpoint + '/';
      const url = `${baseUrl}openai/deployments/${AZURE_CONFIG.deployment}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`;
      
      const response = await axios.post(url, {
        messages: [
          { role: 'system', content: 'You are a professional travel researcher specializing in solo travel. Respond ONLY with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }, {
        headers: { 'api-key': AZURE_CONFIG.apiKey },
        timeout: 60000
      });

      let content = response.data.choices[0].message.content;
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(content);
    } catch (error) {
      logger.error(`AI call failed:`, error.message);
      if (retries < 3) {
        await new Promise(r => setTimeout(r, 2000 * (retries + 1)));
        return this.callAI(prompt, retries + 1);
      }
      throw error;
    }
  }

  generateCityResearchPrompt(city, country) {
    return `
You are a professional solo travel researcher. Create COMPREHENSIVE city research for ${city.name} in ${country.name} with detailed, actionable information for solo travelers.

REQUIREMENTS:
- Write in DETAILED paragraph format - minimum 100-150 words per section
- Include SPECIFIC examples, exact addresses, prices, and practical advice
- Cover ALL aspects solo travelers need to know

Output detailed JSON:

{
  "overview": "4-5 sentence comprehensive overview - solo travel vibe, tourist scene, why solo travelers love this city",
  "solo_score": 1-10 overall solo travel score,
  "solo_nightlife": "MINIMUM 100 words - which neighborhoods are safe at night, best areas for solo bar/club hopping, predator concerns, what time to leave, safe late-night transport",
  "solo_dining": "MINIMUM 100 words - best areas for solo dining, specific restaurant types (izakaya, ramen, etc.), solo-friendly restaurant chains, reservation culture",
  "best_neighborhoods_for_solo": ["MINIMUM 10 specific neighborhoods with why each is solo-friendly - e.g. 'Canggu, Bali - surfer scene, many solo digital nomads, good cafés'"],
  "areas_to_avoid": ["MINIMUM 10 specific areas/addresses with detailed reasons - e.g. 'Kuta beach south end - aggressive beach vendors, scam artists'"],
  "transport_system": "MINIMUM 100 words - detailed: exact metro/train lines, how to buy tickets, which apps to use, peak hours, taxi etiquette, ride-share safety, bike/scooter rental risks",
  "transport_tips": "MINIMUM 80 words - practical tips: airport to city transport, transport from accommodation, how to avoid tourist transport scams",
  "safety_areas": "MINIMUM 100 words - neighborhood by neighborhood safety: which areas are SAFE and WHY, which areas have issues and WHAT specific issues",
  "coworking_spaces": ["MINIMUM 15 coworking spaces with exact names, locations, approximate day rates - e.g. 'Dojo Bali, Canggu - Rp150k/day, fast WiFi, community'"],
  "emergency_info": "MINIMUM 100 words - exact police station address, exact hospital addresses and phone numbers, private clinic options, what to do in medical emergency",
  "avg_daily_budget": actual number for budget solo travel,
  "accommodation_avg": actual average hostel/hotel per night,
  "meal_avg": actual average cost at local restaurants,
  "solo_female_friendly": boolean with detailed reasons - specific concerns, how locals treat solo women, what to wear, where safe,
  "coworking_hub": boolean with specific reasons - coworking scene size, WiFi quality, nomad community size
}

City: ${city.name}
Country: ${country.name}
Population: ${city.population || 'estimate this'}
Country Language: ${country.language}
Currency: ${country.currency}
Current local issues: Check any recent news
`.trim();
  }

  async researchCity(cityId) {
    logger.info(`[CityResearch] Starting for city ID: ${cityId}`);
    
    const city = await db.prepare('SELECT * FROM cities WHERE id = ?').get(cityId);
    if (!city) throw new Error(`City not found: ${cityId}`);
    
    const country = await db.prepare('SELECT * FROM countries WHERE id = ?').get(city.country_id);
    if (!country) throw new Error(`Country not found for city: ${city.name}`);
    
    await db.prepare('UPDATE cities SET research_status = ? WHERE id = ?').run('processing', cityId);
    
    try {
      const prompt = this.generateCityResearchPrompt(city, country);
      const research = await this.callAI(prompt);
      
      await db.prepare(`
        UPDATE cities SET
          overview = ?,
          solo_score = ?,
          solo_nightlife = ?,
          solo_dining = ?,
          best_neighborhoods_for_solo = ?,
          areas_to_avoid = ?,
          transport_system = ?,
          transport_tips = ?,
          safety_areas = ?,
          coworking_spaces = ?,
          emergency_info = ?,
          avg_daily_budget = ?,
          accommodation_avg = ?,
          meal_avg = ?,
          solo_female_friendly = ?,
          coworking_hub = ?,
          research_status = 'completed',
          publication_status = 'pending_review'
        WHERE id = ?
      `).run(
        research.overview,
        research.solo_score,
        research.solo_nightlife,
        research.solo_dining,
        JSON.stringify(research.best_neighborhoods_for_solo),
        JSON.stringify(research.areas_to_avoid),
        research.transport_system,
        research.transport_tips,
        research.safety_areas,
        JSON.stringify(research.coworking_spaces),
        research.emergency_info,
        research.avg_daily_budget,
        research.accommodation_avg,
        research.meal_avg,
        research.solo_female_friendly,
        research.coworking_hub,
        cityId
      );
      
      logger.info(`[CityResearch] Completed for ${city.name}`);
      return { success: true, city: city.name };
      
    } catch (error) {
      logger.error(`[CityResearch] Failed for ${city.name}:`, error.message);
      await db.prepare('UPDATE cities SET research_status = ? WHERE id = ?').run('failed', cityId);
      throw error;
    }
  }

  async researchAllCities() {
    const cities = await db.prepare(
      "SELECT id FROM cities WHERE research_status = 'pending'"
    ).all();
    
    logger.info(`[CityResearch] Found ${cities.length} cities to research`);
    
    let completed = 0;
    for (const city of cities) {
      try {
        await this.researchCity(city.id);
        completed++;
      } catch (e) {
        logger.error(`Failed city ${city.id}:`, e.message);
      }
      await new Promise(r => setTimeout(r, this.rateLimitDelay));
    }
    
    return { completed, total: cities.length };
  }
}

export default new CityResearchOrchestrator();