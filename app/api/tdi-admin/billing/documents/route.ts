import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/is-tdi-admin';

export const dynamic = 'force-dynamic';

/** Documents on file, plus what each district has told us it needs before it will pay. */
export async function GET(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  if (!(await isTDIAdmin(email))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = getServiceSupabase();
  const [{ data: docs }, { data: reqs }, { data: districts }] = await Promise.all([
    sb.from('billing_documents').select('*').order('created_at', { ascending: false }),
    sb.from('billing_requirements').select('*'),
    sb.from('districts').select('id, name'),
  ]);

  const dName = new Map((districts ?? []).map((d) => [d.id, d.name]));
  const company = (docs ?? []).filter((d) => d.is_company_wide);

  const byDistrict = new Map<string, { client: string; documents: any[]; required: string[]; missing: string[] }>();
  for (const d of districts ?? []) byDistrict.set(d.id, { client: d.name, documents: [], required: [], missing: [] });
  for (const d of docs ?? []) {
    if (d.is_company_wide || !d.district_id) continue;
    byDistrict.get(d.district_id)?.documents.push(d);
  }
  for (const r of reqs ?? []) {
    const entry = byDistrict.get(r.district_id);
    if (!entry) continue;
    entry.required.push(r.requirement);
    if (!entry.documents.some((x) => x.doc_type === r.requirement)) entry.missing.push(r.requirement);
  }

  const clients = [...byDistrict.values()].filter((c) => c.documents.length || c.required.length);
  const in90 = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

  return NextResponse.json({
    company,
    clients,
    totals: {
      on_file: (docs ?? []).length,
      missing_required: clients.reduce((s, c) => s + c.missing.length, 0),
      expiring: (docs ?? []).filter((d) => d.expires_on && d.expires_on <= in90).length,
      delivery_evidence: (docs ?? []).filter((d) => d.doc_type === 'delivery_evidence').length,
    },
  });
}

/** Record a document, or record that a district requires one. */
export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  if (!(await isTDIAdmin(email))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = getServiceSupabase();
  const b = await request.json().catch(() => ({}));

  if (b.action === 'add_requirement') {
    const { error } = await sb.from('billing_requirements')
      .upsert({ district_id: b.district_id, requirement: b.requirement, note: b.note ?? null }, { onConflict: 'district_id,requirement' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (!b.doc_type || !b.title) return NextResponse.json({ error: 'doc_type and title are required' }, { status: 400 });
  const { data, error } = await sb.from('billing_documents').insert({
    district_id: b.district_id ?? null, quote_id: b.quote_id ?? null,
    deliverable_id: b.deliverable_id ?? null, invoice_id: b.invoice_id ?? null,
    doc_type: b.doc_type, title: b.title, storage_path: b.storage_path ?? null,
    expires_on: b.expires_on ?? null, is_company_wide: Boolean(b.is_company_wide),
    attach_by_default: Boolean(b.attach_by_default), note: b.note ?? null, uploaded_by: email,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, document: data });
}
