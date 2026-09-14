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

import { clientTaskLabel, clientAsk, askForCategory, NEUTRAL_TASK_LABEL } from '../funding-followup-email';
import { looksLikeRecordId } from '../milestone-key';
import {
  isPastDrafting,
  screenPath,
  eligibilityQuestionTitle,
  ownerOfBlockedPath,
} from '../funding-eligibility';
import { isOursToDo, isWaitingOnUs, whoseTurn } from '../creator-turn';
import { isPersonOwned, isSchoolOwned, isDecisionForRae } from '../funding-ownership';
import { planAfterAnswer } from '../funding-answer-actions';
import { canAgentDraft, stalledDraftMessage } from '../funding-offerable';
import { hasFunderDecided, isLive, isOver, isWithFunder } from '../funding-status';
import { computeNextActions } from '../funding-next-actions';
import { awardLabel, awardedSummary, awardedAmountOf, awardedTotal } from '../funding-award';

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
  {
    id: 'answer-creates-work',
    protects: 'An answer that produces no next step',
    origin:
      '11 September 2026: of the three things an answer can mean, only stop_path did anything. ' +
      'Bella confirmed on 9 September that the St. Peter Chanel window was open and closing ' +
      '1 October. The answer saved, nothing was created, and the work stopped there.',
    cases: [
      {
        name: 'proceed always creates work',
        holds: () =>
          (['gate', 'documentation', 'follow_up', '', 'something_new'] as string[]).every(
            (category) =>
              planAfterAnswer({
                outcome: 'proceed',
                questionTitle: 'Is this funder actually open, and when does it close?',
                answer: 'Sept 1 to Oct 1, open now',
                category,
              }).items.length > 0
          ),
      },
      {
        name: 'a cleared gate asks for the application, not another question',
        holds: () => {
          const plan = planAfterAnswer({
            outcome: 'proceed',
            questionTitle: 'Is TDI an approved vendor with this state agency?',
            answer: 'Yes, approved',
            category: 'gate',
            grantName: 'NEA Learning and Leadership',
          });
          return (
            plan.items.length === 1 &&
            plan.items[0].requiresAnswer === false &&
            plan.items[0].title.includes('NEA Learning and Leadership')
          );
        },
      },
      {
        name: 'a confirmed submission turns into watching for the decision',
        holds: () => {
          const plan = planAfterAnswer({
            outcome: 'proceed',
            questionTitle: 'Check if Gary submitted the IAA Foundation application',
            answer: 'Submitted 9 Sept, confirmation forwarded',
            category: 'follow_up',
            grantName: 'IAA Foundation',
          });
          return plan.items.length === 1 && /decision/i.test(plan.items[0].title);
        },
      },
      {
        name: 'still stuck comes back rather than going quiet',
        holds: () => {
          const plan = planAfterAnswer({
            outcome: 'still_blocked',
            questionTitle: 'Does anyone at this school hold the membership this grant requires?',
            answer: 'Left a voicemail, no reply yet',
            category: 'gate',
            priorReAsks: 0,
          });
          return (
            plan.items.length === 1 &&
            plan.items[0].requiresAnswer === true &&
            plan.items[0].dueInDays > 0
          );
        },
      },
      {
        name: 'a question that has come back twice becomes a decision for Rae',
        holds: () => {
          const plan = planAfterAnswer({
            outcome: 'still_blocked',
            questionTitle: 'Is TDI an approved vendor with this state agency?',
            answer: 'Still no answer from the state',
            category: 'gate',
            priorReAsks: 2,
          });
          return plan.items.length === 1 && plan.items[0].ownerType === 'rae';
        },
      },
      {
        name: 'a chase never lands on the school',
        holds: () =>
          (['proceed', 'still_blocked'] as const).every((outcome) =>
            planAfterAnswer({
              outcome,
              questionTitle: 'Check if Teri submitted the Pepco application',
              answer: 'Not yet',
              category: 'follow_up',
              priorReAsks: 0,
            }).items.every((i) => i.ownerType === 'tdi' || i.ownerType === 'rae')
          ),
      },
      {
        name: 'an answer does not declare a path clear while something still blocks it',
        holds: () => {
          const plan = planAfterAnswer({
            outcome: 'proceed',
            questionTitle: 'Does anyone at this school hold the membership this grant requires?',
            answer: 'All teachers at his school hold an NEA membership',
            category: 'gate',
            grantName: 'NEA Learning and Leadership',
            schoolName: 'Saunemin CCSD #438',
            remainingBlocker: 'must be filed by a named union member and no name is on file.',
          });
          return (
            plan.items.length === 1 &&
            !/clear to pursue/i.test(plan.items[0].title) &&
            plan.items[0].requiresAnswer === true &&
            /named union member/i.test(plan.items[0].description)
          );
        },
      },
      {
        name: 'with nothing else blocking, it does ask for the application',
        holds: () => {
          const plan = planAfterAnswer({
            outcome: 'proceed',
            questionTitle: 'Does anyone at this school hold the membership this grant requires?',
            answer: 'Yes, Gary Doughan is a current member',
            category: 'gate',
            grantName: 'NEA Learning and Leadership',
            remainingBlocker: null,
          });
          return plan.items.length === 1 && /clear to pursue/i.test(plan.items[0].title);
        },
      },
      {
        name: 'stop_path closes the path and creates nothing',
        holds: () => {
          const plan = planAfterAnswer({
            outcome: 'stop_path',
            questionTitle: 'Does anyone at this school hold the membership this grant requires?',
            answer: 'No, confirmed by email 17 Aug',
            category: 'gate',
          });
          return plan.closesPath === true && plan.items.length === 0;
        },
      },
    ],
  },

  {
    id: 'question-names-its-grant',
    protects: 'A list of questions nobody can tell apart',
    origin:
      '10 September 2026: four questions sat on Bella\'s list, every one titled "Is this funder ' +
      'actually open, and when does it close?". She reported she could not find anything about the ' +
      'Washington Commanders Charitable Foundation or Sharing Prince Georges. Amara had researched ' +
      'both on 8 September and the findings were inside two of those identical rows.',
    cases: [
      {
        name: 'the grant name leads the question',
        holds: () =>
          eligibilityQuestionTitle('window', 'Washington Commanders Charitable Foundation').startsWith(
            'Washington Commanders Charitable Foundation'
          ),
      },
      {
        name: 'two grants asked the same question get two different titles',
        holds: () =>
          eligibilityQuestionTitle('window', 'Washington Commanders Charitable Foundation') !==
          eligibilityQuestionTitle('window', 'Sharing Prince Georges'),
      },
      {
        name: 'the question survives when no grant name is available',
        holds: () => {
          const t = eligibilityQuestionTitle('window', null);
          return t.length > 0 && t.includes('open');
        },
      },
      {
        name: 'an unknown rule still produces something a person can act on',
        holds: () => {
          const t = eligibilityQuestionTitle('something_new', 'Some Grant');
          return t.startsWith('Some Grant') && t.length > 'Some Grant: '.length;
        },
      },
      {
        name: 'a grant already named in the question is not named twice',
        holds: () => {
          const t = eligibilityQuestionTitle('window', 'funder');
          return (t.match(/funder/gi) || []).length === 1;
        },
      },
    ],
  },

  {
    id: 'chase-only-what-is-offered',
    protects: 'Telling a person to chase a writer who was never handed the work',
    origin:
      '13 September 2026: Bella\'s board said "Title I Section 1003: nobody has picked this draft up. ' +
      'Requested 9 days ago and vanessa has not started. The portal is offering it correctly, so this ' +
      'is on our side to chase." It was not being offered. The eligibility screen refuses that path ' +
      'because TDI\'s approved-vendor status in that state is unconfirmed.',
    cases: [
      {
        name: 'a finished grant is never offered to a writer',
        holds: () =>
          ['closed', 'denied', 'awarded', 'applied', 'submitted'].every(
            (status) =>
              canAgentDraft(
                { name: 'Some Grant', status, window_status: 'open' },
                { sector: 'public' },
                { gate_open: true },
              ).offerable === false
          ),
      },
      {
        name: 'a shut gate blocks it, and says so',
        holds: () => {
          const v = canAgentDraft(
            { name: 'Some Grant', status: 'not_started', window_status: 'open' },
            { sector: 'public' },
            { gate_open: false },
          );
          return v.offerable === false && v.blockedBy === 'gate' && v.reason.length > 0;
        },
      },
      {
        name: 'an unverified window blocks it',
        holds: () => {
          const v = canAgentDraft(
            { name: 'Some Grant', status: 'not_started', window_status: 'unknown' },
            { sector: 'public' },
            { gate_open: true },
          );
          return v.offerable === false && v.blockedBy === 'window';
        },
      },
      {
        name: 'the eligibility screen can block it too, which is the check that was missing',
        holds: () => {
          const v = canAgentDraft(
            { name: 'Title I Section 1003 (School Improvement)', status: 'not_started', window_status: 'open' },
            { sector: 'diocesan', stateCode: 'LA' },
            { gate_open: true },
          );
          return v.offerable === false && v.blockedBy === 'screen';
        },
      },
      {
        name: 'blocked work never tells anyone to chase',
        holds: () => {
          const blocked = stalledDraftMessage(
            { offerable: false, blockedBy: 'screen', reason: 'TDI is not a confirmed vendor' },
            'vanessa',
            9,
          );
          return !/chase/i.test(blocked.why) || /will not help/i.test(blocked.why);
        },
      },
      {
        name: 'work genuinely on offer does say to chase',
        holds: () => {
          const open = stalledDraftMessage({ offerable: true, blockedBy: null, reason: '' }, 'vanessa', 9);
          return /chase/i.test(open.why) && /9 days/.test(open.why);
        },
      },
      {
        name: 'a blocked reason is never empty',
        holds: () => {
          const cases = [
            canAgentDraft({ name: 'G', status: 'closed' }, {}, { gate_open: true }),
            canAgentDraft({ name: 'G', status: 'not_started', window_status: 'open' }, { archived: true }, { gate_open: true }),
            canAgentDraft({ name: 'G', status: 'not_started', window_status: 'closed_missed' }, {}, { gate_open: true }),
          ];
          return cases.every((c) => !c.offerable && c.reason.trim().length > 0);
        },
      },
    ],
  },

  {
    id: 'email-says-what-we-need',
    protects: 'A school being told a task is due and not what to do about it',
    origin:
      '10 September 2026: Bella asked that automatically written emails "be specific about what we ' +
      'need from contacts". They named the task, gave a date, and said everything was ready on our ' +
      'end, which tells a principal nothing actionable.',
    cases: [
      {
        name: 'a real ask survives',
        holds: () => {
          const ask = clientAsk(
            'Please log into eGMS and report back the exact field labels shown for the Title II-A narrative.'
          );
          return ask !== null && /eGMS/.test(ask);
        },
      },
      {
        name: 'an instruction to a colleague never reaches a school',
        holds: () =>
          [
            'Check if Gary submitted the application and then mark it complete',
            'Ask Bella to confirm the window before we draft anything',
            'Email Teri and remind her about the deadline this week',
          ].every((t) => clientAsk(t) === null),
      },
      {
        name: 'our own wording never reaches a school',
        holds: () =>
          clientAsk(
            'If 3+ staff, proceed with the $5,000 group tier. If zero, mark this opportunity not applicable.'
          ) === null,
      },
      {
        name: 'nothing is said when there is nothing to say',
        holds: () =>
          clientAsk(null) === null && clientAsk('') === null && clientAsk('   ') === null,
      },
      {
        name: 'a label is not mistaken for an ask',
        holds: () => clientAsk('Title II-A application') === null,
      },
      {
        name: 'a status note is never labelled as a request',
        holds: () =>
          clientAsk('Submitted by Jovita Ortiz ~June 16. Expected notification mid-September.') === null,
      },
      {
        name: 'the common task kinds all carry an ask',
        holds: () =>
          ['follow_up', 'documentation', 'gate', 'submission'].every((c) => {
            const a = askForCategory(c);
            return typeof a === 'string' && a.length > 20;
          }),
      },
      {
        name: 'an unknown kind says nothing rather than guessing',
        holds: () => askForCategory('something_new') === null && askForCategory(null) === null,
      },
      {
        name: 'a whole brief is not pasted into an email',
        holds: () => clientAsk('word '.repeat(200)) === null,
      },
    ],
  },

  {
    id: 'dead-ends-are-decisions',
    protects: 'Research a manager cannot do landing on a manager',
    origin:
      "13 September 2026: six of Bella's thirteen open items were research questions such as " +
      '"Is TDI an approved vendor with this state agency?". Four had already been looked at by an ' +
      'agent who could not establish the answer, so the fallback for every agent dead end was her.',
    cases: [
      {
        name: 'a dead end goes to Rae',
        holds: () => ownerOfBlockedPath(true).ownerName === 'Rae',
      },
      {
        name: 'something nobody has looked at yet stays with Bella',
        holds: () => ownerOfBlockedPath(false).ownerName === 'Bella',
      },
      {
        name: 'both owners are reachable',
        holds: () =>
          [true, false].every((looked) => {
            const o = ownerOfBlockedPath(looked);
            return /@teachersdeserveit\.com$/.test(o.ownerEmail) && o.ownerName.length > 0;
          }),
      },
      {
        name: 'the two owners are never the same person',
        holds: () => ownerOfBlockedPath(true).ownerEmail !== ownerOfBlockedPath(false).ownerEmail,
      },
    ],
  },

  {
    id: 'never-allocate-the-ask',
    protects: 'Allocating money a funder never gave us',
    origin:
      '14 September 2026: Bella reported that the funder email said $500 and the site said $5,000. ' +
      'Walmart Spark Good for Saunemin was marked awarded with no amount recorded, and the board fell ' +
      'back to the $5,000 we asked for. She was one click from mapping ten times the money to line ' +
      'items in a conversation with the school.',
    cases: [
      {
        name: 'an awarded grant with no amount asks for the real figure, not an allocation',
        holds: () => {
          const actions = computeNextActions(
            { id: 'p1' },
            [{ id: 'o1', name: 'Walmart Spark Good Grant', status: 'awarded', amount: 5000, awarded_amount: null }],
            [],
            { gate_open: true },
            [],
          );
          const allocate = actions.find((a) => a.id === 'allocate-o1');
          const record = actions.find((a) => a.id === 'record-award-o1');
          return !allocate && !!record;
        },
      },
      {
        name: 'the ask never appears as an amount to allocate',
        holds: () => {
          const actions = computeNextActions(
            { id: 'p1' },
            [{ id: 'o1', name: 'Some Grant', status: 'awarded', amount: 5000, awarded_amount: null }],
            [],
            { gate_open: true },
            [],
          );
          return !actions.some((a) => /Allocate \$5,000/.test(a.label));
        },
      },
      {
        name: 'a real award is still allocated',
        holds: () => {
          const actions = computeNextActions(
            { id: 'p1' },
            [{ id: 'o1', name: 'Some Grant', status: 'awarded', amount: 5000, awarded_amount: 500 }],
            [],
            { gate_open: true },
            [],
          );
          return actions.some((a) => a.id === 'allocate-o1' && /\$500/.test(a.label));
        },
      },
      {
        name: 'a fully allocated award stops asking',
        holds: () => {
          const actions = computeNextActions(
            { id: 'p1' },
            [{ id: 'o1', name: 'Some Grant', status: 'awarded', amount: 5000, awarded_amount: 500 }],
            [],
            { gate_open: true },
            [{ funding_opportunity_id: 'o1', allocated_amount: 500 }],
          );
          return !actions.some((a) => a.id === 'allocate-o1');
        },
      },
    ],
  },

  {
    id: 'the-ask-is-not-a-receipt',
    protects: 'Money we were never given being reported as received',
    origin:
      '14 September 2026: Bella reported "the email says $500 but our site shows $5,000". Five screens ' +
      'answered "what was this awarded" by falling back to opp.amount, which is what we asked for. ' +
      'Walmart Spark Good for Saunemin was marked awarded with no figure recorded, so the Awarded tab ' +
      'read "$5K awarded across 2 grants", the board read "Awarded $5K received", and the pipeline ' +
      'subtracted a receipt that did not exist.',
    cases: [
      {
        name: 'an unrecorded award is never the ask',
        holds: () => awardedAmountOf({ status: 'awarded', amount: 5000, awarded_amount: null }) === null,
      },
      {
        name: 'a recorded award is itself',
        holds: () => awardedAmountOf({ status: 'awarded', amount: 5000, awarded_amount: 500 }) === 500,
      },
      {
        name: 'a total never includes an unrecorded award',
        holds: () => {
          const t = awardedTotal([
            { status: 'awarded', amount: 5000, awarded_amount: null },
            { status: 'awarded', amount: 1000, awarded_amount: 500 },
          ]);
          return t.total === 500 && t.unrecorded === 1;
        },
      },
      {
        name: 'a short total says it is short',
        holds: () => {
          const line = awardedSummary([
            { status: 'awarded', amount: 5000, awarded_amount: null },
            { status: 'awarded', amount: 1000, awarded_amount: 500 },
          ]);
          return /\$500/.test(line) && /incomplete/i.test(line) && !/\$5,000/.test(line);
        },
      },
      {
        name: 'nothing recorded at all does not print a figure',
        holds: () => {
          const line = awardedSummary([{ status: 'awarded', amount: 5000, awarded_amount: null }]);
          return !/\$/.test(line) && /not recorded/i.test(line);
        },
      },
      {
        name: 'a row with no award says so instead of showing the ask',
        holds: () => {
          const label = awardLabel({ status: 'awarded', amount: 5000, awarded_amount: null });
          return label === 'amount not recorded' && !/5,000/.test(label);
        },
      },
      {
        name: 'a zero or negative award counts as unrecorded rather than real',
        holds: () =>
          awardedAmountOf({ status: 'awarded', amount: 5000, awarded_amount: 0 }) === null &&
          awardedAmountOf({ status: 'awarded', amount: 5000, awarded_amount: -1 }) === null,
      },
      {
        name: 'a grant that is not awarded contributes nothing',
        holds: () => {
          const t = awardedTotal([{ status: 'applied', amount: 5000, awarded_amount: 5000 }]);
          return t.total === 0 && t.unrecorded === 0;
        },
      },
    ],
  },

  {
    id: 'one-count-of-her-work',
    protects: 'Two numbers for the same workload on one screen',
    origin:
      '14 September 2026: the tab badge read "Needs you 31" and the stat four pixels below it read ' +
      '23. The badge counted every team item including the decisions routed to Rae; the board column ' +
      'excluded them. The Schools tab made the same mistake again, listing her decisions under ' +
      '"Ready for You" badged "You".',
    cases: [
      {
        name: "Rae's decisions are recognised by either field shape",
        holds: () =>
          isDecisionForRae({ ownerName: 'Rae' }) && isDecisionForRae({ owner_name: 'Rae' }),
      },
      {
        name: 'the test is not confused by case or spacing',
        holds: () => isDecisionForRae({ ownerName: '  rae ' }),
      },
      {
        name: "Bella's work is never counted as a decision",
        holds: () =>
          !isDecisionForRae({ ownerName: 'Bella' }) &&
          !isDecisionForRae({ ownerName: null }) &&
          !isDecisionForRae({}),
      },
      {
        name: "a decision is still ours, not the school's",
        holds: () => isPersonOwned({ ownerType: 'tdi' }) && !isSchoolOwned({ ownerType: 'tdi' }),
      },
    ],
  },

  {
    id: 'three-questions-not-six-lists',
    protects: 'Screens disagreeing about whether a grant is finished',
    origin:
      'A census on 14 September 2026 found "this grant is finished" written twenty-one times in six ' +
      'different ways. One list treated a submitted grant as finished and another did not. Three ' +
      'ignored "closed" entirely. That is why a closed grant sat in a writer queue for nine days and ' +
      'a grant already won was still offered for drafting.',
    cases: [
      {
        name: 'only the funder decides, and only two states mean that',
        holds: () =>
          hasFunderDecided('awarded') &&
          hasFunderDecided('denied') &&
          !hasFunderDecided('closed') &&
          !hasFunderDecided('applied'),
      },
      {
        name: 'closing something ourselves is not the funder deciding',
        holds: () => !hasFunderDecided('closed') && !hasFunderDecided('not_applicable'),
      },
      {
        name: 'with the funder covers everything that has left our hands',
        holds: () =>
          ['applied', 'submitted', 'awarded', 'denied'].every(isWithFunder) &&
          !isWithFunder('researching') &&
          !isWithFunder('not_started'),
      },
      {
        name: 'over covers every way work can end, including the four often missed',
        holds: () =>
          ['awarded', 'denied', 'closed', 'not_applicable', 'cancelled', 'archived'].every(isOver),
      },
      {
        name: 'a grant still being worked is never over',
        holds: () =>
          ['not_started', 'researching', 'applied', 'submitted', 'waiting'].every((st) => !isOver(st)),
      },
      {
        name: 'live is exactly the inverse of over',
        holds: () =>
          ['awarded', 'closed', 'not_started', 'researching', 'cancelled', ''].every(
            (st) => isLive(st) === !isOver(st),
          ),
      },
      {
        name: 'casing and whitespace cannot fork any of the three',
        holds: () =>
          isOver('  Awarded ') && isWithFunder('APPLIED') && hasFunderDecided('Denied'),
      },
      {
        name: 'an unknown status is treated as live rather than quietly finished',
        holds: () => isLive('some_new_status') && !isOver('some_new_status'),
      },
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
