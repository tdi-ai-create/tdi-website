# TDI Website

Next.js 16 App Router, TypeScript, Tailwind 4, Supabase, deployed on Vercel.
Live at www.teachersdeserveit.com.

Read this file before making changes. It encodes decisions that have already
cost real time or reached production broken. Brand and page-level detail lives
in `PROJECT-CONTEXT.md`, which is older and not always current, so treat this
file as the authority where the two disagree.

---

## 1. Verification: the rule that matters most

Most incidents here were not bad code. They were correct-looking code paired
with a check that could not fail.

**A check that cannot visibly fail is not a check.**

- Confirm a command ran by its **exit code**, never by empty output.
  `npx tsc --noEmit` in a worktree without `node_modules` produces no errors
  because it never starts. Silence is not success.
- When filtering output through `grep`, you have hidden the error that says
  the command did not run. Capture the exit code separately.

**Verify the outcome a person experiences, not the presence of the code.**

- Not "the component exists and compiles" but "I loaded the page and the
  component rendered."
- A component with zero importers ships unreachable. Before calling UI work
  done, grep for who imports it and confirm that file is on a live route.
- Not "the button exists" but "I clicked it and the container scrolled 313px."

**Report the observation, not the conclusion.**

Say "tsc exited 0" rather than "typecheck passes." Rae can audit the first.
"I could not verify this" is a real and acceptable answer. It is always better
than asserting.

**When a test says something is broken, suspect the instrument before the code.**

**Label every factual claim.**

- **Measured**: I ran the query or read the line. Cite which.
- **Derived**: follows from measured facts. Show the step so it can be attacked.
- **Unverified**: not checked. Say so, or do not say it.

**A database row is a record, not reality.** A record disagreeing with the
world is the single most common bug in this codebase. Never state a fact about
a school, person, or contract from one table read. Find the system of record.
When a field implies someone failed to do something, assume our record is stale
before assuming they did not do it.

**State that permits a mechanism is not proof the mechanism fired.** For any
"X is happening" claim, require a timestamp, a log row, or an output artifact.

---

## 2. Environments and the two traps

### Vercel: there are two projects and one is wrong

The domain `www.teachersdeserveit.com` is aliased to the **`teachersdeserveit`**
project. A second project named `tdi-website` also exists and builds fine, but
nothing deployed there ever appears on the live site.

Every deploy must name the project explicitly:

```
npx vercel deploy --prod --force --project teachersdeserveit
```

An hour was lost to this being diagnosed as CDN caching.

### Supabase: there are two databases and mixing them breaks the Hub

| Client | Env prefix | Project ref | Owns |
|---|---|---|---|
| `lib/supabase.ts`, `lib/supabase-server.ts` | `NEXT_PUBLIC_SUPABASE_*` | `tauzahhnawejouvtbvuw` | admin portal, sales, funding, creators, partnerships |
| `lib/supabase-hub.ts`, `lib/supabase-hub-server.ts` | `NEXT_PUBLIC_LEARNING_HUB_SUPABASE_*` | `asdwpkcsbcnpknklchdq` | Learning Hub, courses, quick wins, games, community |

Both live in one Next.js app, so the bundler can and did mix them up. Quick Wins
vanished from the Hub in July 2026 because a Hub page got bundled with the main
client. Never change a shared file under `lib/supabase*.ts` without loading a
Hub page and a main admin page afterward and confirming both still read data.

Separating the Hub into its own Vercel project and repo is the intended
direction. Prefer changes that move toward that split, not away from it.

### Preview deployments are currently broken

Every page on a Vercel preview returns `500 MIDDLEWARE_INVOCATION_FAILED`,
including pages that work in production. As of 18 Aug 2026 this is unfixed, so
there is nowhere to click a change before it is live. Until it is fixed, say
plainly which parts of a change you could not verify rather than implying a
preview check happened.

---

## 3. Shipping

**Never push directly to `main`.** Every change goes through a PR, with no
exception for auth, access control, or payment code. If Rae says "push to main,"
open a PR and confirm the approach. If a push would carry commits beyond the
current task, flag them before pushing.

**Ship enforcement dark.** Never apply a database constraint, trigger check, or
required-field rule before the application code and any agent skills that
satisfy it are deployed and verified. A constraint takes effect instantly for
every client with no gradual rollout, while code arrives minutes to days later.
Put new enforcement behind a runtime flag defaulting to off (see `hub_config`
and `hub_flag()`), deploy the code, verify, then flip the flag. Keep the
rollback to a single `UPDATE` that needs no deploy.

**Dry run anything that emails or writes to production.**

- Build `?dryRun=1` into the route itself so it exercises the real code path.
  A separate script proves nothing about what the cron will do.
- The dry run computes the full decision set and reports it, while skipping
  every send and every write.
- Model the blast radius in SQL first, then confirm the live dry run agrees.
  Disagreement means something is wrong. This has already caught a timezone bug.
- For migrations, wrap in `begin; <migration>; <verification select>` with no
  commit. The Supabase MCP discards uncommitted work between calls, so this is
  a true dry run that still returns results.
- Use a deliberately fake `RESEND_API_KEY` when dry running locally.
- Afterward, query the log tables to confirm zero writes. Do not trust a 200.

**Report the blast radius as a number before shipping.** "This entire change
sends one email" is the sentence Rae needs.

**After any write meant to change state, verify the effect.** A 200 is not proof.

---

## 4. Dead code

`PanelShell.tsx` and `PursuitDetailPanel.tsx` under
`app/tdi-admin/funding/components/` are dead. Nothing imports them. A Record tab
was built inside `PanelShell` and shipped completely unreachable before anyone
noticed. The live funding page is `app/tdi-admin/funding/[pursuitId]/page.tsx`,
which imports tab components directly and lays them out as `CollapsibleSection`s.

Rules:

1. Before editing any component, confirm something imports it and that the
   importer is on a live route. Two greps, and it prevents an entire bug class.
2. When you replace a component, delete the old one in the same PR. Leaving it
   "just in case" is how the next session edits the wrong file.
3. Run `npm run deadcode` before opening a PR that touches components. It
   exits non-zero when it finds anything, so it works as a gate.
4. Beware duplicate trees. Git worktrees under `.claude/worktrees/` and in
   scratchpad contain full copies of every source file. A bare `grep -r` returns
   five copies of everything. Always scope searches to `app components lib`.
5. `~/Downloads/tdi-website` is a stale clone frozen at a June 2026 commit. It
   is not the project. The live repo is `~/tdi-website`.

---

## 5. Commands

```
npm run dev            # local dev at http://localhost:3000
npm run build          # production build
npm run typecheck      # tsc --noEmit, check the exit code
npm run lint           # eslint
npm run deadcode       # knip: unused files, exports, and dependencies
npm run check:writes   # fails if a changed file has a Supabase write whose error is discarded
npm run check:schema   # detects DB schema drift against the baseline
npm run validate:quizzes
```

**The defining bug of this codebase is a silent write.** Five separate features
were found broken in two days, every one the same shape: a write fails, the
returned error is discarded, and the caller reports success. Confirm Payment,
the Hub stress chart, saving a partnership contact, the grant eligibility
questions, and local funder discovery, which had never once produced a row
because it wrote to a column that does not exist.

Writing this rule down did not prevent the fourth instance, which was committed
hours later. So it is now mechanical: `npm run check:writes` fails when a file
you changed has a Supabase write whose `error` is thrown away. It judges only
changed files, because roughly 492 such writes already exist and a check nobody
can pass is a check nobody runs.

Never write `await supabase.from(x).insert(...)` on its own. Take the `error`,
and never count something as done before the database has accepted it.

Schema drift is a known bug class here: a wrong column name plus a swallowed
error produces a silently dead feature. `check:schema` exists for that reason.
Run it after any change that touches a query.

---

## 6. Voice and UI

These are absolute, and they apply to code, UI copy, emails, PDFs, commit
messages, and anything a person reads.

- **No emojis.** Anywhere. Use Lucide icons, colored dots, or gradients for
  status, heat, and urgency.
- **No em dashes and no double hyphens.** Rae treats them as a giveaway that
  content was AI written. Use periods, commas, colons, or restructure.
- No underlines except real links on hover.
- No bullet points inside prose. Write naturally.

Brand colors, and only these: navy `#1e2749`, yellow `#ffba06`, blue `#80a4ed`,
white `#ffffff`, gray `#f5f5f5`, light blue `#E8F0FD`. Email CTAs use gold
`#E8B84B`.

Do not display, anywhere user facing:

- Total course time or estimated duration. Individual video length as `m:ss` is
  the only time that may appear.
- Difficulty labels (beginner, intermediate, advanced). Calling a course
  beginner implies the educator is one.
- PD hours. The data stays in the database for certificates only.

Say "Vibe Check", never "Wellbeing", in any user facing copy. The database
action may stay `wellbeing_check`.

Spanish translation is required on game and Hub landing pages.

---

## 7. Domain rules

### Sales pipeline

Order: `unassigned`, `targeting`, `qualified`, `in_conversation`, `engaged`,
`likely_yes`, `proposal_sent`, `signed`, `paid`.

- `in_conversation` means a reply was received or a call is booked. That is the
  "we are talking" stage.
- `engaged` means they said "not now, maybe later." Warm but parked.
- **Never mark a lead `lost`.** In K-12 a no is almost always a not this budget
  year. Log the reason, the follow up already offered, and a specific date a few
  months out, in `sales_opportunity_notes`.
- Never move a lead backward.

### Funding

All grant and funding tasks originate from the funding portal at
`/tdi-admin/funding`. Never hand create tasks like "send this email." Those are
legacy pre-portal workflows.

Grant budgets must always fund TDI contract services (Hub memberships,
coaching, books, sessions). Never invent unrelated items like classroom supplies.

Every grant touchpoint must be white glove for the client, the reviewer, and
Bella at once. If any of the three fails, the work is not done.

### Learning Hub

New games need all three of these or they are invisible in the Games filter:

1. Database record with `category = 'Games'` and `quick_win_type = 'activity'`
2. An entry in the `PRACTICE_TOOLS` array in `app/hub/quick-wins/page.tsx`
3. A component import and slug mapping in `app/hub/practice/[slug]/page.tsx`

Every new game, course, or quick win needs seeded community posts within 24 to
48 hours of publishing. Empty community sections make a tool look dead.

A quick win must be the actual tool, not a guide about the tool. If the title
says checklist, the download has checkboxes. If it says template, it has
fillable fields. The test is whether an educator could use it in five minutes
without reading anything else. Downloads are PDF, never HTML.

Hub publish state: the Hub reads `is_published` only. Setting `status` alone
does nothing. Set both.

---

## 8. People

- **Rae** (rae@teachersdeserveit.com) owns the product and every final call.
- **Bella Dailey**, operations. Communicates in **Slack, never email**
  (user `U0B7DQM880G`, DM `D0B6KG7JDPU`). She must never be assigned QA work.
  No code path may create a Bella-owned QA task and no UI may offer her a
  pass or fail control. Her two legitimate steps are approval (is this true
  about this school, does it sound like us) and escalation decisions between
  concrete options. Prefer the wording "send to Julie for QA".
- **Julie Lynn**, QA agent, owns QA end to end and is the only reviewer.
- **Kristin**, CMO, human. **Omar**, **Jim**, **Mel** are also human.
- **Simone no longer works for TDI.** Remove her from any config, skill file,
  or workflow you encounter.

Every Slack notification to a human must include a direct clickable link to
where they act. Never send a message that says "check X" without the URL to X.
Draft Slack messages for Rae to review rather than sending directly.

---

## 9. Working with Rae

Default mode is deliberate and one item at a time. Finish one discrete piece,
show the result, confirm, then move to the next. Do not batch several unrelated
items into one turn. The autonomous, keep-moving mode applies to live launch
days only.

This applies to reporting as much as to doing. Rae has said that large
multi-section summaries are hard to follow. Give one detail, then ask whether
she is ready for more, and wait. No stacked headers, no multi-row tables, and
no lists of open items in a single message, even when a lot is genuinely done.

Do not work from memory or assumption. Read the actual source file, query the
live data, and go one layer deeper than feels necessary before recommending
what to keep, cut, change, or rebuild.
