import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

console.log('--- Env Diagnostic ---');
console.log('Absolute Path to .env:', envPath);
console.log('File Exists?:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.log('Dotenv Error:', result.error);
    } else {
        console.log('Dotenv Loaded Successfully');
        console.log('INFISICAL_PROJECT_ID:', process.env.INFISICAL_PROJECT_ID ? 'FOUND' : 'MISSING');
    }
} else {
    console.log('ERROR: .env file NOT FOUND at expected path');
}
