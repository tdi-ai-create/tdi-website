import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface SurveyResponse {
  stress_level: number | null;
  planning_hours: number | null;
  retention_intent: number | null;
  implementation_confidence: number | null;
  feeling_valued: number | null;
}

// POST - Aggregate survey data into metric snapshots
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { partnership_id, survey_type } = body;

    if (!partnership_id || !survey_type) {
      return NextResponse.json(
        { success: false, error: 'partnership_id and survey_type are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Query all responses for this partnership + survey type
    const { data: responses, error: fetchError } = await supabase
      .from('survey_responses')
      .select('stress_level, planning_hours, retention_intent, implementation_confidence, feeling_valued')
      .eq('partnership_id', partnership_id)
      .eq('survey_type', survey_type);

    if (fetchError) {
      console.error('Error fetching survey responses:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch survey responses' },
        { status: 500 }
      );
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No survey responses found for aggregation',
        metricsCreated: 0,
      });
    }

    // Calculate averages
    const avg = (field: keyof SurveyResponse): number | null => {
      const values = responses
        .filter((r) => r[field] != null)
        .map((r) => Number(r[field]));
      return values.length > 0
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
        : null;
    };

    const metrics = [
      { name: 'avg_stress', value: avg('stress_level') },
      { name: 'avg_planning_hours', value: avg('planning_hours') },
      { name: 'avg_retention_intent', value: avg('retention_intent') },
      { name: 'avg_implementation_confidence', value: avg('implementation_confidence') },
      { name: 'avg_feeling_valued', value: avg('feeling_valued') },
    ];

    // Insert metric snapshots for each non-null average
    const today = new Date().toISOString().split('T')[0];
    let metricsCreated = 0;

    for (const metric of metrics) {
      if (metric.value !== null) {
        // Check if a snapshot already exists for today
        const { data: existing } = await supabase
          .from('metric_snapshots')
          .select('id')
          .eq('partnership_id', partnership_id)
          .eq('metric_name', metric.name)
          .eq('snapshot_date', today)
          .eq('source', 'survey')
          .maybeSingle();

        if (existing) {
          // Update existing snapshot
          await supabase
            .from('metric_snapshots')
            .update({ metric_value: metric.value })
            .eq('id', existing.id);
        } else {
          // Insert new snapshot
          await supabase.from('metric_snapshots').insert({
            partnership_id,
            metric_name: metric.name,
            metric_value: metric.value,
            snapshot_date: today,
            source: 'survey',
          });
        }
        metricsCreated++;
      }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id,
      action: 'survey_data_aggregated',
      details: {
        survey_type,
        response_count: responses.length,
        averages: Object.fromEntries(
          metrics.filter((m) => m.value !== null).map((m) => [m.name, m.value])
        ),
        aggregated_by: email,
      },
    });

    return NextResponse.json({
      success: true,
      metricsCreated,
      responseCount: responses.length,
      averages: Object.fromEntries(
        metrics.filter((m) => m.value !== null).map((m) => [m.name, m.value])
      ),
    });
  } catch (error) {
    console.error('Error in POST /api/admin/surveys/aggregate:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
