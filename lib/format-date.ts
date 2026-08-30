/**
 * Render a date-only column without losing a day.
 *
 * Postgres `date` columns arrive as "2026-07-01". `new Date("2026-07-01")`
 * parses that as midnight UTC, and toLocaleDateString then renders it in the
 * viewer's zone. In America/Chicago that is 30 June, so Allenwood's contract
 * start showed as "Jun 2026" on the partnership header when it begins in July.
 * Every date-only field on these pages was a day early, and for a contract that
 * starts on the first of a month it was the wrong month.
 *
 * Appending T12:00:00 pins it to midday local, which lands on the intended day
 * in every timezone on earth. That is why it beats forcing UTC: UTC is correct
 * for us and wrong for anyone reading from Asia.
 *
 * Use this for `date` columns only. Timestamps such as created_at are
 * timestamptz and should keep rendering in local time, which is already right.
 */
export function formatDateOnly(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
  if (!value) return '';
  // Already carries a time, so it is a timestamp rather than a date column.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', options);
}
