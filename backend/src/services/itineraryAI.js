/**
 * AI-powered itinerary generation service
 * Uses Azure OpenAI to generate personalised solo travel itineraries
 *
 * Supports:
 * - Solo Vibe mode: social | solitude | balanced
 * - Vibe Check: free-text natural language trip description
 * - FCDO safety context injection
 * - Per-activity safety notes and solo-dining badges
 * - Logistical travel times between spots
 */

import logger from './logger.js';
import db from '../db.js';
import { searchPlaces } from './placesService.js';
import { callAzureOpenAI } from './aiService.js';

/**
 * Generate a personalised itinerary using AI
 * @param {Object} params
 * @param {string} params.destination
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @param {number} [params.days]
 * @param {string[]} [params.interests]
 * @param {string} [params.pace]        - fast | moderate | slow
 * @param {number} [params.budget]      - total budget in GBP
 * @param {string} [params.travelStyle]
 * @param {string} [params.soloVibe]    - social | solitude | balanced
 * @param {string} [params.vibeCheck]   - free-text mood/style description
 * @param {string} [params.fcdoContext] - FCDO safety summary for destination
 */
export async function generateItinerary(params) {
  const {
    destination,
    startDate,
    endDate,
    days,
    interests = [],
    pace = 'moderate',
    budget,
    travelStyle = 'adventure',
    soloVibe = 'balanced',
    vibeCheck = '',
    fcdoContext = ''
  } = params;

  const tripDays = resolveDays(days, startDate, endDate);

  // 1. Check AI Cache first (skip if vibeCheck is present as it's too specific)
  if (!vibeCheck) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const cached = await db.prepare(`
        SELECT itinerary_json FROM ai_itinerary_cache 
        WHERE destination = ? AND days = ? AND pace = ? AND solo_vibe = ? AND travel_style = ?
        AND created_at > ?
      `).get(destination, tripDays, pace, soloVibe, travelStyle, thirtyDaysAgo);

      if (cached) {
        logger.info(`[itineraryAI] Cache HIT for ${destination} (${tripDays} days)`);
        return JSON.parse(cached.itinerary_json);
      }
    } catch (cacheErr) {
      logger.warn('[itineraryAI] Cache lookup failed:', cacheErr.message);
    }
  }

  // Check Azure OpenAI availability
  const config = getAzureConfig();
  if (!config.endpoint || !config.apiKey) {
    logger.warn('[itineraryAI] Azure OpenAI not configured — using intelligent fallback itinerary');
    return await generateFallbackItinerary(destination, tripDays, startDate);
  }

  // Build vibe instructions
  const vibeInstructions = {
    social: 'Prioritise social settings: hostels, group tours, communal dining, traveller meetups, and lively neighbourhoods.',
    solitude: 'Prioritise peaceful, independent experiences: quiet cafes, solo hikes, less-touristy spots, contemplative cultural venues, and early morning visits to popular sites.',
    balanced: 'Mix social and solitary activities — give the traveller options for both connection and independence.'
  }[soloVibe] || '';

  const vibeCheckSection = vibeCheck
    ? `\nUser's personal vibe for this trip: "${vibeCheck}"\nReflect this mood and aesthetic throughout the itinerary.`
    : '';

  const fcdoSection = fcdoContext
    ? `\nCurrent UK Government (FCDO) safety context for ${destination}:\n${fcdoContext}\nUse this to inform safety notes — flag any FCDO-relevant risks in activity safety notes.`
    : '';

  const prompt = `Generate a ${tripDays}-day solo travel itinerary for ${destination}.

User preferences:
- Travel style: ${travelStyle}
- Solo vibe mode: ${soloVibe} — ${vibeInstructions}
- Pace: ${pace}
- Budget: ${budget ? `£${budget} GBP total` : 'flexible'}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'general sightseeing'}
${vibeCheckSection}
${fcdoSection}

Note: Ensure the itinerary is strictly within ${destination}. Verify the country and do not include activities from cities with the same name in different countries.

For EACH activity include:
1. name, type, time (HH:MM), duration (hours), cost in GBP (integer)
2. description (2 sentences max, vivid and specific)
3. location / neighbourhood
4. booking_info (how to book, or empty string)
5. safety_note: a short note relevant to solo travellers (e.g. "Well-lit area, safe at night" or "Avoid after 22:00 — stick to main streets"). Use FCDO context if provided.
6. solo_friendly_dining: true/false (only relevant for Food & Dining type — is dining alone comfortable here?)
7. travel_time_from_previous: estimated travel time in minutes from the previous activity (0 for first activity of day)
8. affiliate_search_hint: for accommodation/tour activities, a short search phrase for booking (e.g. "Tokyo Shinjuku hostel" or "Shibuya food tour")

Format response as ONLY valid JSON (no markdown fences):
{
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "notes": "Day theme",
      "activities": [
        {
          "name": "Activity name",
          "type": "Sightseeing|Food & Dining|Transport|Adventure|Cultural|Relaxation|Shopping|Nightlife|Accommodation",
          "time": "09:00",
          "duration": 2,
          "cost": 0,
          "description": "Vivid description.",
          "location": "Neighbourhood/area",
          "booking_info": "How to book or empty string",
          "safety_note": "Solo safety note",
          "solo_friendly_dining": false,
          "travel_time_from_previous": 15,
          "affiliate_search_hint": ""
        }
      ]
    }
  ],
  "totalEstimatedCost": 500,
  "currency": "GBP",
  "tips": ["Practical solo travel tip 1", "tip 2", "tip 3"],
  "fcdo_warning": "One sentence summary of any active FCDO alerts, or empty string if none"
}

Rules:
- Costs in GBP integers only
- Activities must be realistic, time-ordered, and allow travel time between them
- Flag any late-night (after 22:00) activities in safety_note if in medium/low safety areas
- Return ONLY valid JSON — no markdown, no explanation`;

  try {
    const messages = [
      {
        role: 'system',
        content: `You are an expert solo travel planner for UK travellers. You specialise in safe, personalised, and culturally immersive itineraries. You know current FCDO travel advice and always factor in solo traveller safety. Always respond with valid JSON only.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const content = await callAzureOpenAI(messages, { max_tokens: 6000 });

    if (!content) throw new Error('No content returned from AI');

    // Strip any accidental markdown fences
    let jsonStr = content.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    const itinerary = JSON.parse(jsonStr.trim());

    // 2. Save to Cache if successful (and no personal vibeCheck used)
    if (!vibeCheck && itinerary && !itinerary._fallback) {
      // 4. Cache it asynchronously for future travelers
      try {
        await db.prepare(`
          INSERT INTO ai_itinerary_cache (destination, days, pace, solo_vibe, travel_style, itinerary_json)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(destination, tripDays, pace, soloVibe, travelStyle, JSON.stringify(itinerary));
      } catch (cacheErr) {
        logger.warn('[itineraryAI] Cache save failed:', cacheErr.message);
      }
    }

    return itinerary;

  } catch (error) {
    logger.error('[itineraryAI] Generation error:', error.message);
    return generateFallbackItinerary(destination, tripDays, startDate);
  }
}

/** Resolve number of trip days from params */
function resolveDays(days, startDate, endDate) {
  if (days) return days;
  if (startDate && endDate) {
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  }
  return 7;
}

/**
 * Fallback itinerary when AI is unavailable
 * Clearly marked so the user knows it's a placeholder
 */
async function generateFallbackItinerary(destination, days, startDate) {
  let realPlaces = [];
  let highlights = [];
  let countryCode = null;
  let coords = null;

  try {
    // 1. Geocode to find out WHERE this is (to exclude Rhodes, South Africa if user means Greece)
    const geo = await geocodeAddress(destination).catch(() => null);
    if (geo) {
      countryCode = geo.country_code || (geo.country === 'Greece' ? 'GR' : null); // Geoapify returns country names or codes
      // Try to mapping country names to codes if missing (Geoapify search response has country_code usually)
      coords = { lat: geo.lat, lng: geo.lon };
      logger.info(`[itineraryAI] Geocoded ${destination} to ${geo.country} (${countryCode || 'N/A'})`);
    }

    // 2. Try to get some real places for this destination to make the fallback feel "live"
    try {
      realPlaces = await searchPlaces(destination, { 
        lat: coords?.lat, 
        lng: coords?.lng, 
        countryCode 
      });
      logger.info(`[itineraryAI] Found ${realPlaces.length} real places for fallback in ${destination}`);
    } catch (searchErr) {
      logger.warn(`[itineraryAI] realPlaces search failed: ${searchErr.message}`);
    }
    
    // 3. Try to get destination-specific highlights from our database
    let query = 'SELECT highlights, country FROM destinations WHERE (name = ? OR city = ?)';
    let params = [destination, destination];
    
    if (geo && geo.country) {
      query += ' AND country = ?';
      params.push(geo.country);
    }
    
    let destData = await db.prepare(query).get(...params);
    
    if (!destData) {
      // Fallback to LIKE if no exact match found
      destData = await db.prepare('SELECT highlights, country FROM destinations WHERE name LIKE ? OR city LIKE ? LIMIT 1').get(`%${destination}%`, `%${destination}%`);
    }

    if (destData && destData.highlights) {
       highlights = JSON.parse(destData.highlights);
       logger.info(`[itineraryAI] Found ${highlights.length} local highlights for fallback in ${destination} (${destData.country})`);
    }
  } catch (err) {
    logger.warn(`[itineraryAI] Could not fetch real data for fallback: ${err.message}`);
  }

  const baseActivities = [
    { name: 'Historic Walking Tour', type: 'Sightseeing', duration: 3, cost: 0, description: 'Explore the heart of the city and discover its hidden history.', safety_note: 'Stick to well-frequented paths and keep an eye on your belongings.', solo_friendly_dining: false },
    { name: 'Local Gastronomy Experience', type: 'Food & Dining', duration: 2, cost: 30, description: 'Savour the unique flavours and traditional dishes of the region.', safety_note: 'Great for solo dining — look for communal tables or counter seating.', solo_friendly_dining: true },
    { name: 'Museum of Fine Arts', type: 'Cultural', duration: 4, cost: 20, description: 'Immerse yourself in local arts, history, or architecture.', safety_note: 'Official venues are very safe for solo travellers.', solo_friendly_dining: false },
    { name: 'Botanical Gardens', type: 'Relaxation', duration: 2, cost: 0, description: 'A peaceful escape into local green spaces or scenic viewpoints.', safety_note: 'Best visited during daylight hours when plenty of people are around.', solo_friendly_dining: false },
    { name: 'Local Artisan Market', type: 'Shopping', duration: 3, cost: 10, description: 'Browse local crafts and meet independent makers.', safety_note: 'Busy markets are safe, but keep your bags zipped.', solo_friendly_dining: false },
    { name: 'Independent Tea House', type: 'Food & Dining', duration: 1.5, cost: 8, description: 'The perfect spot to journal, people-watch, and plan your next move.', safety_note: 'Ideal safe haven for solo travellers.', solo_friendly_dining: true }
  ];

  const itineraryDays = [];
  let currentDate = startDate ? new Date(startDate) : new Date();

  for (let i = 1; i <= days; i++) {
    // Select 3 activities for the day
    const dailyActivities = [];
    const seed = i;
    
    for (let j = 0; j < 3; j++) {
      let activity;
      
      // Try to weave in highlights if available
      if (highlights.length > 0 && j === 1) {
        const hIndex = (seed) % highlights.length;
        activity = {
          name: highlights[hIndex],
          type: 'Sightseeing',
          duration: 3,
          cost: 15,
          description: `A must-see highlight of ${destination} that captures its unique spirit.`,
          safety_note: 'Well-trafficked and safe for solo explorers.',
          solo_friendly_dining: false,
          location: destination
        };
      } else {
        const activityIndex = (seed + j) % baseActivities.length;
        activity = {...baseActivities[activityIndex]};
        activity.location = destination;
      }
      
      // If we have real places from Geoapify, use them to replace location/name
      if (realPlaces.length > 0) {
        const placeIndex = (seed * 3 + j) % realPlaces.length;
        const place = realPlaces[placeIndex];
        activity.location = place.address || activity.location;
        if (j === 0) activity.name = `${place.name || activity.name}`;
      }

      dailyActivities.push({
        ...activity,
        time: `${9 + j * 4}:00`,
        booking_info: activity.cost > 0 ? 'Online booking recommended' : '',
        travel_time_from_previous: j === 0 ? 0 : 30
      });
    }

    itineraryDays.push({
      day: i,
      date: currentDate.toISOString().split('T')[0],
      notes: `Day ${i} uncovering the gems of ${destination}`,
      activities: dailyActivities
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalCost = itineraryDays.reduce(
    (sum, day) => sum + day.activities.reduce((s, a) => s + (a.cost || 0), 0), 0
  );

  return {
    destination,
    days: itineraryDays,
    totalEstimatedCost: totalCost,
    currency: 'GBP',
    tips: [
      'Book accommodations in safe, central areas',
      'Keep digital and physical copies of your passport and insurance',
      'Check the FCDO travel advice for your destination before departure',
      'Learn a few local phrases — it goes a long way',
      'Share your itinerary with a trusted contact back home'
    ],
    fcdo_warning: '',
    _fallback: true,
    _fallbackReason: 'AI generation unavailable — configure AZURE_OPENAI_API_KEY in backend/.env'
  };
}

export default { generateItinerary };
