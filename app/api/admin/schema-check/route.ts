import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Check and report on database schema.
 * Note: ALTER TABLE must be run via Supabase Dashboard SQL Editor.
 */
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

    const results: Record<string, unknown> = {};

    // Check creators table columns
    const { data: creatorsData, error: creatorsError } = await supabase
      .from('creators')
      .select('id, content_path')
      .limit(1);

    results.creators = {
      hasContentPath: !creatorsError,
      error: creatorsError?.message,
      sample: creatorsData?.[0],
    };

    // Check creator_milestones columns
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('creator_milestones')
      .select('id, creator_id, milestone_id, status, metadata, submission_data')
      .limit(1);

    // If submission_data doesn't exist, the query will fail
    const hasSubmissionData = !milestonesError || !milestonesError.message.includes('submission_data');

    results.creator_milestones = {
      hasSubmissionData,
      error: milestonesError?.message,
      sample: milestonesData?.[0],
    };

    // If columns are missing, provide the SQL
    const missingColumns: string[] = [];

    if (creatorsError?.message?.includes('content_path')) {
      missingColumns.push('creators.content_path');
    }

    if (milestonesError?.message?.includes('submission_data')) {
      missingColumns.push('creator_milestones.submission_data');
    }

    const sql = missingColumns.length > 0 ? `
-- Run this SQL in Supabase Dashboard > SQL Editor:

${missingColumns.includes('creators.content_path') ? `
-- Add content_path to creators table
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS content_path TEXT
CHECK (content_path IN ('blog', 'download', 'course'));
` : ''}

${missingColumns.includes('creator_milestones.submission_data') ? `
-- Add submission_data to creator_milestones table
ALTER TABLE creator_milestones
ADD COLUMN IF NOT EXISTS submission_data JSONB;
` : ''}
    `.trim() : null;

    return NextResponse.json({
      success: true,
      results,
      missingColumns,
      sql,
      message: missingColumns.length === 0
        ? 'All required columns exist!'
        : `Missing columns: ${missingColumns.join(', ')}. Run the provided SQL in Supabase Dashboard.`,
    });
  } catch (error) {
    console.error('[schema-check] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
