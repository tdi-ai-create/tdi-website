'use client';

/**
 * What needs a person, on one screen.
 *
 * The mirror of the creator portal. A creator opens theirs and sees the one
 * thing in front of them; this answers the same question from our side. It
 * exists because nothing in the admin portal ever said that Katie Welch had
 * been waiting on us for nineteen days.
 *
 * Read only in this version. Every row links to where the action already
 * lives, so it cannot write anything wrong while it is being looked at for
 * the first time.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';
import { TYPE_SECTION_HEADER } from '@/components/tdi-admin/ui/design-tokens';

type Row = {
  creatorId: string;
  recordId: string;
  name: string;
  status: string | null;
  contentPath: string | null;
  step: string;
  ours: boolean;
  days: number | null;
  dueOn: string | null;
  href: string;
};

type Queue = {
  groups: {
    blocked_on_us: Row[];
    overdue: Row[];
    data_issue: Row[];
    no_clock: Row[];
  };
  moving: Row[];
  counts: { needsSomeone: number; openSteps: number; activeCreators: number };
};

const GROUPS: {
  key: keyof Queue['groups'];
  title: string;
  why: string;
  dot: string;
  chip: string;
}[] = [
  {
    key: 'blocked_on_us',
    title: 'Blocked on us',
    why: 'They cannot move until we do something',
    dot: '#80a4ed',
    chip: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    key: 'overdue',
    title: 'Overdue on their side',
    why: 'The clock has run out. Nudge, or give them longer',
    dot: '#b4322e',
    chip: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    key: 'data_issue',
    title: 'The record disagrees with the world',
    why: 'Not an active creator, but still holding an open step',
    dot: '#b4322e',
    chip: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    key: 'no_clock',
    title: 'No clock running',
    why: 'Open, but invisible to every reminder and every overdue count',
    dot: '#c3cadd',
    chip: 'bg-gray-100 text-gray-600 border-gray-200',
  },
];

function waited(r: Row): string {
  if (r.days === null) return 'not started';
  if (r.days === 0) return 'today';
  return `${r.days} day${r.days === 1 ? '' : 's'}`;
}

export function CreatorQueue() {
  const [data, setData] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMoving, setShowMoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/creators/queue');
      const body = await res.json();
      if (!res.ok) {
        // A failed read has to say so. A queue that silently renders empty
        // reads as "nothing needs you", which is the worst possible lie for
        // this particular screen to tell.
        setError(body?.error || `The queue could not be loaded (HTTP ${res.status}).`);
        setData(null);
      } else {
        setData(body);
      }
    } catch {
      setError('The queue could not be loaded. Check your connection and try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Working out what needs you
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-5">
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <p className="text-xs text-gray-500 mt-1">
          This is a failure to read, not an empty queue. Do not take it as nothing needing you.
        </p>
        <button
          onClick={load}
          className="mt-3 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
        >Try again</button>
      </div>
    );
  }

  if (!data) return null;

  const { counts } = data;
  const clear = counts.needsSomeone === 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h3 style={TYPE_SECTION_HEADER}>What needs a person</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {counts.activeCreators} active creator{counts.activeCreators === 1 ? '' : 's'} &middot;{' '}
            {counts.openSteps} open step{counts.openSteps === 1 ? '' : 's'} &middot;{' '}
            <span className={clear ? 'text-gray-500' : 'text-amber-700 font-medium'}>
              {clear ? 'nothing waiting on anyone' : `${counts.needsSomeone} need someone today`}
            </span>
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {GROUPS.map(group => {
        const rows = data.groups[group.key];
        if (!rows.length) return null;
        return (
          <div key={group.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-baseline gap-2 flex-wrap">
              <h4 style={TYPE_SECTION_HEADER}>{group.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${group.chip}`}>
                {rows.length}
              </span>
              <span className="text-xs text-gray-400">{group.why}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {rows.map(r => (
                <Link
                  key={r.recordId}
                  href={r.href}
                  className="grid grid-cols-[10px_1fr_auto] sm:grid-cols-[10px_180px_1fr_104px_92px] gap-3 items-center px-4 py-2.5 hover:bg-gray-50/70 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.dot }} />
                  <span className="text-sm font-semibold text-gray-900 truncate">{r.name}</span>
                  <span className="hidden sm:block text-xs text-gray-500 truncate">
                    {r.step}
                    {group.key === 'data_issue' && r.status && (
                      <span className="text-red-700 font-medium"> &middot; {r.status}</span>
                    )}
                    {group.key === 'overdue' && r.dueOn && (
                      <span className="text-gray-400"> &middot; was due {r.dueOn}</span>
                    )}
                  </span>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: (r.days ?? 0) >= 14 ? '#b4322e' : '#7e88a6' }}
                  >
                    {waited(r)}
                  </span>
                  <span className="hidden sm:block text-xs text-gray-400 justify-self-end">
                    {r.contentPath || 'no path'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {clear && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm font-medium text-gray-900">Nothing is waiting on a person.</p>
          <p className="text-xs text-gray-500 mt-1">
            Every open step has a clock, a date that has not passed, and belongs to an active creator.
          </p>
        </div>
      )}

      {data.moving.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowMoving(s => !s)}
            aria-expanded={showMoving}
            className="w-full px-4 py-3 flex items-baseline gap-2 text-left hover:bg-gray-50"
          >
            <h4 style={TYPE_SECTION_HEADER}>Moving along</h4>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">
              {data.moving.length}
            </span>
            <span className="text-xs text-gray-400">
              On a clock, not yet due, nothing needed from anyone
            </span>
          </button>
          {showMoving && (
            <div className="divide-y divide-gray-50 border-t border-gray-100">
              {data.moving.map(r => (
                <Link
                  key={r.recordId}
                  href={r.href}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[180px_1fr_104px] gap-3 items-center px-4 py-2 hover:bg-gray-50/70"
                >
                  <span className="text-sm text-gray-800 truncate">{r.name}</span>
                  <span className="hidden sm:block text-xs text-gray-500 truncate">{r.step}</span>
                  <span className="text-xs tabular-nums text-gray-400">
                    {r.dueOn ? `due ${r.dueOn}` : waited(r)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
