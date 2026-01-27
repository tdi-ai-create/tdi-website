import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('[run-migration] Starting migration...');

    const results: { step: string; success: boolean; error?: string; data?: unknown }[] = [];

    // Step 1: Check if columns exist, if not they need to be added via Supabase dashboard
    const { data: columns, error: columnsError } = await supabase
      .from('milestones')
      .select('id, action_type, action_config')
      .limit(1);

    if (columnsError && columnsError.message.includes('action_type')) {
      return NextResponse.json({
        success: false,
        error: 'Columns do not exist. Please run this SQL in Supabase Dashboard first:',
        sql: `
ALTER TABLE milestones
ADD COLUMN IF NOT EXISTS action_type TEXT,
ADD COLUMN IF NOT EXISTS action_config JSONB;
        `.trim(),
      });
    }

    // Step 2: Set sign_agreement for the agreement milestone (opens in new tab)
    const { error: agreementError } = await supabase
      .from('milestones')
      .update({
        action_type: 'sign_agreement',
        action_config: { label: 'Review & Sign Agreement' },
      })
      .eq('id', 'agreement_sign');

    results.push({
      step: 'Set sign_agreement for agreement_sign',
      success: !agreementError,
      error: agreementError?.message,
    });

    // Step 3: Set calendly action for booking milestones
    const calendlyMilestones = [
      { id: 'rae_meeting_scheduled', label: 'Book Kickoff Meeting' },
      { id: 'outline_meeting_scheduled', label: 'Book Outline Review' },
      { id: 'final_outline_meeting_scheduled', label: 'Book Final Review' },
    ];

    for (const m of calendlyMilestones) {
      const { error } = await supabase
        .from('milestones')
        .update({
          action_type: 'calendly',
          action_config: {
            url: 'https://calendly.com/rae-teachersdeserveit/creator-chat',
            label: m.label,
          },
        })
        .eq('id', m.id);

      results.push({
        step: `Set calendly for ${m.id}`,
        success: !error,
        error: error?.message,
      });
    }

    // Step 4: Set 'confirm' action for non-team-action milestones (excluding those already set)
    const { data: nonTeamMilestones } = await supabase
      .from('milestones')
      .select('id, name')
      .eq('requires_team_action', false)
      .is('action_type', null);

    if (nonTeamMilestones) {
      for (const m of nonTeamMilestones) {
        const { error } = await supabase
          .from('milestones')
          .update({
            action_type: 'confirm',
            action_config: { label: 'Mark Complete' },
          })
          .eq('id', m.id);

        results.push({
          step: `Set confirm for ${m.id}`,
          success: !error,
          error: error?.message,
        });
      }
    }

    // Step 5: Set 'team_action' for team-action milestones
    const { data: teamMilestones } = await supabase
      .from('milestones')
      .select('id, name')
      .eq('requires_team_action', true)
      .is('action_type', null);

    if (teamMilestones) {
      for (const m of teamMilestones) {
        const { error } = await supabase
          .from('milestones')
          .update({
            action_type: 'team_action',
            action_config: { label: 'Waiting on TDI Team' },
          })
          .eq('id', m.id);

        results.push({
          step: `Set team_action for ${m.id}`,
          success: !error,
          error: error?.message,
        });
      }
    }

    // Step 6: Get all milestones to verify
    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('id, name, phase_id, action_type, action_config, requires_team_action')
      .order('phase_id')
      .order('sort_order');

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('[run-migration] Complete:', { successCount, failCount });

    return NextResponse.json({
      success: true,
      message: `Migration complete: ${successCount} succeeded, ${failCount} failed`,
      results,
      milestones: allMilestones,
    });
  } catch (error) {
    console.error('[run-migration] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
