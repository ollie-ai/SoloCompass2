/**
 * SoloCompass — QA Test Data Seed Script
 * 
 * Creates a full set of test users, trips, emergency contacts, check-ins,
 * buddy profiles, reviews, notifications, and budget data to test every
 * dashboard state and feature flow.
 * 
 * Usage:
 *   cd backend
 *   node src/seed_test_data.js
 * 
 * WARNING: This inserts data into your connected database.
 *          Run against a development/staging DB only.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { InfisicalSDK } from '@infisical/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from backend or root
dotenv.config({ path: resolve(__dirname, '..', 'backend', '.env') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: resolve(__dirname, '..', '.env') });
}

// Support Infisical
if (!process.env.DATABASE_URL && process.env.INFISICAL_CLIENT_ID) {
  try {
    console.log('Fetching secrets from Infisical...');
    const client = new InfisicalSDK({
      siteUrl: process.env.INFISICAL_SITE_URL || 'https://app.infisical.com'
    });
    await client.auth().universalAuth.login({
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET
    });
    const result = await client.secrets().listSecrets({
      environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
      projectId: process.env.INFISICAL_PROJECT_ID,
      secretPath: '/',
    });
    result.secrets.forEach(s => { process.env[s.secretKey] = s.secretValue; });
    console.log('Secrets loaded from Infisical.');
  } catch (err) {
    console.warn('Infisical fetch failed:', err.message);
  }
}

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// ─── Helpers ────────────────────────────────────────────────────
const query = (sql, params = []) => pool.query(sql, params);

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function hoursFromNow(n) {
  return new Date(Date.now() + n * 3600000).toISOString();
}

const DEFAULT_PASSWORD = 'Test1234!';

// ─── Main ───────────────────────────────────────────────────────
async function seed() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   SoloCompass — QA Test Data Seeder      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // ─── 0. FIX SCHEMA ──────────────────────────────────────────
  console.log('🔧 Synchronizing database schema...');
  try {
    await query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS booking_reference TEXT,
      ADD COLUMN IF NOT EXISTS booking_date DATE,
      ADD COLUMN IF NOT EXISTS travel_date DATE,
      ADD COLUMN IF NOT EXISTS return_date DATE,
      ADD COLUMN IF NOT EXISTS reference TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
    `);
    console.log('  ✓ Bookings table synchronized.');
  } catch (err) {
    console.warn('  ⚠️ Schema sync failed (might already be fixed):', err.message);
  }

  // ─── 1. USERS ───────────────────────────────────────────────
  console.log('🧑 Creating test users...');

  const users = [
    { email: 'admin@solocompass.test',     name: 'Admin User',       role: 'admin', tier: 'navigator', premium: true, admin_level: 'super_admin' },
    { email: 'explorer@solocompass.test',  name: 'Emma Explorer',    role: 'user',  tier: 'free',      premium: false, admin_level: null },
    { email: 'guardian@solocompass.test',   name: 'Grace Guardian',   role: 'user',  tier: 'guardian',  premium: true, admin_level: null },
    { email: 'navigator@solocompass.test', name: 'Noah Navigator',   role: 'user',  tier: 'navigator', premium: true, admin_level: null },
    { email: 'newuser@solocompass.test',   name: 'Fresh Traveller',  role: 'user',  tier: 'free',      premium: false, admin_level: null },
    { email: 'expired@solocompass.test',   name: 'Expired Premium',  role: 'user',  tier: 'free',      premium: false, admin_level: null },
    { email: 'buddy1@solocompass.test',    name: 'Sakura Tanaka',    role: 'user',  tier: 'navigator', premium: true, admin_level: null },
    { email: 'buddy2@solocompass.test',    name: 'Liam Murphy',      role: 'user',  tier: 'guardian',  premium: true, admin_level: null },
  ];

  const userIds = {};

  for (const u of users) {
    // Handle existing users
    const existing = await query('SELECT id FROM users WHERE email = $1', [u.email]);
    
    const premiumExpires = u.premium
      ? new Date(Date.now() + 365 * 24 * 3600000).toISOString()
      : null;
    console.log(`  Processing user: ${u.email}, premiumExpires type: ${typeof premiumExpires}, value: ${premiumExpires}`);

    if (existing.rows.length > 0) {
      const userId = existing.rows[0].id;
      userIds[u.email] = userId;
      
      // Update existing user to ensure credentials and status match
      const adminLevelVal = u.admin_level || null;
      console.log(`  Updating user ${u.email} with admin_level: ${adminLevelVal}`);
      await query(
        `UPDATE users SET 
          password = $1, 
          name = $2, 
          role = $3, 
          is_premium = $4, 
          subscription_tier = $5, 
          is_verified = true, 
          premium_expires_at = $6,
          failed_attempts = 0,
          locked_until = NULL,
          admin_level = $7
         WHERE id = $8`,
        [hashedPassword, u.name, u.role, u.premium, u.tier, premiumExpires, adminLevelVal, userId]
      );
      
      console.log(`  ↳ ${u.email} updated (id: ${userId})`);
    } else {
      const adminLevelVal = u.admin_level || null;
      console.log(`  Creating user ${u.email} with admin_level: ${adminLevelVal}`);
      const res = await query(
        `INSERT INTO users (email, password, name, role, is_premium, subscription_tier, is_verified, premium_expires_at, admin_level)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8) RETURNING id`,
        [u.email, hashedPassword, u.name, u.role, u.premium, u.tier, premiumExpires, adminLevelVal]
      );
      userIds[u.email] = res.rows[0].id;
      console.log(`  ✓ ${u.email} created (id: ${userIds[u.email]})`);
    }

    // Create profile
    await query(
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

    console.log(`  ✓ ${u.email} (${u.role}/${u.tier}) → id: ${userIds[u.email]}`);
  }

  // Set expired premium for the expired user
  await query(
    `UPDATE users SET premium_expires_at = $1 WHERE email = $2`,
    [new Date(Date.now() - 30 * 24 * 3600000).toISOString(), 'expired@solocompass.test']
  );

  // ─── 2. TRIPS ───────────────────────────────────────────────
  console.log('\n✈️  Creating test trips...');

  const trips = [
    // Admin trips (covers all dashboard states)
    { user: 'admin@solocompass.test',     name: 'Tokyo Adventure',      dest: 'Tokyo',       start: daysFromNow(30),  end: daysFromNow(37),  status: 'planning',   budget: 2500 },
    { user: 'admin@solocompass.test',     name: 'Paris Getaway',        dest: 'Paris',       start: daysFromNow(7),   end: daysFromNow(14),  status: 'confirmed',  budget: 1800 },
    { user: 'admin@solocompass.test',     name: 'London Explorer',      dest: 'London',      start: daysFromNow(-14), end: daysFromNow(-7),  status: 'completed',  budget: 1200 },
    { user: 'admin@solocompass.test',     name: 'Barcelona Live',       dest: 'Barcelona',   start: daysFromNow(-2),  end: daysFromNow(5),   status: 'confirmed',  budget: 1500 },
    { user: 'admin@solocompass.test',     name: 'Rome Cancelled',       dest: 'Rome',        start: daysFromNow(-30), end: daysFromNow(-23), status: 'cancelled',  budget: 2000 },

    // Explorer trips (at 2-trip limit)
    { user: 'explorer@solocompass.test',  name: 'Bali Beach Trip',      dest: 'Bali',        start: daysFromNow(14),  end: daysFromNow(21),  status: 'planning',   budget: 1000 },
    { user: 'explorer@solocompass.test',  name: 'Amsterdam Weekend',    dest: 'Amsterdam',   start: daysFromNow(45),  end: daysFromNow(48),  status: 'confirmed',  budget: 600 },

    // Guardian trips
    { user: 'guardian@solocompass.test',   name: 'Kenya Safari',         dest: 'Nairobi',     start: daysFromNow(14),  end: daysFromNow(21),  status: 'confirmed',  budget: 3000 },
    { user: 'guardian@solocompass.test',   name: 'Greek Islands',        dest: 'Santorini',   start: daysFromNow(-7),  end: daysFromNow(-1),  status: 'completed',  budget: 2200 },

    // Navigator trips
    { user: 'navigator@solocompass.test', name: 'Bangkok Explorer',     dest: 'Bangkok',     start: daysFromNow(3),   end: daysFromNow(10),  status: 'confirmed',  budget: 1400 },
    { user: 'navigator@solocompass.test', name: 'New York City',        dest: 'New York',    start: daysFromNow(-21), end: daysFromNow(-14), status: 'completed',  budget: 4000 },
    { user: 'navigator@solocompass.test', name: 'Lisbon Discovery',     dest: 'Lisbon',      start: daysFromNow(60),  end: daysFromNow(67),  status: 'planning',   budget: 1600 },

    // Buddy trips (both heading to Tokyo)
    { user: 'buddy1@solocompass.test',    name: 'Tokyo Cherry Blossom', dest: 'Tokyo',       start: daysFromNow(28),  end: daysFromNow(35),  status: 'confirmed',  budget: 2800 },
    { user: 'buddy2@solocompass.test',    name: 'Japan Discovery',      dest: 'Tokyo',       start: daysFromNow(29),  end: daysFromNow(36),  status: 'confirmed',  budget: 2200 },
  ];

  const tripIds = {};

  for (const t of trips) {
    const userId = userIds[t.user];
    const res = await query(
      `INSERT INTO trips (user_id, name, destination, start_date, end_date, status, budget, generation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'idle') RETURNING id`,
      [userId, t.name, t.dest, t.start, t.end, t.status, t.budget]
    );
    tripIds[t.name] = res.rows[0].id;
    console.log(`  ✓ "${t.name}" → ${t.status} (${t.dest}) [user: ${t.user.split('@')[0]}]`);
  }

  // ─── 3. ITINERARY DAYS & ACTIVITIES ─────────────────────────
  console.log('\n📅 Creating sample itinerary days...');

  // Add itinerary for the completed London trip
  const londonTripId = tripIds['London Explorer'];
  if (londonTripId) {
    const dayNames = ['Arrival & Orientation', 'Cultural Deep Dive', 'Hidden Gems', 'Markets & Food', 'Royal London', 'Night Life', 'Departure'];
    for (let i = 0; i < 7; i++) {
      const dayRes = await query(
        `INSERT INTO itinerary_days (trip_id, day_number, date) VALUES ($1, $2, $3) RETURNING id`,
        [londonTripId, i + 1, daysFromNow(-14 + i)]
      );
      const dayId = dayRes.rows[0].id;

      // Add 2-3 activities per day
      const activities = [
        { name: `Morning: ${dayNames[i]}`, type: 'sightseeing', time: '09:00', duration: 3, cost: 25 },
        { name: `Afternoon: Local lunch spot`, type: 'food', time: '12:30', duration: 1.5, cost: 15 },
        { name: `Evening: ${['Bar crawl', 'Theatre', 'River walk', 'Live music', 'Rooftop bar', 'Jazz club', 'Farewell dinner'][i]}`, type: 'entertainment', time: '19:00', duration: 3, cost: 40 },
      ];

      for (const act of activities) {
        await query(
          `INSERT INTO activities (day_id, trip_id, name, type, time, duration_hours, cost, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [dayId, londonTripId, act.name, act.type, act.time, act.duration, act.cost, activities.indexOf(act)]
        );
      }
    }
    console.log('  ✓ 7 days + 21 activities for "London Explorer"');
  }

  // ─── 4. EMERGENCY CONTACTS ─────────────────────────────────
  console.log('\n🆘 Creating emergency contacts...');

  const contacts = [
    { user: 'admin@solocompass.test',     name: 'Sarah Johnson',  email: 'sarah@test.com',   phone: '+447700000001', rel: 'partner',   primary: true },
    { user: 'admin@solocompass.test',     name: 'Mike Johnson',   email: 'mike@test.com',    phone: '+447700000002', rel: 'parent',    primary: false },
    { user: 'admin@solocompass.test',     name: 'Alice Williams', email: 'alice@test.com',   phone: '+447700000003', rel: 'friend',    primary: false },
    { user: 'explorer@solocompass.test',  name: 'Tom Explorer',   email: 'tom@test.com',     phone: '+447700000004', rel: 'friend',    primary: true },
    { user: 'guardian@solocompass.test',   name: 'Helen Guard',    email: 'helen@test.com',   phone: '+447700000005', rel: 'parent',    primary: true },
    { user: 'guardian@solocompass.test',   name: 'Paul Guard',     email: 'paul@test.com',    phone: '+447700000006', rel: 'sibling',   primary: false },
    { user: 'navigator@solocompass.test', name: 'Olivia Nav',     email: 'olivia@test.com',  phone: '+447700000007', rel: 'partner',   primary: true },
    { user: 'navigator@solocompass.test', name: 'James Nav',      email: 'james@test.com',   phone: '+447700000008', rel: 'friend',    primary: false },
    { user: 'navigator@solocompass.test', name: 'Sophie Nav',     email: 'sophie@test.com',  phone: '+447700000009', rel: 'colleague', primary: false },
  ];

  for (const c of contacts) {
    const userId = userIds[c.user];
    await query(
      `INSERT INTO emergency_contacts (user_id, name, email, phone, relationship, is_primary, notify_on_checkin, notify_on_emergency)
       VALUES ($1, $2, $3, $4, $5, $6, true, true)`,
      [userId, c.name, c.email, c.phone, c.rel, c.primary]
    );
  }
  console.log(`  ✓ ${contacts.length} emergency contacts created`);

  // ─── 5. CHECK-IN HISTORY ────────────────────────────────────
  console.log('\n📍 Creating check-in history...');

  const adminId = userIds['admin@solocompass.test'];
  const guardianId = userIds['guardian@solocompass.test'];
  const navigatorId = userIds['navigator@solocompass.test'];

  const checkIns = [
    { user: adminId,    type: 'safe',      lat: 51.5074, lng: -0.1278, msg: 'Just arrived at the hotel!', time: daysFromNow(-13) },
    { user: adminId,    type: 'safe',      lat: 51.5014, lng: -0.1419, msg: 'Enjoying Buckingham Palace', time: daysFromNow(-12) },
    { user: adminId,    type: 'safe',      lat: 51.5081, lng: -0.0759, msg: 'Tower of London is amazing', time: daysFromNow(-11) },
    { user: adminId,    type: 'safe',      lat: 51.5033, lng: -0.1195, msg: 'London Eye at sunset',       time: daysFromNow(-10) },
    { user: adminId,    type: 'safe',      lat: 51.5194, lng: -0.1270, msg: 'British Museum day',         time: daysFromNow(-9) },
    { user: guardianId, type: 'safe',      lat: -1.2864, lng: 36.8172, msg: 'Safari morning!',            time: daysFromNow(-5) },
    { user: guardianId, type: 'safe',      lat: -1.2921, lng: 36.8219, msg: 'All good at camp',           time: daysFromNow(-4) },
    { user: navigatorId, type: 'emergency', lat: 40.7128, lng: -74.0060, msg: 'SOS Test - accidental',    time: daysFromNow(-18) },
  ];

  for (const ci of checkIns) {
    await query(
      `INSERT INTO check_ins (user_id, type, latitude, longitude, message, status, check_in_time)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)`,
      [ci.user, ci.type, ci.lat, ci.lng, ci.msg, ci.time]
    );
  }
  console.log(`  ✓ ${checkIns.length} check-in records created`);

  // ─── 6. SCHEDULED CHECK-INS ────────────────────────────────
  console.log('\n⏰ Creating scheduled check-ins...');

  // Guardian: active recurring schedule
  await query(
    `INSERT INTO scheduled_check_ins (user_id, is_recurring, interval_minutes, start_time, end_time, is_active, next_checkin_time, scheduled_time)
     VALUES ($1, true, 120, $2, $3, true, $4, $2)`,
    [guardianId, hoursFromNow(0), hoursFromNow(48), hoursFromNow(2)]
  );

  // Guardian: one future one-time check-in
  await query(
    `INSERT INTO scheduled_check_ins (user_id, scheduled_time, is_recurring, is_active)
     VALUES ($1, $2, false, true)`,
    [guardianId, hoursFromNow(6)]
  );

  // Guardian: one past (completed) one-time check-in
  await query(
    `INSERT INTO scheduled_check_ins (user_id, scheduled_time, is_recurring, is_active)
     VALUES ($1, $2, false, false)`,
    [guardianId, hoursFromNow(-24)]
  );
  console.log('  ✓ 1 recurring schedule + 2 one-time check-ins for Guardian');

  // ─── 7. BUDDY PROFILES ─────────────────────────────────────
  console.log('\n👫 Creating buddy profiles...');

  const buddyProfiles = [
    { user: 'navigator@solocompass.test', dest: 'Bangkok',  style: 'adventurous', bio: 'Looking for foodie partners to explore Bangkok street food scene!' },
    { user: 'buddy1@solocompass.test',    dest: 'Tokyo',    style: 'moderate',    bio: 'Japanese culture enthusiast, looking for temple-hopping buddies.' },
    { user: 'buddy2@solocompass.test',    dest: 'Tokyo',    style: 'adventurous', bio: 'First time in Japan! Want to explore everything from Shibuya to shrines.' },
    { user: 'guardian@solocompass.test',   dest: 'Nairobi',  style: 'relaxed',     bio: 'Safari lover looking for fellow wildlife photographers.' },
  ];

  for (const bp of buddyProfiles) {
    const userId = userIds[bp.user];
    await query(
      `INSERT INTO travel_buddies (user_id, destination, travel_style, bio, interests, status)
       VALUES ($1, $2, $3, $4, 'culture,food,adventure', 'searching')`,
      [userId, bp.dest, bp.style, bp.bio]
    );
  }
  console.log(`  ✓ ${buddyProfiles.length} buddy profiles created`);

  // ─── 8. BUDDY REQUEST ───────────────────────────────────────
  console.log('\n📬 Creating buddy requests...');

  // buddy1 → buddy2 (pending)
  const buddy1Id = userIds['buddy1@solocompass.test'];
  const buddy2Id = userIds['buddy2@solocompass.test'];
  const buddy1Trip = tripIds['Tokyo Cherry Blossom'];

  if (buddy1Id && buddy2Id && buddy1Trip) {
    await query(
      `INSERT INTO buddy_requests (sender_id, receiver_id, trip_id, message, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [buddy1Id, buddy2Id, buddy1Trip, 'Hey! I see we are both heading to Tokyo around the same time. Want to explore together?']
    );
    console.log('  ✓ Pending request: buddy1 → buddy2');
  }

  // ─── 9. REVIEWS ─────────────────────────────────────────────
  console.log('\n⭐ Creating sample reviews...');

  const reviews = [
    { user: adminId,     dest: 'London',    venue: 'The Shard',           type: 'attraction', rating: 5, solo: 4, safety: 5, value: 3, title: 'Incredible views of London',      content: 'The view from the 72nd floor is absolutely breathtaking. As a solo traveller, I felt completely safe and the staff were very welcoming.' },
    { user: adminId,     dest: 'London',    venue: 'Borough Market',      type: 'restaurant', rating: 4, solo: 5, safety: 4, value: 5, title: 'Perfect for solo foodies',         content: 'So many food stalls to try! Easy to eat alone here since everyone is doing the same. Highly recommend the raclette stand.' },
    { user: guardianId,  dest: 'Santorini', venue: 'Oia Sunset Point',    type: 'attraction', rating: 5, solo: 3, safety: 5, value: 5, title: 'Best sunset on Earth',             content: 'Arrive early to get a good spot. The sunset is truly magical. Lots of couples but solo travellers will enjoy it too.' },
    { user: navigatorId, dest: 'New York',  venue: 'Joe\'s Pizza',        type: 'restaurant', rating: 4, solo: 5, safety: 4, value: 5, title: 'New York pizza institution',        content: 'Quick, cheap, and delicious. Perfect solo meal between sightseeing. The classic slice is all you need.' },
    { user: navigatorId, dest: 'New York',  venue: 'Central Park',        type: 'attraction', rating: 5, solo: 5, safety: 4, value: 5, title: 'A must-visit green oasis',          content: 'Spent hours walking through the park. Felt safe even in the evening. The Bethesda Fountain area is magical.' },
  ];

  for (const r of reviews) {
    await query(
      `INSERT INTO reviews (user_id, destination, venue_name, venue_type, overall_rating, solo_friendly_rating, safety_rating, value_rating, title, content, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)`,
      [r.user, r.dest, r.venue, r.type, r.rating, r.solo, r.safety, r.value, r.title, r.content]
    );
  }
  console.log(`  ✓ ${reviews.length} reviews created`);

  // ─── 10. NOTIFICATIONS ──────────────────────────────────────
  console.log('\n🔔 Creating sample notifications...');

  const notifications = [
    { user: adminId,     type: 'trip_update',     title: 'Trip Reminder',           msg: 'Your Paris Getaway starts in 7 days! Time to start packing.' },
    { user: adminId,     type: 'trip_update',     title: 'Check-in Confirmed',     msg: 'Your safety check-in was received. Your contacts have been notified.' },
    { user: adminId,     type: 'advisory', title: 'Travel Advisory Update',  msg: 'New FCDO advisory for Barcelona. Exercise increased caution.' },
    { user: guardianId,  type: 'trip_update',    title: 'New Buddy Request',       msg: 'Someone wants to connect with you for your Nairobi trip!' },
    { user: navigatorId, type: 'advisory',  title: 'Subscription Renewed',    msg: 'Your Navigator plan has been renewed for another month.' },
    { user: navigatorId, type: 'trip_update',     title: 'Trip Starting Soon',      msg: 'Bangkok Explorer begins in 3 days. Have you packed everything?' },
  ];

  for (const n of notifications) {
    await query(
      `INSERT INTO notifications (user_id, type, title, message, is_read)
       VALUES ($1, $2, $3, $4, false)`,
      [n.user, n.type, n.title, n.msg]
    );
  }
  console.log(`  ✓ ${notifications.length} notifications created`);

  // ─── 11. NOTIFICATION PREFERENCES ──────────────────────────
  console.log('\n⚙️  Creating notification preferences...');

  for (const email of Object.keys(userIds)) {
    await query(
      `INSERT INTO notification_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userIds[email]]
    );
  }
  console.log(`  ✓ ${Object.keys(userIds).length} notification preference records`);

  // ─── 12. ACCOMMODATIONS ────────────────────────────────────
  console.log('\n🏨 Creating sample accommodations...');

  if (tripIds['Paris Getaway']) {
    await query(
      `INSERT INTO accommodations (trip_id, name, type, address, check_in_date, check_out_date, confirmation_number, cost, currency)
       VALUES ($1, 'Hotel Le Marais', 'hotel', '12 Rue de Rivoli, Paris', $2, $3, 'HLM-78923', 1200, 'EUR')`,
      [tripIds['Paris Getaway'], daysFromNow(7), daysFromNow(14)]
    );
    console.log('  ✓ Accommodation for Paris Getaway');
  }

  if (tripIds['Bangkok Explorer']) {
    await query(
      `INSERT INTO accommodations (trip_id, name, type, address, check_in_date, check_out_date, confirmation_number, cost, currency)
       VALUES ($1, 'Lub d Bangkok Silom', 'hostel', '4 Decho Road, Bangkok', $2, $3, 'LBD-45612', 350, 'USD')`,
      [tripIds['Bangkok Explorer'], daysFromNow(3), daysFromNow(10)]
    );
    console.log('  ✓ Accommodation for Bangkok Explorer');
  }

  // ─── 13. BOOKINGS ──────────────────────────────────────────
  console.log('\n🎫 Creating sample bookings...');

  if (tripIds['Paris Getaway']) {
    await query(
      `INSERT INTO bookings (trip_id, type, provider, confirmation_number, travel_date, return_date, departure_location, arrival_location, cost, currency, status)
       VALUES ($1, 'flight', 'British Airways', 'BA-4567-LHR-CDG', $2, $3, 'London Heathrow', 'Paris CDG', 245, 'GBP', 'confirmed')`,
      [tripIds['Paris Getaway'], daysFromNow(7), daysFromNow(14)]
    );
    console.log('  ✓ Flight booking for Paris Getaway');
  }

  // ─── 14. TRIP DOCUMENTS ────────────────────────────────────
  console.log('\n📄 Creating sample documents...');

  if (tripIds['Paris Getaway']) {
    await query(
      `INSERT INTO trip_documents (trip_id, user_id, document_type, name, expiry_date, notes)
       VALUES ($1, $2, 'passport', 'UK Passport', $3, 'Blue passport, issued 2024')`,
      [tripIds['Paris Getaway'], adminId, daysFromNow(365 * 5)]
    );
    await query(
      `INSERT INTO trip_documents (trip_id, user_id, document_type, name, expiry_date, notes)
       VALUES ($1, $2, 'insurance', 'World Nomads Travel Insurance', $3, 'Policy #WN-892341')`,
      [tripIds['Paris Getaway'], adminId, daysFromNow(30)]
    );
    console.log('  ✓ 2 documents for Paris Getaway');
  }

  // ─── 15. SAVED PLACES ──────────────────────────────────────
  console.log('\n📌 Creating saved places...');

  if (tripIds['Bangkok Explorer']) {
    const places = [
      { name: 'Chatuchak Weekend Market', cat: 'shopping',   lat: 13.7999, lng: 100.5503, visited: false },
      { name: 'Wat Pho',                  cat: 'landmark',   lat: 13.7468, lng: 100.4927, visited: false },
      { name: 'Jay Fai',                  cat: 'restaurant', lat: 13.7525, lng: 100.5063, visited: true },
    ];
    for (const p of places) {
      await query(
        `INSERT INTO places (trip_id, name, category, latitude, longitude, visited)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tripIds['Bangkok Explorer'], p.name, p.cat, p.lat, p.lng, p.visited]
      );
    }
    console.log('  ✓ 3 saved places for Bangkok Explorer');
  }

  // ─── 16. QUIZ RESULTS ──────────────────────────────────────
  console.log('\n🧬 Creating quiz results...');

  const quizUsers = ['admin@solocompass.test', 'guardian@solocompass.test', 'navigator@solocompass.test'];
  const quizStyles = ['adventurous', 'cultural', 'balanced'];

  for (let i = 0; i < quizUsers.length; i++) {
    const userId = userIds[quizUsers[i]];
    await query(
      `INSERT INTO quiz_results (user_id, dominant_style, scores, summary, adventure_level, social_style)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        quizStyles[i],
        JSON.stringify({ adventure: 7 + i, culture: 8 - i, relaxation: 5, social: 6 + i, nature: 7 }),
        `You're a ${quizStyles[i]} traveller who loves discovering new places on your own terms.`,
        ['high', 'moderate', 'moderate'][i],
        ['social', 'selective', 'social'][i],
      ]
    );
  }
  console.log(`  ✓ ${quizUsers.length} quiz results created`);

  // ─── SUMMARY ────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   ✅  SEED COMPLETE                      ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Users:              ${Object.keys(userIds).length.toString().padEnd(18)}║`);
  console.log(`║  Trips:              ${trips.length.toString().padEnd(18)}║`);
  console.log(`║  Itinerary Days:     7 + 21 activities  ║`);
  console.log(`║  Emergency Contacts: ${contacts.length.toString().padEnd(18)}║`);
  console.log(`║  Check-ins:          ${checkIns.length.toString().padEnd(18)}║`);
  console.log(`║  Scheduled Check-ins: 3                 ║`);
  console.log(`║  Buddy Profiles:     ${buddyProfiles.length.toString().padEnd(18)}║`);
  console.log(`║  Buddy Requests:     1                  ║`);
  console.log(`║  Reviews:            ${reviews.length.toString().padEnd(18)}║`);
  console.log(`║  Notifications:      ${notifications.length.toString().padEnd(18)}║`);
  console.log(`║  Accommodations:     2                  ║`);
  console.log(`║  Bookings:           1                  ║`);
  console.log(`║  Documents:          2                  ║`);
  console.log(`║  Saved Places:       3                  ║`);
  console.log(`║  Quiz Results:       ${quizUsers.length.toString().padEnd(18)}║`);
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Password for ALL:   Test1234!          ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log('Dashboard state coverage:');
  console.log('  • No trips     → newuser@solocompass.test');
  console.log('  • Planning     → admin (Tokyo Adventure)');
  console.log('  • Upcoming     → admin (Paris Getaway +7d)');
  console.log('  • Live trip    → admin (Barcelona, spanning today)');
  console.log('  • Completed    → admin (London Explorer, past)');
  console.log('  • At trip limit→ explorer (2 active trips)');
  console.log('  • Expired plan → expired@solocompass.test');
  console.log('  • Buddy match  → buddy1 + buddy2 (both Tokyo)\n');

  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  pool.end();
  process.exit(1);
});
