import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function GET() {
  try {
    const authClient = await getAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: creator, error: findError } = await (supabase
      .from('creators') as any)
      .select('id')
      .eq('email', user.email)
      .single();

    if (findError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const { data: payouts, error: payoutsError } = await (supabase
      .from('affiliate_payouts') as any)
      .select('*')
      .eq('creator_id', creator.id)
      .order('period_start', { ascending: false })
      .limit(24);

    if (payoutsError) {
      console.error('[affiliate-payouts] Query error:', payoutsError);
      return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
    }

    const formattedPayouts = (payouts || []).map((p: any) => ({
      id: p.id,
      periodStart: p.period_start,
      periodEnd: p.period_end,
      amountCents: p.amount_cents,
      conversionCount: p.conversion_count,
      status: p.status, // pending | approved | paid
      paidAt: p.paid_at,
      notes: p.notes,
    }));

    return NextResponse.json({
      success: true,
      payouts: formattedPayouts,
    });
  } catch (error) {
    console.error('[affiliate-payouts] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
