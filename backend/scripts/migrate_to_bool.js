import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

// Manually set Infisical credentials if missing from environment
if (!process.env.INFISICAL_CLIENT_ID || !process.env.INFISICAL_CLIENT_SECRET) {
    console.error('[Env] INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET must be set in .env');
    process.exit(1);
}

import initInfisical from '../src/config/infisical.js';

async function migrate() {
  console.log('Initializing Infisical...');
  try {
    await initInfisical();
  } catch (e) {
    console.warn('Infisical init failed, continuing with local env:', e.message);
  }
  
  const { Pool } = pg;
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    console.log('Starting PostgreSQL data type migration (Robust)...');

    // 1. Create sessions table if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        refresh_token TEXT,
        device_info TEXT,
        ip_address TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Sessions table verified/created.');

    // Function to safely alter column to boolean
    const safeAlterToBool = async (table, column) => {
      try {
        // Check current type
        const res = await client.query(`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        `, [table, column]);

        if (res.rows.length === 0) {
          console.log(`Column ${column} in table ${table} does not exist. Skipping.`);
          return;
        }

        const currentType = res.rows[0].data_type;
        console.log(`Table: ${table}, Column: ${column}, Current Type: ${currentType}`);

        if (currentType === 'boolean') {
          console.log(`Column ${column} is already boolean. Skipping.`);
          return;
        }

        // Perform migration
        console.log(`Altering ${table}.${column} to BOOLEAN...`);
        await client.query(`
          ALTER TABLE ${table} 
          ALTER COLUMN ${column} DROP DEFAULT,
          ALTER COLUMN ${column} SET DATA TYPE BOOLEAN USING (
            CASE 
              WHEN ${column} IS NULL THEN NULL
              WHEN ${column}::text IN ('1', 'true', 't', 'y', 'yes') THEN true 
              ELSE false 
            END
          ),
          ALTER COLUMN ${column} SET DEFAULT false;
        `);
        console.log(`Column ${column} in ${table} successfully converted to BOOLEAN.`);
      } catch (e) {
        console.error(`Error altering ${table}.${column}:`, e.message);
      }
    };

    // 2. Users table
    await safeAlterToBool('users', 'is_premium');
    await safeAlterToBool('users', 'is_verified');

    // 3. Emergency contacts
    await safeAlterToBool('emergency_contacts', 'is_primary');
    await safeAlterToBool('emergency_contacts', 'notify_on_checkin');
    await safeAlterToBool('emergency_contacts', 'notify_on_emergency');
    await safeAlterToBool('emergency_contacts', 'verified');

    // 4. Reviews
    await safeAlterToBool('reviews', 'is_verified');

    // 5. Scheduled Check-ins
    await safeAlterToBool('scheduled_check_ins', 'is_active');
    await safeAlterToBool('scheduled_check_ins', 'final_warning_sent');
    await safeAlterToBool('scheduled_check_ins', 'sos_triggered');
    await safeAlterToBool('scheduled_check_ins', 'is_recurring');

    // 6. Others
    await safeAlterToBool('places', 'visited');
    await safeAlterToBool('packing_lists', 'is_shared');
    await safeAlterToBool('packing_items', 'is_packed');
    await safeAlterToBool('packing_items', 'is_essential');
    await safeAlterToBool('packing_items', 'is_custom');
    await safeAlterToBool('webhook_subscriptions', 'active');

    console.log('Robust migration complete!');
  } catch (err) {
    console.error('Migration failed FATAL:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
