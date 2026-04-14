/**
 * SoloCompass — Global Setup for Playwright Tests
 * 
 * Seeds the database with test data before running any test suite.
 * This runs ONCE per Playwright invocation.
 * 
 * Usage: Automatically invoked by playwright.config.js via globalSetup
 */

import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load backend env (includes Infisical credentials)
dotenv.config({ path: resolve(__dirname, '..', '..', '..', 'backend', '.env') });

const { Pool } = pg;

let pool;

/**
 * Initialize Infisical to get secrets (same as backend does)
 */
async function initInfisical() {
  if (process.env.INFISICAL_ENABLED === 'false' || process.env.NODE_ENV === 'test') {
    console.log('[Infisical] Disabled via env, using local .env');
    return;
  }

  if (!process.env.INFISICAL_CLIENT_ID || !process.env.INFISICAL_CLIENT_SECRET || !process.env.INFISICAL_PROJECT_ID) {
    console.log('[Infisical] Missing credentials, skipping...');
    return;
  }

  try {
    const { InfisicalSDK } = await import('@infisical/sdk');
    const client = new InfisicalSDK({
      siteUrl: process.env.INFISICAL_SITE_URL || 'https://app.infisical.com'
    });

    await client.auth().universalAuth.login({
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET
    });

    const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    const result = await client.secrets().listSecrets({
      environment,
      projectId: process.env.INFISICAL_PROJECT_ID,
      secretPath: '/',
      includeImports: true
    });

    const secretsList = result?.secrets || [];
    secretsList.forEach((secret) => {
      process.env[secret.secretKey] = secret.secretValue;
    });
    console.log(`[Infisical] Loaded ${secretsList.length} secrets`);
  } catch (error) {
    console.log(`[Infisical] Failed: ${error.message}, continuing with available env vars`);
  }
}

async function getPool() {
  if (pool) return pool;
  
  // Initialize Infisical to get DATABASE_URL
  await initInfisical();
  
  // Also check .env.local if exists
  if (!process.env.DATABASE_URL) {
    const envPath = resolve(__dirname, '..', '..', '..', 'backend', '.env.local');
    dotenv.config({ path: envPath });
  }
  
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not found.');
    return null;
  }
  
  const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
  
  console.log(`[DB] Connecting to ${isLocal ? 'local' : 'remote'} database...`);
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  
  return pool;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function hoursFromNow(n) {
  return new Date(Date.now() + n * 3600000).toISOString();
}

const DEFAULT_PASSWORD = 'Test1234!';

async function seedDatabase() {
  console.log('\n🌱 Seeding test database...');
  
  const dbPool = await getPool();
  if (!dbPool) {
    console.log('⚠️ Skipping database seed - no DATABASE_URL available');
    return;
  }
  
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const userIds = {};

  // 1. USERS
  const users = [
    { email: 'admin@solocompass.test',     name: 'Admin User',       role: 'admin', tier: 'navigator', premium: true },
    { email: 'explorer@solocompass.test',  name: 'Emma Explorer',    role: 'user',  tier: 'free',      premium: false },
    { email: 'guardian@solocompass.test',   name: 'Grace Guardian',   role: 'user',  tier: 'guardian',  premium: true },
    { email: 'navigator@solocompass.test', name: 'Noah Navigator',   role: 'user',  tier: 'navigator', premium: true },
    { email: 'newuser@solocompass.test',   name: 'Fresh Traveller',  role: 'user',  tier: 'free',      premium: false },
    { email: 'expired@solocompass.test',   name: 'Expired Premium',  role: 'user',  tier: 'free',      premium: false },
    { email: 'buddy1@solocompass.test',    name: 'Sakura Tanaka',    role: 'user',  tier: 'navigator', premium: true },
    { email: 'buddy2@solocompass.test',    name: 'Liam Murphy',      role: 'user',  tier: 'guardian',  premium: true },
  ];

  for (const u of users) {
    const existing = await dbPool.query('SELECT id FROM users WHERE email = $1', [u.email]);
    if (existing.rows.length > 0) {
      const existingId = existing.rows[0].id;
      userIds[u.email] = existingId;

      const premiumExpires = u.premium
        ? new Date(Date.now() + 365 * 24 * 3600000).toISOString()
        : null;

      // Keep E2E auth deterministic by normalizing credentials/plan fields on every run.
      await dbPool.query(
        `UPDATE users
         SET password = $1,
             name = $2,
             role = $3,
             is_premium = $4,
             subscription_tier = $5,
             is_verified = true,
             premium_expires_at = $6
         WHERE id = $7`,
        [hashedPassword, u.name, u.role, u.premium, u.tier, premiumExpires, existingId]
      );
      continue;
    }

    const premiumExpires = u.premium
      ? new Date(Date.now() + 365 * 24 * 3600000).toISOString()
      : null;

    const res = await dbPool.query(
      `INSERT INTO users (email, password, name, role, is_premium, subscription_tier, is_verified, premium_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7) RETURNING id`,
      [u.email, hashedPassword, u.name, u.role, u.premium, u.tier, premiumExpires]
    );
    userIds[u.email] = res.rows[0].id;

    await dbPool.query(
      `INSERT INTO profiles (user_id, bio, travel_style, home_city)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO NOTHING`,
      [
        userIds[u.email],
        `Hi! I'm ${u.name}. Solo travelling is my passion.`,
        ['adventurous', 'moderate', 'relaxed', 'adventurous', 'moderate', 'relaxed', 'adventurous', 'moderate'][users.indexOf(u)],
        ['London', 'Manchester', 'Bristol', 'Edinburgh', 'Birmingham', 'Liverpool', 'Tokyo', 'Dublin'][users.indexOf(u)],
      ]
    );
  }

  // Set expired premium
  await pool.query(
    `UPDATE users SET premium_expires_at = $1 WHERE email = $2`,
    [new Date(Date.now() - 30 * 24 * 3600000).toISOString(), 'expired@solocompass.test']
  );

  // 2. TRIPS
  const trips = [
    { user: 'admin@solocompass.test',     name: 'Tokyo Adventure',      dest: 'Tokyo',       start: daysFromNow(30),  end: daysFromNow(37),  status: 'planning',   budget: 2500 },
    { user: 'admin@solocompass.test',     name: 'Paris Getaway',        dest: 'Paris',       start: daysFromNow(7),   end: daysFromNow(14),  status: 'confirmed',  budget: 1800 },
    { user: 'admin@solocompass.test',     name: 'London Explorer',      dest: 'London',      start: daysFromNow(-14), end: daysFromNow(-7),  status: 'completed',  budget: 1200 },
    { user: 'admin@solocompass.test',     name: 'Barcelona Live',       dest: 'Barcelona',   start: daysFromNow(-2),  end: daysFromNow(5),   status: 'confirmed',  budget: 1500 },
    { user: 'admin@solocompass.test',     name: 'Rome Cancelled',       dest: 'Rome',        start: daysFromNow(-30), end: daysFromNow(-23), status: 'cancelled',  budget: 2000 },
    { user: 'explorer@solocompass.test',  name: 'Bali Beach Trip',      dest: 'Bali',        start: daysFromNow(14),  end: daysFromNow(21),  status: 'planning',   budget: 1000 },
    { user: 'explorer@solocompass.test',  name: 'Amsterdam Weekend',    dest: 'Amsterdam',   start: daysFromNow(45),  end: daysFromNow(48),  status: 'confirmed',  budget: 600 },
    { user: 'guardian@solocompass.test',   name: 'Kenya Safari',         dest: 'Nairobi',     start: daysFromNow(14),  end: daysFromNow(21),  status: 'confirmed',  budget: 3000 },
    { user: 'guardian@solocompass.test',   name: 'Greek Islands',        dest: 'Santorini',   start: daysFromNow(-7),  end: daysFromNow(-1),  status: 'completed',  budget: 2200 },
    { user: 'navigator@solocompass.test', name: 'Bangkok Explorer',     dest: 'Bangkok',     start: daysFromNow(3),   end: daysFromNow(10),  status: 'confirmed',  budget: 1400 },
    { user: 'navigator@solocompass.test', name: 'New York City',        dest: 'New York',    start: daysFromNow(-21), end: daysFromNow(-14), status: 'completed',  budget: 4000 },
    { user: 'navigator@solocompass.test', name: 'Lisbon Discovery',     dest: 'Lisbon',      start: daysFromNow(60),  end: daysFromNow(67),  status: 'planning',   budget: 1600 },
    { user: 'buddy1@solocompass.test',    name: 'Tokyo Cherry Blossom', dest: 'Tokyo',       start: daysFromNow(28),  end: daysFromNow(35),  status: 'confirmed',  budget: 2800 },
    { user: 'buddy2@solocompass.test',    name: 'Japan Discovery',      dest: 'Tokyo',       start: daysFromNow(29),  end: daysFromNow(36),  status: 'confirmed',  budget: 2200 },
  ];

  const tripIds = {};

  for (const t of trips) {
    const userId = userIds[t.user];
    const res = await dbPool.query(
      `INSERT INTO trips (user_id, name, destination, start_date, end_date, status, budget, generation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'idle') RETURNING id`,
      [userId, t.name, t.dest, t.start, t.end, t.status, t.budget]
    );
    tripIds[t.name] = res.rows[0].id;
  }

  // 3. ITINERARY DAYS for London Explorer
  const londonTripId = tripIds['London Explorer'];
  if (londonTripId) {
    const dayNames = ['Arrival & Orientation', 'Cultural Deep Dive', 'Hidden Gems', 'Markets & Food', 'Royal London', 'Night Life', 'Departure'];
    for (let i = 0; i < 7; i++) {
      const dayRes = await pool.query(
        `INSERT INTO itinerary_days (trip_id, day_number, date) VALUES ($1, $2, $3) RETURNING id`,
        [londonTripId, i + 1, daysFromNow(-14 + i)]
      );
      const dayId = dayRes.rows[0].id;

      const activities = [
        { name: `Morning: ${dayNames[i]}`, type: 'sightseeing', time: '09:00', duration: 3, cost: 25 },
        { name: `Afternoon: Local lunch spot`, type: 'food', time: '12:30', duration: 1.5, cost: 15 },
        { name: `Evening: ${['Bar crawl', 'Theatre', 'River walk', 'Live music', 'Rooftop bar', 'Jazz club', 'Farewell dinner'][i]}`, type: 'entertainment', time: '19:00', duration: 3, cost: 40 },
      ];

      for (const act of activities) {
        await dbPool.query(
          `INSERT INTO activities (day_id, trip_id, name, type, time, duration_hours, cost, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [dayId, londonTripId, act.name, act.type, act.time, act.duration, act.cost, activities.indexOf(act)]
        );
      }
    }
  }

  // 4. EMERGENCY CONTACTS
  const contacts = [
    { user: 'admin@solocompass.test',     name: 'Sarah Johnson',  email: 'sarah@test.com',   phone: '+447700000001', rel: 'partner',   primary: true },
    { user: 'admin@solocompass.test',     name: 'Mike Johnson',   email: 'mike@test.com',    phone: '+447700000002', rel: 'parent',    primary: false },
    { user: 'explorer@solocompass.test',  name: 'Tom Explorer',   email: 'tom@test.com',     phone: '+447700000004', rel: 'friend',    primary: true },
    { user: 'guardian@solocompass.test',   name: 'Helen Guard',    email: 'helen@test.com',   phone: '+447700000005', rel: 'parent',    primary: true },
    { user: 'navigator@solocompass.test', name: 'Olivia Nav',     email: 'olivia@test.com',  phone: '+447700000007', rel: 'partner',   primary: true },
  ];

  for (const c of contacts) {
    const userId = userIds[c.user];
    await dbPool.query(
      `INSERT INTO emergency_contacts (user_id, name, email, phone, relationship, is_primary, notify_on_checkin, notify_on_emergency)
       VALUES ($1, $2, $3, $4, $5, $6, true, true)`,
      [userId, c.name, c.email, c.phone, c.rel, c.primary]
    );
  }

  // 5. CHECK-IN HISTORY
  const adminId = userIds['admin@solocompass.test'];
  const guardianId = userIds['guardian@solocompass.test'];
  const navigatorId = userIds['navigator@solocompass.test'];

  const checkIns = [
    { user: adminId,    type: 'safe',      lat: 51.5074, lng: -0.1278, msg: 'Just arrived at the hotel!', time: daysFromNow(-13) },
    { user: adminId,    type: 'safe',      lat: 51.5014, lng: -0.1419, msg: 'Enjoying Buckingham Palace', time: daysFromNow(-12) },
    { user: guardianId, type: 'safe',      lat: -1.2864, lng: 36.8172, msg: 'Safari morning!',            time: daysFromNow(-5) },
  ];

  for (const ci of checkIns) {
    await dbPool.query(
      `INSERT INTO check_ins (user_id, type, latitude, longitude, message, status, check_in_time)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)`,
      [ci.user, ci.type, ci.lat, ci.lng, ci.msg, ci.time]
    );
  }

  // 6. SCHEDULED CHECK-INS for Guardian
  await dbPool.query(
    `INSERT INTO scheduled_check_ins (user_id, is_recurring, interval_minutes, start_time, end_time, is_active, next_checkin_time, scheduled_time)
     VALUES ($1, true, 120, $2, $3, true, $4, $4)`,
    [guardianId, hoursFromNow(0), hoursFromNow(48), hoursFromNow(2)]
  );

  // 7. BUDDY PROFILES
  const buddyProfiles = [
    { user: 'navigator@solocompass.test', dest: 'Bangkok',  style: 'adventurous', bio: 'Looking for foodie partners to explore Bangkok street food scene!' },
    { user: 'buddy1@solocompass.test',    dest: 'Tokyo',    style: 'moderate',    bio: 'Japanese culture enthusiast, looking for temple-hopping buddies.' },
    { user: 'buddy2@solocompass.test',    dest: 'Tokyo',    style: 'adventurous', bio: 'First time in Japan! Want to explore everything from Shibuya to shrines.' },
  ];

  for (const bp of buddyProfiles) {
    const userId = userIds[bp.user];
    await dbPool.query(
      `INSERT INTO travel_buddies (user_id, destination, travel_style, bio, interests, status)
       VALUES ($1, $2, $3, $4, 'culture,food,adventure', 'searching')`,
      [userId, bp.dest, bp.style, bp.bio]
    );
  }

  // 8. BUDDY REQUEST
  const buddy1Id = userIds['buddy1@solocompass.test'];
  const buddy2Id = userIds['buddy2@solocompass.test'];
  const buddy1Trip = tripIds['Tokyo Cherry Blossom'];

  if (buddy1Id && buddy2Id && buddy1Trip) {
    await dbPool.query(
      `INSERT INTO buddy_requests (sender_id, receiver_id, trip_id, message, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [buddy1Id, buddy2Id, buddy1Trip, 'Hey! I see we are both heading to Tokyo around the same time. Want to explore together?']
    );
  }

  // 9. REVIEWS
  const reviews = [
    { user: adminId,     dest: 'London',    venue: 'The Shard',           type: 'attraction', rating: 5, solo: 4, safety: 5, value: 3, title: 'Incredible views of London',      content: 'The view from the 72nd floor is absolutely breathtaking.' },
    { user: guardianId,  dest: 'Santorini', venue: 'Oia Sunset Point',    type: 'attraction', rating: 5, solo: 3, safety: 5, value: 5, title: 'Best sunset on Earth',             content: 'Arrive early to get a good spot. The sunset is truly magical.' },
    { user: navigatorId, dest: 'New York',  venue: 'Joe\'s Pizza',        type: 'restaurant', rating: 4, solo: 5, safety: 4, value: 5, title: 'New York pizza institution',        content: 'Quick, cheap, and delicious.' },
  ];

  for (const r of reviews) {
    await dbPool.query(
      `INSERT INTO reviews (user_id, destination, venue_name, venue_type, overall_rating, solo_friendly_rating, safety_rating, value_rating, title, content, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)`,
      [r.user, r.dest, r.venue, r.type, r.rating, r.solo, r.safety, r.value, r.title, r.content]
    );
  }

  // 10. NOTIFICATIONS - skip due to schema constraints
  // const notifications = [
  //   { user: adminId,     type: 'trip',     title: 'Trip Reminder',           msg: 'Your Paris Getaway starts in 7 days!' },
  //   { user: guardianId,  type: 'buddy',    title: 'New Buddy Request',       msg: 'Someone wants to connect with you!' },
  // ];

  // for (const n of notifications) {
  //   await dbPool.query(
  //     `INSERT INTO notifications (user_id, type, title, message, is_read)
  //      VALUES ($1, $2, $3, $4, false)`,
  //     [n.user, n.type, n.title, n.msg]
  //   );
  // }

  // 11. NOTIFICATION PREFERENCES
  for (const email of Object.keys(userIds)) {
    await dbPool.query(
      `INSERT INTO notification_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userIds[email]]
    );
  }

  // 12. QUIZ RESULTS
  const quizUsers = ['admin@solocompass.test', 'guardian@solocompass.test', 'navigator@solocompass.test'];
  const quizStyles = ['adventurous', 'cultural', 'balanced'];

  for (let i = 0; i < quizUsers.length; i++) {
    const userId = userIds[quizUsers[i]];
    await dbPool.query(
      `INSERT INTO quiz_results (user_id, dominant_style, scores, summary, adventure_level, social_style)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        quizStyles[i],
        JSON.stringify({ adventure: 7 + i, cultural: 8 - i, relax: 5, foodie: i + 6, history: i + 4, nature: 7 }),
        `You're a ${quizStyles[i]} traveller.`,
        ['high', 'moderate', 'moderate'][i],
        ['social', 'selective', 'social'][i],
      ]
    );
  }

  console.log(`✅ Seeded ${Object.keys(userIds).length} users, ${trips.length} trips`);
  
  await dbPool.end();
  
  return 'done';
}

export default async function globalSetup() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    // Don't throw - allow tests to run anyway (some don't need data)
  }
}
