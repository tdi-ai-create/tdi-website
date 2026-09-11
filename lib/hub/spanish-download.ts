/**
 * Which file a reader gets, and what we tell them it is.
 *
 * One function, because this decision is made in more than one place on the Hub
 * and a second copy of it is how a card ends up promising Spanish that the
 * button does not deliver.
 *
 * Three conditions have to hold before a Spanish file is served. The reader
 * chose Spanish, the switch is on, and **Paloma has reviewed that document**.
 * The third is the one worth defending: a rendered file is not a checked file,
 * and every Spanish document exists for some minutes before anyone has read it.
 *
 * Everything else falls back to English and says so. A silent fallback is how a
 * translation that never shipped goes unnoticed for a year, and a hidden button
 * tells a Spanish speaking teacher the Hub has nothing for her when it has
 * hundreds of things for her.
 */

export type FileLanguage = 'en' | 'es'

export type DownloadSource = {
  file_url?: string | null
  tool_file_url?: string | null
  file_url_es?: string | null
  tool_file_url_es?: string | null
  translated_at?: string | null
}

export type DownloadChoice = {
  /** The guide, or the single document when there is no separate tool. */
  downloadUrl: string | null
  /** The printable tool, when the item has one. */
  toolFileUrl: string | null
  /** What the reader is actually about to open. Drives the note on the page. */
  fileLanguage: FileLanguage
  /** True when the reader asked for Spanish and is getting English anyway. */
  fellBackToEnglish: boolean
}

export function pickDownloads(
  row: DownloadSource,
  language: string,
  spanishEnabled: boolean,
): DownloadChoice {
  const wantsSpanish = language === 'es'
  const reviewed = !!row.translated_at
  const hasSpanishFile = !!row.file_url_es || !!row.tool_file_url_es

  const serveSpanish = wantsSpanish && spanishEnabled && reviewed && hasSpanishFile

  if (serveSpanish) {
    return {
      // An item can have a Spanish tool and no Spanish guide, or the reverse.
      // Each file falls back on its own rather than the pair falling back
      // together, so a reader gets every Spanish document that exists.
      downloadUrl: row.file_url_es || row.file_url || null,
      toolFileUrl: row.tool_file_url_es || row.tool_file_url || null,
      fileLanguage: 'es',
      fellBackToEnglish: false,
    }
  }

  return {
    downloadUrl: row.file_url || null,
    toolFileUrl: row.tool_file_url || null,
    fileLanguage: 'en',
    fellBackToEnglish: wantsSpanish,
  }
}
