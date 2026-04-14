import { InfisicalSDK } from '@infisical/sdk';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

async function migrate() {
  console.log('Fetching secrets from Infisical...');
  const client = new InfisicalSDK({
    siteUrl: process.env.INFISICAL_SITE_URL || 'https://app.infisical.com'
  });
  await client.auth().universalAuth.login({
    clientId: process.env.INFISICAL_CLIENT_ID,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET
  });
  const result = await client.secrets().listSecrets({
    environment: 'dev',
    projectId: process.env.INFISICAL_PROJECT_ID,
    secretPath: '/',
  });
  result.secrets.forEach(s => { process.env[s.secretKey] = s.secretValue; });
  console.log('Secrets loaded.');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Starting migration...');
    
    // 1. Add verification columns to users
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_tier INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMP;
    `);
    console.log('Added verification columns to users.');

    // 2. Cleanup travel_buddies redundancy
    // We keep the columns for now but mark them as deprecated in the schema (visually)
    // Actually, in a real migration we might drop them, but let's just ensure the code stops using them.
    // For now, let's just add a comment or ensures indexes are correct.
    
    // 3. Ensure profiles has everything needed for Solo ID
    await pool.query(`
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS social_links TEXT DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS verification_data TEXT DEFAULT '{}';
    `);
    console.log('Profile table enhanced.');

    console.log('Migration COMPLETED.');
  } catch (err) {
    console.error('Migration FAILED:', err);
  } finally {
    await pool.end();
  }
}

migrate();
