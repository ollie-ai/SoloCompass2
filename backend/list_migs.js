import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const migs = await pool.query(`SELECT version FROM schema_migrations`);
    console.log(JSON.stringify(migs.rows.map(r => r.version), null, 2));
  } catch (err) {
    console.error('Error during check:', err.message);
  } finally {
    await pool.end();
  }
}

check();
