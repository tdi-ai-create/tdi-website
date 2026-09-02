/**
 * Replacing a published file has to retire its review stamp.
 *
 * A Quick Win records QA in `qa_notes` (which carries the rubric version),
 * `reviewed_at` and `reviewed_by`. Those describe a specific document. Swap the
 * file and leave them in place and the library reports a brand-new, unread PDF
 * as reviewed against the standard.
 *
 * That is the failure that put 58 falsely-stamped items into the queue in
 * August. It is the same shape as every silent-write bug we have had: the write
 * succeeds, nothing errors, and the record now says something untrue.
 *
 * Retiring the stamp is also what makes the rebuild loop work. An item whose
 * file changed drops out of the reviewed set and back in front of QA on its own,
 * so nobody has to remember to re-queue it.
 */

/** Fields a caller must select before calling {@link retireReviewStamp}. */
export interface StampedRow {
  id: string
  slug?: string | null
  qa_notes?: string | null
  reviewed_at?: string | null
  reviewed_by?: string | null
}

export interface RetireResult {
  /** Merge into the same `.update()` that writes the new file. */
  patch: {
    reviewed_at: null
    reviewed_by: null
    qa_notes: string
  }
  /** True when the row actually carried a stamp, for logging and dry runs. */
  hadStamp: boolean
  auditLine: string
}

/**
 * Build the patch that retires a row's review stamp.
 *
 * Applied in the same update as the new file, so a file can never be live under
 * a stamp that describes the file it replaced. The previous stamp is preserved
 * in `qa_notes` rather than erased: it is a true record of a document that was
 * once live, and the audit trail is the point.
 *
 * @param row      the row as it is now, before the replacement lands
 * @param what     which file changed, named in the audit line
 * @param actor    who or what performed the replacement
 * @param stamp    ISO timestamp for the audit line
 */
export function retireReviewStamp(
  row: StampedRow,
  what: 'guide' | 'tool',
  actor: string,
  stamp: string,
): RetireResult {
  const hadStamp = Boolean(row.reviewed_at || row.reviewed_by)

  const previous = hadStamp
    ? ` Previous review by ${row.reviewed_by || 'unknown'} on ${row.reviewed_at || 'unknown date'} no longer applies.`
    : ''

  const auditLine =
    `[${stamp}] ${what} file replaced by ${actor}. Review stamp cleared: ` +
    `this item needs QA on the new file before it counts as reviewed.${previous}`

  return {
    patch: {
      reviewed_at: null,
      reviewed_by: null,
      qa_notes: row.qa_notes ? `${row.qa_notes}\n${auditLine}` : auditLine,
    },
    hadStamp,
    auditLine,
  }
}
