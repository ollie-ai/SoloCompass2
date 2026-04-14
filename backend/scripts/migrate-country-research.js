/**
 * Country Research Migration Script
 * Run this against your database to set up the new country research schema
 * and seed the initial 6 countries.
 * 
 * Usage: node scripts/migrate-country-research.js
 */

import 'dotenv/config';
import logger from '../src/services/logger.js';
import initInfisical from '../src/config/infisical.js';

// Initialize Infisical first to populate process.env
try {
    await initInfisical();
    logger.info('[MIGRATION] Infisical secrets populated.');
} catch (error) {
    logger.warn('[MIGRATION] Infisical handshake failed, using local .env');
}

// Now we can import modules that depend on process.env
const { default: db } = await import('../src/db.js');

const MIGRATION_NAME = 'country_research_v1';

async function runMigration() {
  logger.info('Starting country research migration...');
  
  try {
    // =========================================================================
    // STEP 1: Add new columns for destinations table
    logger.info('Adding new columns to destinations table...');
    
    const columnsToAdd = [
      // Positioning & Fit
      { name: 'positioning_summary', type: 'TEXT' },
      { name: 'caution_for_tags', type: 'TEXT' },
      
      // Budget & Cost
      { name: 'daily_budget_min', type: 'NUMERIC' },
      { name: 'daily_budget_max', type: 'NUMERIC' },
      { name: 'backpacker_daily', type: 'NUMERIC' },
      { name: 'comfort_daily', type: 'NUMERIC' },
      
      // Practical Logistics
      { name: 'currency_code', type: 'TEXT' },
      { name: 'plug_type', type: 'TEXT' },
      { name: 'time_zone', type: 'TEXT' },
      { name: 'card_acceptance_score', type: 'TEXT' },
      
      // Digital Nomad
      { name: 'wifi_reliability_score', type: 'TEXT' },
      { name: 'coworking_density', type: 'TEXT' },
      { name: 'visa_remote_friendliness', type: 'TEXT' },
      { name: 'english_accessibility', type: 'TEXT' },
      
      // Solo Social
      { name: 'solo_social_score', type: 'INTEGER' },
      { name: 'hostel_culture_score', type: 'INTEGER' },
      { name: 'meetup_density', type: 'TEXT' },
      { name: 'first_time_solo_friendly', type: 'TEXT' },
      
      // Regional
      { name: 'regional_differences_summary', type: 'TEXT' },
      { name: 'easiest_first_regions', type: 'TEXT' },
      { name: 'higher_risk_regions', type: 'TEXT' },
      
      // Source Labels & Freshness
      { name: 'source_label', type: 'TEXT' },
      { name: 'entry_requirements_snapshot', type: 'TEXT' },
      { name: 'official_advisory_detail', type: 'TEXT' },
      
      // Research Workflow
      { name: 'research_workflow_state', type: 'TEXT', default: "'draft'" },
      { name: 'research_completeness_score', type: 'REAL' },
      
      // Additional fields for country pages
      { name: 'title', type: 'TEXT' },
      { name: 'climate_summary', type: 'TEXT' },
      { name: 'language_summary', type: 'TEXT' },
      { name: 'transport_summary', type: 'TEXT' },
      { name: 'payment_notes', type: 'TEXT' },
      { name: 'sim_esim_notes', type: 'TEXT' },
      
      // City routing
      { name: 'launch_cities', type: 'TEXT' },
    ];

    for (const col of columnsToAdd) {
      const defaultClause = col.default ? ` DEFAULT ${col.default}` : '';
      try {
        await db.prepare(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${defaultClause}`).run();
        logger.info(`  ✓ Added ${col.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          logger.info(`  ○ ${col.name} already exists`);
        } else {
          throw err;
        }
      }
    }

    // =========================================================================
    // STEP 2: Clear existing destinations
    // =========================================================================
    logger.info('Clearing existing destinations...');
    await db.prepare('DELETE FROM destinations').run();
    logger.info('  ✓ Cleared all destinations');
    
    // Reset sequence
    await db.prepare("SELECT setval('destinations_id_seq', 1, false)").run();
    logger.info('  ✓ Reset ID sequence');

    // =========================================================================
    // STEP 3: Seed initial 6 countries
    // =========================================================================
    logger.info('Seeding initial 6 countries...');
    
    const seedCountries = [
      {
        name: 'Japan',
        slug: 'japan',
        country: 'Japan',
        destination_level: 'country',
        positioning_summary: 'A profoundly safe, efficient, and culturally rich destination perfect for solo travelers seeking structure, respect, and deep cultural immersion.',
        short_summary: 'Immaculately safe,astonishingly efficient, and culturally深度. Perfect for solo travelers who value structure, cleanliness, and respectful interactions.',
        why_solo_travellers: 'Japan offers an unmatched solo travel experience with exceptional safety, world-class public transport, and a culture that genuinely welcomes visitors. Solo dining is comfortable, crime is virtually non-existent, and English signage is widespread in cities.',
        best_for_tags: JSON.stringify(['culture', 'safety', 'nature', 'food', 'efficiency']),
        caution_for_tags: JSON.stringify(['expensive', 'language_barrier', 'cultural_etiquette']),
        budget_level: 'moderate',
        daily_budget_min: 80,
        daily_budget_max: 200,
        backpacker_daily: 80,
        comfort_daily: 200,
        currency_code: 'JPY',
        plug_type: 'Type A/B (100V)',
        time_zone: 'Asia/Tokyo',
        card_acceptance_score: 'high',
        wifi_reliability_score: 'high',
        coworking_density: 'high',
        visa_remote_friendliness: 'medium',
        english_accessibility: 'high',
        solo_social_score: 7,
        hostel_culture_score: 8,
        meetup_density: 'high',
        first_time_solo_friendly: 'yes',
        climate_summary: 'Four distinct seasons. Summer (Jun-Aug) is hot/humid, Winter (Dec-Feb) is cold with snow in north. Spring (Mar-May) is ideal for cherry blossoms.',
        language_summary: 'Japanese is the main language. English is limited outside major cities but sufficient for travel basics. Learning basic phrases is greatly appreciated.',
        transport_summary: 'Exceptional. JR Pass covers most trains. IC cards work everywhere. Subways in major cities are clean and efficient.',
        payment_notes: 'Cash is still king in Japan. 7-Eleven and post offices have international ATMs. Most hotels and restaurants accept cards in cities.',
        sim_esim_notes: 'eSIM works well. Japanese carriers (NTT, SoftBank, KDDI) have good coverage. Airport SIM counters available.',
        safety_rating: 'high',
        solo_friendly_rating: 10,
        publication_status: 'draft',
        safety_gate_status: 'unchecked',
        manual_review_status: 'pending',
        research_workflow_state: 'draft',
        source_label: 'ai',
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80',
        description: 'Japan is a captivating destination that seamlessly blends ancient traditions with cutting-edge modernity. From the neon-lit streets of Tokyo to the serene temples of Kyoto, solo travelers will find a country that is exceptionally safe, immaculately maintained, and profoundly respectful of visitors.'
      },
      {
        name: 'Portugal',
        slug: 'portugal',
        country: 'Portugal',
        destination_level: 'country',
        positioning_summary: 'One of Europe\'s most welcoming and affordable countries, offering excellent solo travel infrastructure, vibrant social scenes, and year-round appeal.',
        short_summary: 'Affordable, friendly, and sun-soaked. Perfect for solo travelers who want European charm without the price tag and excellent hostel culture.',
        why_solo_travellers: 'Portugal consistently ranks as one of Europe\'s best solo travel destinations. The people are genuinely warm, English is widely spoken, hostel culture is excellent, and the cost of living remains reasonable. Lisbon, Porto, and the Algarve each offer distinct experiences.',
        best_for_tags: JSON.stringify(['social', 'budget', 'coastal', 'culture', 'wine']),
        caution_for_tags: JSON.stringify(['pickpocketing', 'summer_crowds']),
        budget_level: 'budget',
        daily_budget_min: 50,
        daily_budget_max: 120,
        backpacker_daily: 50,
        comfort_daily: 120,
        currency_code: 'EUR',
        plug_type: 'Type F (230V)',
        time_zone: 'Europe/Lisbon',
        card_acceptance_score: 'high',
        wifi_reliability_score: 'high',
        coworking_density: 'high',
        visa_remote_friendliness: 'high',
        english_accessibility: 'excellent',
        solo_social_score: 9,
        hostel_culture_score: 10,
        meetup_density: 'high',
        first_time_solo_friendly: 'yes',
        climate_summary: 'Mediterranean climate. Hot summers (Jun-Sep) especially in south. Mild winters (Dec-Feb) with some rain. Spring and autumn are ideal.',
        language_summary: 'Portuguese is the main language. English is widely spoken in tourist areas. Portuguese people are generally patient and helpful.',
        transport_summary: 'Excellent train network (Comboios de Portugal). Budget airlines connect major cities. Intercity buses are affordable. Urban transport in Lisbon/Porto is efficient.',
        payment_notes: 'Card payments widely accepted. MB Way app is popular for transfers. ATM networks are extensive.',
        sim_esim_notes: 'All major Portuguese carriers (Vodafone, NOS, MEO) offer good prepaid options. eSIM available from most providers.',
        safety_rating: 'high',
        solo_friendly_rating: 10,
        publication_status: 'draft',
        safety_gate_status: 'unchecked',
        manual_review_status: 'pending',
        research_workflow_state: 'draft',
        source_label: 'ai',
        image_url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&q=80',
        description: 'Portugal offers an exceptional solo travel experience with its blend of affordable living, excellent infrastructure, and genuinely welcoming locals. From the tiled facades of Lisbon to the port wine cellars of Porto and the stunning beaches of the Algarve, Portugal delivers a refined European experience without the premium price tag.'
      },
      {
        name: 'Spain',
        slug: 'spain',
        country: 'Spain',
        destination_level: 'country',
        positioning_summary: 'A passionate, diverse destination offering world-class culture, excellent food, and one of Europe\'s strongest solo travel scenes.',
        short_summary: 'Vibrant, diverse, and socially electric. Perfect for solo travelers who want culture, food, and an active social scene.',
        why_solo_travellers: 'Spain has perfected the art of solo travel with its siesta culture, excellent tapas scene perfect for solo dining, and vibrant social venues. Barcelona, Madrid, Valencia, and Seville each offer distinct personalities. The hostel network is excellent and English is widely spoken.',
        best_for_tags: JSON.stringify(['culture', 'food', 'social', 'beach', 'architecture']),
        caution_for_tags: JSON.stringify(['pickpocketing', 'summer_heat', 'language_barrier']),
        budget_level: 'moderate',
        daily_budget_min: 60,
        daily_budget_max: 150,
        backpacker_daily: 60,
        comfort_daily: 150,
        currency_code: 'EUR',
        plug_type: 'Type C/F (230V)',
        time_zone: 'Europe/Madrid',
        card_acceptance_score: 'high',
        wifi_reliability_score: 'high',
        coworking_density: 'high',
        visa_remote_friendliness: 'medium',
        english_accessibility: 'medium',
        solo_social_score: 9,
        hostel_culture_score: 9,
        meetup_density: 'high',
        first_time_solo_friendly: 'yes',
        climate_summary: 'Varied by region. Central areas have hot summers and cold winters. Mediterranean coast is milder. Canary Islands are year-round destination.',
        language_summary: 'Spanish (Castellano) is the main language. Catalan (Barcelona), Basque (Basque Country), and Galician are also spoken. English in tourist areas.',
        transport_summary: 'Excellent AVE high-speed train network. Budget flights are cheap. Metro systems in major cities. Local buses are reliable.',
        payment_notes: 'Cards widely accepted. Cash still preferred in some traditional restaurants. Contactless payments common.',
        sim_esim_notes: 'All major carriers (Vodafone, Orange, Masmovil) offer good coverage. eSIM readily available.',
        safety_rating: 'high',
        solo_friendly_rating: 9,
        publication_status: 'draft',
        safety_gate_status: 'unchecked',
        manual_review_status: 'pending',
        research_workflow_state: 'draft',
        source_label: 'ai',
        image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80',
        description: 'Spain is a country that celebrates life through food, art, music, and social connection. Solo travelers will find a destination that genuinely embraces the solo diner, offers world-class cultural experiences, and provides excellent value across every budget level.'
      },
      {
        name: 'Thailand',
        slug: 'thailand',
        country: 'Thailand',
        destination_level: 'country',
        positioning_summary: 'The quintessential backpacker destination offering exceptional value, warm hospitality, and a perfect blend of culture, nature, and social energy.',
        short_summary: 'Affordable, welcoming, and endlessly diverse. Perfect for solo travelers who want adventure, culture, and great value.',
        why_solo_travellers: 'Thailand remains one of the world\'s most solo-friendly destinations. The cost of living is exceptionally low, English is widely understood in tourist areas, the food is exceptional and cheap, and the hostel scene is world-class. From Bangkok\'s energy to northern mountains to southern islands, Thailand delivers.',
        best_for_tags: JSON.stringify(['budget', 'food', 'beach', 'culture', 'adventure']),
        caution_for_tags: JSON.stringify(['scams', 'tourist_traps', ' monsoon_season']),
        budget_level: 'budget',
        daily_budget_min: 25,
        daily_budget_max: 80,
        backpacker_daily: 25,
        comfort_daily: 80,
        currency_code: 'THB',
        plug_type: 'Type A/B (220V)',
        time_zone: 'Asia/Bangkok',
        card_acceptance_score: 'medium',
        wifi_reliability_score: 'high',
        coworking_density: 'high',
        visa_remote_friendliness: 'high',
        english_accessibility: 'high',
        solo_social_score: 10,
        hostel_culture_score: 10,
        meetup_density: 'very_high',
        first_time_solo_friendly: 'yes',
        climate_summary: 'Tropical. Hot (Mar-May), rainy season (Jun-Oct), and cool (Nov-Feb). Best time is Nov-Feb. Avoid Songkran (April) if you dislike crowds.',
        language_summary: 'Thai is the main language. English is widely spoken in tourist areas and major cities. Thai people are patient with language barriers.',
        transport_summary: 'Excellent domestic flights (AirAsia, Bangkok Air). Night trains are an experience. Songthaews and buses for local transport. Tuk-tuks in cities.',
        payment_notes: 'Cash is king. ATMs everywhere with small fees. Mobile banking (PromptPay) is widespread. Exchange at superrich for best rates.',
        sim_esim_notes: 'AIS, TrueMove, and DTAC all offer excellent cheap prepaid data. eSIM available. Airport SIM counters are convenient.',
        safety_rating: 'medium',
        solo_friendly_rating: 10,
        publication_status: 'draft',
        safety_gate_status: 'unchecked',
        manual_review_status: 'pending',
        research_workflow_state: 'draft',
        source_label: 'ai',
        image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80',
        description: 'Thailand offers an unbeatable combination of affordability, hospitality, and diverse experiences. Whether you\'re exploring Bangkok\'s bustling markets, relaxing on southern island beaches, or trekking through northern mountain villages, Thailand provides an exceptional solo travel experience that keeps visitors coming back.'
      },
      {
        name: 'Italy',
        slug: 'italy',
        country: 'Italy',
        destination_level: 'country',
        positioning_summary: 'A dream destination for culture, food, and art lovers, offering timeless cities, stunning landscapes, and the world\'s best culinary scene.',
        short_summary: 'Timeless, delicious, and endlessly inspiring. Perfect for solo travelers who prioritize culture, food, and artistic heritage.',
        why_solo_travellers: 'Italy captures the imagination like few other destinations. The art, architecture, and culinary traditions are unmatched. Solo travel is easy in tourist areas though some regions feel less solo-friendly than others. The key is embracing the Italian pace - slow down, linger over meals, and engage with locals.',
        best_for_tags: JSON.stringify(['culture', 'food', 'history', 'art', 'architecture']),
        caution_for_tags: JSON.stringify(['expensive', 'pickpocketing', 'tourist_scams']),
        budget_level: 'moderate',
        daily_budget_min: 80,
        daily_budget_max: 200,
        backpacker_daily: 80,
        comfort_daily: 200,
        currency_code: 'EUR',
        plug_type: 'Type L (230V)',
        time_zone: 'Europe/Rome',
        card_acceptance_score: 'high',
        wifi_reliability_score: 'high',
        coworking_density: 'medium',
        visa_remote_friendliness: 'medium',
        english_accessibility: 'medium',
        solo_social_score: 7,
        hostel_culture_score: 7,
        meetup_density: 'medium',
        first_time_solo_friendly: 'yes',
        climate_summary: 'Mediterranean. Hot summers (Jul-Aug) in cities. Mild winters in south, cold in north. Spring (Apr-May) and autumn (Sep-Oct) are ideal.',
        language_summary: 'Italian is the main language. English is common in tourist areas but limited elsewhere. Learning basic Italian greatly enhances experience.',
        transport_summary: 'Excellent high-speed trains (Frecce). Regional trains are reliable. Budget flights within Italy are cheap. Urban metros in Rome, Milan, Naples.',
        payment_notes: 'Cards widely accepted in tourist areas. Cash still preferred in smaller towns. Contactless payments increasingly common.',
        sim_esim_notes: 'TIM, Vodafone, and Wind offer good coverage. eSIM available. Consider tourist-specific plans from TIM.',
        safety_rating: 'high',
        solo_friendly_rating: 8,
        publication_status: 'draft',
        safety_gate_status: 'unchecked',
        manual_review_status: 'pending',
        research_workflow_state: 'draft',
        source_label: 'ai',
        image_url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&q=80',
        description: 'Italy is a destination that needs no introduction - it has shaped Western civilization through art, architecture, philosophy, and cuisine. For solo travelers, Italy offers an immersive journey through history, the chance to wander world-class museums, and the simple pleasure of an excellent meal enjoyed alone.'
      },
      {
        name: 'Mexico',
        slug: 'mexico',
        country: 'Mexico',
        destination_level: 'country',
        positioning_summary: 'A vibrant, diverse destination offering exceptional value, world-class food, rich culture, and some of the best solo travel infrastructure in Latin America.',
        short_summary: 'Colourful, affordable, and incredibly diverse. Perfect for solo travelers who want culture, beaches, and amazing food without the European price tag.',
        why_solo_travellers: 'Mexico offers an extraordinary solo travel experience with its world-renowned cuisine, incredibly diverse landscapes, and genuinely warm hospitality. From Mexico City\'s cultural depth to the beaches of Oaxaca and the Yucatan, Mexico delivers variety without breaking the bank. English is common in tourist areas.',
        best_for_tags: JSON.stringify(['food', 'culture', 'beach', 'budget', 'architecture']),
        caution_for_tags: JSON.stringify(['safety_regional', 'tourist_scams', 'water_quality']),
        budget_level: 'budget',
        daily_budget_min: 30,
        daily_budget_max: 100,
        backpacker_daily: 30,
        comfort_daily: 100,
        currency_code: 'MXN',
        plug_type: 'Type A/B (127V)',
        time_zone: 'America/Mexico_City',
        card_acceptance_score: 'high',
        wifi_reliability_score: 'high',
        coworking_density: 'high',
        visa_remote_friendliness: 'high',
        english_accessibility: 'medium',
        solo_social_score: 9,
        hostel_culture_score: 9,
        meetup_density: 'high',
        first_time_solo_friendly: 'yes',
        climate_summary: 'Varied by region. Tropical in south (Cancun, Tulum). Desert in north. Central highlands (Mexico City) have mild year-round. Rainy season (May-Oct).',
        language_summary: 'Spanish is the main language. English is common in tourist areas and major cities. Learning Spanish greatly enhances experience.',
        transport_summary: 'Good bus network (ADO, ETN for luxury). Domestic flights are affordable. Metro in Mexico City is extensive and cheap. Taxis and Uber widely available.',
        payment_notes: 'Cards widely accepted in cities. Cash still common in markets and small towns. ATMs are everywhere.',
        sim_esim_notes: 'Telcel, TelMex (Claro), and AT&T all offer good coverage. eSIM available. Tourist SIM options at airports.',
        safety_rating: 'medium',
        solo_friendly_rating: 8,
        publication_status: 'draft',
        safety_gate_status: 'unchecked',
        manual_review_status: 'pending',
        research_workflow_state: 'draft',
        source_label: 'ai',
        image_url: 'https://images.unsplash.com/photo-1518659526054-1903407d76d5?auto=format&fit=crop&q=80',
        description: 'Mexico is a country that rewards the curious traveler with its extraordinary diversity, world-class cuisine, and deeply rooted cultural traditions. From ancient Mayan ruins to colonial西班牙-style towns, from pristine beaches to vibrant Mexico City, solo travelers will find a destination that feels both exotic and accessible.'
      }
    ];

    for (const country of seedCountries) {
      // Convert arrays to JSON strings
      const fields = [];
      const values = [];
      const params = [];
      
      for (const [key, value] of Object.entries(country)) {
        fields.push(key);
        values.push('?');
        
        if (Array.isArray(value)) {
          params.push(JSON.stringify(value));
        } else {
          params.push(value);
        }
      }
      
      const query = `INSERT INTO destinations (${fields.join(', ')}) VALUES (${values.join(', ')})`;
      await db.prepare(query).run(...params);
      logger.info(`  ✓ Seeded ${country.name}`);
    }

    logger.info('\n✓ Migration complete!');
    logger.info('\nSeeded countries: Japan, Portugal, Spain, Thailand, Italy, Mexico');
    logger.info('Each country is in "draft" state with research_workflow_state = "draft"');
    logger.info('\nNext steps:');
    logger.info('1. Run research on each country via admin panel');
    logger.info('2. Review AI-generated content');
    logger.info('3. Add official advisory data manually');
    logger.info('4. Approve and publish when ready');
    
  } catch (error) {
    logger.error('Migration failed:', error.message);
    throw error;
  }
  
  process.exit(0);
}

// Run if called directly
runMigration();