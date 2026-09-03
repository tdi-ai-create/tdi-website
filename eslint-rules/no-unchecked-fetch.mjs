/**
 * no-unchecked-fetch
 *
 * Fails when a browser `fetch` is awaited and whether it succeeded is never
 * established.
 *
 * Why this rule exists. On 3 September 2026, six controls were found broken in
 * one day, every one the same shape: the request fails, the response is
 * discarded or its failure is unhandled, and the button looks dead or, worse,
 * reports success.
 *
 *   1. Ticking a funding task did nothing. The route refuses to close a
 *      question without an answer and returns a sentence written for the
 *      person clicking. The handler binned it and reloaded. Ten of seventeen
 *      open items are questions, so this was the usual outcome.
 *   2. Approve and Reject on agent drafts posted to an endpoint that needs a
 *      bearer token no browser has. Every click returned 401. The handler
 *      checked res.ok and did nothing when it was false, so a hard refusal
 *      looked identical to a dead button. Neither had ever worked, and a
 *      draft sat pending for three days.
 *   3. Saving an email draft said "saved!" without reading the reply.
 *   4. Sending an email said "sent!" after a failed send, claiming something
 *      reached a school when it may never have left.
 *   5. The access tool's repair button reported "Repaired the account" while
 *      changing nothing at all.
 *   6. Cancelling an action and saving a note both discarded failures.
 *
 * Every one of these was found by clicking, not by reading. CLAUDE.md already
 * said a check that cannot visibly fail is not a check, and four of the six
 * were written after that sentence. So the check has to be mechanical.
 *
 * What counts as establishing success:
 *   const res = await fetch(url); if (!res.ok) ...            ok
 *   const r = await fetch(url); const d = await r.json(); if (r.ok && d.ok)  ok
 *   if ((await fetch(url)).ok) ...                            ok
 *   await fetch(url)                                          REPORTED
 *   const d = await (await fetch(url)).json()                 REPORTED
 *
 * Not covered on purpose: fetch inside a route handler talking to a third
 * party. This is about controls a person presses, where the cost of a silent
 * failure is somebody believing work happened.
 */

/** Names that mean "this identifier holds a Response". */
function bindsResponse(node) {
  return node?.type === 'Identifier' || node?.type === 'ObjectPattern';
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'A fetch whose success is never established. The control fails silently, or reports success it did not verify.',
    },
    schema: [],
    messages: {
      unchecked:
        'This fetch can fail and nothing here would notice. Keep the response and check `.ok` before reporting success. Six controls were found broken this way in one day, including two that had never worked.',
    },
  },

  create(context) {
    /** Identifiers in this file that hold a Response and are later checked. */
    const checked = new Set();
    const candidates = [];

    function isFetchCall(node) {
      return (
        node?.type === 'CallExpression' &&
        ((node.callee?.type === 'Identifier' && node.callee.name === 'fetch') ||
          (node.callee?.type === 'MemberExpression' && node.callee.property?.name === 'fetch'))
      );
    }

    return {
      // res.ok / response.status anywhere marks that identifier as checked.
      MemberExpression(node) {
        if (
          (node.property?.name === 'ok' || node.property?.name === 'status') &&
          node.object?.type === 'Identifier'
        ) {
          checked.add(node.object.name);
        }
      },

      AwaitExpression(node) {
        if (!isFetchCall(node.argument)) return;

        const parent = node.parent;

        // await fetch(...) as a bare statement: nothing can ever be checked.
        if (parent?.type === 'ExpressionStatement') {
          candidates.push({ node, name: null });
          return;
        }

        // const x = await fetch(...) -> checkable, decide at Program:exit
        if (parent?.type === 'VariableDeclarator' && bindsResponse(parent.id)) {
          if (parent.id.type === 'Identifier') {
            candidates.push({ node, name: parent.id.name });
          }
          return;
        }

        // (await fetch(...)).json() -> the Response is thrown away immediately
        if (
          parent?.type === 'MemberExpression' &&
          parent.object === node &&
          parent.property?.name !== 'ok' &&
          parent.property?.name !== 'status'
        ) {
          candidates.push({ node, name: null });
          return;
        }

        // if ((await fetch(...)).ok) and similar are fine.
      },

      'Program:exit'() {
        for (const c of candidates) {
          if (c.name && checked.has(c.name)) continue;
          context.report({ node: c.node, messageId: 'unchecked' });
        }
      },
    };
  },
};
