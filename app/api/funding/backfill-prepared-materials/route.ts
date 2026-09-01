import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/is-tdi-admin';
import { buildPreparedDraft, draftToStoredText } from '@/lib/funding/prepared-draft';

/**
 * Fills prepared_materials on open funding tasks that have none.
 *
 * Every open task predates the generator, so on the first run this touches the
 * whole open queue. It only ever writes to rows where the column is empty, so
 * anything a human wrote by hand is left exactly as it is.
 *
 * GET  ?dryRun=1   computes every draft and reports them, writes nothing
 * POST              writes
 */

type Row = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  owner_type: string | null;
  client_label: string | null;
  due_date: string | null;
  prepared_materials: string | null;
  status: string | null;
  funding_pursuits: {
    pursuit_name: string | null;
    district_name: string | null;
    funder_label: string | null;
    client_contact_name: string | null;
    client_contact_role: string | null;
    submission_deadline: string | null;
  } | null;
  funding_opportunities: {
    name: string | null;
    amount: number | null;
    contact_name: string | null;
    internal_deadline: string | null;
  } | null;
};

const SELECT = `
  id, title, description, category, owner_type, client_label, due_date,
  prepared_materials, status,
  funding_pursuits ( pursuit_name, district_name, funder_label,
                     client_contact_name, client_contact_role, submission_deadline ),
  funding_opportunities ( name, amount, contact_name, internal_deadline )
`;

function planFor(row: Row) {
  const p = row.funding_pursuits;
  const o = row.funding_opportunities;

  const draft = buildPreparedDraft({
    title: row.title,
    description: row.description,
    category: row.category,
    ownerType: row.owner_type,
    clientLabel: row.client_label,
    pursuitName: p?.pursuit_name ?? null,
    districtName: p?.district_name ?? null,
    funderLabel: p?.funder_label ?? null,
    // The opportunity contact is the person on this specific grant, so it wins
    // over the pursuit level contact when both exist.
    clientContactName: o?.contact_name ?? p?.client_contact_name ?? null,
    clientContactRole: p?.client_contact_role ?? null,
    opportunityName: o?.name ?? null,
    opportunityAmount: o?.amount ?? null,
    deadline: row.due_date ?? o?.internal_deadline ?? p?.submission_deadline ?? null,
  });

  return draft ? { id: row.id, title: row.title, kind: draft.kind, text: draftToStoredText(draft) } : null;
}

async function loadCandidates() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('funding_action_items')
    .select(SELECT)
    .not('status', 'in', '("completed","cancelled")')
    .or('prepared_materials.is.null,prepared_materials.eq.')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`loading action items failed: ${error.message}`);
  return (data ?? []) as unknown as Row[];
}

export async function GET(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  if (!email || !(await isTDIAdmin(email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.nextUrl.searchParams.get('dryRun') !== '1') {
    return NextResponse.json(
      { error: 'Use ?dryRun=1 to preview, or POST to write.' },
      { status: 400 }
    );
  }

  try {
    const rows = await loadCandidates();
    const plans = rows.map(planFor).filter(Boolean) as NonNullable<ReturnType<typeof planFor>>[];

    return NextResponse.json({
      dryRun: true,
      candidates: rows.length,
      wouldWrite: plans.length,
      skippedNothingUsefulToSay: rows.length - plans.length,
      byKind: {
        email: plans.filter((p) => p.kind === 'email').length,
        script: plans.filter((p) => p.kind === 'script').length,
      },
      samples: plans.slice(0, 3),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  if (!email || !(await isTDIAdmin(email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  try {
    const rows = await loadCandidates();
    const plans = rows.map(planFor).filter(Boolean) as NonNullable<ReturnType<typeof planFor>>[];

    let written = 0;
    const failures: { id: string; title: string; error: string }[] = [];

    for (const plan of plans) {
      // Guarded on the column still being empty, so a draft written by a human
      // between the read and this write is never overwritten.
      const { error } = await supabase
        .from('funding_action_items')
        .update({ prepared_materials: plan.text, updated_at: new Date().toISOString() })
        .eq('id', plan.id)
        .or('prepared_materials.is.null,prepared_materials.eq.');

      if (error) {
        console.error(`[backfill-prepared-materials] ${plan.id} failed:`, error.message);
        failures.push({ id: plan.id, title: plan.title, error: error.message });
      } else {
        written++;
      }
    }

    return NextResponse.json({
      dryRun: false,
      candidates: rows.length,
      written,
      failed: failures.length,
      failures,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
