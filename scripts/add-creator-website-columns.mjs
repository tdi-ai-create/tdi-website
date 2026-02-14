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
  console.log('Adding website display columns to creators table...\n');

  // Test if columns exist by trying to select them
  const { data, error } = await supabase
    .from('creators')
    .select('id, display_on_website, website_display_name, website_bio, website_title, headshot_url, display_order')
    .limit(1);

  if (error) {
    console.log('Columns do not exist yet. Please run this SQL in Supabase dashboard:\n');
    console.log('-- Add website display columns to creators table');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS display_on_website BOOLEAN DEFAULT false;');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_display_name TEXT;');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_bio TEXT;');
    console.log("ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_title TEXT DEFAULT 'Content Creator';");
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS headshot_url TEXT;');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 99;');
    console.log('\n-- Create index for public queries');
    console.log('CREATE INDEX IF NOT EXISTS idx_creators_display ON creators(display_on_website, display_order);');
  } else {
    console.log('Columns already exist!');
    console.log('Sample row:', data);
  }
}

run();
