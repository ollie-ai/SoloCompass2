import 'dotenv/config';
import axios from 'axios';
import db from '../src/db.js';
import logger from '../src/services/logger.js';
import { geocodeAddress } from '../src/services/placesService.js';

// Configuration
const AZURE_CONFIG = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
};

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Call Azure OpenAI for research
 */
async function callAI(prompt) {
  const url = `${AZURE_CONFIG.endpoint}openai/deployments/${AZURE_CONFIG.deployment}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`;
  const response = await axios.post(url, {
    messages: [
      { role: 'system', content: 'You are a professional travel researcher specializing in solo travel safety and logistics. Respond ONLY with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  }, {
    headers: { 'api-key': AZURE_CONFIG.apiKey }
  });
  return response.data.choices[0].message.content;
}

/**
 * Fetch high-quality image from Unsplash
 */
async function fetchImage(query) {
  if (!UNSPLASH_ACCESS_KEY) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
  try {
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });
    return res.data.results[0]?.urls?.regular || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
  } catch (err) {
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
  }
}

/**
 * Research a single destination
 */
async function researchDestination(name) {
  logger.info(`[Seeder] Researching ${name}...`);
  
  const prompt = `Research the following destination for a solo travel app: "${name}"
  
  Provide the following details in JSON format:
  {
    "name": "Full name",
    "country": "Country",
    "city": "Primary city",
    "description": "3-sentence inspiring overview",
    "budget_level": "budget|moderate|luxury",
    "safety_rating": "high|medium|low",
    "solo_friendly_rating": 1-5 (integer),
    "safety_intelligence": "Specific solo safety advice (e.g., safe neighbourhoods, transport at night)",
    "emergency_contacts": { "police": "string", "ambulance": "string", "fire": "string" },
    "highlights": ["list of 6 top attractions/spots"],
    "best_months": ["months where it's best to visit"],
    "fcdo_slug": "url-friendly country name for FCDO lookups",
    "agoda_search": "search term for hotel booking",
    "viator_search": "search term for tours"
  }`;

  try {
    const aiResponse = await callAI(prompt);
    // Strip markdown if AI included it
    const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanJson);
    
    // Geocode to get coordinates
    const geo = await geocodeAddress(name).catch(() => ({ lat: 0, lon: 0 }));
    data.latitude = geo.lat;
    data.longitude = geo.lon;
    
    // Fetch image
    data.image_url = await fetchImage(`${data.name} ${data.country} travel`);
    
    return data;
  } catch (err) {
    logger.error(`[Seeder] FAILED researching ${name}: ${err.message}`);
    return null;
  }
}

/**
 * Seed a list of destinations
 */
async function seedDestinations(list) {
  for (const name of list) {
    const data = await researchDestination(name);
    if (!data) continue;

    try {
      // Check if exists
      const existing = await db.prepare('SELECT id FROM destinations WHERE name = ? AND country = ?').get(data.name, data.country);
      
      if (existing) {
        logger.info(`[Seeder] UPDATING ${data.name}...`);
        await db.prepare(`
          UPDATE destinations SET
            city = ?, description = ?, budget_level = ?, safety_rating = ?,
            solo_friendly_rating = ?, image_url = ?, fcdo_slug = ?,
            latitude = ?, longitude = ?, emergency_contacts = ?, 
            safety_intelligence = ?, highlights = ?
          WHERE id = ?
        `).run(
          data.city, data.description, data.budget_level, data.safety_rating,
          data.solo_friendly_rating, data.image_url, data.fcdo_slug,
          data.latitude, data.longitude, JSON.stringify(data.emergency_contacts),
          data.safety_intelligence, JSON.stringify(data.highlights),
          existing.id
        );
      } else {
        logger.info(`[Seeder] INSERTING ${data.name}...`);
        await db.prepare(`
          INSERT INTO destinations (
            name, country, city, description, budget_level, safety_rating,
            solo_friendly_rating, image_url, fcdo_slug, latitude, longitude,
            emergency_contacts, safety_intelligence, highlights
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          data.name, data.country, data.city, data.description, data.budget_level,
          data.safety_rating, data.solo_friendly_rating, data.image_url,
          data.fcdo_slug, data.latitude, data.longitude,
          JSON.stringify(data.emergency_contacts), data.safety_intelligence,
          JSON.stringify(data.highlights)
        );
      }
      logger.info(`[Seeder] Success: ${data.name}`);
    } catch (dbErr) {
      logger.error(`[Seeder] DB Error for ${data.name}: ${dbErr.message}`);
    }
  }
}

// Master list of top solo travel destinations to seed first
const TOP_DESTINATIONS = [
  'Rhodes, Greece',
  'Chiang Mai, Thailand',
  'Tokyo, Japan',
  'Porto, Portugal',
  'Reykjavik, Iceland',
  'Copenhagen, Denmark',
  'Hanoi, Vietnam',
  'Split, Croatia',
  'Seoul, South Korea',
  'Ljubljana, Slovenia',
  'Edinburgh, Scotland',
  'Dublin, Ireland',
  'Amsterdam, Netherlands',
  'Stockholm, Sweden',
  'Vienna, Austria',
  'Bergen, Norway',
  'Udaipur, India',
  'Siem Reap, Cambodia',
  'Hoi An, Vietnam',
  'Taipei, Taiwan'
];

seedDestinations(TOP_DESTINATIONS)
  .then(() => {
    logger.info('[Seeder] COMPLETED seeding core destinations.');
    process.exit(0);
  })
  .catch(err => {
    logger.error(`[Seeder] CRITICAL ERROR: ${err.message}`);
    process.exit(1);
  });
