
import 'dotenv/config';
import logger from '../src/services/logger.js';
import initInfisical from '../src/config/infisical.js';

// Initialize Infisical first to populate process.env
try {
    await initInfisical();
    logger.info('[SEED] Infisical secrets populated.');
} catch (error) {
    logger.warn('[SEED] Infisical handshake failed, using local .env');
}

// Now we can import modules that depend on process.env
const { default: db } = await import('../src/db.js');
const { callAzureOpenAI } = await import('../src/services/aiService.js');

const DESTINATION_BATCH_SIZE = 10;
const TOTAL_DESTINATIONS = 50;

async function generateDestinationsBatch() {
    const prompt = `
    Generate a JSON list of ${DESTINATION_BATCH_SIZE} diverse, safe, and popular solo travel destinations worldwide.
    Focus on a mix of beginner-friendly (Europe, Japan) and adventurous but safe (Costa Rica, Bali) locations.
    
    Return ONLY a JSON object with a "destinations" key containing an array of objects.
    Each object MUST have:
    - name: String (City or Region)
    - country: String
    - city: String (optional)
    - description: String (2-3 sentences, exciting and informative)
    - highlights: Array of Strings (3-5 items)
    - travel_styles: Array of Strings (e.g., "Architecture", "Food", "Nature")
    - budget_level: String ("Budget", "Mid-range", "Luxury")
    - climate: String ("Tropical", "Temperate", "Mediterranean", etc.)
    - best_months: Array of Strings
    - safety_rating: String ("High", "Very High")
    - solo_friendly_rating: Integer (1-10)
    - image_url: String (Unsplash source URL with keywords, e.g., "https://images.unsplash.com/photo-1513581166391-8b5096d4c0a1?auto=format&fit=crop&q=80&w=2000")
    - destination_tips: String (One paragraph of specific solo travel advice)
    - latitude: Float
    - longitude: Float
    - emergency_contacts: JSON object (police, ambulance, tourist_police)
    - safety_intelligence: String (A paragraph on why it is safe and what to watch for)
    `;

    try {
        const response = await callAzureOpenAI([
            { role: 'system', content: 'You are a professional travel data assistant. Respond only in valid JSON.' },
            { role: 'user', content: prompt }
        ], { json: true });

        const data = typeof response === 'string' ? JSON.parse(response) : response;
        return data.destinations || [];
    } catch (error) {
        logger.error(`[SEED] AI Generation failed: ${error.message}`);
        console.error(error); // Log full error to console
        return [];
    }
}

async function seed() {
    logger.info(`[SEED] Starting destination seeding (${TOTAL_DESTINATIONS} total)...`);
    
    let seededCount = 0;
    while (seededCount < TOTAL_DESTINATIONS) {
        logger.info(`[SEED] Generating batch... (${seededCount}/${TOTAL_DESTINATIONS})`);
        const batch = await generateDestinationsBatch();
        
        for (const dest of batch) {
            try {
                // Check if already exists
                const existing = await db.get('SELECT id FROM destinations WHERE name = ? AND country = ?', dest.name, dest.country);
                if (existing) {
                    logger.info(`[SEED] Skipping ${dest.name} (exists)`);
                    continue;
                }

                await db.run(`
                    INSERT INTO destinations (
                        name, country, city, description, highlights, travel_styles, 
                        budget_level, climate, best_months, safety_rating, 
                        solo_friendly_rating, image_url, destination_tips, 
                        latitude, longitude, emergency_contacts, safety_intelligence
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, 
                dest.name, 
                dest.country, 
                dest.city || null, 
                dest.description, 
                JSON.stringify(dest.highlights), 
                JSON.stringify(dest.travel_styles),
                dest.budget_level,
                dest.climate,
                JSON.stringify(dest.best_months),
                dest.safety_rating,
                dest.solo_friendly_rating,
                dest.image_url,
                dest.destination_tips,
                dest.latitude,
                dest.longitude,
                JSON.stringify(dest.emergency_contacts),
                dest.safety_intelligence
                );
                
                seededCount++;
                logger.info(`[SEED] Added ${dest.name}, ${dest.country} (${seededCount}/${TOTAL_DESTINATIONS})`);
            } catch (err) {
                logger.error(`[SEED] Error adding ${dest.name}:`, err.message);
            }
        }
    }

    logger.info('[SEED] Seeding completed!');
    process.exit(0);
}

seed().catch(err => {
    logger.error('[SEED] Fatal error:', err);
    process.exit(1);
});
