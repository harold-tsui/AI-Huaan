import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

console.log('[JEST_ENV_SETUP] Attempting to load .env file...');

const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`[JEST_ENV_SETUP] Successfully loaded .env file from: ${envPath}`);
} else {
  console.warn(`[JEST_ENV_SETUP] .env file not found at: ${envPath}. Proceeding without it.`);
}