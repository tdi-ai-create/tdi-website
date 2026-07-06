import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/admin/creator-email-activity
// Returns recent creator email log entries for the admin dashboard.

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('creator_email_log')
      .select('id, creator_id, creator_name, creator_email, direction, category, subject, step, sent_at')
      .gte('sent_at', weekAgo.toISOString())
      .order('sent_at', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ emails: [] });
    }

    return NextResponse.json({ emails: data || [] });
  } catch {
    return NextResponse.json({ emails: [] });
  }
}
