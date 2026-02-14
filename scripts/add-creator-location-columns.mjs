import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log('Adding location columns to creators table...');

  // Add state column (2-letter abbreviation)
  const { error: stateError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE creators ADD COLUMN IF NOT EXISTS state TEXT;`
  });

  if (stateError) {
    // Try direct query if RPC doesn't exist
    console.log('RPC not available, trying alternative approach...');

    // Check if column exists by querying
    const { data: testData, error: testError } = await supabase
      .from('creators')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Error accessing creators table:', testError);
      return;
    }

    console.log('Note: Columns need to be added via Supabase dashboard SQL editor:');
    console.log('');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS state TEXT;');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS location_prompt_dismissed BOOLEAN DEFAULT FALSE;');
    console.log('');
    console.log('Or the columns may already exist. Checking...');
  }

  // Verify columns by trying to select them
  const { data, error } = await supabase
    .from('creators')
    .select('id, state, location_prompt_dismissed')
    .limit(1);

  if (error) {
    if (error.message.includes('state') || error.message.includes('location_prompt_dismissed')) {
      console.log('');
      console.log('Columns do not exist yet. Please run this SQL in Supabase dashboard:');
      console.log('');
      console.log('-- Add location tracking columns to creators table');
      console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS state TEXT;');
      console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS location_prompt_dismissed BOOLEAN DEFAULT FALSE;');
      console.log('');
      console.log('-- Add index for geographic queries');
      console.log('CREATE INDEX IF NOT EXISTS idx_creators_state ON creators(state);');
    } else {
      console.error('Error:', error.message);
    }
  } else {
    console.log('Columns already exist or were added successfully!');
    console.log('Sample row:', data);
  }
}

run();
