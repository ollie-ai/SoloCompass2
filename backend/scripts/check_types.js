import pg from 'pg';
import initInfisical from '../src/config/infisical.js';

async function check() {
  await initInfisical();
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('users', 'sessions', 'destinations')");
    console.log(JSON.stringify(res.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}
check();
