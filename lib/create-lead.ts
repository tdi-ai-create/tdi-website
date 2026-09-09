// ---------------------------------------------------------------------------
// One way a lead gets into the CRM.
//
// Extracted from app/api/leads/create so a second entry point (the sample
// packet form on /for-schools) writes the same row shape into the same table
// and fires the same enrichment. Two hand-written inserts against
// sales_opportunities would drift, and the second one would quietly stop
// matching what the pipeline expects.
// ---------------------------------------------------------------------------

import { getServiceSupabase } from '@/lib/supabase';
import type { CreateLeadInput } from '@/types/leads';

export interface InsertLeadResult {
  lead: { id: string } | null;
  error: string | null;
}

/**
 * Write a lead into sales_opportunities.
 *
 * Only columns confirmed in the production schema are set. contact_role has no
 * column yet, so it is folded into notes rather than dropped.
 */
export async function insertLead(input: CreateLeadInput): Promise<InsertLeadResult> {
  // getServiceSupabase throws when the environment is missing its keys. A
  // caller that wants to keep serving the visitor after a failed write cannot
  // do that if this function throws instead of returning, so the throw is
  // converted here rather than at every call site.
  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Supabase is not configured';
    console.error('Lead insert could not start:', message);
    return { lead: null, error: message };
  }

  const noteParts: string[] = [];
  if (input.contact_role) noteParts.push(`Role: ${input.contact_role}`);
  if (input.notes) noteParts.push(input.notes);
  const combinedNotes = noteParts.length > 0 ? noteParts.join('\n') : null;

  const insertData: Record<string, unknown> = {
    name: input.district_name,
    contact_name: input.contact_name || null,
    contact_email: input.contact_email || null,
    contact_phone: input.contact_phone || null,
    source: input.source,
    value: input.estimated_deal_size || null,
    heat: input.initial_heat || 'warm',
    notes: combinedNotes,
    stage: input.stage || 'qualified',
    type: 'new_business',
    school_year: '2026-27',
    assigned_to_email: input.assigned_to_email || 'rae@teachersdeserveit.com',
    partnership_status: input.partnership_status || 'prospect',
  };

  if (input.state_code) insertData.state = input.state_code;

  try {
    const { data: lead, error } = await supabase
      .from('sales_opportunities')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Lead insert failed:', error);
      return { lead: null, error: error.message };
    }

    return { lead, error: null };
  } catch (err) {
    // A network failure reaching Supabase looks nothing like a rejected row,
    // and it used to surface as an unhandled throw.
    const message = err instanceof Error ? err.message : 'Lead insert failed';
    console.error('Lead insert threw:', message);
    return { lead: null, error: message };
  }
}

/**
 * Kick off enrichment. Deliberately not awaited by callers: a lead that lands
 * in the CRM without enrichment is still a lead, and the visitor should not
 * wait on it.
 */
export function triggerEnrichment(leadId: string, baseUrl: string): void {
  fetch(`${baseUrl}/api/leads/enrich`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lead_id: leadId }),
  }).catch((err) => {
    console.error('Enrichment trigger failed (non-blocking):', err);
  });
}
