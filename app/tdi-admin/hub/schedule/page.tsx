'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDateOnly } from '@/lib/format-date';

/**
 * The Hub release calendar.
 *
 * Shows which Quick Wins are due to go live on which weekday, at most three a
 * day. Everything here reads and writes through /api/tdi-admin/hub-schedule,
 * which imports the same cap and weekday rules the scheduler uses, so this page
 * cannot put the calendar into a state the daily job would not accept.
 *
 * There is no publish button. Publishing happens in exactly two places: Julie's
 * existing action, and the daily job. Adding a third path here would be the
 * quickest way to end up with content live that nothing checked.
 */

type Item = {
  id: string;
  slug: string | null;
  title: string | null;
  category: string | null;
  lift: string | null;
  quick_win_type: string | null;
  is_published: boolean;
  status: string | null;
  scheduled_publish_date: string;
  scheduled_by: string | null;
  reviewed_by: string | null;
};

type QueueItem = {
  id: string;
  channel: string;
  content_type: string | null;
  title: string | null;
  status: string;
  owner: string | null;
  approver: string | null;
  audience_tag: string | null;
  scheduled_for: string | null;
  artifact_rendered_at: string | null;
  published_at: string | null;
  published_url: string | null;
  approved_at: string | null;
  verified_at: string | null;
  calendar_day?: string | null;
};

// One colour per channel, so a month reads as a shape before it reads as a list.
const CHANNEL: Record<string, { label: string; dot: string; bg: string }> = {
  hub:          { label: 'Hub',      dot: '#2F6FB5', bg: '#E6EEF8' },
  substack:     { label: 'Substack', dot: '#B75B2A', bg: '#F8EBE3' },
  instagram:    { label: 'Instagram',dot: '#A83A68', bg: '#F8E7EE' },
  video_script: { label: 'Video',    dot: '#22766A', bg: '#E0F0ED' },
  email:        { label: 'Email',    dot: '#63549C', bg: '#EDEAF7' },
};
const channelOf = (c: string) => CHANNEL[c] ?? { label: c, dot: '#8A94A2', bg: '#F1F3F5' };

// Who a state waits on, phrased for a person rather than a state machine.
const WAITING: Record<string, string> = {
  brief: 'not written yet',
  drafting: 'being written',
  pending_qa: 'with Julie',
  pending_creative: 'with Lily',
  pending_editorial: 'with Olivia',
  pending_approval: 'waiting on approval',
  approved: 'approved',
  scheduled: 'scheduled',
  published: 'published',
  verified: 'live and checked',
  changes_requested: 'sent back',
};

type Payload = {
  month: string;
  today_ct: string;
  cap_per_day: number;
  waiting_for_a_slot: number;
  overdue: number;
  items: Item[];
  queued: QueueItem[];
  unscheduled: QueueItem[];
  stalled: QueueItem[];
  horizons: {
    social: { target: number; planned: number };
    substack: { target: number; planned: number };
  };
};

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function monthShift(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default function HubSchedulePage() {
  const [month, setMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tdi-admin/hub-schedule?month=${m}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load the schedule');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the schedule');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  async function act(id: string, action: 'move' | 'unschedule', date?: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch('/api/tdi-admin/hub-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id, date }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'That did not work');
      await load(month);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not work');
    } finally {
      setBusy(null);
    }
  }

  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const leading = first.getUTCDay();

  const byDate = new Map<string, Item[]>();
  for (const it of data?.items ?? []) {
    const list = byDate.get(it.scheduled_publish_date) ?? [];
    list.push(it);
    byDate.set(it.scheduled_publish_date, list);
  }

  const queueByDate = new Map<string, QueueItem[]>();
  for (const q of data?.queued ?? []) {
    const day = q.calendar_day ?? q.scheduled_for;
    if (!day) continue;
    const list = queueByDate.get(day) ?? [];
    list.push(q);
    queueByDate.set(day, list);
  }

  const cells: Array<{ iso: string | null; day: number | null }> = [];
  for (let i = 0; i < leading; i++) cells.push({ iso: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ iso: ymd(y, m, d), day: d });
  while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });

  const cap = data?.cap_per_day ?? 3;
  const today = data?.today_ct ?? '';

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-[#1e2749]">Content calendar</h1>
        <Link href="/tdi-admin/hub" className="text-sm text-[#5B6B8C] hover:underline">
          Back to Hub
        </Link>
      </div>
      <p className="text-sm text-[#6B7684] mb-5 max-w-[70ch]">
        Every channel on one surface. Hub tools take the next open weekday, at most {cap} a day.
        Planned work sits on the day it is planned for; work that went out sits on the day it went out,
        greyed, with a tick once someone has confirmed it is really live. Nothing publishes by pressing
        something on this page.
      </p>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <button onClick={() => setMonth(monthShift(month, -1))}
          className="px-3 py-1.5 text-sm border border-[#D8DDE3] rounded hover:bg-[#F4F6F8]">
          Previous
        </button>
        <span className="font-semibold text-[#1e2749] min-w-[140px] text-center">
          {new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
        </span>
        <button onClick={() => setMonth(monthShift(month, 1))}
          className="px-3 py-1.5 text-sm border border-[#D8DDE3] rounded hover:bg-[#F4F6F8]">
          Next
        </button>

        {data && (
          <div className="flex gap-4 ml-auto text-sm">
            <span className="text-[#6B7684]">
              <strong className="text-[#1e2749]">{data.waiting_for_a_slot}</strong> waiting for a slot
            </span>
            <span className={data.overdue > 0 ? 'text-[#9E3B3B] font-semibold' : 'text-[#6B7684]'}>
              <strong>{data.overdue}</strong> overdue
            </span>
          </div>
        )}
      </div>

      {data && data.overdue > 0 && (
        <div className="mb-4 p-3 rounded border border-[#9E3B3B] bg-[#F8E7E6] text-sm text-[#1e2749]">
          <strong>{data.overdue}</strong> item{data.overdue === 1 ? '' : 's'} passed a scheduled day and
          did not go live. That usually means the daily publisher is not running, not that the content
          is wrong.
        </div>
      )}

      {!loading && data && data.stalled.length > 0 && (
        <div className="mb-4 p-3 rounded border border-[#96631A] bg-[#F8F0DF] text-sm text-[#1e2749]">
          <strong>{data.stalled.length}</strong> approved
          {data.stalled.length === 1 ? ' piece has' : ' pieces have'} been sitting for more than three
          days without going out. Approval is not publication: a person posts Substack, Zara puts social
          into Buffer, and either can be missed.
          <div className="mt-2 flex flex-wrap gap-2">
            {data.stalled.map(q => (
              <span key={q.id} className="text-[11px] bg-white border border-[#E3D4B0] rounded px-2 py-1">
                {q.title || '(untitled)'} · {channelOf(q.channel).label}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded border border-[#9E3B3B] bg-[#F8E7E6] text-sm">{error}</div>
      )}

      {loading && <p className="text-sm text-[#6B7684]">Loading…</p>}

      {!loading && data && (
        <div className="border border-[#D8DDE3] rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-7 bg-[#F4F6F8] border-b border-[#D8DDE3]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="px-2 py-2 text-[11px] uppercase tracking-wider text-[#6B7684]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const items = c.iso ? byDate.get(c.iso) ?? [] : [];
              const dow = i % 7;
              const weekend = dow === 0 || dow === 6;
              const isToday = c.iso === today;
              const full = items.length >= cap;
              return (
                <div key={i}
                  className={[
                    'min-h-[112px] border-r border-b border-[#E9ECF0] p-1.5 flex flex-col gap-1',
                    !c.iso ? 'bg-[#F4F6F8]' : weekend ? 'bg-[#F4F6F8]' : 'bg-white',
                    isToday ? 'ring-2 ring-inset ring-[#2F5C9E]' : '',
                  ].join(' ')}
                >
                  {c.day && (
                    <div className="flex items-center justify-between text-[11px] text-[#6B7684]">
                      <span className={isToday ? 'font-bold text-[#2F5C9E]' : ''}>{c.day}</span>
                      {!weekend && (
                        <span className={full ? 'text-[#96631A]' : 'text-[#9AA4B0]'}
                          title="Hub tools placed on this day, against the daily cap. Marketing content is not capped.">
                          {items.length}/{cap} Hub
                        </span>
                      )}
                    </div>
                  )}
                  {items.map(it => (
                    <div key={it.id}
                      className={[
                        'rounded px-1.5 py-1 text-[11px] leading-tight border-l-[3px]',
                        it.is_published
                          ? 'bg-[#F4F6F8] border-l-[#9AA4B0] text-[#6B7684]'
                          : c.iso && c.iso < today
                            ? 'bg-[#F8E7E6] border-l-[#9E3B3B] text-[#1e2749]'
                            : 'bg-[#E6EEF8] border-l-[#2F6FB5] text-[#1e2749]',
                      ].join(' ')}
                    >
                      <div className="font-semibold">{it.title || it.slug}</div>
                      <div className="text-[10px] text-[#6B7684] mt-0.5">
                        {it.is_published ? 'live' : 'scheduled'}
                        {it.category ? ` · ${it.category}` : ''}
                      </div>
                      {!it.is_published && (
                        <div className="flex gap-2 mt-1">
                          <button
                            disabled={busy === it.id}
                            onClick={() => {
                              const d = window.prompt('Move to which day? YYYY-MM-DD', it.scheduled_publish_date);
                              if (d) act(it.id, 'move', d);
                            }}
                            className="text-[10px] text-[#2F5C9E] hover:underline disabled:opacity-40"
                          >
                            Move
                          </button>
                          <button
                            disabled={busy === it.id}
                            onClick={() => act(it.id, 'unschedule')}
                            className="text-[10px] text-[#9E3B3B] hover:underline disabled:opacity-40"
                          >
                            Take off
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {(c.iso ? queueByDate.get(c.iso) ?? [] : []).map(q => {
                    const ch = channelOf(q.channel);
                    // An unwritten brief is drawn as an outline: no fill, dashed
                    // edge. Kristin has to be able to tell a placeholder from a
                    // finished piece at a glance, without reading either one.
                    const unwritten = q.status === 'brief' || q.status === 'drafting';
                    // Finished work is stated, not planned. It reads quieter and
                    // carries a mark, so a month shows what went out at a glance.
                    const done = q.status === 'published' || q.status === 'verified';
                    return (
                      <div key={q.id}
                        className={[
                          'rounded px-1.5 py-1 text-[11px] leading-tight border-l-[3px]',
                          unwritten ? 'border border-dashed' : '',
                        ].join(' ')}
                        style={{
                          background: unwritten ? 'transparent' : done ? '#F4F6F8' : ch.bg,
                          borderLeftColor: ch.dot,
                          borderColor: unwritten ? ch.dot : undefined,
                          opacity: done ? 0.85 : 1,
                        }}
                      >
                        <div className={
                          unwritten ? 'italic text-[#4A5568]'
                            : done ? 'font-semibold text-[#6B7684]'
                            : 'font-semibold text-[#1e2749]'
                        }>
                          {q.status === 'verified' ? '\u2713 ' : ''}{q.title || '(untitled)'}
                        </div>
                        <div className="text-[10px] text-[#6B7684] mt-0.5">
                          {ch.label} · {WAITING[q.status] ?? q.status}
                          {q.owner && q.owner !== 'system' && q.owner !== 'nobody' ? ` · ${q.owner}` : ''}
                        </div>
                        {q.channel === 'instagram' && !unwritten && (
                          <a href={`/tdi-admin/hub/carousel?id=${q.id}`}
                            className="text-[10px] text-[#2F5C9E] hover:underline block mt-0.5">
                            see the slides
                          </a>
                        )}
                        {q.published_url && (
                          <a href={q.published_url} target="_blank" rel="noreferrer"
                            className="text-[10px] text-[#2F5C9E] hover:underline block mt-0.5 truncate">
                            open it
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[11px] text-[#6B7684]">
          {Object.values(CHANNEL).map(ch => (
            <span key={ch.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: ch.dot }} />
              {ch.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block border border-dashed border-[#8A94A2]" />
            not written yet
          </span>
          <span className="flex items-center gap-1.5 text-[#6B7684]">
            <span>&#10003;</span> live and checked
          </span>
          <span className="ml-auto flex gap-3">
            {([['Social', data.horizons.social], ['Substack', data.horizons.substack]] as const).map(([name, h]) => (
              <span key={name} className={h.planned >= h.target ? 'text-[#3F6B4F]' : 'text-[#96631A]'}>
                {name} planned {h.planned} of {h.target} days out
              </span>
            ))}
          </span>
        </div>
      )}

      {!loading && data && data.unscheduled.length > 0 && (
        <div className="mt-6 border border-[#D8DDE3] rounded-lg bg-white p-4">
          <h2 className="!text-sm !font-semibold !leading-normal !m-0 text-[#1e2749] mb-1">
            No day yet ({data.unscheduled.length})
          </h2>
          <p className="text-[12px] text-[#6B7684] mb-3 max-w-[70ch]">
            Real work with nowhere to sit. These do not block anything, but a month that looks empty
            while this list is long is not actually an empty month.
          </p>
          <div className="flex flex-wrap gap-2">
            {data.unscheduled.map(q => {
              const ch = channelOf(q.channel);
              const unwritten = q.status === 'brief' || q.status === 'drafting';
              return (
                <div key={q.id}
                  className={[
                    'rounded px-2 py-1.5 text-[11px] border-l-[3px] max-w-[260px]',
                    unwritten ? 'border border-dashed' : '',
                  ].join(' ')}
                  style={{
                    background: unwritten ? 'transparent' : ch.bg,
                    borderLeftColor: ch.dot,
                    borderColor: unwritten ? ch.dot : undefined,
                  }}>
                  <div className={unwritten ? 'italic text-[#4A5568]' : 'font-semibold text-[#1e2749]'}>
                    {q.title || '(untitled)'}
                  </div>
                  <div className="text-[10px] text-[#6B7684] mt-0.5">
                    {ch.label} · {WAITING[q.status] ?? q.status}
                    {q.owner && q.owner !== 'system' && q.owner !== 'nobody' ? ` · ${q.owner}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && data && data.items.length === 0 && data.queued.length === 0 && (
        <p className="text-sm text-[#6B7684] mt-4">
          Nothing scheduled in {formatDateOnly(`${month}-01`, { month: 'long', year: 'numeric' })}.
          Items appear here once Julie schedules them instead of publishing them.
        </p>
      )}
    </div>
  );
}
