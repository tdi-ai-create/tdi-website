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
  console.log('Updating ~15% of example users to prefer Spanish...');
  
  // Get example users
  const { data: users, error: fetchError } = await supabase
    .from('hub_profiles')
    .select('id')
    .eq('is_example', true);
  
  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }
  
  console.log(`Found ${users.length} example users`);
  
  // Update ~15% to Spanish
  const spanishCount = Math.floor(users.length * 0.15);
  const shuffled = users.sort(() => Math.random() - 0.5);
  const spanishUsers = shuffled.slice(0, spanishCount).map(u => u.id);
  
  // Update preferences field with preferred_language
  let updated = 0;
  for (const userId of spanishUsers) {
    const { data: profile } = await supabase
      .from('hub_profiles')
      .select('preferences')
      .eq('id', userId)
      .single();
    
    const newPrefs = { ...(profile?.preferences || {}), preferred_language: 'spanish' };
    
    const { error } = await supabase
      .from('hub_profiles')
      .update({ preferences: newPrefs })
      .eq('id', userId);
    
    if (!error) updated++;
  }
  
  console.log(`Updated ${updated} users to Spanish preference`);
}

run();
