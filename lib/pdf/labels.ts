/**
 * The words the template prints that are not the author's content.
 *
 * Every heading, field label and badge in lib/pdf/*.tsx was a string literal
 * until 9 September 2026. That was fine while every document was English, and
 * it breaks the moment one is not: render a translated payload through a
 * template that prints "Why This Works" and a teacher gets Spanish body text
 * under English headings, which reads as broken rather than as untranslated.
 *
 * So chrome lives here, keyed by language, and the templates take a lang.
 *
 * Two things deliberately do not translate. "Teachers Deserve It" is the
 * company name, and teachersdeserveit.com is a URL.
 *
 * Lift labels are brand vocabulary rather than description. Grab & Go is not
 * "agarra y ve". The Spanish below is chosen to carry the same promise, and it
 * is Rae's to change: see docs/hub-bilingual-resource-spec.md section 8.
 */

export type Lang = 'en' | 'es'

export type PdfLabels = {
  category: string
  forRoles: string
  lift: string
  time: string
  overview: string
  whyThisWorks: string
  howToUseThis: string
  adaptIt: string
  tryItThisWeek: string
  reflect: string
  notes: string
  tip: string
  lift_low: string
  lift_med: string
  lift_high: string
  role_teacher: string
  role_para: string
  role_leader: string
  role_coach: string
}

const EN: PdfLabels = {
  category: 'Category',
  forRoles: 'For',
  lift: 'Lift',
  time: 'Time',
  overview: 'Overview',
  whyThisWorks: 'Why This Works',
  howToUseThis: 'How to Use This',
  adaptIt: 'Adapt It',
  tryItThisWeek: 'Try It This Week',
  reflect: 'Reflect',
  notes: 'Notes',
  tip: 'Tip',
  lift_low: 'Grab & Go',
  lift_med: 'Some Prep',
  lift_high: 'Deep Dive',
  role_teacher: 'Teachers',
  role_para: 'Paras',
  role_leader: 'Leaders',
  role_coach: 'Coaches',
}

const ES: PdfLabels = {
  category: 'Categoría',
  forRoles: 'Para',
  lift: 'Esfuerzo',
  time: 'Tiempo',
  overview: 'Resumen',
  whyThisWorks: 'Por qué funciona',
  howToUseThis: 'Cómo usarlo',
  adaptIt: 'Adáptalo',
  tryItThisWeek: 'Pruébalo esta semana',
  reflect: 'Reflexiona',
  notes: 'Notas',
  tip: 'Consejo',
  // Brand vocabulary, chosen rather than translated. Listo para usar keeps the
  // "you can use this now" promise that Grab & Go carries.
  lift_low: 'Listo para usar',
  lift_med: 'Algo de preparación',
  lift_high: 'A fondo',
  role_teacher: 'Maestros',
  role_para: 'Paraprofesionales',
  role_leader: 'Líderes',
  role_coach: 'Asesores',
}

export function getLabels(lang: Lang = 'en'): PdfLabels {
  return lang === 'es' ? ES : EN
}

/** Badge text for the capacity chip. Falls through to the raw value, as before. */
export function liftLabel(lift: string, lang: Lang = 'en'): string {
  const L = getLabels(lang)
  const map: Record<string, string> = {
    low: L.lift_low, LOW: L.lift_low,
    med: L.lift_med, MED: L.lift_med, medium: L.lift_med,
    high: L.lift_high, HIGH: L.lift_high,
  }
  return map[lift] || lift
}

/** Role chip text. Falls through to the raw value, as before. */
export function roleLabel(role: string, lang: Lang = 'en'): string {
  const L = getLabels(lang)
  const map: Record<string, string> = {
    teacher: L.role_teacher,
    para: L.role_para,
    leader: L.role_leader,
    coach: L.role_coach,
  }
  return map[role] || role
}
