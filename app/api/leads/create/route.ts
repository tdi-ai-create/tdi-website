import { NextRequest, NextResponse } from 'next/server';
import { insertLead, triggerEnrichment } from '@/lib/create-lead';
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

    const { lead, error } = await insertLead(body);

    if (error || !lead) {
      return NextResponse.json(
        { error: 'Failed to create lead', details: error },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (req.headers.get('origin') ?? 'http://localhost:3000');

    triggerEnrichment(lead.id, baseUrl);

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error('Create lead route error:', err);
    return NextResponse.json(
      { error: 'Server error', details: (err as Error).message },
      { status: 500 }
    );
  }
}
