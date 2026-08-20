'use client';

// ---------------------------------------------------------------------------
// The suggested date on a creator's current step, and the way out of it.
//
// Rae's instruction was that a timeline is our recommendation and never a
// deadline, so the button that moves it sits directly beside the date rather
// than behind a menu. A date you cannot move is a deadline whatever the copy
// around it says.
//
// Nothing here scolds. A passed date reads as "whenever you are ready", not as
// overdue, and asking for longer requires no reason and produces no warning.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';

interface StepDateProps {
  milestoneRecordId: string | null;
  dueOn: string;
  extensions: number;
  onExtended?: () => void;
}

function friendly(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

function daysFromToday(dateStr: string): number {
  const due = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

export function StepDate({ milestoneRecordId, dueOn, extensions, onExtended }: StepDateProps) {
  const [busy, setBusy] = useState(false);
  const [moved, setMoved] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const showing = moved ?? dueOn;
  const days = daysFromToday(showing);
  const past = days < 0;

  const extend = async () => {
    if (!milestoneRecordId) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch('/api/creator-portal/extend-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneRecordId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFailed(true);
      } else {
        setMoved(data.newDueOn);
        onExtended?.();
      }
    } catch {
      setFailed(true);
    }
    setBusy(false);
  };

  const line = past
    ? `Suggested for ${friendly(showing)}. Whenever you are ready.`
    : days === 0
      ? `Suggested for today, though there is no rush.`
      : `Suggested by ${friendly(showing)}, about ${days} ${days === 1 ? 'day' : 'days'} away.`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="inline-flex items-center gap-1.5 text-gray-600">
        <CalendarDays className="w-4 h-4 text-gray-400" />
        {line}
      </span>

      {milestoneRecordId && (
        <button
          onClick={extend}
          disabled={busy}
          className="text-sm font-medium text-[#1e2749] underline-offset-2 hover:underline disabled:opacity-50"
        >
          {busy ? 'Moving it...' : 'I need more time'}
        </button>
      )}

      {moved && (
        <span className="text-sm text-green-700">
          Done, moved to {friendly(moved)}. No explanation needed.
        </span>
      )}

      {failed && (
        <span className="text-sm text-red-700">
          That did not save. Reply to any email from us and we will move it for you.
        </span>
      )}

      {extensions > 0 && !moved && (
        <span className="text-xs text-gray-400">
          Moved {extensions} {extensions === 1 ? 'time' : 'times'} already, which is completely fine.
        </span>
      )}
    </div>
  );
}
