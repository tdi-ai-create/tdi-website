/**
 * Which funding task statuses mean "this is finished, stop showing it".
 *
 * This exists because the same filter was written by hand in four places and
 * three of them were wrong in the same way. They excluded `done` and `skipped`
 * and did not exclude `cancelled`, so every cancelled task kept appearing as
 * live work: in Bella's daily digest, in the portal alerts, and in the overdue
 * counts we were reading as the state of the programme.
 *
 * The effect was not small. Ten of the twenty-two apparently open tasks were
 * cancelled, including every alarming one. The oldest genuinely open item was
 * 29 days old, not 57.
 *
 * `skipped` is kept because one code path still writes it, though no row
 * currently holds it. Statuses actually present today: pending, blocked,
 * done, cancelled.
 */
export const TERMINAL_TASK_STATUSES = ['done', 'skipped', 'cancelled'] as const

/** PostgREST `in` list. Use with `.not('status', 'in', NOT_TERMINAL_FILTER)`. */
export const NOT_TERMINAL_FILTER = `(${TERMINAL_TASK_STATUSES.map(s => `"${s}"`).join(',')})`
