'use client';

/**
 * All five Vibe Check areas on one card, with progress across the year.
 *
 * Rae, 1 October 2026: "we track 5 areas, please make sure all dashboards have
 * a spot on the current year tab logs all 5 areas of vibe checks in a visually
 * apealing way that also provides quick insight and the ability to track
 * progress throughout the year".
 *
 * Four areas are scored 1 to 5 and higher is better. The fifth, needs, is not
 * scored: staff pick a word, and it is the only one where they say what they
 * want rather than how they feel. It is given its own treatment rather than
 * forced into a bar it does not fit.
 *
 * Two rules this component exists to keep:
 *
 * Aggregate only, never a name. An area with fewer than three people reports no
 * average at all, because in a school where the leader knows everybody a mean of
 * one answer is that person's private response with a number on it.
 *
 * And it is always "Vibe Check", never "Wellbeing", in anything a person reads.
 */

export interface VibeAreaData {
  key: string;
  label: string;
  blurb: string;
  avg: number | null;
  people: number;
  responses: number;
  trend: { month: string; avg: number; responses: number }[];
}

export interface VibeCheckData {
  areas: VibeAreaData[];
  needs: { word: string; count: number }[];
  people: number;
  responses: number;
  lastAt: string | null;
  unknown: boolean;
}

/** Teal when healthy, gold when worth watching, never red. A 2.9 is a signal, not a failure. */
function toneFor(avg: number | null): { bar: string; text: string } {
  if (avg === null) return { bar: '#D7DBE5', text: '#6b7291' };
  if (avg >= 3.8) return { bar: '#2A9D8F', text: '#14594f' };
  if (avg >= 3.0) return { bar: '#80a4ed', text: '#1b3f80' };
  return { bar: '#E8B84B', text: '#7a5600' };
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  // Built from parts, never parsed, so a month does not shift in a western timezone.
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

/** Direction of travel across the stored months. Needs two to say anything. */
function movement(trend: { avg: number }[]): { dir: 'up' | 'down' | 'flat'; delta: number } | null {
  if (trend.length < 2) return null;
  const delta = Math.round((trend[trend.length - 1].avg - trend[0].avg) * 10) / 10;
  if (delta > 0.1) return { dir: 'up', delta };
  if (delta < -0.1) return { dir: 'down', delta };
  return { dir: 'flat', delta: 0 };
}

export default function VibeCheckPanel({ data, staffTotal }: { data: VibeCheckData; staffTotal: number }) {
  const scored = data.areas.filter(a => a.avg !== null);
  const waiting = data.areas.filter(a => a.avg === null);
  const share = staffTotal > 0 ? Math.round((data.people / staffTotal) * 100) : null;

  // Nothing at all yet. Say what it is and what fills it, rather than drawing
  // four empty bars.
  if (data.people === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
        <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight">Vibe Check</h2>
        <p className="text-[13px] text-gray-500 mt-1.5 max-w-[68ch] leading-relaxed">
          Short check ins in the Hub, a few seconds each, across five areas: mood, energy,
          belonging, purpose, and what your team says it needs. Nobody has completed one yet.
          Each answer stays private to the person and you see the school.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-[15px] font-bold text-[#1e2749] tracking-tight">Vibe Check</h2>
        <span className="text-[11.5px] text-gray-500 tabular-nums">
          {data.people} {data.people === 1 ? 'person' : 'people'}
          {share !== null ? `, ${share}% of your team` : ''}
        </span>
      </div>
      <p className="text-[12.5px] text-gray-500 mt-1.5 max-w-[70ch] leading-relaxed">
        A few seconds each, answered in the Hub. Each answer is private to the person and what you
        see is the school, which is the only reason the answers are honest.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mt-5">
        {scored.map(area => {
          const tone = toneFor(area.avg);
          const move = movement(area.trend);
          const pct = area.avg !== null ? (area.avg / 5) * 100 : 0;
          const peak = Math.max(...area.trend.map(t => t.avg), 5);
          return (
            <div key={area.key} className="rounded-xl p-4" style={{ background: '#F8FAFC' }}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-bold text-[#1e2749]">{area.label}</p>
                <p className="text-[19px] font-bold leading-none tabular-nums" style={{ color: tone.text }}>
                  {area.avg?.toFixed(1)}
                  <span className="text-[11px] font-semibold text-gray-400"> / 5</span>
                </p>
              </div>
              <p className="text-[11.5px] text-gray-500 mt-0.5">{area.blurb}</p>

              <div className="h-2 rounded-full bg-gray-200 overflow-hidden mt-2.5" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone.bar }} />
              </div>

              {/* Month by month, so a leader can see the direction and not just today. */}
              {area.trend.length > 1 && (
                <div className="mt-3">
                  <div className="flex items-end gap-1 h-9" aria-hidden="true">
                    {area.trend.map(t => (
                      <div key={t.month} className="flex-1 flex flex-col justify-end" title={`${monthLabel(t.month)}: ${t.avg} of 5, ${t.responses} answers`}>
                        <div className="rounded-sm" style={{ height: `${Math.max(8, (t.avg / peak) * 100)}%`, background: tone.bar, opacity: 0.55 }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {area.trend.map(t => (
                      <span key={t.month} className="flex-1 text-[9.5px] text-gray-400 text-center">{monthLabel(t.month)}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-500 mt-2 tabular-nums">
                {area.people} {area.people === 1 ? 'person' : 'people'}
                {move && move.dir !== 'flat' && (
                  <span style={{ color: move.dir === 'up' ? '#14594f' : '#7a5600' }}>
                    {' '}· {move.dir === 'up' ? 'up' : 'down'} {Math.abs(move.delta).toFixed(1)} since {monthLabel(area.trend[0].month)}
                  </span>
                )}
                {move && move.dir === 'flat' && <span> · steady since {monthLabel(area.trend[0].month)}</span>}
              </p>
            </div>
          );
        })}
      </div>

      {/* The fifth area. Not a score, and the most directly useful of the five. */}
      {data.needs.length > 0 && (
        <div className="mt-5 rounded-xl px-4 py-3.5" style={{ background: '#E8F0FD' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e2749]/60 mb-2">
            What your team says it needs
          </p>
          <div className="flex flex-wrap gap-2">
            {data.needs.map(n => (
              <span
                key={n.word}
                className="text-[13px] font-semibold rounded-full px-3 py-1 bg-white text-[#1e2749]"
                style={{ border: '1px solid rgba(128,164,237,0.4)' }}
              >
                {n.word}
                {n.count > 1 && <span className="text-[11px] font-medium text-gray-500 tabular-nums"> ×{n.count}</span>}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-gray-600 mt-2.5 max-w-[68ch] leading-relaxed">
            Their own words, chosen rather than written. This is the one area where your staff
            say what they want rather than how they feel.
          </p>
        </div>
      )}

      {/* Named plainly rather than hidden, so a blank area is not mistaken for a bad one. */}
      {waiting.length > 0 && (
        <p className="text-[12px] text-gray-500 mt-4 max-w-[70ch] leading-relaxed">
          {waiting.map(a => a.label).join(', ')} {waiting.length === 1 ? 'is' : 'are'} not reported yet.
          An area needs at least three people before it shows an average, because with fewer than
          that you would effectively be reading one person&apos;s private answer.
        </p>
      )}
    </div>
  );
}
