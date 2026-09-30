import { Loader2, Eye } from 'lucide-react';

/**
 * One school year, as the school's own record of it.
 *
 * Lifted verbatim out of the Our Partnership tab on 30 September 2026, where it
 * was reachable only behind a semester toggle that most people never pressed.
 * Rae asked for a tab per year instead, so this renders the same record in a
 * place a person can find.
 *
 * Every field is optional because a year in progress has different parts filled
 * in than a year that finished.
 */
export interface SemesterRecordData {
  semester: string;
  semester_label: string;
  is_current?: boolean;
  metrics?: Record<string, unknown> | null;
  highlights?: unknown[] | null;
  building_data?: Record<string, unknown>[] | null;
  observation_notes?: unknown[] | {
    title: string;
    date?: string;
    notes?: string;
    love_notes?: { para: string; school: string; highlights: string; para_replied?: boolean; reply_summary?: string }[];
  }[] | null;
  para_quotes?: { quote?: string; text?: string; para?: string; school?: string; building?: string; role?: string }[] | null;
  timeline_events?: { date?: string; label?: string; title?: string; notes?: string; status?: string }[] | null;
}


/**
 * A calendar date, read as a calendar date.
 *
 * `new Date('2026-07-01')` is parsed as UTC midnight, which in Chicago renders
 * as 30 June. Every date on this record was a day early, including observation
 * day dates a school would plan around. Splitting the parts builds it in local
 * time instead. A value carrying a time is left to the normal parser.
 */
function formatRecordDate(value: string, opts: Intl.DateTimeFormatOptions): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', opts);
}

export function SemesterRecord({ data, loading }: { data: SemesterRecordData | null; loading?: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-sm text-gray-400">No record has been written for this year yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Historical Metrics */}
      {data.metrics && Object.keys(data.metrics).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {data.semester_label} Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(data.metrics as Record<string, { label: string; value: string | number; color?: string }>).map(([key, metric]) => (
              <div key={key} className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: metric.color || '#1e2749' }}>
                  {metric.value}
                </p>
                <p className="text-[10px] text-gray-500 font-medium mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Highlights */}
      {data.highlights && (data.highlights as string[]).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Semester Highlights</h2>
          <div className="space-y-2">
            {(data.highlights as string[]).map((h, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#2A9D8F' }} />
                <p className="text-sm text-gray-700 leading-relaxed">{h}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Building Data */}
      {data.building_data && data.building_data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Building Spotlight</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Building</th>
                  <th className="text-right text-xs font-semibold text-gray-500 pb-2 px-4">Paras</th>
                  <th className="text-right text-xs font-semibold text-gray-500 pb-2 px-4">Login %</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2 pl-4">Recognition</th>
                </tr>
              </thead>
              <tbody>
                {data.building_data.map((b: Record<string, unknown>, i: number) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-[#1e2749]">{b.name as string}</td>
                    <td className="py-2.5 px-4 text-right text-gray-600">{(b.staff_count as number) ?? '—'}</td>
                    <td className="py-2.5 px-4 text-right text-gray-600">{b.login_pct ? `${b.login_pct}%` : '—'}</td>
                    <td className="py-2.5 pl-4 text-left">
                      {(b.awards as string[])?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(b.awards as string[]).map((award: string, j: number) => (
                            <span key={j} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}>
                              {award}
                            </span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Observation Notes */}
      {data.observation_notes && (data.observation_notes as { title: string; date?: string; notes?: string; love_notes?: { para: string; school: string; highlights: string; para_replied?: boolean; reply_summary?: string }[] }[]).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Observation Notes</h2>
          <div className="space-y-6">
            {(data.observation_notes as { title: string; date?: string; notes?: string; love_notes?: { para: string; school: string; highlights: string; para_replied?: boolean; reply_summary?: string }[] }[]).map((note, i) => (
              <div key={i}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#EFF6FF' }}>
                    <Eye className="w-3.5 h-3.5" style={{ color: '#2563EB' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1e2749]">{note.title}</p>
                    {note.date && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRecordDate(note.date, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    {note.notes && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{note.notes}</p>
                    )}
                  </div>
                </div>
                {/* Individual Love Notes */}
                {note.love_notes && note.love_notes.length > 0 && (
                  <div className="mt-4 ml-9 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Individual Feedback Sent</p>
                    {note.love_notes.map((ln, j) => (
                      <div key={j} className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#1e2749]">{ln.para}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#2563EB' }}>{ln.school}</span>
                          {ln.para_replied && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#ECFDF5', color: '#059669' }}>replied</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{ln.highlights}</p>
                        {ln.reply_summary && (
                          <p className="text-xs text-gray-500 mt-1.5 pl-3 italic" style={{ borderLeft: '2px solid #D1D5DB' }}>{ln.reply_summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Para Quotes */}
      {data.para_quotes && data.para_quotes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Voices From Your School</h2>
          <div className="space-y-3">
            {data.para_quotes.map((q, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border-l-4"
                style={{ background: '#F9FAFB', borderLeftColor: '#2A9D8F' }}
              >
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;{q.text}&rdquo;
                </p>
                {(q.role || q.building) && (
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    {[q.role, q.building].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Timeline */}
      {data.timeline_events && data.timeline_events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {data.semester_label} Timeline
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {(['completed', 'in_progress', 'upcoming'] as const).map((status) => {
              const cfg = {
                completed: { label: 'Done', color: '#16A34A' },
                in_progress: { label: 'In Progress', color: '#D97706' },
                upcoming: { label: 'Coming Soon', color: '#2563EB' },
              }[status];
              const events = (data.timeline_events ?? []).filter((e) => e.status === status);
              return (
                <div key={status}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{events.length}</span>
                  </div>
                  {events.length === 0 ? (
                    <p className="text-xs text-gray-300 italic">Nothing here</p>
                  ) : (
                    events.map((ev, j) => (
                      <div key={j} className="flex items-start gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: cfg.color }} />
                        <div>
                          <p className="text-sm text-gray-700 leading-snug">{ev.title}</p>
                          {ev.date && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatRecordDate(ev.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                          {ev.notes && (
                            <p className="text-xs text-gray-500 mt-0.5">{ev.notes}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
