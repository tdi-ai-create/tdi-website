/**
 * Turning a client's note history into spreadsheet cells.
 *
 * Kept out of the page component so the export can be verified without a
 * browser: scripts/verify-sales-export.mjs builds a real workbook from live
 * data and checks the notes actually landed in it.
 *
 * The pipeline export used to write `sales_opportunities.notes` into a single
 * "Notes" cell. That column is an old import, so an exported list carried none
 * of the calls, emails or meetings anyone had logged.
 */

export interface ExportNote {
  body: string
  created_at: string
  author: string
  note_type: string
  /** Where it was written, when that is not the lead it is listed under. */
  source_label: string | null
}

/**
 * Excel refuses a cell over 32,767 characters, and a client with a hundred
 * notes goes past that. The main tab carries as much history as a cell can
 * hold; the All Notes tab carries every note, one per row, always.
 */
export const NOTES_CELL_LIMIT = 30000

export function formatNoteDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function displayAuthor(author: string): string {
  return author.includes('@') ? author.split('@')[0] : author
}

function flatten(body: string): string {
  return body.replace(/\s*\n\s*/g, ' ')
}

/** The client's history as one cell: newest first, dated and attributed. */
export function notesToCell(notes: ExportNote[]): string {
  const lines: string[] = []
  let used = 0

  for (let i = 0; i < notes.length; i++) {
    const n = notes[i]
    const from = n.source_label ? ` [${n.source_label}]` : ''
    const line = `${formatNoteDate(n.created_at)} - ${displayAuthor(n.author)}${from}: ${flatten(n.body)}`

    if (used + line.length > NOTES_CELL_LIMIT) {
      // Say what was left out rather than ending mid-history. Nothing is lost:
      // the All Notes tab has every one of them.
      lines.push(`(+${notes.length - i} more, see the All Notes tab)`)
      break
    }

    lines.push(line)
    used += line.length + 2
  }

  return lines.join('\n\n')
}

export interface ExportNoteRow {
  'District / School': string
  Date: string
  Author: string
  Type: string
  'Written on': string
  Note: string
}

/**
 * One row per note for the All Notes tab, so nothing depends on how much text a
 * single cell can hold and the history can be sorted and filtered.
 */
export function buildNoteRows(
  leads: { id: string; name: string | null }[],
  notesByOpp: Record<string, ExportNote[]>
): ExportNoteRow[] {
  return leads.flatMap(lead =>
    (notesByOpp[lead.id] ?? []).map(n => ({
      'District / School': lead.name || '',
      Date: formatNoteDate(n.created_at),
      Author: displayAuthor(n.author),
      Type: n.note_type,
      'Written on': n.source_label || 'This lead',
      Note: flatten(n.body),
    }))
  )
}
