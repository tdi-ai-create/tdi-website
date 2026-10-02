-- 165: Leadership assignment of Hub content to named staff.
--
-- The agreement is docs/assignment-spec.md, rules A0 to A10, agreed with Rae on
-- 2 October 2026. This is the storage for it and nothing else: no route reads
-- these tables yet and the tab is behind a flag that is off.
--
-- Why it exists. A principal can read on their dashboard that trauma informed
-- practice sits at 15% against a target of 65% and has no move available inside
-- the product. Eleven goals across six schools are worded as practice being in
-- use and eight of them have never been measured, rendering as "Soon" on a live
-- client dashboard. This is the instrument those goals lack.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- Why this is in the Hub database and not the portal
--
-- A7.1. The goal lives in the portal (partnership_kpis) and the content and the
-- teacher live here (hub_quick_wins, hub_courses, hub_profiles). The two reads
-- that have to be reliable are a teacher seeing what was assigned to them and a
-- teacher answering it, and both are Hub side. It also moves with the intended
-- Hub separation rather than against it.
--
-- The cost of that choice is paid below: there are no foreign keys to anything
-- in the portal, so every portal reference is a plain uuid plus a copy of the
-- label as it read at the time.

create table if not exists hub_assignments (
  id                uuid primary key default gen_random_uuid(),

  -- The portal partnership. No foreign key is possible across databases.
  -- Never partnership_slug: that column on hub_profiles is quarantined and was
  -- twice wrong about Glen Ellyn in a single conversation.
  partnership_id    uuid not null,

  -- A7.3, and L4.7. People are matched on lowercased email, both ends.
  -- Lowercased on write rather than on read, because a read that forgets is a
  -- row that silently belongs to nobody.
  assigned_by_email text not null check (assigned_by_email = lower(assigned_by_email)),
  recipient_email   text not null check (recipient_email = lower(recipient_email)),

  -- What was assigned. Not a foreign key, and not a quick win id, because two
  -- of the four assignable kinds are not rows at all. Games are Quick Wins in
  -- the Games category and do have a row, but the sixteen quizzes live in
  -- lib/hub/quizConfigs.ts as code and only the eight with a slug have a Hub
  -- address at all. getRoutableQuizzes() already draws that line, and an
  -- assignment has to point at something a teacher can open.
  content_type      text not null check (content_type in ('quickwin', 'game', 'course', 'quiz')),
  content_slug      text not null,

  -- The title as it read when this was assigned. A renamed or retired tool must
  -- never leave a teacher looking at an assignment with no name on it. This is
  -- display fallback only: the live title always wins when the slug resolves.
  content_title     text not null,

  -- A2.1 and A2.3. Every assignment names the goal it serves, and the teacher
  -- is shown it, so nobody is handed something with no stated reason.
  --
  -- A7.2. Stored as a plain uuid with no foreign key, alongside the goal's
  -- wording at the time, so a renamed or retired goal never leaves a teacher
  -- reading an assignment whose reason has vanished.
  --
  -- goal_id is null exactly when the goal is one the school wrote itself under
  -- A2.4, which has no partnership_kpis row and must never acquire one without
  -- TDI adopting it per A2.7.
  goal_id           uuid,
  goal_label        text not null,
  goal_is_school_authored boolean not null default false,

  -- A3.1. The time the staff plan to work on this together. It is not a due
  -- date, nothing comes due, and A3.4 forbids a passed date from closing
  -- anything. Named planned_ rather than due_ so no future reader can mistake
  -- it, because 41 of 52 open action items were past their date on the day this
  -- was written and nothing anywhere marked them late.
  planned_date      date,

  -- A4.11 and A4.12. One reminder, ever, and only to the people a reminder
  -- would help. Stamped so a second send is impossible rather than unlikely.
  reminder_sent_at  timestamptz,

  -- A4.13.3. A quiz closes when it is taken, since that is its only completion
  -- event. Everything else closes when a leader closes it or when the recipient
  -- is removed from the roster. A closed row keeps its history.
  closed_at         timestamptz,
  closed_reason     text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- A1.1 is a cap of three open assignments per recipient, counted across every
-- leader who assigned to them. It is enforced in the route and not here.
--
-- A check constraint cannot count sibling rows, and a trigger that could would
-- make the cap invisible to the person hitting it: A1.3 says the refusal has to
-- name the three it is already holding and offer to close one, which a database
-- error cannot do. This index is what makes that count cheap enough to run on
-- every insert.
create index if not exists hub_assignments_open_per_person
  on hub_assignments (recipient_email)
  where closed_at is null;

create index if not exists hub_assignments_partnership
  on hub_assignments (partnership_id, created_at desc);

-- A5.1 reads the share of assigned staff at "used it with students" or above,
-- per goal, computed on every display. This is the index that read uses.
create index if not exists hub_assignments_goal
  on hub_assignments (partnership_id, goal_id)
  where closed_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- A4.6 to A4.8. The answer is a position, not a submission.
--
-- Every change is kept and the newest row wins. A teacher can move up, and
-- A4.7 says they can move back down, because somebody who was using something
-- regularly and stopped is telling us something true. The goal number follows
-- the truth rather than ratcheting, so a figure on a leader's dashboard can
-- fall, which is uncomfortable and correct.
--
-- This is also why there is no current_step column on hub_assignments. A5.2
-- forbids a stored mirror of a computed value: every hand-maintained copy of a
-- derived number in this codebase has eventually disagreed with the thing it
-- copied.

create table if not exists hub_assignment_answers (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references hub_assignments(id) on delete cascade,

  -- A4.1, in order. 1 not yet, 2 read it and have not used it, 3 used it with
  -- students, 4 using it regularly. The line between 2 and 3 is the whole
  -- philosophy and is where A5.1 counts from.
  step          smallint not null check (step between 1 and 4),

  -- A4.2. Optional, and the teacher chooses who sees it.
  words         text,

  -- A4.4. "just_me" means just them. Not the leader, not TDI, not a report, not
  -- an export. If that is ever loosened the teacher has been lied to, so the
  -- read path filters on this column and never the component.
  words_shared_with text not null default 'just_me'
    check (words_shared_with in ('just_me', 'my_leader', 'my_school_anonymous')),

  created_at    timestamptz not null default now()
);

create index if not exists hub_assignment_answers_current
  on hub_assignment_answers (assignment_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- A4.9 and A4.10. Ten days after a teacher answers, once, they are asked
-- whether they have used it yet, and a "not yet" is followed by one question
-- about what is in the way.
--
-- The reason list is fixed rather than free text because free text cannot be
-- counted, and the whole value is a leader seeing three of seven saying the
-- same thing. A4.11 then routes the single reminder off these values, which is
-- the second job the list does: somebody who said the tool is wrong for their
-- room is never reminded, because that is an answer rather than silence.

create table if not exists hub_assignment_followups (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references hub_assignments(id) on delete cascade,

  reason        text not null check (reason in (
    'does_not_fit',        -- it does not fit my students or my subject
    'no_time',             -- I have not had the time yet
    'tried_it_failed',     -- I tried it and it did not work
    'already_doing_it',    -- I am already doing something like it
    'need_help'            -- I would need help to get started
  )),

  -- Optional words alongside, at the same sharing level the teacher chose for
  -- their answer. Nothing here is ever shown at a level they did not pick.
  words         text,

  created_at    timestamptz not null default now()
);

create index if not exists hub_assignment_followups_assignment
  on hub_assignment_followups (assignment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row level security.
--
-- Every read here is done by a server route holding the service key, so these
-- policies exist to make an accidental anon or authenticated read return
-- nothing rather than everything. A Hub quick win RLS gap of exactly this shape
-- was a live bug in July.

alter table hub_assignments          enable row level security;
alter table hub_assignment_answers   enable row level security;
alter table hub_assignment_followups enable row level security;
