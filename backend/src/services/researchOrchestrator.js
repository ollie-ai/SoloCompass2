import axios from 'axios';
import db from '../db.js';
import logger from '../services/logger.js';

// Normalize endpoint URL - ensure it has https:// prefix and doesn't have doubled parts
function normalizeEndpoint(url) {
  if (!url) return null;
  // Fix wrong domain - Azure OpenAI should be openai.azure.com, not cognitiveservices.azure.com
  let normalized = url.replace(/cognitiveservices\.azure\.com/gi, 'openai.azure.com');
  // Remove any doubled suffixes like "openai.azure.comopenai"
  normalized = normalized.replace(/azure\.comopenai/gi, 'azure.com');
  // Ensure https:// prefix
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  return normalized;
}

const AZURE_CONFIG = {
  endpoint: normalizeEndpoint(process.env.AZURE_OPENAI_ENDPOINT),
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
};

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' }
];

class ResearchOrchestrator {
  constructor() {
    this.rateLimitDelay = 1000; // 1 second between requests
    this.maxRetries = 3;
    
    if (!AZURE_CONFIG.endpoint) {
      console.error('[Research] ERROR: AZURE_OPENAI_ENDPOINT not configured!');
    } else {
      console.log('[Research] Azure endpoint configured:', AZURE_CONFIG.endpoint);
    }
  }

  async callAI(prompt, retries = 0) {
    try {
      // Ensure endpoint has trailing slash for proper URL construction
      const baseUrl = AZURE_CONFIG.endpoint?.endsWith('/') ? AZURE_CONFIG.endpoint : AZURE_CONFIG.endpoint + '/';
      const url = `${baseUrl}openai/deployments/${AZURE_CONFIG.deployment}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`;
      console.log('[Research] Calling AI at:', url.replace(AZURE_CONFIG.apiKey, '***'));
      
      const response = await axios.post(url, {
        messages: [
          { role: 'system', content: 'You are a professional travel researcher specializing in solo travel safety and logistics. Respond ONLY with valid JSON. No markdown, no explanation.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 16000
      }, {
        headers: { 'api-key': AZURE_CONFIG.apiKey },
        timeout: 60000
      });

      let content = response.data.choices[0].message.content;
      
      // Clean up any markdown formatting
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      return JSON.parse(content);
    } catch (error) {
      logger.error(`AI call failed (attempt ${retries + 1}):`, error.message);
      
      if (retries < this.maxRetries) {
        await new Promise(r => setTimeout(r, 2000 * (retries + 1)));
        return this.callAI(prompt, retries + 1);
      }
      
      throw error;
    }
  }

  generateCountryResearchPrompt(country) {
    return `
You are a professional solo travel researcher. Create COMPREHENSIVE research for ${country.name} with detailed, actionable information for solo travelers.

REQUIREMENTS:
-Write in DETAILED paragraph format - minimum 150-200 words per section
- Include SPECIFIC examples, locations, and practical advice
- Cover ALL aspects solo travelers need to know

Output detailed JSON with these comprehensive fields:

{
  "overview": "4-5 sentence comprehensive overview of ${country.name} as a solo travel destination - mention unique solo travel culture, vibe, why it attracts solo travelers",
  "solo_safety_score": 1-10 integer rating based on crime, scams, infrastructure safety,
  "solo_friendly_rating": "excellent/good/moderate/poor based on solo traveler culture",
  "safety_overview": "MINIMUM 150 words - detailed breakdown of general safety, day safety vs night safety, tourist-targeted crime, natural disaster risks, specific areas safest and most dangerous, how locals treat solo travelers",
  "best_regions_for_solo": ["MINIMUM 10 specific cities/regions with brief why each is solo-friendly"],
  "regions_to_avoid": ["MINIMUM 5-10 specific neighborhoods/areas/regions with specific reasons - don't just say 'avoid at night' but explain what happens there"],
  "transport_tips": "MINIMUM 100 words - comprehensive transport: how to get from airport, public transport cards to buy, metro systems, train types, when to avoid rush hour, taxi/ride-share options, road safety, any transport scams to avoid",
  "cultural_etiquette": "MINIMUM 100 words - detailed: greeting customs, photography etiquette, temple/shrine rules, restaurant etiquette, tipping culture, dress codes, talking to strangers, public behavior expectations",
  "common_scams": ["MINIMUM 10 specific scams with detailed descriptions: how they work, where they happen, how to avoid them - e.g. 'Taxi meter scam in Bangkok - driver doesn't use meter and quotes inflated price'"],
  "local_customs": ["MINIMUM 15 customs with explanations: why they matter, how to follow them properly"],
  "emergency_number": "main emergency number (not 911 unless correct)",
  "police_number": "police specific number if different",
  "ambulance_number": "ambulance/medical emergency number",
  "embassy_info": "MINIMUM 100 words - exact address, phone number, what they can/cannot help with, emergency services provided",
  "budget_daily_local": actual number for budget travel (street food, dorms, local transport),
  "budget_daily_tourist": actual number for comfortable travel (restaurants, hotels, tours),
  "budget_accommodation": actual average hostel/hotel price per night,
  "budget_food": actual average meal cost at local restaurants,
  "solo_female_safe": boolean with specific reasons - how do locals treat solo women, what precautions needed,
  "lgbtq_friendly": boolean with specific reasons - legal status, social acceptance, LGBTQ+ areas if any,
  "digital_nomad_score": 1-10 with reasons - WiFi availability, coworking spaces, coworking visa if exists, SIM card ease,
  "nightlife_safety": "detailed assessment: what areas are safe at night, general safety culture around drinking, predator concerns"
}

Country: ${country.name}
Language: ${country.language}
Currency: ${country.currency} (${country.currency_symbol})
Timezone: ${country.timezone}
Capital: ${country.capital_city || 'research this'}
Current issues/advisories: Check recent travel advisories
`.trim();
  }

  async researchCountry(countryCode) {
    logger.info(`[Research] Starting research for ${countryCode}`);
    
    // Get country from DB
    const country = await db.prepare('SELECT * FROM countries WHERE UPPER(code) = UPPER(?)').get(countryCode);
    if (!country) {
      throw new Error(`Country not found: ${countryCode}`);
    }
    
    // Mark as processing
    await db.prepare('UPDATE countries SET research_status = ? WHERE id = ?').run('processing', country.id);
    
    try {
      // Generate main research in English
      const prompt = this.generateCountryResearchPrompt(country);
      const research = await this.callAI(prompt);
      
      // Update country with research data
      await db.prepare(`
        UPDATE countries SET
          overview = ?,
          solo_safety_score = ?,
          solo_friendly_rating = ?,
          safety_overview = ?,
          best_regions_for_solo = ?,
          regions_to_avoid = ?,
          transport_tips = ?,
          cultural_etiquette = ?,
          common_scams = ?,
          local_customs = ?,
          emergency_number = ?,
          police_number = ?,
          ambulance_number = ?,
          embassy_info = ?,
          budget_daily_local = ?,
          budget_daily_tourist = ?,
          budget_accommodation = ?,
          budget_food = ?,
          solo_female_safe = ?,
          lgbtq_friendly = ?,
          digital_nomad_score = ?,
          nightlife_safety = ?,
          research_status = 'completed',
          publication_status = 'pending_review'
        WHERE id = ?
      `).run(
        research.overview,
        research.solo_safety_score,
        research.solo_friendly_rating,
        research.safety_overview,
        JSON.stringify(research.best_regions_for_solo),
        JSON.stringify(research.regions_to_avoid),
        research.transport_tips,
        research.cultural_etiquette,
        JSON.stringify(research.common_scams),
        JSON.stringify(research.local_customs),
        research.emergency_number,
        research.police_number,
        research.ambulance_number,
        research.embassy_info,
        research.budget_daily_local,
        research.budget_daily_tourist,
        research.budget_accommodation,
        research.budget_food,
        research.solo_female_safe,
        research.lgbtq_friendly,
        research.digital_nomad_score,
        research.nightlife_safety,
        country.id
      );
      
      logger.info(`[Research] Completed research for ${countryCode}`);
      
      // Now translate to other languages
      await this.translateCountryContent(country, research);
      
      return { success: true, country: countryCode };
      
    } catch (error) {
      logger.error(`[Research] Failed for ${countryCode}:`, error.message);
      await db.prepare('UPDATE countries SET research_status = ? WHERE id = ?').run('failed', country.id);
      throw error;
    }
  }

  async translateCountryContent(country, research) {
    // Translate key fields to other languages
    const fieldsToTranslate = [
      { key: 'overview', label: 'Overview' },
      { key: 'safety_overview', label: 'Safety Overview' },
      { key: 'transport_tips', label: 'Transport Tips' },
      { key: 'cultural_etiquette', label: 'Cultural Etiquette' }
    ];
    
    for (const lang of LANGUAGES) {
      if (lang.code === 'en') continue; // Skip English
      
      logger.info(`[Research] Translating ${country.code} to ${lang.name}...`);
      
      try {
        const translationPrompt = `Translate the following travel information from English to ${lang.name}. 
Return ONLY valid JSON with the same keys, translated content in ${lang.name}:

${JSON.stringify(research, null, 2)}`;

        const translation = await this.callAI(translationPrompt);
        
        // Store translations (would need additional columns in DB)
        logger.info(`[Research] Translation complete for ${country.code} (${lang.name})`);
        
      } catch (error) {
        logger.error(`[Research] Translation failed for ${country.code} (${lang.name}):`, error.message);
      }
      
      // Rate limiting
      await new Promise(r => setTimeout(r, this.rateLimitDelay));
    }
  }

  async researchAllCountries() {
    const countries = await db.prepare(
      "SELECT * FROM countries WHERE research_status = 'pending' ORDER BY name"
    ).all();
    
    logger.info(`[Research] Found ${countries.length} countries to research`);
    
    let completed = 0;
    let failed = 0;
    
    for (const country of countries) {
      try {
        await this.researchCountry(country.code);
        completed++;
      } catch (error) {
        logger.error(`[Research] Failed for ${country.code}:`, error.message);
        failed++;
      }
      
      // Rate limiting between countries
      await new Promise(r => setTimeout(r, this.rateLimitDelay * 2));
    }
    
    return { completed, failed, total: countries.length };
  }
}

export default new ResearchOrchestrator();