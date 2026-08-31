/**
 * Which school year a date falls in.
 *
 * A US school year runs July to June, so July 2026 through June 2027 is
 * "2026-27". Everything financial here is discussed in those terms, and the
 * calendar year is never the right unit.
 *
 * Deliberately not used to derive an invoice's year. ANC-00025 is dated
 * 1 July 2026 for observations delivered the previous spring, so its date says
 * 2026-27 while the work is 2025-26. That is exactly the case that hid a
 * $1,920 prior year balance inside this year's contract, so the year is stored
 * on the invoice and this only supplies the default and the "what year is it
 * now" answer.
 */

/** July starts the new school year. */
const SCHOOL_YEAR_START_MONTH = 7

export function schoolYearOf(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(`${date.slice(0, 10)}T12:00:00`) : date
  const year = d.getFullYear()
  const start = d.getMonth() + 1 >= SCHOOL_YEAR_START_MONTH ? year : year - 1
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`
}

export function currentSchoolYear(): string {
  return schoolYearOf(new Date())
}
