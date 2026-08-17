-- Runs against the CREATOR PORTAL project (tauzahhnawejouvtbvuw).
--
-- The system asks questions and has nowhere to put the answers.
--
-- "Ask Paula Poche if the school has an NEA member teacher" was created on
-- 21 July and marked done on 27 July. The only note on it read "Nudge sent to
-- bella@teachersdeserveit.com". No answer was ever recorded, so the record said
-- resolved while the question was still open. It was found three weeks later,
-- by which point the same question had also stalled a second school.
--
-- That is not a one-off. Marking an item done currently means "somebody clicked
-- done", not "we learned something". A green tick and an unanswered question
-- look identical.
--
-- Four columns, and one flag that says whether they are required.
--
--   answer        what we were actually told
--   answered_by   who told us
--   answered_at   when
--   outcome       what it means for the work:
--                   proceed        the path continues
--                   stop_path      this path is not viable, close it
--                   still_blocked  answered, but does not unblock us yet
--
-- requires_answer marks an item as a question rather than a task. Signing a
-- contract is a task: doing it is the whole story. Asking whether a school has
-- an NEA member is a question: doing it tells us nothing, the reply does.
--
-- Deliberately nullable with no constraint and defaulting to false. Enforcement
-- lives in application code and applies only where requires_answer is true, so
-- this can be applied ahead of the code that reads it and every existing row
-- keeps behaving exactly as it does today. No backfill: retro-flagging closed
-- items would demand answers nobody can now supply.

alter table public.funding_action_items
  add column if not exists requires_answer boolean not null default false,
  add column if not exists answer           text,
  add column if not exists answered_by      text,
  add column if not exists answered_at      timestamptz,
  add column if not exists outcome          text;

comment on column public.funding_action_items.requires_answer is
  'True when this item is a question whose reply is the point, not a task whose completion is the point. Only these are held to needing an answer before they can close.';

comment on column public.funding_action_items.answer is
  'What we were actually told. Null on an item still awaiting a reply.';

comment on column public.funding_action_items.answered_by is
  'Who supplied the answer. A person, not the system.';

comment on column public.funding_action_items.outcome is
  'What the answer means for the work: proceed, stop_path, or still_blocked. Recorded so "done" can never again mean "somebody clicked done".';

-- Read-side helper: every question still waiting on a reply, oldest first.
-- Exists so "what have we asked and not heard back on" is one query rather than
-- something a person has to remember to look for.
create or replace view public.funding_open_questions
with (security_invoker = true) as
select
  a.id,
  a.pursuit_id,
  a.opportunity_id,
  a.title,
  a.client_label,
  a.owner_type,
  a.owner_email,
  a.due_date,
  a.created_at,
  (current_date - a.due_date) as days_overdue
from public.funding_action_items a
where a.requires_answer = true
  and a.status in ('pending', 'in_progress')
  and a.answer is null
order by a.due_date nulls last, a.created_at;

comment on view public.funding_open_questions is
  'Questions asked and not yet answered. Feeds the daily digest so an unanswered ask cannot sit unnoticed the way the NEA member question did for three weeks.';
