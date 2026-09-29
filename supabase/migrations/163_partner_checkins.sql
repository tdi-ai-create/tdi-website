-- 163: Partner check-ins. A short staff survey a school leader runs in a meeting.
--
-- Why this exists. St. Mary's primary goal is "confidence managing classroom
-- behavior", and the only honest way to measure confidence is to ask the people
-- who have it. The onboarding email promised Hillary Russell five questions in
-- October and the same five again in May, sent to her rather than out to her
-- staff so she can put them in front of the team at a staff meeting. That
-- promise had no instrument behind it.
--
-- Why it is generic. Four survey pages already exist in this repo, one per
-- client (allenwood, asd4, wego, rw), each with its own hardcoded question list
-- and its own table. That is the pattern we were told to stop repeating. A
-- check-in here is a row: any partnership can be given one without a deploy,
-- and the questions live in the row rather than in a component.
--
-- The goal link is the point. A check-in names a partnership_kpis.kpi_key and
-- one question inside itself, and the share of respondents choosing certain
-- values on that question becomes that goal's current_value. So answering the
-- form moves the number the school sees on its own dashboard, instead of the
-- number waiting on somebody to remember to type it in.
--
-- Responses carry no name, no email and no grade level. It is twelve people and
-- a principal in one room, and a question about whether you can handle the
-- behavior in your own classroom only gets an honest answer if nobody can be
-- identified from it. The goal only ever needs the percentage.

create table if not exists partner_checkins (
  id              uuid primary key default gen_random_uuid(),
  partnership_id  uuid not null,
  -- Goes in a URL and into an email to a principal, so it is readable and
  -- unguessable rather than a bare uuid: "stmary-behavior-oct26".
  code            text not null unique,
  title           text not null,
  intro           text,
  -- [{ id, type: scale | choice | text, label, low_label, high_label,
  --    options: [], required: bool }]
  questions       jsonb not null,

  -- Which goal this feeds, and how. All four are needed together or not at all:
  -- a check-in with no kpi_key is a survey that informs a conversation, which is
  -- a legitimate thing to want.
  kpi_key           text,
  goal_question_id  text,
  -- The answers that count as success. Scale answers are stored as numbers, so
  -- "a 4 or a 5 out of 5" is {4,5}.
  goal_values       jsonb,
  -- Below this many responses the goal is left alone. One person answering 5
  -- would otherwise publish "100%" onto a principal's dashboard mid-meeting.
  min_responses     integer not null default 5,

  status          text not null default 'open',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint partner_checkins_status_real check (status in ('draft', 'open', 'closed')),
  constraint partner_checkins_min_responses_positive check (min_responses >= 1),
  constraint partner_checkins_goal_all_or_nothing check (
    (kpi_key is null and goal_question_id is null and goal_values is null)
    or (kpi_key is not null and goal_question_id is not null and goal_values is not null)
  )
);

comment on table partner_checkins is
  'One short staff check-in for one partnership. Questions live in the row, not in a component.';
comment on column partner_checkins.code is
  'The public URL segment: /check-in/<code>. Readable and unguessable, since the link is the only access control.';
comment on column partner_checkins.status is
  'draft accepts nothing, open accepts responses, closed stops them. No date window on purpose: a window that expires early fails silently on the one morning it matters.';
comment on column partner_checkins.min_responses is
  'Responses needed before the linked goal is written. Guards against publishing a percentage off one answer.';

create table if not exists partner_checkin_responses (
  id            uuid primary key default gen_random_uuid(),
  checkin_id    uuid not null references partner_checkins (id) on delete cascade,
  -- { question_id: answer }. Numbers for scales, strings for choice and text.
  answers       jsonb not null,
  submitted_at  timestamptz not null default now()
);

comment on table partner_checkin_responses is
  'Anonymous by design. No name, email, role or grade level, and no user id. Do not add one.';

create index if not exists partner_checkin_responses_checkin_idx
  on partner_checkin_responses (checkin_id);

create index if not exists partner_checkins_partnership_idx
  on partner_checkins (partnership_id);

alter table partner_checkins enable row level security;
alter table partner_checkin_responses enable row level security;

-- Both tables are reached only through /api/check-in/[code], which uses the
-- service role. The anon key gets nothing, which is what keeps one school's
-- responses out of another school's reach when the only secret is the link.
drop policy if exists "service role manages partner checkins" on partner_checkins;
create policy "service role manages partner checkins"
  on partner_checkins for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages partner checkin responses" on partner_checkin_responses;
create policy "service role manages partner checkin responses"
  on partner_checkin_responses for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
