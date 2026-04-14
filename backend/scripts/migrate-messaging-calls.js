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
  });
}

async function tableExists(pool, tableName) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
    [tableName]
  );
  return result.rows.length > 0;
}

const tables = [
  {
    name: 'buddy_conversations',
    sql: `CREATE TABLE IF NOT EXISTS buddy_conversations (
      id SERIAL PRIMARY KEY,
      participant_a INTEGER NOT NULL REFERENCES users(id),
      participant_b INTEGER NOT NULL REFERENCES users(id),
      trip_id INTEGER REFERENCES trips(id),
      last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'buddy_messages',
    sql: `CREATE TABLE IF NOT EXISTS buddy_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES buddy_conversations(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'system')),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'buddy_calls',
    sql: `CREATE TABLE IF NOT EXISTS buddy_calls (
      id SERIAL PRIMARY KEY,
      caller_id INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      conversation_id INTEGER REFERENCES buddy_conversations(id),
      call_type TEXT DEFAULT 'video' CHECK(call_type IN ('video', 'audio')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'ended', 'missed')),
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'trip_shares',
    sql: `CREATE TABLE IF NOT EXISTS trip_shares (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      share_code TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'trip_collaborators',
    sql: `CREATE TABLE IF NOT EXISTS trip_collaborators (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      role TEXT DEFAULT 'editor' CHECK(role IN ('editor', 'viewer')),
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trip_id, user_id)
    )`
  }
];

const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON buddy_messages(conversation_id, created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_conversations_participant_a ON buddy_conversations(participant_a)',
  'CREATE INDEX IF NOT EXISTS idx_conversations_participant_b ON buddy_conversations(participant_b)',
  'CREATE INDEX IF NOT EXISTS idx_calls_caller ON buddy_calls(caller_id)',
  'CREATE INDEX IF NOT EXISTS idx_calls_receiver ON buddy_calls(receiver_id)',
  'CREATE INDEX IF NOT EXISTS idx_calls_status ON buddy_calls(status)',
  'CREATE INDEX IF NOT EXISTS idx_trip_shares_code ON trip_shares(share_code)',
  'CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip ON trip_collaborators(trip_id)',
  'CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user ON trip_collaborators(user_id)'
];

async function runMigration() {
  console.log('=== Messaging, Calls & Trip Sharing Migration ===\n');
  
  const pool = getPool();
  
  try {
    await pool.query('SELECT NOW()');
    console.log('[OK] Database connected\n');
    
    // Create tables
    for (const table of tables) {
      const exists = await tableExists(pool, table.name);
      if (exists) {
        console.log(`[SKIP] Table ${table.name} - already exists`);
      } else {
        await pool.query(table.sql);
        console.log(`[CREATE] Table ${table.name}`);
      }
    }
    
    console.log('');
    
    // Create indexes
    for (const index of indexes) {
      await pool.query(index);
      const idxName = index.match(/INDEX\s+IF NOT EXISTS\s+(\w+)/)?.[1] || 'index';
      console.log(`[INDEX] ${idxName}`);
    }
    
    console.log('\n=== Migration Complete ===');
    
  } catch (err) {
    console.error('[ERROR]', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});