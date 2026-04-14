import 'dotenv/config';
import pg from 'pg';

async function debug() {
  const { Pool } = pg;
  const url = process.env.DATABASE_URL;
  console.log('Connecting to:', url ? 'URL Present' : 'URL MISSING');
  
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Testing simple query...');
    const res = await pool.query('SELECT 1 as result');
    console.log('Success:', res.rows[0]);
    
    console.log('Testing destinations status query...');
    try {
      const dest = await pool.query('SELECT id, name, status FROM destinations LIMIT 1');
      console.log('Destinations status check:', dest.rows[0]);
    } catch (e) {
      console.error('Destinations query FAILED:', e.message);
      if (e.message.includes('status')) {
        console.log('THE STATUS COLUMN IS MISSING OR BROKEN');
      }
    }
    
    console.log('Testing trips query...');
    try {
      const trips = await pool.query('SELECT * FROM trips LIMIT 1');
      console.log('Trips query success:', trips.rows[0]?.id);
    } catch (e) {
      console.error('Trips query FAILED:', e.message);
    }

  } catch (err) {
    console.error('Pool connection FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

debug();
