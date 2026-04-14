import pg from 'pg';
const { Pool } = pg;

// Use Infisical-injected DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixRemainingBooleans() {
  const columns = [
    { table: 'notifications', column: 'is_read' },
    { table: 'scheduled_check_ins', column: 'is_active' },
    { table: 'scheduled_check_ins', column: 'is_recurring' },
    { table: 'scheduled_check_ins', column: 'reminder_sent' },
    { table: 'scheduled_check_ins', column: 'final_warning_sent' },
    { table: 'scheduled_check_ins', column: 'sos_triggered' },
    { table: 'emergency_contacts', column: 'notify_on_checkin' },
    { table: 'emergency_contacts', column: 'notify_on_emergency' },
  ];

  for (const { table, column } of columns) {
    try {
      const res = await pool.query(`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [table, column]);

      if (res.rows.length === 0) {
        console.log(`  ⚠  ${table}.${column} — column does not exist, skipping`);
        continue;
      }

      const currentType = res.rows[0].data_type;
      if (currentType === 'boolean') {
        console.log(`  ✓  ${table}.${column} — already BOOLEAN`);
        continue;
      }

      console.log(`  →  ${table}.${column} — converting ${currentType} to BOOLEAN...`);
      await pool.query(`
        ALTER TABLE ${table} 
        ALTER COLUMN ${column} TYPE BOOLEAN 
        USING CASE WHEN ${column}::text IN ('1', 'true', 't') THEN true ELSE false END
      `);
      console.log(`  ✓  ${table}.${column} — converted successfully`);
    } catch (err) {
      console.error(`  ✗  ${table}.${column} — ERROR: ${err.message}`);
    }
  }

  // Also add missing columns to profiles if needed
  const profileColumns = [
    { name: 'display_name', type: 'TEXT' },
    { name: 'home_base', type: 'TEXT' },
    { name: 'visible', type: 'BOOLEAN DEFAULT true' },
  ];

  for (const col of profileColumns) {
    try {
      const exists = await pool.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = $1
      `, [col.name]);
      
      if (exists.rows.length === 0) {
        console.log(`  →  profiles.${col.name} — adding column (${col.type})...`);
        await pool.query(`ALTER TABLE profiles ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✓  profiles.${col.name} — added`);
      } else {
        console.log(`  ✓  profiles.${col.name} — already exists`);
      }
    } catch (err) {
      console.error(`  ✗  profiles.${col.name} — ERROR: ${err.message}`);
    }
  }

  console.log('\nDone!');
  await pool.end();
}

fixRemainingBooleans();
