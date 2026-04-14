import db from './db.js';

const destinations = [
  {
    name: 'Chiang Mai',
    city: 'Chiang Mai',
    country: 'Thailand',
    description: 'The digital nomad capital of the world. Chiang Mai offers a perfect blend of modern cafes, ancient temples, and a massive solo traveler community.',
    image_url: 'https://images.unsplash.com/photo-1590001158193-790133597d9c?w=1200',
    budget_level: 'budget',
    safety_rating: 'high',
    solo_friendly_rating: 5,
    climate: 'tropical',
    travel_styles: ['cultural', 'social', 'foodie'],
    highlights: ['Night Bazaar', 'Doi Suthep Temple', 'Nimman Road Cafes']
  },
  {
    name: 'Lisbon',
    city: 'Lisbon',
    country: 'Portugal',
    description: 'A hilly, coastal capital city known for its cafe culture and soulful Fado music. Extremely walkable and safe for solo explorers.',
    image_url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=1200',
    budget_level: 'moderate',
    safety_rating: 'high',
    solo_friendly_rating: 5,
    climate: 'temperate',
    travel_styles: ['cultural', 'relax', 'foodie'],
    highlights: ['Belem Tower', 'Alfama District', 'Time Out Market']
  },
  {
    name: 'Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    description: 'The ultimate destination for solo travel. From solo-dining booths to incredible public transport, Tokyo is designed for the individual.',
    image_url: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d44?w=1200',
    budget_level: 'luxury',
    safety_rating: 'high',
    solo_friendly_rating: 5,
    climate: 'temperate',
    travel_styles: ['cultural', 'foodie', 'nature'],
    highlights: ['Shibuya Crossing', 'Shinjuku Gyoen', 'Akihabara']
  },
  {
    name: 'Reykjavik',
    city: 'Reykjavik',
    country: 'Iceland',
    description: 'The safest country in the world. Perfect for solo road trips, witnessing the Northern Lights, and relaxing in thermal lagoons.',
    image_url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200',
    budget_level: 'luxury',
    safety_rating: 'high',
    solo_friendly_rating: 4,
    climate: 'cold',
    travel_styles: ['nature', 'adventure'],
    highlights: ['Blue Lagoon', 'Golden Circle', 'Hallgrimskirkja']
  },
  {
    name: 'Medellin',
    city: 'Medellin',
    country: 'Colombia',
    description: 'The City of Eternal Spring. A vibrant, social hub with a deep-rooted coffee culture and incredible mountain views.',
    image_url: 'https://images.unsplash.com/photo-1594911772125-07469796e62c?w=1200',
    budget_level: 'budget',
    safety_rating: 'medium',
    solo_friendly_rating: 4,
    climate: 'tropical',
    travel_styles: ['social', 'adventure', 'foodie'],
    highlights: ['Comuna 13', 'El Poblado', 'Guatape Rock']
  }
];

async function seed() {
  console.log('--- Starting Destination Seeding ---');
  
  try {
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO destinations (
        name, city, country, description, image_url, budget_level, 
        safety_rating, solo_friendly_rating, climate, travel_styles, highlights
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const dest of destinations) {
      insertStmt.run(
        dest.name,
        dest.city,
        dest.country,
        dest.description,
        dest.image_url,
        dest.budget_level,
        dest.safety_rating,
        dest.solo_friendly_rating,
        dest.climate,
        JSON.stringify(dest.travel_styles),
        JSON.stringify(dest.highlights)
      );
      console.log(`Seeded: ${dest.name}`);
    }

    console.log('--- Seeding Complete ---');
  } catch (error) {
    console.error('Seeding Failed:', error);
  }
}

seed();
