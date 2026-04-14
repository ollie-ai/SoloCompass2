/**
 * Seed test events for admin audit logs and error reports
 * Run: node seed-test-events.js
 */
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  const now = new Date();

  const testEvents = [
    // Audit log events
    { event_name: 'trip_created', event_data: JSON.stringify({ tripId: 1, destination: 'Hong Kong' }), daysAgo: 0 },
    { event_name: 'trip_created', event_data: JSON.stringify({ tripId: 2, destination: 'Tokyo' }), daysAgo: 1 },
    { event_name: 'checkin_completed', event_data: JSON.stringify({ checkinId: 1, status: 'safe' }), daysAgo: 0 },
    { event_name: 'checkin_missed', event_data: JSON.stringify({ checkinId: 2, status: 'missed' }), daysAgo: 2 },
    { event_name: 'sos_triggered', event_data: JSON.stringify({ tripId: 1, reason: 'missed_checkins' }), daysAgo: 3 },
    { event_name: 'user_registered', event_data: JSON.stringify({ method: 'email' }), daysAgo: 5 },
    { event_name: 'ai_chat_message', event_data: JSON.stringify({ model: 'gpt-4o', tokens: 150 }), daysAgo: 0 },
    { event_name: 'advisory_notification', event_data: JSON.stringify({ country: 'Hong Kong', level: 'caution' }), daysAgo: 1 },
    { event_name: 'trip_completed', event_data: JSON.stringify({ tripId: 3, destination: 'Paris' }), daysAgo: 7 },
    { event_name: 'itinerary_generated', event_data: JSON.stringify({ tripId: 1, days: 5 }), daysAgo: 0 },

    // Client error events (for error reports tab)
    { event_name: 'client_error', event_data: JSON.stringify({ message: 'TypeError: Cannot read properties of undefined', stack: 'at TripCard.jsx:45\nat renderWithHooks', url: 'http://localhost:5176/trips', userAgent: 'Mozilla/5.0', timestamp: new Date(now - 2 * 3600000).toISOString(), type: 'uncaught_exception' }), daysAgo: 0 },
    { event_name: 'client_error', event_data: JSON.stringify({ message: 'Failed to fetch destinations', stack: 'at api.js:12', url: 'http://localhost:5176/destinations', userAgent: 'Mozilla/5.0', timestamp: new Date(now - 5 * 3600000).toISOString(), type: 'unhandled_rejection' }), daysAgo: 0 },
    { event_name: 'client_error', event_data: JSON.stringify({ message: 'NetworkError when attempting to fetch resource', stack: '', url: 'http://localhost:5176/dashboard', userAgent: 'Mozilla/5.0', timestamp: new Date(now - 24 * 3600000).toISOString(), type: 'resource_error' }), daysAgo: 1 },
    { event_name: 'client_error', event_data: JSON.stringify({ message: 'ReferenceError: useState is not defined', stack: 'at Layout.jsx:9', url: 'http://localhost:5176/admin', userAgent: 'Mozilla/5.0', timestamp: new Date(now - 3 * 24 * 3600000).toISOString(), type: 'uncaught_exception' }), daysAgo: 3 },
    { event_name: 'client_error', event_data: JSON.stringify({ message: '404 Not Found: /api/trips/999', stack: '', url: 'http://localhost:5176/trips/999', userAgent: 'Mozilla/5.0', timestamp: new Date(now - 5 * 24 * 3600000).toISOString(), type: 'unhandled_rejection' }), daysAgo: 5 },
  ];

  // Get a user_id for some events (use the first user)
  const userResult = await pool.query('SELECT id FROM users LIMIT 1');
  const userId = userResult.rows.length > 0 ? userResult.rows[0].id : null;

  console.log(`Seeding ${testEvents.length} test events...`);

  for (const event of testEvents) {
    const timestamp = new Date(now - event.daysAgo * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO events (user_id, event_name, event_data, timestamp) VALUES ($1, $2, $3, $4)`,
      [userId, event.event_name, event.event_data, timestamp]
    );
  }

  console.log(`✅ Seeded ${testEvents.length} events successfully`);
  console.log(`   - ${testEvents.filter(e => e.event_name !== 'client_error').length} audit log events`);
  console.log(`   - ${testEvents.filter(e => e.event_name === 'client_error').length} client error events`);

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
