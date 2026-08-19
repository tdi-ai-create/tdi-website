/**
 * no-unchecked-db-write
 *
 * Fails when a Supabase write is awaited and its `error` is never looked at.
 *
 * Why this rule exists. On 18 and 19 August 2026, five separate features were
 * found to be silently broken, all with the same shape: a write fails, the
 * returned error is discarded, and the caller reports success.
 *
 *   1. Confirm Payment wrote three columns that did not exist. The invoice was
 *      already marked paid, so the school was never emailed a receipt and the
 *      #financials alert never fired.
 *   2. The Hub stress chart read `score` where check-ins write `stress_score`.
 *      417 check-ins, 309 members, no chart, ever.
 *   3. Saving a partnership contact returned 401 on every attempt. The UI had
 *      no branch for failure, so the field simply sat there looking normal.
 *   4. The eligibility audit reported "6 questions raised" and wrote zero,
 *      rejected by two CHECK constraints.
 *   5. Local funder discovery wrote to a `notes` column that does not exist.
 *      It had never once produced a row, and that single word cost the whole
 *      ability to find funding specific to a school.
 *
 * Every one was invisible for weeks or months. A written rule did not prevent
 * number four, which was committed hours after that rule was written down. So
 * the check has to be mechanical.
 *
 * What counts as looking at the error:
 *   const { error } = await supabase.from('t').insert({...})     ok
 *   const res = await supabase.from('t').update({...})           ok, kept
 *   const { data, error: e } = await supabase...                 ok, renamed
 *   await supabase.from('t').insert({...})                       REPORTED
 *   const { data } = await supabase.from('t').insert({...})      REPORTED
 *
 * Not covered on purpose: reads. A `select` that silently returns nothing is a
 * real bug too, but flagging every read at once would bury the writes, and
 * writes are where the damage has been.
 */

const WRITE_METHODS = new Set(['insert', 'update', 'upsert', 'delete']);

/** Walk a member/call chain looking for `.from(...)`, the Supabase tell. */
function chainHasFrom(node) {
  let cur = node;
  let depth = 0;
  while (cur && depth < 24) {
    depth++;
    if (
      cur.type === 'CallExpression' &&
      cur.callee?.type === 'MemberExpression' &&
      cur.callee.property?.name === 'from'
    ) {
      return true;
    }
    if (cur.type === 'CallExpression') cur = cur.callee;
    else if (cur.type === 'MemberExpression') cur = cur.object;
    else return false;
  }
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require the error from a Supabase write to be captured, so a failed write cannot look like a successful one.',
    },
    schema: [],
    messages: {
      discarded:
        'This {{method}} can fail and nothing here would notice. Destructure error from the result and act on it. Five features were silently broken this way in two days.',
      noErrorKey:
        'This {{method}} destructures its result but never takes `error`. A rejected write is indistinguishable from a successful one. Add `error` and act on it.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee?.type !== 'MemberExpression') return;

        const method = callee.property?.name;
        if (!WRITE_METHODS.has(method)) return;
        if (!chainHasFrom(callee.object)) return;

        // Climb any trailing chain: .eq(...).select().single() and so on.
        let top = node;
        while (
          top.parent &&
          ((top.parent.type === 'MemberExpression' && top.parent.object === top) ||
            (top.parent.type === 'CallExpression' && top.parent.callee === top))
        ) {
          top = top.parent;
        }

        // Only awaited calls are judged. An un-awaited builder is not yet a query.
        if (top.parent?.type !== 'AwaitExpression') return;
        const awaited = top.parent;
        const parent = awaited.parent;

        // await supabase.from('t').insert({...})   result thrown away
        if (parent?.type === 'ExpressionStatement') {
          context.report({ node: callee.property, messageId: 'discarded', data: { method } });
          return;
        }

        // const { ... } = await ...
        if (parent?.type === 'VariableDeclarator' && parent.id?.type === 'ObjectPattern') {
          const takesError = parent.id.properties.some(
            (p) => p.type === 'Property' && p.key?.name === 'error',
          );
          if (!takesError) {
            context.report({ node: callee.property, messageId: 'noErrorKey', data: { method } });
          }
          return;
        }

        // Anything else (assigned whole, returned, passed on) keeps the error
        // reachable, so it is left alone.
      },
    };
  },
};
