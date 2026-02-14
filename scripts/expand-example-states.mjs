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

// 21 states matching TDI's real footprint with weighted distribution
const STATE_DISTRIBUTION = [
  { state: 'IL', weight: 0.12, name: 'Illinois' },
  { state: 'TX', weight: 0.10, name: 'Texas' },
  { state: 'CA', weight: 0.08, name: 'California' },
  { state: 'NY', weight: 0.06, name: 'New York' },
  { state: 'FL', weight: 0.06, name: 'Florida' },
  { state: 'OH', weight: 0.05, name: 'Ohio' },
  { state: 'GA', weight: 0.05, name: 'Georgia' },
  { state: 'NC', weight: 0.04, name: 'North Carolina' },
  { state: 'PA', weight: 0.04, name: 'Pennsylvania' },
  { state: 'MI', weight: 0.04, name: 'Michigan' },
  { state: 'VA', weight: 0.03, name: 'Virginia' },
  { state: 'AZ', weight: 0.03, name: 'Arizona' },
  { state: 'TN', weight: 0.03, name: 'Tennessee' },
  { state: 'IN', weight: 0.03, name: 'Indiana' },
  { state: 'MO', weight: 0.03, name: 'Missouri' },
  { state: 'WI', weight: 0.03, name: 'Wisconsin' },
  { state: 'CO', weight: 0.03, name: 'Colorado' },
  { state: 'LA', weight: 0.03, name: 'Louisiana' },
  { state: 'AL', weight: 0.03, name: 'Alabama' },
  { state: 'SC', weight: 0.03, name: 'South Carolina' },
  { state: 'KY', weight: 0.03, name: 'Kentucky' },
  { state: 'OR', weight: 0.03, name: 'Oregon' },
];

function pickRandomState() {
  const rand = Math.random();
  let cumulative = 0;
  for (const s of STATE_DISTRIBUTION) {
    cumulative += s.weight;
    if (rand < cumulative) {
      return s.state;
    }
  }
  return 'OR'; // fallback
}

async function run() {
  console.log('Expanding example user states to 21+ states...\n');

  // Get example users with their onboarding_data
  const { data: users, error: fetchError } = await supabase
    .from('hub_profiles')
    .select('id, display_name, onboarding_data')
    .eq('is_example', true);

  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }

  console.log(`Found ${users.length} example users\n`);

  // Assign states with weighted distribution
  const stateCounts = {};
  let updated = 0;

  for (const user of users) {
    const newState = pickRandomState();
    stateCounts[newState] = (stateCounts[newState] || 0) + 1;

    // Merge new state into existing onboarding_data
    const updatedOnboardingData = {
      ...(user.onboarding_data || {}),
      state: newState,
    };

    const { error } = await supabase
      .from('hub_profiles')
      .update({ onboarding_data: updatedOnboardingData })
      .eq('id', user.id);

    if (!error) {
      updated++;
    } else {
      console.error(`Failed to update ${user.display_name}:`, error.message);
    }
  }

  console.log(`Updated ${updated} users\n`);
  console.log('State distribution:');

  // Sort by count descending
  const sorted = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1]);

  for (const [state, count] of sorted) {
    const stateName = STATE_DISTRIBUTION.find(s => s.state === state)?.name || state;
    const pct = ((count / updated) * 100).toFixed(1);
    console.log(`  ${state} (${stateName}): ${count} users (${pct}%)`);
  }

  console.log(`\nTotal unique states: ${Object.keys(stateCounts).length}`);
}

run();
