'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, BarChart3 } from 'lucide-react';
import { HorizontalBarChart, DonutChart, DonutLegend, TrendAreaChart, RadialGauge, LiveSectionHeader } from '@/components/tdi-admin/hub-charts/HubCharts';
import { USChoroplethMap } from '@/components/tdi-admin/shared/USChoroplethMap';
import { getSupabase } from '@/lib/supabase';
import {
  ADMIN_TYPOGRAPHY,
  PORTAL_TOKENS,
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_SMALL,
} from '@/components/tdi-admin/ui/design-tokens';
import { FunnelCards } from '@/components/admin/cmo/FunnelCards';
import { TikTokTable } from '@/components/admin/cmo/TikTokTable';
import { SubstackTable } from '@/components/admin/cmo/SubstackTable';
import { UTMTracking } from '@/components/admin/cmo/UTMTracking';
import { RaeBrief } from '@/components/admin/cmo/RaeBrief';
import { SubscriberChart } from '@/components/admin/cmo/SubscriberChart';
import { ARRChart } from '@/components/admin/cmo/ARRChart';
import { WeeklyEntryForm } from '@/components/admin/cmo/WeeklyEntryForm';
import type {
  WeeklyMetrics,
  TikTokPost,
  SubstackPost,
  UTMTracking as UTMTrackingType,
  RaeBrief as RaeBriefType,
  SubscriberSource,
  PaidARR,
} from '@/components/admin/cmo/types';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function shiftWeek(weekStart: string, delta: number): string {
  const d = new Date(weekStart + 'T00:00');
  d.setDate(d.getDate() + 7 * delta);
  return d.toISOString().split('T')[0];
}

// Hub Intelligence section
function HubIntelligenceSection() {
  const [data, setData] = useState<{
    membershipSources: Record<string, number>;
    signupsByDay: Record<string, number>;
    topContent: { title: string; views: number }[];
    communityEngagement: { responses: number; qaThreads: number };
    stateReach: Record<string, number>;
    totalStates: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tdi-admin/hub-connections?section=cmo')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">Loading Hub data...</div>;
  if (!data) return null;

  const days = Object.entries(data.signupsByDay).sort((a, b) => a[0].localeCompare(b[0]));
  const areaData = days.map(([day, count]) => ({ label: day.slice(5), value: count }));
  const sourceEntries = Object.entries(data.membershipSources).sort((a, b) => b[1] - a[1]);
  const totalMembers = sourceEntries.reduce((s, [, c]) => s + c, 0);

  return (
    <div className="space-y-4">
      <LiveSectionHeader title="Hub Intelligence" subtitle="Live platform data powering marketing decisions" />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RadialGauge value={data.totalStates} max={50} label="" size={52} color="#2A9D8F" />
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#2A9D8F' }}>{data.totalStates}/50</p>
              <p style={{ fontSize: 10, color: '#6B7280' }}>States Reached</p>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>{data.communityEngagement.responses + data.communityEngagement.qaThreads}</p>
          <p style={{ fontSize: 10, color: '#6B7280' }}>Community Posts</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#8B5CF6' }}>{totalMembers}</p>
          <p style={{ fontSize: 10, color: '#6B7280' }}>Paid Members</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#EAB308' }}>
            {Object.entries(data.membershipSources).find(([k]) => k === 'substack_perk')?.[1] || 0}
          </p>
          <p style={{ fontSize: 10, color: '#6B7280' }}>Substack Perks</p>
        </div>
      </div>

      {/* Charts: area chart + donut + bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Signup trend area chart */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Hub Signups (30 days)</p>
          <TrendAreaChart data={areaData} height={200} color="#2A9D8F" showGrid />
        </div>

        {/* Membership source donut */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Membership Sources</p>
          {sourceEntries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <DonutChart
                data={sourceEntries.map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))}
                size={170}
                innerRadius={46}
                outerRadius={68}
                centerValue={totalMembers}
                centerLabel="total"
              />
              <div style={{ marginTop: 12, width: '100%' }}>
                <DonutLegend data={sourceEntries.map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))} />
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 24, fontSize: 12 }}>No membership data</p>
          )}
        </div>
      </div>

      {/* Top content bar chart */}
      {data.topContent.length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Top Hub Content by Views</p>
          <HorizontalBarChart
            data={data.topContent.slice(0, 8).map(c => ({
              label: c.title.length > 30 ? c.title.slice(0, 30) + '...' : c.title,
              value: c.views,
              color: '#2A9D8F',
            }))}
            valueFormatter={(v) => `${v} views`}
          />
        </div>
      )}
    </div>
  );
}

type DateRange = '14d' | '30d' | '90d' | 'all';

function getRangeStart(range: DateRange): string | null {
  if (range === 'all') return null;
  const d = new Date();
  const days = range === '14d' ? 14 : range === '30d' ? 30 : 90;
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function getRangeLabel(range: DateRange): string {
  if (range === 'all') return 'All Time';
  const end = new Date();
  const start = new Date();
  const days = range === '14d' ? 14 : range === '30d' ? 30 : 90;
  start.setDate(start.getDate() - days);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function CMODashboardPage() {
  const supabase = getSupabase();
  const [pageState, setPageState] = useState<'loading' | 'ready' | 'db_pending'>('loading');
  const [dateRange, setDateRange] = useState<DateRange>('90d');
  const [showDataEntry, setShowDataEntry] = useState(false);
  const [entryWeek, setEntryWeek] = useState(() => getWeekStart(new Date()));

  const [allMetrics, setAllMetrics] = useState<WeeklyMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<WeeklyMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<WeeklyMetrics | null>(null);
  const [tiktokPosts, setTiktokPosts] = useState<TikTokPost[]>([]);
  const [substackPosts, setSubstackPosts] = useState<SubstackPost[]>([]);
  const [utmRows, setUtmRows] = useState<UTMTrackingType[]>([]);
  const [briefs, setBriefs] = useState<RaeBriefType[]>([]);
  const [subscriberSources, setSubscriberSources] = useState<SubscriberSource[]>([]);
  const [arrData, setArrData] = useState<PaidARR[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Verify migration applied + find most recent week with data
  useEffect(() => {
    const probe = async () => {
      const { data, error } = await supabase
        .from('cmo_weekly_metrics')
        .select('week_start')
        .order('week_start', { ascending: false })
        .limit(1);
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        setPageState('db_pending');
      } else {
        setPageState('ready');
      }
    };
    probe();
  }, [supabase]);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    const rangeStart = getRangeStart(dateRange);

    // Build queries with optional date filter
    let metricsQuery = supabase.from('cmo_weekly_metrics').select('*').order('week_start', { ascending: true });
    let tiktokQuery = supabase.from('cmo_tiktok_posts').select('*').order('post_date', { ascending: false });
    let substackQuery = supabase.from('cmo_substack_posts').select('*').order('post_date', { ascending: false });
    let utmQuery = supabase.from('cmo_utm_tracking').select('*');
    let briefQuery = supabase.from('cmo_rae_brief').select('*').order('week_start', { ascending: false });

    if (rangeStart) {
      metricsQuery = metricsQuery.gte('week_start', rangeStart);
      tiktokQuery = tiktokQuery.gte('week_start', rangeStart);
      substackQuery = substackQuery.gte('week_start', rangeStart);
      utmQuery = utmQuery.gte('week_start', rangeStart);
      briefQuery = briefQuery.gte('week_start', rangeStart);
    }

    const [
      { data: metrics },
      { data: tiktok },
      { data: substack },
      { data: utm },
      { data: brief },
      { data: subSources },
      { data: arr },
    ] = await Promise.all([
      metricsQuery,
      tiktokQuery,
      substackQuery,
      utmQuery,
      briefQuery,
      supabase.from('cmo_subscriber_sources').select('*').order('month', { ascending: true }),
      supabase.from('cmo_paid_arr').select('*').order('month', { ascending: true }),
    ]);

    const allWeeks = (metrics as WeeklyMetrics[]) || [];
    setAllMetrics(allWeeks);

    // Aggregate: use the latest week's cumulative values (followers, subscribers)
    // and sum the periodic values (views, clicks, applications)
    if (allWeeks.length > 0) {
      const latest = allWeeks[allWeeks.length - 1];
      const aggregated: WeeklyMetrics = {
        ...latest,
        tiktok_views: allWeeks.reduce((s, w) => s + (w.tiktok_views || 0), 0),
        form_clicks: allWeeks.reduce((s, w) => s + (w.form_clicks || 0), 0),
        applications_received: allWeeks.reduce((s, w) => s + (w.applications_received || 0), 0),
        // Keep latest cumulative values for followers/subscribers
        tiktok_followers: latest.tiktok_followers,
        substack_subscribers: latest.substack_subscribers,
        substack_paid_subscribers: latest.substack_paid_subscribers,
        substack_arr_cents: latest.substack_arr_cents,
      };
      setCurrentMetrics(aggregated);
      // Previous = first week in range for comparison
      setPreviousMetrics(allWeeks.length > 1 ? allWeeks[0] : null);
    } else {
      setCurrentMetrics(null);
      setPreviousMetrics(null);
    }

    setTiktokPosts((tiktok as TikTokPost[]) || []);
    setSubstackPosts((substack as SubstackPost[]) || []);
    setUtmRows((utm as UTMTrackingType[]) || []);
    setBriefs((brief as RaeBriefType[]) || []);
    setSubscriberSources((subSources as SubscriberSource[]) || []);
    setArrData((arr as PaidARR[]) || []);
    setDataLoading(false);
  }, [dateRange, supabase]);

  useEffect(() => {
    if (pageState === 'ready') loadData();
  }, [pageState, loadData]);

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (pageState === 'db_pending') {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="max-w-md text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BarChart3 size={40} className="text-teal-400 mx-auto mb-4" />
          <h2 className="mb-2" style={TYPE_SECTION_HEADER}>
            CMO Dashboard — Provisioning
          </h2>
          <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
            Database migration 040 has not been applied yet. Run{' '}
            <code className="bg-gray-100 px-1 rounded text-xs font-mono">supabase/migrations/040_cmo_dashboard.sql</code>{' '}
            in the Supabase SQL editor, then refresh this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Range label computed inline

  return (
    <div style={{ background: PORTAL_TOKENS.pageBg }}>
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Section header */}
        <div style={{ marginBottom: 8 }}>
          <h1
            style={{
              ...TYPE_PAGE_TITLE,
              margin: 0,
              display: 'inline-block',
              borderBottom: '3px solid #2A9D8F',
              paddingBottom: 8,
            }}
          >
            CMO Dashboard
          </h1>
          <p style={{ ...TYPE_PAGE_SUBTITLE, marginTop: 8 }}>
            Attract → Warm → Convert · marketing funnel
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {([['14d', 'Last 14 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days'], ['all', 'All Time']] as [DateRange, string][]).map(([range, label]) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: `1.5px solid ${dateRange === range ? '#2A9D8F' : '#D1D5DB'}`,
                  background: dateRange === range ? '#2A9D8F' : 'white',
                  color: dateRange === range ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
            {dataLoading && <Loader2 size={16} className="animate-spin text-gray-400 ml-2" />}
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{getRangeLabel(dateRange)}</span>
            <button
              onClick={() => setShowDataEntry(!showDataEntry)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6,
                border: '1px solid #D1D5DB', background: showDataEntry ? '#F3F4F6' : 'white',
                color: '#374151', cursor: 'pointer',
              }}
            >
              {showDataEntry ? 'Hide Data Entry' : 'Add Data'}
            </button>
          </div>
        </div>

        {/* Data entry form (collapsible) */}
        {showDataEntry && (
          <WeeklyEntryForm weekStart={entryWeek} onSaved={loadData} supabase={supabase} />
        )}

        {/* Funnel KPI Cards */}
        <FunnelCards current={currentMetrics} previous={previousMetrics} allWeeks={allMetrics} />

        {/* Content tables */}
        <div className="grid grid-cols-1 gap-6">
          <TikTokTable posts={tiktokPosts} />
          <SubstackTable posts={substackPosts} />
        </div>

        {/* UTM Tracking */}
        <UTMTracking rows={utmRows} />

        {/* Hub Intelligence */}
        <HubIntelligenceSection />

        {/* Rae's Brief */}
        <RaeBrief briefs={briefs} />

        {/* Audience Geography */}
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={TYPE_SECTION_HEADER}>Audience Geography</div>
            <div style={{ ...TYPE_SMALL, marginTop: 2 }}>Substack subscriber distribution · 50 states, 101 countries</div>
          </div>
          <USChoroplethMap
            byState={{
              NY: { count: 605, value: 605, label: 'subscribers' },
              IL: { count: 405, value: 405, label: 'subscribers' },
              CA: { count: 380, value: 380, label: 'subscribers' },
              GA: { count: 341, value: 341, label: 'subscribers' },
              PA: { count: 301, value: 301, label: 'subscribers' },
              TX: { count: 245, value: 245, label: 'subscribers' },
              FL: { count: 220, value: 220, label: 'subscribers' },
              OH: { count: 185, value: 185, label: 'subscribers' },
              NC: { count: 165, value: 165, label: 'subscribers' },
              VA: { count: 148, value: 148, label: 'subscribers' },
              MI: { count: 132, value: 132, label: 'subscribers' },
              NJ: { count: 128, value: 128, label: 'subscribers' },
              MA: { count: 115, value: 115, label: 'subscribers' },
              IN: { count: 108, value: 108, label: 'subscribers' },
              WI: { count: 95, value: 95, label: 'subscribers' },
              MN: { count: 88, value: 88, label: 'subscribers' },
              CO: { count: 82, value: 82, label: 'subscribers' },
              MD: { count: 78, value: 78, label: 'subscribers' },
              WA: { count: 72, value: 72, label: 'subscribers' },
              MO: { count: 68, value: 68, label: 'subscribers' },
            }}
            valueLabel="subscribers"
            accentColor="#2A9D8F"
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <SubscriberChart data={subscriberSources} />
          <ARRChart data={arrData} />
        </div>
      </div>
    </div>
  );
}
