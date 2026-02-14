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

// Creators who should already be showing on the website
const EXISTING_WEBSITE_CREATORS = [
  'Erin Light',
  'Katie Welch',
  'Sue Thompson',
  'Paige Roberts',
  'Walter Cullin Jr',
  'Kimberelle Martin',
  'Paige Griffin',
  'Kayla Brown',
  'Ian Bowen',
  'Amanda Duffy',
  'Jay Jackson',
  'Holly Stuart',
];

async function run() {
  console.log('Enabling website visibility for existing creators...\n');

  // First check if columns exist
  const { data: testData, error: testError } = await supabase
    .from('creators')
    .select('id, display_on_website')
    .limit(1);

  if (testError && testError.message.includes('display_on_website')) {
    console.log('ERROR: display_on_website column does not exist yet.');
    console.log('Please run this SQL in Supabase dashboard first:\n');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS display_on_website BOOLEAN DEFAULT false;');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_display_name TEXT;');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_bio TEXT;');
    console.log("ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_title TEXT DEFAULT 'Content Creator';");
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS headshot_url TEXT;');
    console.log('ALTER TABLE creators ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 99;');
    return;
  }

  let displayOrder = 1;
  let updated = 0;
  let notFound = [];

  for (const name of EXISTING_WEBSITE_CREATORS) {
    // Find creator by name
    const { data: creator, error: findError } = await supabase
      .from('creators')
      .select('id, name')
      .eq('name', name)
      .single();

    if (findError || !creator) {
      notFound.push(name);
      continue;
    }

    // Update creator
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        display_on_website: true,
        website_display_name: name,
        website_title: 'Content Creator',
        display_order: displayOrder,
      })
      .eq('id', creator.id);

    if (!updateError) {
      console.log(`✓ Enabled: ${name} (order: ${displayOrder})`);
      updated++;
      displayOrder++;
    } else {
      console.log(`✗ Failed: ${name} - ${updateError.message}`);
    }
  }

  console.log(`\n${updated} creators enabled for website display`);

  if (notFound.length > 0) {
    console.log(`\nNot found in database: ${notFound.join(', ')}`);
    console.log('(These creators may need to be added to the creators table first)');
  }
}

run();
