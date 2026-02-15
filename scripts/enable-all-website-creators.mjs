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
  console.log('Enabling ALL creators for website display...\n');

  // Get all creators who are not currently displayed
  const { data: creators, error: fetchError } = await supabase
    .from('creators')
    .select('id, name, display_on_website, display_order')
    .or('display_on_website.eq.false,display_on_website.is.null')
    .order('name');

  if (fetchError) {
    console.error('Error fetching creators:', fetchError);
    return;
  }

  console.log(`Found ${creators?.length || 0} creators to enable\n`);

  if (!creators || creators.length === 0) {
    console.log('All creators are already enabled!');
    return;
  }

  // Get the highest current display_order
  const { data: maxOrderData } = await supabase
    .from('creators')
    .select('display_order')
    .eq('display_on_website', true)
    .order('display_order', { ascending: false })
    .limit(1);

  let nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1;
  let enabled = 0;

  for (const creator of creators) {
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        display_on_website: true,
        website_display_name: creator.name,
        website_title: 'Content Creator',
        display_order: nextOrder,
      })
      .eq('id', creator.id);

    if (!updateError) {
      console.log(`✓ Enabled: ${creator.name} (order: ${nextOrder})`);
      enabled++;
      nextOrder++;
    } else {
      console.log(`✗ Failed: ${creator.name} - ${updateError.message}`);
    }
  }

  console.log(`\n${enabled} additional creators enabled for website display`);

  // Show final count
  const { count } = await supabase
    .from('creators')
    .select('*', { count: 'exact', head: true })
    .eq('display_on_website', true);

  console.log(`\nTotal creators visible on website: ${count}`);
}

run();
