/**
 * One colour per Quick Win category, used everywhere a category is shown.
 *
 * Every downloadable tool used to come out navy and grey, so a teacher with six
 * of them open could not tell one from another at a glance. Variety fixes that,
 * but only if it means something: a colour that tracks the category tells you
 * this is a wellness tool before you read a word, where decorative variation
 * would just be noise.
 *
 * Before this file there were three separate copies of a CATEGORY_COLORS map in
 * page components and they disagreed. On the Hub home, Time Savers was gold and
 * Classroom Tools was green. On a Quick Win page the two were swapped, so the
 * same category changed colour depending on where you stood. Same bug class as
 * the three copies of isTestAccount.
 *
 * They also only covered six of the twelve categories that actually exist, so
 * 121 of 269 published items fell through to one shared fallback. Half the
 * library was the same colour by accident.
 *
 * Contrast: every value below clears 4.5:1 against navy, verified rather than
 * eyeballed, so navy text on a category band always passes WCAG AA. Four of the
 * first choices failed and were lightened until they passed. Use navy on these,
 * never white: white fails on all twelve.
 */

export const NAVY = '#1E2749'
export const GOLD = '#E8B84B'

/** Fallback for a category not listed here. Deliberately neutral, not gold, so
 *  an unmapped category is visibly unmapped rather than silently blending in. */
export const CATEGORY_FALLBACK = '#C8CDD6'

export const CATEGORY_COLORS: Record<string, string> = {
  'Communication': '#E8927C',
  'Classroom Management': '#E8B84B',
  'Instructional Strategies': '#8FBFAE',
  'Games': '#DFA0BF',
  'Leadership': '#B49BD0',
  'Classroom Setup': '#A8B7C7',
  'Time Savers': '#8CC489',
  'Assessment': '#E3A970',
  'Lesson Planning': '#94B2D4',
  'Vocational': '#C9A98C',
  'Self-Care': '#D2AEDC',
  'Stress Relief': '#A3BDD6',
}

export function categoryColor(category: string | null | undefined): string {
  if (!category) return CATEGORY_FALLBACK
  return CATEGORY_COLORS[category] ?? CATEGORY_FALLBACK
}
