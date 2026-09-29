/**
 * What educators call things, versus what the library calls them.
 *
 * Hub search matches substrings against titles, descriptions, categories and
 * tags. That works only when the reader happens to use our word. On
 * 29 September 2026 the first logged search on the Hub was "paraprofesional",
 * which returned nothing, on a library where 55 published tools carry the
 * `para` tag. The tools were there. The word was not.
 *
 * So this is a small, reviewed vocabulary rather than a clever algorithm. Each
 * group is a set of terms that mean the same thing to an educator. Searching
 * any one of them also searches the others.
 *
 * Rules that keep it honest:
 *
 *   - **Groups are equivalences, not associations.** A TA and a para are the
 *     same person. Wellness and time management are not the same subject, even
 *     though the same teacher wants both. Associations belong in related
 *     resources, not in search, because they quietly make every search worse.
 *   - **Synonym hits rank below exact hits.** Someone who typed our word gets
 *     our word first, always. Widening a search must never demote a good match.
 *   - **It changes when the zero result log says it should**, not when someone
 *     has a hunch. That log is the evidence and it now exists.
 *
 * Misspellings sit in here too, deliberately. A dedicated spelling layer using
 * trigram similarity is the next step, and it needs two Postgres extensions
 * that are not installed yet. Until then, the handful of misspellings that
 * actually show up cost one line each.
 */

/**
 * Terms that mean the same thing. Lowercase, and compared lowercased.
 *
 * Reviewed by Rae before this shipped. Adding a group without review is how a
 * vocabulary becomes 300 uncontrolled tags.
 */
export const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  // The one that started this. All five titles for the same role, plus the
  // misspelling that produced the first logged zero result search.
  [
    'para',
    'paraprofessional',
    'paraprofesional',
    'paraeducator',
    'para educator',
    'teaching assistant',
    'classroom aide',
    'instructional assistant',
    'one to one',
  ],

  // Two adults teaching the same room. The Working Together shelf lives here.
  [
    'co-teaching',
    'coteaching',
    'co teaching',
    'push in',
    'push-in',
    'inclusion support',
    'collaborative teaching',
  ],

  ['behavior', 'behaviour', 'behavior management', 'discipline'],

  ['de-escalation', 'de escalation', 'deescalation', 'calm down', 'calming'],

  ['iep', 'individualized education program', '504', 'special education', 'sped'],

  ['ell', 'esl', 'english language learner', 'multilingual learner', 'emergent bilingual'],

  ['principal', 'administrator', 'admin', 'school leader'],

  ['instructional coach', 'coach', 'mentor', 'mentoring'],

  ['wellness', 'well being', 'wellbeing', 'self care', 'burnout'],

  ['substitute', 'sub plans', 'substitute plans', 'emergency plans'],

  ['formative assessment', 'check for understanding', 'exit ticket', 'exit slip'],

  ['family communication', 'parent communication', 'parent contact', 'parent conference'],
];

/** Lowercased term to every other term in its group. Built once at module load. */
const EXPANSIONS: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    for (const term of group) {
      const others = group.filter((t) => t !== term);
      // A term appearing in two groups gets both sets rather than the last one.
      map.set(term, [...(map.get(term) ?? []), ...others]);
    }
  }
  return map;
})();

/**
 * Extra terms worth searching alongside what the reader typed.
 *
 * Returns only the additions, never the original, so the caller cannot
 * accidentally lose track of which results were the exact match. Ranking
 * depends on that distinction.
 *
 * Matching is whole-query for now. "para" expands, and so does "teaching
 * assistant", but "para forms" does not, because expanding on a contained word
 * would turn "separate" into a search for teaching assistants.
 */
export function expandQuery(query: string): string[] {
  const normalised = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalised) return [];
  return EXPANSIONS.get(normalised) ?? [];
}
