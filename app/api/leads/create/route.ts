import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import type { CreateLeadInput } from '@/types/leads';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateLeadInput;

    if (!body.district_name || !body.source) {
      return NextResponse.json(
        { error: 'district_name and source are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: lead, error: insertErr } = await supabase
      .from('sales_opportunities')
      .insert({
        name: body.district_name,
        contact_name: body.contact_name || null,
        contact_role: body.contact_role || null,
        contact_email: body.contact_email || null,
        contact_phone: body.contact_phone || null,
        source: body.source,
        state_code: body.state_code || null,
        value: body.estimated_deal_size || null,
        heat: body.initial_heat || 'warm',
        notes: body.notes || null,
        stage: 'qualified',
        type: 'new',
        school_year: '2026-27',
        enrichment_status: 'pending',
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Lead insert failed:', insertErr);
      return NextResponse.json(
        { error: 'Failed to create lead', details: insertErr.message },
        { status: 500 }
      );
    }

    // Fire-and-forget enrichment trigger
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (req.headers.get('origin') ?? 'http://localhost:3000');

    fetch(`${baseUrl}/api/leads/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id }),
    }).catch((err) => {
      console.error('Enrichment trigger failed (non-blocking):', err);
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error('Create lead route error:', err);
    return NextResponse.json(
      { error: 'Server error', details: (err as Error).message },
      { status: 500 }
    );
  }
}
