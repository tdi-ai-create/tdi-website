-- Runs against the CREATOR PORTAL project (tauzahhnawejouvtbvuw).
--
-- Adds email to the one chronological record.
--
-- 128 unioned nine sources and every one of them was something we wrote to
-- ourselves: events, task notes, QA reviews, cancel and denial reasons,
-- answers, school notes. Not one of them was a message to the school.
--
-- So the record built to answer "what did we say about this school, and when"
-- was missing every word we actually said to them. When a principal replies to
-- a message and Bella opens the record to see the thread, the thread is not
-- there. It also hides the drafts now queued for her to send, which is the one
-- pile the pipeline expects her to work through.
--
-- Sent and drafted are distinguished on purpose. A draft is a thing we intend
-- to say and have not; folding it in as though it had been sent would make the
-- record claim contact that never happened. The clock follows suit: sent mail
-- is placed at sent_at, drafts at created_at, so a draft sits where it was
-- written rather than at the epoch.
--
-- Postgres has no way to append to a view, so this restates 128 in full and
-- adds one union. The nine existing branches are unchanged.

create or replace view public.funding_record
with (security_invoker = true) as

-- What happened, including everything the system narrates about itself
select
  t.pursuit_id,
  null::uuid                                   as opportunity_id,
  (t.event_date::timestamptz)                  as occurred_at,
  'system'::text                               as author,
  'event'::text                                as kind,
  t.event_title                                as subject,
  t.event_detail                               as body
from public.funding_pursuit_timeline t

union all

-- Notes a person left on a task
select
  a.pursuit_id, a.opportunity_id, a.updated_at,
  coalesce(a.completed_by, a.owner_email, 'unknown'),
  'task note', a.title, a.notes
from public.funding_action_items a
where a.notes is not null and btrim(a.notes) <> ''

union all

-- Why a task was cancelled
select
  a.pursuit_id, a.opportunity_id, coalesce(a.completed_at, a.updated_at),
  coalesce(a.completed_by, 'unknown'),
  'cancelled', a.title, a.cancel_reason
from public.funding_action_items a
where a.cancel_reason is not null and btrim(a.cancel_reason) <> ''

union all

-- What a question was actually answered with. New, and the point of the
-- decision records: "done" now carries what we learned.
select
  a.pursuit_id, a.opportunity_id, coalesce(a.answered_at, a.updated_at),
  coalesce(a.answered_by, 'unknown'),
  'answer', a.title,
  a.answer || case when a.outcome is not null then ' — ' || a.outcome else '' end
from public.funding_action_items a
where a.answer is not null and btrim(a.answer) <> ''

union all

-- Free notes written against a funding path
select
  o.pursuit_id, n.opportunity_id, n.created_at,
  coalesce(n.author, 'unknown'), 'path note', o.name, n.content
from public.funding_opportunity_notes n
join public.funding_opportunities o on o.id = n.opportunity_id

union all

-- Julie's full review history, every attempt, not just the last verdict
select
  o.pursuit_id, q.opportunity_id, q.created_at,
  coalesce(q.reviewer, 'julie'), 'qa review',
  o.name || ' — attempt ' || q.attempt || case when q.passed then ', passed' else ', failed' end,
  q.summary
from public.funding_narrative_qa_reviews q
join public.funding_opportunities o on o.id = q.opportunity_id

union all

-- Why a funder said no
select
  o.pursuit_id, o.id, coalesce(o.decision_date::timestamptz, o.updated_at),
  'funder', 'denied', o.name, o.denial_reason
from public.funding_opportunities o
where o.denial_reason is not null and btrim(o.denial_reason) <> ''

union all

-- Why the stop rule refused a path
select
  o.pursuit_id, o.id, o.eligibility_checked_at,
  'eligibility screen', 'stopped', o.name, o.eligibility_reason
from public.funding_opportunities o
where o.eligibility_reason is not null and o.eligibility_verdict <> 'clear'

union all

-- The free-text block kept per school
select
  p.id, null::uuid, p.updated_at, 'unknown', 'school note', p.district_name, p.internal_notes
from public.funding_pursuits p
where p.internal_notes is not null and btrim(p.internal_notes) <> ''

union all

-- What we actually said to the school, and what is written but unsent
select
  e.pursuit_id, e.opportunity_id,
  coalesce(e.sent_at, e.created_at),
  coalesce(e.sent_by, e.from_email, 'unknown'),
  case when e.status = 'draft' then 'email draft' else 'email' end,
  coalesce(e.subject, '(no subject)')
    || case when coalesce(e.to_name, e.to_email) is not null
            then ', to ' || coalesce(e.to_name, e.to_email) else '' end,
  e.body
from public.funding_email_log e;

comment on view public.funding_record is
  'Every note, event, review, answer, reason and email written about grant work, from all ten places they live, in one chronological record. A view rather than a table so it can never drift from the originals.';
