import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL=postgres://... node run-all-migrations.js');
  process.exit(1);
}

async function runMigration(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], {
      env: process.env,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('=== Running All Migrations ===\n');
  
  try {
    console.log('--- Step 1: Destination Schema ---');
    await runMigration('migrate-destination-schema.js');
    console.log('');
    
    console.log('--- Step 2: Messaging, Calls & Trip Sharing ---');
    await runMigration('migrate-messaging-calls.js');
    console.log('');
    
    console.log('=== All Migrations Complete ===');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

main();