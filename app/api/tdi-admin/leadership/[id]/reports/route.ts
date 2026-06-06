import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getHubSupabase() {
  const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!hubUrl || !hubKey) return null;
  return createClient(hubUrl, hubKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

type ReportType = 'roster' | 'board_summary' | 'kpi_standings' | 'engagement' | 'courses' | 'wellness' | 'observations' | 'full_export';

/**
 * GET /api/tdi-admin/leadership/[id]/reports?type=roster
 *
 * Generates export data for different report types.
 * Returns JSON that the frontend can render as CSV, PDF, or display.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id: partnershipId } = await params;
  const reportType = (request.nextUrl.searchParams.get('type') || 'roster') as ReportType;

  const supabase = getSupabaseAdmin();
  const hubSupabase = getHubSupabase();

  // Get partnership details
  const { data: partnership } = await supabase
    .from('partnerships')
    .select('*')
    .eq('id', partnershipId)
    .single();

  if (!partnership) {
    return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
  }

  // Get organization name
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('partnership_id', partnershipId)
    .limit(1)
    .single();

  const orgName = org?.name || partnership.contact_name;

  try {
    switch (reportType) {
      case 'roster': {
        const { data: staff } = await supabase
          .from('staff_members')
          .select('first_name, last_name, email, role_title, hub_enrolled, hub_login_date, created_at')
          .eq('partnership_id', partnershipId)
          .order('last_name');

        const hasData = staff && staff.length > 0;
        return NextResponse.json({
          reportType: 'roster',
          title: `Staff Roster: ${orgName}`,
          hasData,
          data: staff || [],
          columns: ['First Name', 'Last Name', 'Email', 'Role', 'Hub Access', 'Last Login', 'Added'],
          rowCount: staff?.length || 0,
          emptyMessage: 'No staff roster uploaded yet.',
          emptyAction: 'Ask your principal to upload their staff roster from the dashboard, or upload it yourself from the admin portal.',
          emailSubject: `${orgName}: Staff Roster Request`,
          emailBody: `Hi,\n\nWe're setting up your TDI Learning Hub access and need your staff roster to create accounts.\n\nCould you send us a list with: First Name, Last Name, Email, and Role for each staff member?\n\nA simple spreadsheet or CSV works great.\n\nThanks!\nThe TDI Team`,
        });
      }

      case 'board_summary': {
        // Gather all data for an AI-generated board summary
        const { data: staff } = await supabase
          .from('staff_members')
          .select('hub_enrolled, hub_login_date')
          .eq('partnership_id', partnershipId);

        const { data: kpis } = await supabase
          .from('partnership_kpis')
          .select('*')
          .eq('partnership_id', partnershipId)
          .eq('status', 'active');

        const { data: actionItems } = await supabase
          .from('action_items')
          .select('status')
          .eq('partnership_id', partnershipId);

        const totalStaff = staff?.length || 0;
        const hubLogins = staff?.filter(s => s.hub_login_date).length || 0;
        const loginPct = totalStaff > 0 ? Math.round((hubLogins / totalStaff) * 100) : 0;
        const completedItems = actionItems?.filter(a => a.status === 'completed').length || 0;
        const totalItems = actionItems?.length || 0;

        const hasData = totalStaff > 0 || (kpis && kpis.length > 0);

        return NextResponse.json({
          reportType: 'board_summary',
          title: `Board Summary: ${orgName}`,
          hasData,
          data: {
            orgName,
            phase: partnership.contract_phase,
            contractStart: partnership.contract_start,
            contractEnd: partnership.contract_end,
            totalStaff,
            hubLogins,
            loginPct,
            completedItems,
            totalItems,
            kpis: kpis || [],
            observationDaysUsed: partnership.observation_days_used || 0,
            observationDaysTotal: partnership.observation_days_total || 0,
            virtualSessionsUsed: partnership.virtual_sessions_used || 0,
            virtualSessionsTotal: partnership.virtual_sessions_total || 0,
          },
          emptyMessage: 'Not enough data for a board summary yet. The partnership needs active staff and at least one KPI set.',
          emptyAction: 'Set KPIs on the Internal tab and ensure staff are enrolled in the Hub.',
          emailSubject: `${orgName}: Board Presentation Data`,
          emailBody: `Hi,\n\nI'm preparing data for a board presentation on our TDI partnership and would love to include some additional context.\n\nCould you share:\n- Any specific outcomes or quotes from your teachers\n- Board priorities this year that TDI aligns with\n- Any data points your board finds most compelling\n\nWe'll put together a summary you can present directly.\n\nThanks!\nThe TDI Team`,
        });
      }

      case 'kpi_standings': {
        const { data: kpis } = await supabase
          .from('partnership_kpis')
          .select('*')
          .eq('partnership_id', partnershipId)
          .order('sort_order');

        const hasData = kpis && kpis.length > 0;
        return NextResponse.json({
          reportType: 'kpi_standings',
          title: `KPI Standings: ${orgName}`,
          hasData,
          data: kpis || [],
          columns: ['KPI', 'Target', 'Current', 'Status', 'How TDI Delivers', 'Data Source'],
          rowCount: kpis?.length || 0,
          emptyMessage: 'No KPIs set for this partnership yet.',
          emptyAction: 'Go to the Internal tab and select 3-5 KPIs from the curated menu.',
        });
      }

      case 'engagement': {
        // Pull Hub engagement data
        let hubData = null;
        if (hubSupabase) {
          try {
            const { data } = await hubSupabase
              .from('hub_activity_log')
              .select('user_id, action, created_at')
              .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
              .limit(5000);
            hubData = data;
          } catch {}
        }

        const { data: staff } = await supabase
          .from('staff_members')
          .select('email, hub_enrolled, hub_login_date, first_name, last_name')
          .eq('partnership_id', partnershipId)
          .order('last_name');

        const hasData = (staff && staff.length > 0) || (hubData && hubData.length > 0);

        return NextResponse.json({
          reportType: 'engagement',
          title: `Hub Engagement: ${orgName}`,
          hasData,
          data: {
            staff: staff || [],
            activityCount: hubData?.length || 0,
            staffCount: staff?.length || 0,
            enrolledCount: staff?.filter(s => s.hub_enrolled).length || 0,
            loggedInCount: staff?.filter(s => s.hub_login_date).length || 0,
          },
          emptyMessage: 'No Hub engagement data available yet.',
          emptyAction: 'Ensure staff have Hub accounts and have been encouraged to log in.',
          emailSubject: `${orgName}: Hub Engagement Check-In`,
          emailBody: `Hi,\n\nI wanted to check in on Hub engagement for your team.\n\nWe're seeing some great data points and would love to share a quick update. Would you have 10 minutes this week?\n\nAlso, if there are staff members who haven't logged in yet, we can help re-engage them through your staff champion.\n\nThanks!\nThe TDI Team`,
        });
      }

      case 'courses': {
        let courseData = null;
        if (hubSupabase) {
          try {
            const { data } = await hubSupabase
              .from('hub_enrollments')
              .select('user_email, course_title, status, completed_at, enrolled_at')
              .limit(2000);
            courseData = data;
          } catch {}
        }

        const hasData = courseData && courseData.length > 0;

        return NextResponse.json({
          reportType: 'courses',
          title: `Course Completions: ${orgName}`,
          hasData,
          data: courseData || [],
          columns: ['Educator', 'Course', 'Status', 'Enrolled', 'Completed'],
          rowCount: courseData?.length || 0,
          emptyMessage: 'No course enrollment data available yet.',
          emptyAction: 'Courses are completed through the Hub. Encourage your team to explore the course library.',
        });
      }

      case 'wellness': {
        // Anonymized wellness summary (never individual names)
        let vibeData = null;
        if (hubSupabase) {
          try {
            const { data } = await hubSupabase
              .from('hub_activity_log')
              .select('metadata, created_at')
              .eq('action', 'wellbeing_check')
              .gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString())
              .limit(5000);
            vibeData = data;
          } catch {}
        }

        const scores = (vibeData || []).map((v: { metadata: { score?: number } }) => v.metadata?.score).filter(Boolean) as number[];
        const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
        const hasData = scores.length > 0;

        return NextResponse.json({
          reportType: 'wellness',
          title: `Wellness Summary: ${orgName} (Anonymized)`,
          hasData,
          data: {
            totalCheckIns: scores.length,
            avgScore,
            distribution: {
              excellent: scores.filter(s => s >= 4.5).length,
              good: scores.filter(s => s >= 3.5 && s < 4.5).length,
              moderate: scores.filter(s => s >= 2.5 && s < 3.5).length,
              struggling: scores.filter(s => s < 2.5).length,
            },
          },
          note: 'Individual educator names are never included in wellness reports. This data is anonymized and aggregated.',
          emptyMessage: 'No wellness data available yet. Vibe Check data begins populating once educators use the Hub regularly.',
          emptyAction: 'Encourage staff to do their daily Vibe Check on the Hub. It takes 10 seconds and is completely private.',
        });
      }

      case 'full_export': {
        // Everything in one export
        const { data: staff } = await supabase.from('staff_members').select('*').eq('partnership_id', partnershipId).order('last_name');
        const { data: kpis } = await supabase.from('partnership_kpis').select('*').eq('partnership_id', partnershipId).eq('status', 'active');
        const { data: actionItems } = await supabase.from('action_items').select('*').eq('partnership_id', partnershipId).order('sort_order');
        const { data: notes } = await supabase.from('partnership_notes').select('*').eq('partnership_id', partnershipId).order('created_at', { ascending: false });
        const { data: meetings } = await supabase.from('partnership_meetings').select('*').eq('partnership_id', partnershipId).order('meeting_date', { ascending: false });
        const { data: timeline } = await supabase.from('timeline_events').select('*').eq('partnership_id', partnershipId).order('event_date');

        return NextResponse.json({
          reportType: 'full_export',
          title: `Full Partnership Export: ${orgName}`,
          hasData: true,
          data: {
            partnership,
            organization: org,
            staff: staff || [],
            kpis: kpis || [],
            actionItems: actionItems || [],
            notes: notes || [],
            meetings: meetings || [],
            timeline: timeline || [],
          },
          generatedAt: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[reports] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
