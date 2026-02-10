// Metric snapshot utilities for TDI Partnership Dashboards
import { SupabaseClient } from '@supabase/supabase-js';

export async function recordMetric(
  supabase: SupabaseClient,
  partnershipId: string,
  metricName: string,
  value: number,
  source: string = 'manual',
  buildingId?: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Upsert: if a snapshot exists for this metric + date, update it
  const query = supabase
    .from('metric_snapshots')
    .select('id')
    .eq('partnership_id', partnershipId)
    .eq('metric_name', metricName)
    .eq('snapshot_date', today);

  if (buildingId) {
    query.eq('building_id', buildingId);
  } else {
    query.is('building_id', null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    await supabase
      .from('metric_snapshots')
      .update({ metric_value: value, source })
      .eq('id', existing.id);
  } else {
    await supabase.from('metric_snapshots').insert({
      partnership_id: partnershipId,
      building_id: buildingId || null,
      metric_name: metricName,
      metric_value: value,
      snapshot_date: today,
      source,
    });
  }
}

export async function getLatestMetric(
  supabase: SupabaseClient,
  partnershipId: string,
  metricName: string,
  buildingId?: string
): Promise<number | null> {
  const query = supabase
    .from('metric_snapshots')
    .select('metric_value')
    .eq('partnership_id', partnershipId)
    .eq('metric_name', metricName)
    .order('snapshot_date', { ascending: false })
    .limit(1);

  if (buildingId) {
    query.eq('building_id', buildingId);
  } else {
    query.is('building_id', null);
  }

  const { data } = await query.single();
  return data?.metric_value ?? null;
}

export async function getMetricHistory(
  supabase: SupabaseClient,
  partnershipId: string,
  metricName: string
): Promise<Array<{ date: string; value: number }>> {
  const { data } = await supabase
    .from('metric_snapshots')
    .select('snapshot_date, metric_value')
    .eq('partnership_id', partnershipId)
    .eq('metric_name', metricName)
    .is('building_id', null)
    .order('snapshot_date', { ascending: true });

  return (data || []).map((d) => ({
    date: d.snapshot_date,
    value: d.metric_value,
  }));
}

export async function getMetricChange(
  supabase: SupabaseClient,
  partnershipId: string,
  metricName: string
): Promise<{ baseline: number | null; current: number | null; change: number | null }> {
  const { data } = await supabase
    .from('metric_snapshots')
    .select('snapshot_date, metric_value')
    .eq('partnership_id', partnershipId)
    .eq('metric_name', metricName)
    .is('building_id', null)
    .order('snapshot_date', { ascending: true });

  if (!data || data.length === 0) {
    return { baseline: null, current: null, change: null };
  }

  const baseline = data[0]?.metric_value ?? null;
  const current = data[data.length - 1]?.metric_value ?? null;

  if (baseline === null || current === null) {
    return { baseline, current, change: null };
  }

  const change = baseline !== 0 ? ((current - baseline) / baseline) * 100 : 0;

  return { baseline, current, change };
}
