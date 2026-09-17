import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/partners/funding/[partnershipId]
 *
 * Funding status for one partnership, read from that school's own
 * funding_pursuits row.
 *
 * This route deliberately returns less than the table holds. The funding
 * records are not trustworthy enough to put award figures in front of a
 * principal: every active pursuit carries total_awarded = 0 while at least one
 * partner has told us on a call that money has already transferred, and
 * Saunemin's row reads current_phase = 'submitted' with paths_submitted = 0 and
 * an empty funding_paths array. A record that disagrees with itself should not
 * be rendered as fact to a client.
 *
 * So we expose the amount being pursued and a plain-language stage, and we
 * withhold anything that would read as a settled outcome. When the funding
 * pipeline records awards reliably, widen this.
 */
function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Internal pipeline phases are not partner language.
const PHASE_COPY: Record<string, string> = {
  intake: 'We are mapping which funding sources you qualify for.',
  research: 'We are researching funders that fit your school.',
  drafting: 'We are writing your applications.',
  review: 'Your applications are in review with our team.',
  submitted: 'Your applications are submitted and we are waiting on decisions.',
  awarded: 'Funding has been awarded. We will confirm the details with you directly.',
  delivered: 'This round of funding work is complete.',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ partnershipId: string }> }
) {
  const { partnershipId } = await params;

  if (!partnershipId) {
    return NextResponse.json({ error: 'partnershipId required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('funding_pursuits')
    .select('pursuit_name, current_phase, total_amount, archived')
    .eq('partnership_id', partnershipId)
    .eq('archived', false)
    .maybeSingle();

  if (error) {
    // Never let a read failure render as "no funding work is happening".
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ hasFunding: false });
  }

  const amount = Number(data.total_amount);

  return NextResponse.json({
    hasFunding: true,
    amountPursued: Number.isFinite(amount) && amount > 0 ? amount : null,
    stage:
      PHASE_COPY[data.current_phase] ??
      'Your funding work is in progress.',
  });
}
