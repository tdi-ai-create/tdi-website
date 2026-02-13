import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tauzahhnawejouvtbvuw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdXphaGhuYXdlam91dnRidnV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ1NzkxNywiZXhwIjoyMDg1MDMzOTE3fQ.SSda-9rmmH0raDRiNpEYhilC8pK81Hfmox7-d9Bz8FU'
);

async function checkSchema() {
  console.log('Checking database schema...\n');
  
  // Get hub_profiles columns
  const { data: profiles, error: e1 } = await supabase.from('hub_profiles').select('*').limit(1);
  console.log('hub_profiles columns:', profiles?.[0] ? Object.keys(profiles[0]).join(', ') : (e1?.message || 'empty table'));
  
  // Get hub_enrollments columns  
  const { data: enrollments, error: e2 } = await supabase.from('hub_enrollments').select('*').limit(1);
  console.log('hub_enrollments columns:', enrollments?.[0] ? Object.keys(enrollments[0]).join(', ') : (e2?.message || 'empty table'));
  
  // Get hub_certificates columns
  const { data: certs, error: e3 } = await supabase.from('hub_certificates').select('*').limit(1);
  console.log('hub_certificates columns:', certs?.[0] ? Object.keys(certs[0]).join(', ') : (e3?.message || 'empty table'));
  
  // Get hub_courses columns
  const { data: courses, error: e4 } = await supabase.from('hub_courses').select('*').limit(1);
  console.log('hub_courses columns:', courses?.[0] ? Object.keys(courses[0]).join(', ') : (e4?.message || 'empty table'));
  
  // Get hub_activity_log columns
  const { data: activity, error: e5 } = await supabase.from('hub_activity_log').select('*').limit(1);
  console.log('hub_activity_log columns:', activity?.[0] ? Object.keys(activity[0]).join(', ') : (e5?.message || 'empty table'));
}

checkSchema();
