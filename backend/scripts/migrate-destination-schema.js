import pg from 'pg';

const { Pool } = pg;

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable not set');
  }
  const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  return new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

async function testConnection() {
  const pool = getPool();
  try {
    await pool.query('SELECT NOW()');
    console.log('[OK] Database connected');
    return true;
  } catch (err) {
    console.error('[ERROR] Database connection failed:', err.message);
    return false;
  }
}

const newColumns = [
  { name: 'slug', type: 'TEXT UNIQUE', constraint: null },
  { name: 'destination_type', type: 'TEXT', constraint: null },
  { name: 'region', type: 'TEXT', constraint: null },
  { name: 'primary_city', type: 'TEXT', constraint: null },
  { name: 'timezone', type: 'TEXT', constraint: null },
  { name: 'publication_status', type: "TEXT DEFAULT 'draft'", constraint: "CHECK(publication_status IN ('draft', 'pending_review', 'live', 'paused', 'blocked'))" },
  { name: 'safety_gate_status', type: "TEXT DEFAULT 'unchecked'", constraint: "CHECK(safety_gate_status IN ('unchecked', 'pass', 'fail'))" },
  { name: 'manual_review_status', type: "TEXT DEFAULT 'pending'", constraint: "CHECK(manual_review_status IN ('pending', 'approved', 'rejected'))" },
  { name: 'reviewer', type: 'INTEGER', constraint: 'REFERENCES users(id)' },
  { name: 'reviewed_at', type: 'TIMESTAMP', constraint: null },
  { name: 'advisory_checked_at', type: 'TIMESTAMP', constraint: null },
  { name: 'advisory_source', type: 'TEXT', constraint: null },
  { name: 'advisory_summary', type: 'TEXT', constraint: null },
  { name: 'stale_after', type: 'TIMESTAMP', constraint: null },
  { name: 'notes_for_internal_review', type: 'TEXT', constraint: null },
  { name: 'internal_safety_tier', type: 'TEXT', constraint: null },
  { name: 'internal_confidence_score', type: 'REAL', constraint: null },
  { name: 'common_risks', type: 'TEXT', constraint: null },
  { name: 'safer_areas_summary', type: 'TEXT', constraint: null },
  { name: 'areas_extra_caution', type: 'TEXT', constraint: null },
  { name: 'after_dark_guidance', type: 'TEXT', constraint: null },
  { name: 'transport_safety_notes', type: 'TEXT', constraint: null },
  { name: 'women_solo_notes', type: 'TEXT', constraint: null },
  { name: 'lgbtq_notes', type: 'TEXT', constraint: null },
  { name: 'emergency_prep_note', type: 'TEXT', constraint: null },
  { name: 'scam_harassment_patterns', type: 'TEXT', constraint: null },
  { name: 'short_summary', type: 'TEXT', constraint: null },
  { name: 'why_solo_travellers', type: 'TEXT', constraint: null },
  { name: 'best_for_tags', type: 'TEXT', constraint: null },
  { name: 'climate_summary', type: 'TEXT', constraint: null },
  { name: 'arrival_tips', type: 'TEXT', constraint: null },
  { name: 'local_etiquette_notes', type: 'TEXT', constraint: null },
  { name: 'ideal_trip_length', type: 'TEXT', constraint: null },
  { name: 'neighbourhood_shortlist', type: 'TEXT', constraint: null },
  { name: 'content_freshness_date', type: 'TIMESTAMP', constraint: null },
  { name: 'ai_batch_run_id', type: 'TEXT', constraint: null },
  { name: 'ai_prompt_version', type: 'TEXT', constraint: null },
  { name: 'ai_briefing_status', type: "TEXT DEFAULT 'pending'", constraint: "CHECK(ai_briefing_status IN ('pending', 'generated', 'reviewed', 'published'))" },
  { name: 'ai_quality_score', type: 'REAL', constraint: null },
  { name: 'fallback_summary_available', type: 'BOOLEAN DEFAULT FALSE', constraint: null },
  { name: 'source_pack_complete', type: 'BOOLEAN DEFAULT FALSE', constraint: null },
  { name: 'ai_card_summary', type: 'TEXT', constraint: null },
  { name: 'ai_safety_brief', type: 'TEXT', constraint: null },
  { name: 'ai_solo_suitability', type: 'TEXT', constraint: null },
  { name: 'ai_arrival_checklist', type: 'TEXT', constraint: null },
  { name: 'ai_neighbourhood_guidance', type: 'TEXT', constraint: null },
  { name: 'ai_after_dark', type: 'TEXT', constraint: null },
  { name: 'ai_common_friction', type: 'TEXT', constraint: null },
  { name: 'ai_quick_facts', type: 'TEXT', constraint: null },
  { name: 'ai_fallback_summary', type: 'TEXT', constraint: null },
];

async function columnExists(pool, columnName) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = $1`,
    [columnName]
  );
  return result.rows.length > 0;
}

async function runMigration() {
  console.log('=== Destination Schema Migration ===\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database. Please check DATABASE_URL.');
    process.exit(1);
  }

  const pool = getPool();
  let addedCount = 0;
  let skippedCount = 0;

  for (const col of newColumns) {
    const exists = await columnExists(pool, col.name);
    if (exists) {
      console.log(`[SKIP] ${col.name} - already exists`);
      skippedCount++;
    } else {
      let sql = `ALTER TABLE destinations ADD COLUMN ${col.name} ${col.type}`;
      if (col.constraint) {
        sql += ` ${col.constraint}`;
      }

      try {
        await pool.query(sql);
        console.log(`[ADD] ${col.name}`);
        addedCount++;
      } catch (err) {
        console.error(`[ERROR] ${col.name}: ${err.message}`);
      }
    }
  }

  console.log('\n--- Migrating existing data ---');
  try {
    const updateResult = await pool.query(`
      UPDATE destinations 
      SET publication_status = 'live' 
      WHERE status = 'live' AND (publication_status IS NULL OR publication_status = 'draft')
    `);
    console.log(`[MIGRATE] Updated ${updateResult.rowCount} rows: status 'live' -> publication_status 'live'`);
  } catch (err) {
    console.error(`[ERROR] Data migration: ${err.message}`);
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);

  await pool.end();
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});