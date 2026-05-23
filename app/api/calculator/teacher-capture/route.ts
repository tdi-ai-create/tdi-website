import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, calculator, stressLevel, tier } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Tags: calculator-complete, calculator:{burnout|joy}, stress-level-{n}, stress-tier-{low|mid|high}
    const tags = [
      'calculator-complete',
      `calculator:${calculator}`,
      `stress-level-${stressLevel}`,
      `stress-tier-${tier}`,
    ];

    // Write to GHL
    const ghlApiKey = process.env.GHL_API_KEY;
    const ghlLocationId = process.env.GHL_LOCATION_ID;

    if (ghlApiKey && ghlLocationId) {
      await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
        body: JSON.stringify({
          email: cleanEmail,
          locationId: ghlLocationId,
          tags,
          source: 'calculator',
        }),
      });
    }

    // Write to Supabase as backup record
    try {
      const supabase = getServiceSupabase();
      await supabase.from('calculator_submissions').insert({
        email: cleanEmail,
        calculator_type: calculator,
        stress_level: stressLevel,
        tier,
      });
    } catch (dbErr) {
      // Don't fail the request if Supabase write fails
      console.error('[teacher-capture] supabase error', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[teacher-capture] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
