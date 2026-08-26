'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * What a partnership's educators are actually doing in the Hub.
 *
 * The Leadership area used to show six counters, none of which arrived because
 * every route feeding them asked the wrong database. This shows the depth that
 * was always there: which courses a staff reaches for, what they ask in the
 * community, how many recognitions they have earned.
 *
 * Wellbeing is aggregate only, and deliberately so. The action step gate tells
 * teachers "This is yours. We will never share it." Per person rows here carry
 * activity counts and never a Vibe Check.
 */

interface Summary {
  activeEducators: number;
  neverOpened: number;
  lessonsWorked: number;
  coursesStarted: number;
  quickWinsOpened: number;
  coursesFinished: number;
  certificates: number;
  toolsSaved: number;
  communityPosts: number;
  questionsAsked: number;
  recognitions: number;
  vibeChecks: number;
  vibeAverage: number | null;
  lastActivity: string | null;
}

interface Person {
  email: string;
  name: string | null;
  lessons: number;
  quickWins: number;
  checkins: number;
  total: number;
  last: string | null;
}

interface Payload {
  hasSeats: boolean;
  seats: number;
  summary: Summary | null;
  courses: { title: string; enrolled: number }[];
  quizzes: { type: string; results: string[] }[];
  people: Person[];
}

const CARD = 'bg-white rounded-xl border border-gray-100';
const SHADOW = { boxShadow: '0 1px 4px rgba(0,0,0,0.04)' };

function Stat({ n, label, tone }: { n: number | string; label: string; tone?: 'ok' | 'bad' }) {
  const color = tone === 'ok' ? '#0F7B52' : tone === 'bad' ? '#B03325' : '#2B3A67';
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[22px] font-bold leading-none tabular-nums" style={{ color }}>{n}</p>
      <p className="text-[11px] text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function humanQuiz(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function YourPeoplePanel({
  partnershipId,
  userEmail,
}: {
  partnershipId: string;
  userEmail: string | null;
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) return;
    let cancelled = false;
    fetch(`/api/tdi-admin/leadership/${partnershipId}/hub-depth`, {
      headers: { 'x-user-email': userEmail },
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || `Request failed with ${res.status}`);
        return body;
      })
      .then((body) => !cancelled && setData(body))
      .catch((err) => !cancelled && setError(err.message || 'Could not load Hub activity'));
    return () => {
      cancelled = true;
    };
  }, [partnershipId, userEmail]);

  if (error) {
    return (
      <div className={`${CARD} p-5 flex items-start gap-3`} style={SHADOW}>
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Hub activity is unavailable</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${CARD} p-8 flex items-center justify-center gap-3 text-gray-400`} style={SHADOW}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading Hub activity</span>
      </div>
    );
  }

  if (!data.hasSeats || !data.summary) {
    return (
      <div className={`${CARD} p-8 text-center`} style={SHADOW}>
        <p className="text-sm font-semibold text-gray-700">No Hub seats for this partnership</p>
        <p className="text-sm text-gray-500 mt-1">
          Nothing to report until seats are provisioned. There is nothing wrong with the data.
        </p>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-4">
      <div className={`${CARD} overflow-hidden`} style={SHADOW}>
        <div className="h-0.5 w-full" style={{ background: '#2563EB' }} />
        <div className="grid gap-px bg-gray-100" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))' }}>
          <Stat n={s.activeEducators} label="Genuinely active" tone={s.activeEducators > 0 ? 'ok' : 'bad'} />
          <Stat n={data.seats} label="Seats live" />
          <Stat n={s.neverOpened} label="Never opened it" tone={s.neverOpened > 0 ? 'bad' : 'ok'} />
          <Stat n={s.lessonsWorked} label="Lessons worked" />
          <Stat n={s.coursesStarted} label="Courses started" />
          <Stat n={s.questionsAsked} label="Questions asked" />
          <Stat n={s.recognitions} label="Recognitions" />
          <Stat n={s.certificates} label="Certificates" />
        </div>
        {s.lastActivity && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
            Most recent activity {new Date(s.lastActivity).toLocaleDateString()}. Provisioning events are excluded, so
            active means a person did something.
          </div>
        )}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className={`${CARD} overflow-hidden`} style={SHADOW}>
          <h3 className="text-[13px] font-bold text-[#2B3A67] px-4 py-3 border-b border-gray-100 bg-gray-50">
            What they are learning
          </h3>
          {data.courses.length > 0 ? (
            <div className="px-4 py-1">
              {data.courses.slice(0, 8).map((c) => (
                <div key={c.title} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-[13px] text-gray-700">{c.title}</span>
                  <span className="text-[13px] font-bold text-[#2B3A67] tabular-nums">{c.enrolled}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-[13px] text-gray-400">
              No courses started yet. Seats are live and nobody has opened one.
            </p>
          )}
        </div>

        <div className={`${CARD} overflow-hidden`} style={SHADOW}>
          <h3 className="text-[13px] font-bold text-[#2B3A67] px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
            How they are doing
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: '#FCF2DC', color: '#9A6608' }}>
              Aggregate only
            </span>
          </h3>
          {s.vibeChecks > 0 ? (
            <div className="px-4 py-1">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-600">Vibe Checks completed</span>
                <span className="text-[13px] font-bold tabular-nums">{s.vibeChecks}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-600">Average, out of 5</span>
                <span className="text-[13px] font-bold tabular-nums">{s.vibeAverage ?? 'n/a'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-gray-600">Tools saved for later</span>
                <span className="text-[13px] font-bold tabular-nums">{s.toolsSaved}</span>
              </div>
              <p className="text-[11px] text-gray-400 pb-3 pt-1">
                Individual entries are never shown. Teachers are told these are private, and that promise is why the
                answers are honest.
              </p>
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-[13px] text-gray-400">
              No Vibe Checks yet.
            </p>
          )}
        </div>

        {data.quizzes.length > 0 && (
          <div className={`${CARD} overflow-hidden`} style={SHADOW}>
            <h3 className="text-[13px] font-bold text-[#2B3A67] px-4 py-3 border-b border-gray-100 bg-gray-50">
              Who they are
            </h3>
            <div className="px-4 py-1">
              {data.quizzes.slice(0, 6).map((q) => (
                <div key={q.type} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-[13px] text-gray-600">{humanQuiz(q.type)}</span>
                  <span className="text-[12px] font-semibold text-[#2B3A67] text-right">
                    {q.results.map(humanQuiz).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`${CARD} overflow-hidden`} style={SHADOW}>
        <h3 className="text-[13px] font-bold text-[#2B3A67] px-4 py-3 border-b border-gray-100 bg-gray-50">
          Person by person
        </h3>
        {data.people.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 520 }}>
              <thead>
                <tr className="bg-gray-50">
                  {['Educator', 'Lessons', 'Quick Wins', 'Vibe Checks', 'Actions', 'Last seen'].map((h, i) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200"
                      style={{ textAlign: i === 0 ? 'left' : 'right' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.people.map((p) => (
                  <tr key={p.email} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-[12.5px] text-gray-700 border-b border-gray-50">
                      {p.name || p.email}
                    </td>
                    {[p.lessons, p.quickWins, p.checkins, p.total].map((v, i) => (
                      <td key={i} className="px-4 py-2.5 text-[12px] text-right tabular-nums text-gray-600 border-b border-gray-50">
                        {v}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-[12px] text-right tabular-nums text-gray-500 border-b border-gray-50">
                      {p.last ? new Date(p.last).toLocaleDateString() : 'never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-4 py-6 text-center text-[13px] text-gray-400">
            {data.seats} seats are live and nobody has opened the Hub yet.
          </p>
        )}
        {s.neverOpened > 0 && data.people.length > 0 && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
            {s.neverOpened} of {data.seats} provisioned educators have never opened the Hub.
          </div>
        )}
      </div>
    </div>
  );
}
