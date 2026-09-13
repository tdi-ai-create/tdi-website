/**
 * Stop the UI translator translating the things it must not translate.
 *
 * Found on 11 September, the day Spanish downloads went live, by looking at a
 * real page instead of a database row. Google had rendered the company name as
 * "Los profesores se lo merecen", Quick Wins as "Victorias rápidas", and the
 * Learning Hub as "Centro de aprendizaje". It had been doing that since June on
 * every Spanish page, and nobody saw it because nothing else on the page was
 * held to a standard.
 *
 * Two jobs here.
 *
 * **Protect.** Product names and the company name survive translation intact,
 * including when they sit inside a longer sentence. "Share this Quick Win" has
 * to come back with Quick Win still in it.
 *
 * **Override.** A few strings have a chosen Spanish form rather than a
 * translated one, and the badge words are the reason this matters: the PDF
 * prints "Algo de preparación" and the page was printing "Elevación media" for
 * the same thing, which reads as two different products.
 *
 * The glossary these follow is docs/hub-bilingual-resource-spec.md section 7.
 */

/**
 * Never translated, in any language, anywhere.
 *
 * Longest first, so "Quick Wins" is protected before "Quick Win" can match
 * inside it and leave a stray "s" behind.
 */
export const DO_NOT_TRANSLATE = [
  'Teachers Deserve It',
  'Learning Hub',
  'Quick Wins',
  'Quick Win',
  'Blueprint',
  'Cohort',
  'Pulse',
  'Focus',
  'Hub',
].sort((a, b) => b.length - a.length)

/**
 * Chosen rather than translated. Exact match on the whole string.
 *
 * The lift badges are Rae's wording, agreed 11 September, and they have to be
 * the same three words the PDF prints.
 */
export const UI_OVERRIDES_ES: Record<string, string> = {
  'Grab & Go': 'Listo para usar',
  'Low Lift': 'Listo para usar',
  'Some Prep': 'Algo de preparación',
  'Medium Lift': 'Algo de preparación',
  'Deep Dive': 'A fondo',
  'High Lift': 'A fondo',

  // Categories, so a card and the document it opens agree with each other.
  'Lesson Planning': 'Planificación de clases',
  'Assessment': 'Evaluación',
  'Instructional Strategies': 'Estrategias de enseñanza',
  'Classroom Setup': 'Organización del aula',
  'Classroom Management': 'Manejo del aula',
  'Communication': 'Comunicación',
  'Time Savers': 'Ahorra tiempo',
  'Leadership': 'Liderazgo',
  'Self-Care': 'Bienestar personal',
  'Stress Relief': 'Alivio del estrés',
  'Games': 'Juegos',
  'Vocational': 'Formación profesional',

  // The one term a general translator always gets wrong here.
  'Coaches': 'Asesores',
  'Coach': 'Asesor',

  // Whole phrases, because masking a product name leaves the translator
  // guessing its gender and it guesses neuter: "Share this Quick Win" came
  // back as "Comparte esto Quick Win". These are the phrases on the Hub today
  // that pair a determiner with a masked name.
  'Share this Quick Win': 'Comparte este Quick Win',
  'Explore Quick Wins': 'Explora los Quick Wins',
  'Explore all Quick Wins': 'Explora todos los Quick Wins',
  'Explore more Quick Wins': 'Descubre más Quick Wins',
  'Browse Quick Wins': 'Explora los Quick Wins',
  'Back to Quick Wins': 'Volver a Quick Wins',
  'This Quick Win': 'Este Quick Win',
  'Save this Quick Win': 'Guarda este Quick Win',
}

/** A token no translator will touch or reorder, unlike the words themselves. */
const token = (i: number) => `__TDI${i}__`

/**
 * Swap protected names out for tokens before translation.
 *
 * Returns the masked string and the list needed to put the names back. A
 * string containing no protected name is returned unchanged, so the common
 * case costs nothing.
 */
export function maskProtected(text: string): { masked: string; found: string[] } {
  const found: string[] = []
  let masked = text

  for (const name of DO_NOT_TRANSLATE) {
    // Case-insensitive, because the nav prints LEARNING HUB in caps and a
    // case-sensitive pass let exactly that through on the first day. What goes
    // back is the case as it appeared in the original, not the case in the
    // list, so a heading stays a heading.
    const pattern = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const hits = masked.match(pattern)
    if (!hits) continue

    const index = found.length
    found.push(hits[0])
    masked = masked.replace(pattern, token(index))
  }

  return { masked, found }
}

/**
 * Put the protected names back.
 *
 * Translators sometimes alter a token's spacing or case, so this matches
 * loosely rather than exactly. A token that survives unrecognised would print
 * as "__TDI0__" on the page, which is worse than the bug this fixes.
 */
export function unmaskProtected(text: string, found: string[]): string {
  let out = text
  found.forEach((name, i) => {
    const loose = new RegExp(`_{0,2}\\s*TDI\\s*${i}\\s*_{0,2}`, 'gi')
    out = out.replace(loose, name)
  })
  return out
}

/** The whole rule in one call: override, or mask and hand back what to translate. */
export function prepareForTranslation(text: string): {
  /** Set when no translation call is needed at all. */
  resolved?: string
  masked?: string
  found?: string[]
} {
  const override = UI_OVERRIDES_ES[text.trim()]
  if (override) return { resolved: override }

  // A string that is nothing but a protected name never goes to a translator.
  // Compared case-insensitively for the same reason the masking is: the nav
  // prints LEARNING HUB in caps. The original is returned, so its case is kept.
  const trimmed = text.trim()
  if (DO_NOT_TRANSLATE.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
    return { resolved: text }
  }

  const { masked, found } = maskProtected(text)
  return { masked, found }
}
