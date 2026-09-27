import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

/**
 * Attach an existing partnership to an existing CRM opportunity.
 *
 * `partnerships.sales_deal_id` was only ever written at birth, in two places:
 * signing a quote (`/api/quotes/[id]/sign`) and converting a signed deal into
 * a brand new partnership (`/api/admin/deal-to-partnership`). Neither can be
 * pointed at a partnership that already exists, and nothing in the UI wrote
 * the column at all. So any partnership created by hand stayed unlinked for
 * good: the admin page found no sales enrichment to show, and
 * OpportunityDetailPanel found no partnership behind the deal.
 *
 * On 24 September 2026, 6 of 9 active partnerships were in that state.
 *
 * GET  ?partnershipId=...&q=...  candidate opportunities to pick from
 * POST { partnershipId, dealId } write the link (dealId null to detach)
 */

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase credentials');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Opportunities that are already spoken for, mapped to the partnership holding them. */
async function getTakenDealIds(
  supabase: ReturnType<typeof getServiceSupabase>,
  exceptPartnershipId: string
) {
  const { data, error } = await supabase
    .from('partnerships')
    .select('id, slug, sales_deal_id')
    .not('sales_deal_id', 'is', null)
    .neq('id', exceptPartnershipId);

  if (error) {
    console.error('[attach-deal] could not read existing links:', error.message);
    return new Map<string, { id: string; slug: string | null }>();
  }

  return new Map(
    (data || []).map((p) => [p.sales_deal_id as string, { id: p.id, slug: p.slug }])
  );
}

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partnershipId = searchParams.get('partnershipId');
    const q = (searchParams.get('q') || '').trim();

    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: partnership, error: pErr } = await supabase
      .from('partnerships')
      .select('id, slug, org_name, contact_name, contact_email, sales_deal_id')
      .eq('id', partnershipId)
      .maybeSingle();

    if (pErr) {
      console.error('[attach-deal] partnership lookup failed:', pErr.message);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }
    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Default the search to the partnership's own name so the picker opens on
    // the deals most likely to be right, rather than the whole pipeline.
    const term = q || partnership.org_name || partnership.contact_name || '';

    let query = supabase
      .from('sales_opportunities')
      .select('id, name, stage, type, value, contact_name, contact_email, school_year, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(25);

    if (term) {
      const safe = term.replace(/[%,()]/g, ' ').trim();
      if (safe) {
        query = query.or(`name.ilike.%${safe}%,contact_email.ilike.%${safe}%,contact_name.ilike.%${safe}%`);
      }
    }

    const { data: deals, error: dErr } = await query;
    if (dErr) {
      console.error('[attach-deal] opportunity search failed:', dErr.message);
      return NextResponse.json({ error: dErr.message }, { status: 500 });
    }

    const taken = await getTakenDealIds(supabase, partnershipId);

    return NextResponse.json({
      partnership,
      deals: (deals || []).map((d) => ({
        ...d,
        // Surfaced rather than filtered out, so it is obvious why a deal that
        // looks right cannot be picked.
        takenBy: taken.get(d.id) || null,
      })),
    });
  } catch (err) {
    console.error('[attach-deal] GET error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { partnershipId } = body;
    const dealId: string | null = body.dealId ?? null;

    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: partnership, error: pErr } = await supabase
      .from('partnerships')
      .select('id, slug, sales_deal_id')
      .eq('id', partnershipId)
      .maybeSingle();

    if (pErr) {
      console.error('[attach-deal] partnership lookup failed:', pErr.message);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }
    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    let dealName: string | null = null;

    if (dealId) {
      const { data: deal, error: dErr } = await supabase
        .from('sales_opportunities')
        .select('id, name, deleted_at')
        .eq('id', dealId)
        .maybeSingle();

      if (dErr) {
        console.error('[attach-deal] opportunity lookup failed:', dErr.message);
        return NextResponse.json({ error: dErr.message }, { status: 500 });
      }
      if (!deal || deal.deleted_at) {
        return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
      }

      // One deal, one partnership. Silently stealing it would leave the old
      // partnership pointing at nothing, which is the bug this route exists
      // to end rather than repeat.
      const taken = await getTakenDealIds(supabase, partnershipId);
      const holder = taken.get(dealId);
      if (holder) {
        return NextResponse.json(
          {
            error: `That deal is already attached to ${holder.slug || holder.id}. Detach it there first.`,
          },
          { status: 409 }
        );
      }

      dealName = deal.name;
    }

    const { error: updErr } = await supabase
      .from('partnerships')
      .update({ sales_deal_id: dealId, updated_at: new Date().toISOString() })
      .eq('id', partnershipId);

    if (updErr) {
      console.error('[attach-deal] link write failed:', updErr.message);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    const { error: logErr } = await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      user_id: null,
      action: dealId ? 'partnership_deal_attached' : 'partnership_deal_detached',
      details: {
        deal_id: dealId,
        deal_name: dealName,
        previous_deal_id: partnership.sales_deal_id,
        by: email,
      },
    });
    if (logErr) console.error('[attach-deal] activity log entry lost:', logErr.message);

    return NextResponse.json({ success: true, partnershipId, dealId, dealName });
  } catch (err) {
    console.error('[attach-deal] POST error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
