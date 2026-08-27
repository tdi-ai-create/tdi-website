'use client';

import { useState } from 'react';
import { Loader2, Plus, X, Check } from 'lucide-react';

/**
 * Record a session that happened, and capture what educators said while doing it.
 *
 * api/tdi-admin/leadership/[id]/complete-session has existed for months and had
 * zero callers. There was no button, so it had never run for any partnership.
 * That one unused route is why several blocks on every school's own dashboard
 * are empty:
 *
 *   - "What Educators Are Saying" needs teacher_quotes, which only this writes.
 *   - Impact Spotlight anchors to a timeline_events observation row.
 *   - The delivered count reads contract_deliverables, which this marks.
 *
 * So this form is not really a form. It is the thing that fills a school's
 * dashboard, and the quotes are the part that matters most, because a
 * principal's own teachers saying it lands differently to any number we report.
 */

interface Quote {
  quote_text: string;
  teacher_role: string;
}

const SESSION_TYPES = [
  { value: 'observation', label: 'Observation day' },
  { value: 'virtual_session', label: 'Virtual session' },
  { value: 'executive_session', label: 'Executive session' },
];

export default function LogSessionPanel({
  partnershipId,
  contracted,
  onLogged,
}: {
  partnershipId: string;
  contracted: { observation: number; virtual: number; executive: number };
  onLogged?: () => void;
}) {
  const available = SESSION_TYPES.filter((t) =>
    t.value === 'observation'
      ? contracted.observation > 0
      : t.value === 'virtual_session'
      ? contracted.virtual > 0
      : contracted.executive > 0
  );

  const [open, setOpen] = useState(false);
  const [sessionType, setSessionType] = useState(available[0]?.value ?? 'observation');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionNumber, setSessionNumber] = useState(1);
  const [loveNotesCount, setLoveNotesCount] = useState(0);
  const [internalNotes, setInternalNotes] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([{ quote_text: '', teacher_role: '' }]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (available.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-sm font-semibold text-gray-700">No sessions in this contract</p>
        <p className="text-sm text-gray-500 mt-1">
          This partnership is Hub access only, with no observation days or sessions to record.
        </p>
      </div>
    );
  }

  const usableQuotes = quotes.filter((q) => q.quote_text.trim().length > 0);

  async function submit() {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/complete-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType,
          sessionNumber,
          sessionDate,
          loveNotesCount,
          internalNotes: internalNotes.trim() || null,
          quotes: usableQuotes,
        }),
      });
      const body = await res.json();
      // A 200 is not proof. The route returns an explicit error when quotes
      // fail to save, and reporting success over that is exactly how this data
      // went missing in the first place.
      if (!res.ok || body.error) {
        setResult({ ok: false, message: body.error || `Request failed with ${res.status}` });
      } else {
        setResult({
          ok: true,
          message: `Recorded. ${usableQuotes.length} quote${usableQuotes.length === 1 ? '' : 's'} will appear on their dashboard.`,
        });
        setQuotes([{ quote_text: '', teacher_role: '' }]);
        setInternalNotes('');
        onLogged?.();
      }
    } catch (err) {
      setResult({ ok: false, message: String(err) });
    } finally {
      setSaving(false);
    }
  }

  const input = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#2563EB]';
  const label = 'block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5';

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="h-0.5 w-full" style={{ background: '#2563EB' }} />
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <p className="text-sm font-bold text-[#2B3A67]">Record a session</p>
          <p className="text-[12.5px] text-gray-500 mt-0.5">
            Fills the deliverable count, the Impact Spotlight and the educator quotes on their dashboard.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#2563EB] whitespace-nowrap">{open ? 'Close' : 'Open'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div>
              <label className={label} htmlFor="session-type">Type</label>
              <select id="session-type" className={input} value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                {available.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="session-date">Date it happened</label>
              <input id="session-date" type="date" className={input} value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="session-number">Which one</label>
              <input id="session-number" type="number" min={1} className={input} value={sessionNumber} onChange={(e) => setSessionNumber(Number(e.target.value))} />
            </div>
            <div>
              <label className={label} htmlFor="love-notes">Love Notes sent</label>
              <input id="love-notes" type="number" min={0} className={input} value={loveNotesCount} onChange={(e) => setLoveNotesCount(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="internal-notes">Internal notes</label>
            <textarea
              id="internal-notes"
              className={`${input} min-h-[70px] resize-y`}
              placeholder="What you saw, what to follow up. Not shown to the school."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={label} style={{ marginBottom: 0 }}>What educators said</span>
              <span className="text-[11px] text-gray-400">Appears on their dashboard</span>
            </div>
            <div className="space-y-2">
              {quotes.map((q, i) => (
                <div key={i} className="grid gap-2" style={{ gridTemplateColumns: '1fr 150px auto' }}>
                  <input
                    className={input}
                    placeholder="Something a teacher actually said"
                    value={q.quote_text}
                    onChange={(e) => setQuotes(quotes.map((x, j) => (j === i ? { ...x, quote_text: e.target.value } : x)))}
                  />
                  <input
                    className={input}
                    placeholder="Their role"
                    value={q.teacher_role}
                    onChange={(e) => setQuotes(quotes.map((x, j) => (j === i ? { ...x, teacher_role: e.target.value } : x)))}
                  />
                  <button
                    onClick={() => setQuotes(quotes.length > 1 ? quotes.filter((_, j) => j !== i) : [{ quote_text: '', teacher_role: '' }])}
                    className="px-2 text-gray-300 hover:text-gray-600"
                    aria-label="Remove quote"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setQuotes([...quotes, { quote_text: '', teacher_role: '' }])}
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2563EB]"
            >
              <Plus size={13} /> Add another
            </button>
          </div>

          {result && (
            <div
              className="flex items-start gap-2 p-3 rounded-lg text-[13px]"
              style={{
                background: result.ok ? '#E3F3EB' : '#FAE9E6',
                color: result.ok ? '#0F7B52' : '#B03325',
              }}
            >
              {result.ok ? <Check size={15} className="mt-0.5 shrink-0" /> : <X size={15} className="mt-0.5 shrink-0" />}
              <span>{result.message}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={submit}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: '#2563EB' }}
            >
              {saving ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Saving</span> : 'Record session'}
            </button>
            <span className="text-[12px] text-gray-400">
              {usableQuotes.length > 0
                ? `${usableQuotes.length} quote${usableQuotes.length === 1 ? '' : 's'} ready`
                : 'No quotes yet. The session still records without them.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
