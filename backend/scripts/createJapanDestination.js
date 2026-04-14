import db from '../src/db.js';

async function seed() {
  // Create Japan destination in old destinations table
  await db.query(`
    INSERT INTO destinations (name, city, country, description, highlights, safety_rating, budget_level, climate, best_months, image_url, latitude, longitude, created_at, updated_at)
    VALUES ('Japan', 'Tokyo', 'Japan', 'Japan is a dream destination for solo travelers, offering a unique blend of ancient traditions and cutting-edge modernity. Its efficient infrastructure, low crime rates, and welcoming culture make it ideal for exploring independently.', '["Tokyo - Modern metropolis with excellent transport", "Kyoto - Ancient temples and traditional culture", "Osaka - Street food and friendly locals", "Hiroshima - Historical significance", "Sapporo - Natural beauty and food culture"]', 'high', 'mid', 'temperate', '["March","April","May","September","October","November"], '35.6762', '139.6503', NOW(), NOW())
    ON CONFLICT (name, city, country) DO NOTHING
  `);
  console.log('Created Japan destination');
}

seed();