import db from '../src/db.js';

console.log('Running subscription_tier migration...');

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'explorer', 'ultimate'));
  `);
  console.log('Successfully added subscription_tier column to users table');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('subscription_tier column already exists, skipping...');
  } else {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}
