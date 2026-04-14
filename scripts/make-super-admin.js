// Script to update admin user to super_admin
// Run with: cd scripts && node make-super-admin.js (from project root)

import db from '../backend/src/db.js';

async function makeSuperAdmin() {
  // Wait for DB to be ready
  let attempts = 0;
  while (!db.get && attempts < 10) {
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
    console.log('Waiting for DB...', attempts);
  }

  try {
    // Find the admin user
    const user = await db.get('SELECT id, email, role, admin_level FROM users WHERE email = ?', 'admin@solocompass.test');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found. Let me check what users exist:');
      const users = await db.all('SELECT id, email, role, admin_level FROM users LIMIT 5');
      console.log('Users in DB:', users);
      process.exit(1);
    }

    // Update to super_admin
    await db.run('UPDATE users SET admin_level = ?, role = ? WHERE id = ?', 'super_admin', 'admin', user.id);
    console.log('Updated admin_level to super_admin and role to admin');

    // Verify
    const updated = await db.get('SELECT id, email, role, admin_level FROM users WHERE email = ?', 'admin@solocompass.test');
    console.log('Updated user:', updated);
    
    console.log('\n✅ Done! admin@solocompass.test is now a super_admin');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}

makeSuperAdmin();