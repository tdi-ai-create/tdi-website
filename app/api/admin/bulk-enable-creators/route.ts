import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/bulk-enable-creators
 *
 * One-time utility: sets display_on_website=true and website_display_name=name
 * for all active creators who are currently missing from the website.
 */
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all creators not currently displayed
    const { data: hidden, error: fetchError } = await supabase
      .from('creators')
      .select('id, name, display_on_website, website_display_name, status')
      .or('display_on_website.eq.false,display_on_website.is.null');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Filter to active creators only
    const toEnable = (hidden || []).filter(c => c.status !== 'dropped' && c.status !== 'inactive');

    if (toEnable.length === 0) {
      return NextResponse.json({ message: 'All creators already visible', updated: 0 });
    }

    // Update each one
    let updated = 0;
    for (const creator of toEnable) {
      const { error } = await supabase
        .from('creators')
        .update({
          display_on_website: true,
          website_display_name: creator.website_display_name || creator.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creator.id);

      if (!error) updated++;
    }

    return NextResponse.json({
      message: `Enabled ${updated} creators on website`,
      updated,
      total: toEnable.length,
      creators: toEnable.map(c => c.name),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
