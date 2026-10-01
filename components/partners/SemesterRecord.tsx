import { Loader2 } from 'lucide-react';

/**
 * One school year, as the school's own record of it.
 *
 * Two rules from Rae, 30 September 2026, and the layout follows them:
 *
 *   The page exists to show what the partnership produced, so the result leads.
 *   An earlier version opened on 51 of 149 and 98 who had not started, which
 *   reads as a partnership underperforming to the person deciding whether to
 *   renew it.
 *
 *   Any number that is not favourable carries a TDI solution beside it. The
 *   strongest of those is something already in their contract, because it costs
 *   the leader nothing to accept.
 *
 * Both years render through this same component so they can be read against
 * each other. What differs is the data: each year carries its own hero rather
 * than borrowing the other's.
 */

export interface SemesterRecordData {
  semester: string;
  semester_label: string;
  is_current?: boolean;
  is_proposal?: boolean;
  badge?: string | null;
  hero?: {
    eyebrow?: string;
    headline?: string;
    blurb?: string;
    stats?: { value: string; label: string }[];
    benchmark?: { label?: string; value?: string; pct?: number } | null;
  } | null;
  solutions?: {
    kind?: 'included' | 'add';
    label?: string;
    title?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
  }[] | null;
  metrics?: Record<string, unknown> | null;
  highlights?: unknown[] | null;
  para_quotes?: { quote?: string; text?: string; para?: string; school?: string; building?: string; role?: string }[] | null;
  /**
   * What we saw on the days we were in the building.
   *
   * Declared and typed since the record was built, and rendered nowhere until
   * 1 October 2026. Across the fleet roughly 44 Love Notes have been written,
   * 25 at St Peter Chanel in a single day, and none of it reached a dashboard.
   * The strongest craft TDI produces was the least visible part of the product.
   */
  observation_notes?: {
    date?: string;
    title?: string;
    label?: string;
    note?: string;
    body?: string;
    text?: string;
    building?: string;
    school?: string;
    observed?: number;
    love_notes?: number;
  }[] | null;
  timeline_events?: { date?: string; label?: string; title?: string; notes?: string; status?: string }[] | null;
}

/**
 * A calendar date, read as a calendar date.
 *
 * `new Date('2026-07-01')` is parsed as UTC midnight, which in Chicago renders
 * as 30 June. Every date on this record was a day early, including observation
 * day dates a school would plan around.
 */
function formatRecordDate(value: string, opts: Intl.DateTimeFormatOptions): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', opts);
}

function quoteText(q: { quote?: string; text?: string }): string {
  return q.quote || q.text || '';
}

/**
 * A school, never a person.
 *
 * Rae and I settled this on 30 September: a first name plus a small building
 * identifies someone, these were written in a survey about the sessions rather
 * than for a leadership screen, and the reader is their Associate
 * Superintendent.
 */
function quoteAttribution(q: { para?: string; school?: string; building?: string; role?: string }): string {
  return q.school || q.building || q.role || '';
}

export function SemesterRecord({
  data,
  loading,
  children,
}: {
  data: SemesterRecordData | null;
  loading?: boolean;
  /** Live-data blocks the stored record cannot hold, such as who has not started. */
  children?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <p className="text-sm text-gray-400">No record has been written for this year yet.</p>
      </div>
    );
  }

  const hero = data.hero || null;
  const highlights = (data.highlights || []).filter(h => typeof h === 'string') as string[];
  const quotes = (data.para_quotes || []).filter(q => quoteText(q));
  const obsNoteText = (n: { note?: string; body?: string; text?: string }) =>
    (n.note || n.body || n.text || '').trim();
  const observations = (data.observation_notes || []).filter(n => obsNoteText(n) || n.title || n.label);
  const timeline = data.timeline_events || [];
  const included = (data.solutions || []).filter(s => s.kind === 'included');
  const addons = (data.solutions || []).filter(s => s.kind !== 'included');

  const metricEntries = Object.entries(
    (data.metrics || {}) as Record<string, { label?: string; value?: string | number; color?: string }>
  ).filter(([, m]) => m && typeof m === 'object' && 'value' in m);

  return (
    <div className="space-y-4">

      {/* A year that has not happened is not a record. Say so once, loudly, at
          the top, because this tab sits beside two showing measured numbers and
          a projection next to a result reads as a result. */}
      {data.is_proposal && (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
          style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}
        >
          <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#D97706' }} />
          <span>
            This year has not happened. Every figure below is a target we are proposing, not something measured,
            and each names the baseline it was built from.
          </span>
        </div>
      )}

      {/* ─── THE RESULT, FIRST ─── */}
      {hero?.headline && (
        <div
          className="rounded-2xl p-7 md:p-8 text-white"
          style={{ background: 'linear-gradient(135deg, #1e2749, #33507e)' }}
        >
          {hero.eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.09em] mb-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {hero.eyebrow}
            </p>
          )}
          <h2 className="text-xl md:text-2xl font-bold leading-snug tracking-tight mb-1.5" style={{ color: '#FFFFFF', textWrap: 'balance' }}>
            {hero.headline}
          </h2>
          {hero.blurb && (
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {hero.blurb}
            </p>
          )}

          {!!hero.stats?.length && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {hero.stats.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {data.is_proposal && (
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Target
                    </p>
                  )}
                  <p className="text-2xl font-bold leading-none tabular-nums" style={{ color: '#E8B84B' }}>{s.value}</p>
                  <p className="text-[11.5px] leading-snug mt-1.5" style={{ color: 'rgba(255,255,255,0.72)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {hero.benchmark?.pct != null && (
            <div className="flex items-center gap-3 flex-wrap mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>
              <span>{hero.benchmark.label}</span>
              <span className="flex-1 min-w-[180px] h-[7px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
                <span className="block h-full rounded-full" style={{ width: `${hero.benchmark.pct}%`, background: '#E8B84B' }} />
              </span>
              <span className="font-bold tabular-nums">{hero.benchmark.value}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── THE NUMBERS BEHIND IT ─── */}
      {metricEntries.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
          <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight">
            {data.is_proposal ? `What ${data.semester_label} would include` : `${data.semester_label} in numbers`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {metricEntries.map(([key, m]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-4">
                <p className="text-[22px] font-bold tabular-nums" style={{ color: m.color || '#1e2749' }}>{String(m.value)}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
          <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight mb-4">
            {data.is_proposal ? 'Why this shape' : 'What stood out'}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {highlights.map((h, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#1e2749] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#2A9D8F' }} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Live blocks the stored record cannot hold, such as who has not started */}
      {children}

      {/* ─── A SOLUTION BESIDE EVERY GAP ─── */}
      {included.map((s, i) => (
        <div key={`inc-${i}`} className="rounded-2xl p-6 md:p-7 border" style={{ background: '#E8F0FD', borderColor: 'rgba(128,164,237,0.35)' }}>
          {s.label && (
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500 mb-1.5">{s.label}</p>
          )}
          <h3 className="text-sm font-bold text-[#1e2749] mb-1.5">{s.title}</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed max-w-3xl">{s.body}</p>
          {s.ctaLabel && s.ctaHref && (
            <a
              href={s.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3.5 text-[13px] font-bold rounded-full px-4 py-2"
              style={{ background: '#E8B84B', color: '#1e2749' }}
            >
              {s.ctaLabel}
            </a>
          )}
        </div>
      ))}

      {observations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
          <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight">What we saw in your building</h2>
          <p className="text-xs text-gray-500 mt-1.5">
            From the days we were on site. Nothing here is evaluation and none of it sits in anyone&apos;s file.
          </p>
          <div className="flex flex-col gap-3 mt-4">
            {observations.map((n, i) => {
              const where = n.building || n.school;
              const counts = [
                typeof n.observed === 'number' ? `${n.observed} observed` : null,
                typeof n.love_notes === 'number' ? `${n.love_notes} Love Notes` : null,
              ].filter(Boolean).join(' · ');
              return (
                <div key={i} className="rounded-xl p-4" style={{ background: '#E8F0FD' }}>
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <p className="text-[13.5px] font-bold text-[#1e2749]">{n.title || n.label}</p>
                    {n.date && (
                      <span className="text-[11.5px] text-gray-500 tabular-nums whitespace-nowrap">
                        {formatRecordDate(n.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {(where || counts) && (
                    <p className="text-[11.5px] text-gray-500 mt-0.5">
                      {[where, counts].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {obsNoteText(n) && (
                    <p className="text-[13.5px] text-[#1e2749] leading-relaxed mt-2 max-w-[72ch]">{obsNoteText(n)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {quotes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
          <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight">In their own words</h2>
          <p className="text-xs text-gray-500 mt-1.5">Unedited, from the survey your staff filled in themselves.</p>
          <div className="flex flex-col gap-3 mt-4">
            {quotes.map((q, i) => (
              <div key={i} className="pl-4 py-3 bg-gray-50 rounded-r-xl border-l-[3px] border-[#80a4ed]">
                <p className="text-sm text-[#1e2749] leading-relaxed">{quoteText(q)}</p>
                {quoteAttribution(q) && (
                  <span className="block text-xs text-gray-400 mt-2">{quoteAttribution(q)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {timeline.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
          <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight mb-4">{data.semester_label} timeline</h2>
          {/* Only the columns that have something in them.
              A finished year has nothing in progress and nothing coming up, so
              the old version printed "In progress 0 Nothing here" and "Coming up
              0 Nothing here" beneath St Peter Chanel's completed first year.
              Two empty columns under their best record, which reads as a broken
              feature rather than as a year that ended. Rae caught it on the live
              page, 1 October 2026. */}
          <div className={`grid grid-cols-1 gap-5 ${
            (['completed', 'in_progress', 'upcoming'] as const).filter(st => timeline.some(e => e.status === st)).length > 1
              ? 'sm:grid-cols-3'
              : ''
          }`}>
            {(['completed', 'in_progress', 'upcoming'] as const).map(status => {
              const cfg = {
                completed: { label: 'Done', color: '#2A9D8F' },
                in_progress: { label: 'In progress', color: '#B4741A' },
                upcoming: { label: 'Coming up', color: '#3b5fa8' },
              }[status];
              const events = timeline.filter(e => e.status === status);
              if (events.length === 0) return null;
              return (
                <div key={status}>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-[11px] text-gray-400 ml-auto tabular-nums">{events.length}</span>
                  </div>
                  {(
                    <ul className="flex flex-col gap-2">
                      {events.map((e, i) => (
                        <li key={i} className="text-[13px] text-[#1e2749] leading-snug">
                          {e.label || e.title}
                          {e.date && (
                            <span className="block text-[11px] text-gray-400 mt-0.5">
                              {formatRecordDate(e.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {addons.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
          <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight">
            {addons[0].label || 'What districts add next'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {addons.map((s, i) => (
              <div key={i} className="rounded-xl p-4 border border-dashed" style={{ borderColor: '#80a4ed' }}>
                <h3 className="text-[13px] font-bold text-[#1e2749] mb-1.5">{s.title}</h3>
                <p className="text-[12.5px] text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
