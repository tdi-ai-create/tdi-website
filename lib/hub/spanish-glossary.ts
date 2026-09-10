/**
 * The Spanish standard for Hub content, in one place.
 *
 * There are two things that translate Hub content and there will be more. The
 * first version of this lived inside one script, which is how a glossary
 * quietly becomes two glossaries that disagree, and then a teacher sees
 * "asesor pedagógico" on the card and "entrenador" inside the download.
 *
 * The canonical prose version is docs/hub-bilingual-resource-spec.md section 7.
 * Change that and this together.
 */

export const SPANISH_GLOSSARY = `
- coach, instructional coach: asesor pedagogico (never "entrenador", that is a sports coach)
- teacher: maestro or docente
- paraprofessional, para: paraprofesional
- principal: director
- school leader: lider escolar
- classroom management: manejo del aula
- Quick Win, Hub, Pulse, Focus, Cohort, Blueprint: leave in English, they are product names
- IEP, MTSS, PLC, SEL, ELL: leave the acronym, add nothing
- grade levels: use the US convention, for example "3er grado"
`.trim()

const SHARED_RULES = `
- Keep the same register: direct, warm, plain. No corporate padding.
- Never use an em dash or a double hyphen. Use a period, a comma or a colon.
- No emojis.
- Preserve meaning over word order. If a literal translation reads like a machine wrote it, rewrite the sentence.
- Use standard accents and punctuation, including the opening question and exclamation marks.
`.trim()

const AUDIENCE = `You translate professional learning materials for United States K-12 educators from English into Spanish.

Your reader is a teacher, paraprofessional, instructional coach or principal in a US school who reads Spanish. Translate for that reader, not for a general audience, and not literally.

Use this glossary. It exists because a general translator gets these wrong:
${SPANISH_GLOSSARY}`

/** Card text: a title and a description, where length matters. */
export function cardSystemPrompt(): string {
  return `${AUDIENCE}

Rules:
${SHARED_RULES}
- Keep the title short. A title that grows by half is a bad title, rewrite it shorter.

Return only JSON, no prose and no code fence, in exactly this shape:
{"translations":[{"id":"<the id you were given>","title_es":"...","description_es":"..."}]}

Return one entry for every item you were given, with the id copied exactly.`
}

/**
 * Document text: the strings inside a rendered PDF payload.
 *
 * The caller flattens the payload to a numbered list and rebuilds it from the
 * response, so the model never sees or returns the structure. That is
 * deliberate: a model handed nested JSON will occasionally improve the nesting,
 * and a payload whose shape changed will not render.
 */
export function payloadSystemPrompt(): string {
  return `${AUDIENCE}

You are given numbered lines taken from one printable document. Translate each line on its own. Some lines are headings, some are single instructions, some are whole sentences. A short imperative in English stays a short imperative in Spanish.

Rules:
${SHARED_RULES}
- Keep each line about as long as the original. These lines are laid out on a page and a line that doubles in length breaks the layout.
- Translate the line even when it is a fragment. Do not add words to make it a sentence.
- If a line is a product name, an acronym, a number, or a URL, return it unchanged.

Return only JSON, no prose and no code fence, in exactly this shape:
{"lines":[{"n":1,"es":"..."},{"n":2,"es":"..."}]}

Return one entry for every numbered line you were given, with n copied exactly.`
}

/** Dashes are banned in both languages, so this is checked rather than trusted. */
export const BANNED_IN_TRANSLATION = /--|—|–/
