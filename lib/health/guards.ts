// ---------------------------------------------------------------------------
// Every guard proves it can still catch its own case.
//
// This repo has roughly forty checks: thirteen npm scripts, twenty integrity
// scripts, six health crons. It has no unit tests. So there is no evidence that
// any of those guards can still fail, and a guard that has quietly stopped
// working looks exactly like a guard that is passing.
//
// That is the same silent-failure shape as every bug found this week, sitting
// one level up. clientTaskLabel is the clearest example: it is the only thing
// standing between our internal wording and a school's inbox, it has never been
// exercised by anything, and if a regex in it broke tomorrow the first person to
// find out would be a principal.
//
// So each guard below is registered with what it protects, which incident it
// came from, and cases it MUST get right. A case is not a unit test for its own
// sake. It is the specific thing that went wrong, written down so the guard has
// to keep catching it.
//
// The rule for adding one: every entry names a real incident. If you cannot
// name the day it cost something, it does not belong here yet.
// ---------------------------------------------------------------------------

import { clientTaskLabel, NEUTRAL_TASK_LABEL } from '../funding-followup-email';
import { looksLikeRecordId } from '../milestone-key';
import { isPastDrafting, screenPath } from '../funding-eligibility';
import { isOursToDo, isWaitingOnUs, whoseTurn } from '../creator-turn';
import { isPersonOwned, isSchoolOwned } from '../funding-ownership';

export interface GuardCase {
  /** What this case proves, in words. */
  name: string;
  /** True when the guard behaved. */
  holds: () => boolean;
}

export interface Guard {
  id: string;
  /** What breaks in the real world if this stops working. */
  protects: string;
  /** The incident that put it here. */
  origin: string;
  cases: GuardCase[];
}

export const GUARDS: Guard[] = [
  {
    id: 'client-wording',
    protects: 'Internal wording reaching a school',
    origin:
      '18 August 2026: an agent filled client_label with our pricing ladder and the words ' +
      '"mark this opportunity not applicable", in a draft addressed to the school it described.',
    cases: [
      {
        name: 'an instruction to a colleague is refused',
        holds: () =>
          clientTaskLabel('Check if Gary submitted the application', null, null) === NEUTRAL_TASK_LABEL,
      },
      {
        name: 'one of our own names is refused',
        holds: () => clientTaskLabel('Ask Bella to confirm the window', null, null) === NEUTRAL_TASK_LABEL,
      },
      {
        name: 'our pricing ladder is refused',
        holds: () =>
          clientTaskLabel(
            'If 3+, proceed with the $5,000 group tier. If zero, mark not applicable.',
            null,
            null,
          ) === NEUTRAL_TASK_LABEL,
      },
      {
        name: 'a grant name is allowed through',
        holds: () => /Illinois Prairie/.test(clientTaskLabel('Check if Gary submitted', null, 'Illinois Prairie Community Foundation')),
      },
      {
        name: 'a sentence is too long to be a label',
        holds: () => clientTaskLabel('x'.repeat(120), null, null) === NEUTRAL_TASK_LABEL,
      },
    ],
  },

  {
    id: 'milestone-identifier',
    protects: 'Every write button on the admin creator page',
    origin:
      '31 August to 8 September 2026: the page sent creator_milestones.id where the routes look up ' +
      'milestones.id. Approve, Request changes and Mark complete were all broken for eight days and ' +
      'reported it as "Milestone not found".',
    cases: [
      {
        name: 'a uuid is spotted as a row id',
        holds: () => looksLikeRecordId('0dd7f0de-3b1a-4c9e-9a11-2f7c1b5d8e42') === true,
      },
      { name: 'a step key is not mistaken for one', holds: () => looksLikeRecordId('assets_submitted') === false },
      { name: 'an empty value is not a row id', holds: () => looksLikeRecordId('') === false },
      { name: 'a non-string is not a row id', holds: () => looksLikeRecordId(null) === false },
    ],
  },

  {
    id: 'pre-draft-gate',
    protects: 'A blocker appearing on a grant the school already filed',
    origin:
      '9 September 2026: Allenwood\'s NEA card showed "no name is on file" four lines above ' +
      '"Submitted by Jovita Ortiz (NEA member)". It had been filed on 16 June and the audit stamped it on 18 August.',
    cases: [
      { name: 'client_submitted counts as filed', holds: () => isPastDrafting(null, true) === true },
      { name: 'applied counts as filed', holds: () => isPastDrafting('applied', false) === true },
      { name: 'denied counts as filed', holds: () => isPastDrafting('denied', null) === true },
      { name: 'not_started does not', holds: () => isPastDrafting('not_started', false) === false },
      {
        name: 'a filed grant clears every rule',
        holds: () =>
          screenPath(
            { name: 'NEA Learning & Leadership Grant', namedApplicant: null, alreadySubmitted: true },
            { sector: 'diocesan' },
          ).verdict === 'clear',
      },
      {
        name: 'an unfiled one is still gated',
        holds: () =>
          screenPath(
            { name: 'NEA Learning & Leadership Grant', namedApplicant: null, alreadySubmitted: false },
            { sector: 'public district' },
          ).verdict === 'ask_first',
      },
    ],
  },

  {
    id: 'whose-turn',
    protects: 'The board and the creator page agreeing on who owes what',
    origin:
      '8 September 2026: four files decided whose turn it was with four different rules, so the board ' +
      'told Bella a step was ours while the creator page called it theirs.',
    cases: [
      { name: 'a team step is ours', holds: () => isOursToDo({ requiresTeamAction: true }) === true },
      { name: 'a creator step is not', holds: () => isOursToDo({ requiresTeamAction: false }) === false },
      {
        name: 'a submitted step is waiting on us',
        holds: () => isWaitingOnUs({ status: 'in_progress', reviewStatus: 'submitted' }) === true,
      },
      {
        name: 'an untouched creator step is theirs',
        holds: () => whoseTurn({ status: 'available', requiresTeamAction: false }) === 'creator',
      },
    ],
  },

  {
    id: 'grant-work-ownership',
    protects: 'Work labelled as the school\'s when it is ours, and the reverse',
    origin:
      '8 September 2026: eleven of thirteen person-owned funding items were displayed as "Agent Pipeline" ' +
      'on the school card. Earlier, TDI follow-ups owned as client mailed titles written about a principal, ' +
      'to that principal. Two received 41 of them.',
    cases: [
      { name: 'client owner_type is the school', holds: () => isSchoolOwned({ owner_type: 'client' }) === true },
      { name: 'tdi owner_type is a person', holds: () => isPersonOwned({ owner_type: 'tdi' }) === true },
      { name: 'a missing owner_type is a person', holds: () => isPersonOwned({}) === true },
      { name: 'camelCase is read the same way', holds: () => isSchoolOwned({ ownerType: 'client' }) === true },
    ],
  },
];

export interface GuardResult {
  id: string;
  protects: string;
  origin: string;
  passed: number;
  failed: { name: string; error?: string }[];
}

/**
 * Runs every case. A guard that throws is treated as failing, because a guard
 * that cannot run is not protecting anything.
 */
export function runGuards(): GuardResult[] {
  return GUARDS.map((g) => {
    const failed: { name: string; error?: string }[] = [];
    let passed = 0;
    for (const c of g.cases) {
      try {
        if (c.holds()) passed += 1;
        else failed.push({ name: c.name });
      } catch (e) {
        failed.push({ name: c.name, error: String((e as Error).message ?? e) });
      }
    }
    return { id: g.id, protects: g.protects, origin: g.origin, passed, failed };
  });
}
