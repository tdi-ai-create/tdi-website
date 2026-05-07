import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { enrichLead, calculateTotalScore } from '@/lib/leadEnrichment';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { lead_id } = await req.json();

  if (!lead_id) {
    return NextResponse.json({ error: 'lead_id required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Fetch the lead
  const { data: lead, error: fetchErr } = await supabase
    .from('sales_opportunities')
    .select('*')
    .eq('id', lead_id)
    .single();

  if (fetchErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  // Create job record
  const { data: job } = await supabase
    .from('lead_enrichment_jobs')
    .insert({
      lead_id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Mark lead as in_progress
  await supabase
    .from('sales_opportunities')
    .update({ enrichment_status: 'in_progress' })
    .eq('id', lead_id);

  const startTime = Date.now();

  // Run enrichment
  const result = await enrichLead({
    district_name: lead.name,
    contact_name: lead.contact_name,
    contact_role: lead.contact_role,
    source: lead.source,
    state_code: lead.state_code,
    notes: lead.notes,
  });

  const duration = Date.now() - startTime;

  if (!result.success || !result.data) {
    await supabase
      .from('sales_opportunities')
      .update({
        enrichment_status: 'failed',
        enrichment_error: result.error || 'Unknown error',
      })
      .eq('id', lead_id);

    if (job) {
      await supabase
        .from('lead_enrichment_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          error_message: result.error,
          raw_response: result.rawResponse,
        })
        .eq('id', job.id);
    }

    return NextResponse.json(
      { error: 'Enrichment failed', details: result.error },
      { status: 500 }
    );
  }

  const totalScore = calculateTotalScore(result.data.scoring);

  const { error: updateErr } = await supabase
    .from('sales_opportunities')
    .update({
      enrichment_status: 'complete',
      enrichment_data: result.data,
      ai_strategic_brief: result.data.strategic_brief,
      lead_score: totalScore,
      score_breakdown: result.data.scoring,
      enriched_at: new Date().toISOString(),
      enrichment_error: null,
    })
    .eq('id', lead_id);

  if (updateErr) {
    console.error('Failed to write enrichment back:', updateErr);
  }

  if (job) {
    await supabase
      .from('lead_enrichment_jobs')
      .update({
        status: 'complete',
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        raw_response: {
          model: 'claude-sonnet-4-20250514',
          enrichment: result.data,
        },
      })
      .eq('id', job.id);
  }

  return NextResponse.json({
    success: true,
    lead_id,
    score: totalScore,
    duration_ms: duration,
  });
}
