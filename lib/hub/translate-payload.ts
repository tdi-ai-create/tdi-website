/**
 * Turning an English document payload into a Spanish one.
 *
 * Lives here rather than in the script because a cron now does this too, and
 * two copies of a translator is how a document translated on Tuesday reads
 * differently from the same document translated on Wednesday.
 *
 * The model never sees the payload's structure. Strings are flattened to a
 * numbered list, translated, and put back at the exact paths they came from. A
 * model handed nested JSON will occasionally improve the nesting, and a payload
 * whose shape changed will not render.
 */

import Anthropic from '@anthropic-ai/sdk'
import { payloadSystemPrompt, BANNED_IN_TRANSLATION } from './spanish-glossary'

export const TRANSLATION_MODEL = 'claude-opus-5'

/**
 * Keys whose values are machinery rather than prose. Translating `tool_type`
 * into Spanish would produce a payload the renderer cannot dispatch on.
 */
const NOT_PROSE = new Set([
  'type', 'tool_type', 'lang', 'id', 'slug', 'url', 'href', 'icon',
  'color', 'colour', 'category', 'weight', 'variant', 'style',
])

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

/** Every translatable string in the payload, with the path to put it back. */
function collectStrings(node: Json, path: (string | number)[], out: { path: (string | number)[]; text: string }[]) {
  if (typeof node === 'string') {
    const trimmed = node.trim()
    // A bare number, a short acronym, or an empty string is not worth a round
    // trip and is exactly what a translator garbles.
    if (trimmed && !/^[\d\s.,%:/-]+$/.test(trimmed)) out.push({ path, text: node })
    return
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => collectStrings(child, [...path, i], out))
    return
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (NOT_PROSE.has(key)) continue
      collectStrings(value as Json, [...path, key], out)
    }
  }
}

function setAtPath(root: Json, path: (string | number)[], value: string) {
  let node: Json = root
  for (let i = 0; i < path.length - 1; i++) {
    node = (node as Record<string, Json>)[path[i] as string]
  }
  ;(node as Record<string, Json>)[path[path.length - 1] as string] = value
}

function parseLines(text: string): { n: number; es: string }[] {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned) as { lines?: unknown }
  if (!Array.isArray(parsed.lines)) throw new Error('no lines array in response')
  return parsed.lines as { n: number; es: string }[]
}

/**
 * Keep the document title and the card title saying the same thing.
 *
 * The card title and the payload title are translated by two different scripts.
 * When the English source has them identical, two independent translations
 * produce two different Spanish sentences, and a teacher sees one title on the
 * card and another at the top of the download. Paloma filed that three times
 * (TEA-563, 564, 566) before this existed.
 *
 * Only when the English matched. Where the English deliberately differs, for
 * example a card title for browsing and a kid-facing title inside the document,
 * the Spanish is left free to differ too.
 */
export function alignTitle(payload: Json, englishTitle: string | null, spanishTitle: string | null): Json {
  if (!englishTitle || !spanishTitle) return payload
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload
  const obj = payload as Record<string, Json>
  if (typeof obj.title !== 'string') return payload
  if (obj.title.trim() !== englishTitle.trim()) return payload
  return { ...obj, title: spanishTitle }
}

export async function translatePayload(client: Anthropic, payload: Json, label: string): Promise<Json> {
  const strings: { path: (string | number)[]; text: string }[] = []
  collectStrings(payload, [], strings)
  if (strings.length === 0) throw new Error(`${label}: nothing translatable in this payload`)

  const numbered = strings.map((s, i) => `${i + 1}. ${s.text}`).join('\n')

  const response = await client.messages.create({
    model: TRANSLATION_MODEL,
    max_tokens: 16000,
    system: payloadSystemPrompt(),
    messages: [{ role: 'user', content: numbered }],
  })

  if (response.stop_reason === 'refusal') throw new Error(`${label}: the model declined this payload`)

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  const lines = parseLines(text)

  // Every line back, exactly once, or the payload is rebuilt with holes in it.
  const seen = new Map<number, string>()
  for (const line of lines) {
    if (!Number.isInteger(line.n) || line.n < 1 || line.n > strings.length) {
      throw new Error(`${label}: response carries line ${line.n}, which was not sent`)
    }
    if (seen.has(line.n)) throw new Error(`${label}: response repeats line ${line.n}`)
    if (!line.es?.trim()) throw new Error(`${label}: empty translation on line ${line.n}`)
    if (BANNED_IN_TRANSLATION.test(line.es)) throw new Error(`${label}: dash came back on line ${line.n}`)
    seen.set(line.n, line.es)
  }
  if (seen.size !== strings.length) {
    throw new Error(`${label}: sent ${strings.length} lines, got ${seen.size} back`)
  }

  const translated = JSON.parse(JSON.stringify(payload)) as Json
  strings.forEach((s, i) => setAtPath(translated, s.path, seen.get(i + 1)!))
  return translated
}

