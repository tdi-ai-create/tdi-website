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

    // Build notes, including contact_role if provided (column may not exist yet)
    const noteParts: string[] = [];
    if (body.contact_role) noteParts.push(`Role: ${body.contact_role}`);
    if (body.notes) noteParts.push(body.notes);
    const combinedNotes = noteParts.length > 0 ? noteParts.join('\n') : null;

    // Base insert fields — only columns confirmed in the production schema
    const insertData: Record<string, unknown> = {
      name: body.district_name,
      contact_name: body.contact_name || null,
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      source: body.source,
      value: body.estimated_deal_size || null,
      heat: body.initial_heat || 'warm',
      notes: combinedNotes,
      stage: body.stage || 'qualified',
      type: 'new_business',
      school_year: '2026-27',
      assigned_to_email: body.assigned_to_email || 'rae@teachersdeserveit.com',
      partnership_status: body.partnership_status || 'prospect',
    };

    // Add state if provided
    if (body.state_code) insertData.state = body.state_code;

    // Add optional columns directly to insertData
    if (body.contact_role) insertData.contact_role = body.contact_role;

    let { data: lead, error: insertErr } = await supabase
      .from('sales_opportunities')
      .insert(insertData)
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
