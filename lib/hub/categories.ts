/**
 * One spelling of a category, wherever it is shown.
 *
 * Quick Wins store a category as a label: "Classroom Management". Courses store
 * the same idea as a slug: "classroom-management", "stress-&-wellness". Nothing
 * reconciles the two in the database, so every surface showing a course
 * category converts it on the way out, and three places were doing that
 * independently:
 *
 *   app/hub/courses/page.tsx       full conversion, used to match the filter bar
 *   components/hub/CourseCard.tsx  the same conversion, copied
 *   app/hub/page.tsx               only the hyphens, so the Hub home page read
 *                                  "classroom management" in lower case while
 *                                  the card beside it read "Classroom
 *                                  Management"
 *
 * A fourth copy was about to be written for the leadership assign picker, which
 * is where this stops being untidy and becomes a bug: a picker that filters
 * Quick Wins and courses together matches nothing at all unless both sides
 * speak one vocabulary.
 *
 * So the conversion lives here once. The real fix is one vocabulary in the
 * database, and until that exists every reader has to agree on how to fake it.
 */
export function categoryLabel(category: string | null | undefined): string {
  if (!category) return '';
  return category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * True when a stored category means the same thing as a filter label, in either
 * vocabulary. Quick Wins already match on equality. Courses need converting
 * first, and a caller should never have to know which it is holding.
 */
export function categoryMatches(
  category: string | null | undefined,
  label: string,
): boolean {
  if (!category) return false;
  return category === label || categoryLabel(category) === label;
}
