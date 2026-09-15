-- What we know about ourselves, and how well we know it.
--
-- school_facts answers "what do we know about this district". There has never
-- been an equivalent for TDI, so every question about our own standing was
-- asked from scratch, attached to whichever grant happened to raise it, and
-- lost when that grant closed.
--
-- Measured on Saunemin CCSD 438, 15 September 2026. A Title I Section 1003
-- narrative failed QA three times. Two of the three blockers were about the
-- school and one was about us: whether TDI holds the executed ISBE contract
-- required to deliver Section 1003 funded services. The writer correctly
-- declined to invent an answer across all three attempts. The question was
-- raised as a gate on that one grant on 19 August, escalated, and never
-- answered. The path was closed on 14 September with the question still open,
-- and its closure auto-cancelled the question as "no longer blocking
-- anything".
--
-- So the answer was never found, and the next grant that needs it will ask
-- again from nothing. The same shape killed our registry standing: verified
-- missing on 19 August, a vendor application drafted, never sent, and it is
-- now a procurement blocker on other districts.
--
-- A fact about TDI is not a property of a pursuit. It belongs to us, it is
-- true across every school at once, and answering it once should answer it
-- everywhere.
--
-- Shape deliberately mirrors school_facts so lib/funding/facts.ts governs both
-- with one set of rules. Same four statuses, same provenance columns, same
-- supersede chain, and the same two integrity checks: a known fact must carry
-- a value, an origin and a verified date, and an unverified one must at least
-- carry a value.
--
-- The one addition is `scope`. Plenty of what we need to know about ourselves
-- is per state rather than global: approved provider status is an Illinois
-- fact, not a TDI fact. Null scope means it is true everywhere, which is
-- right for our EIN and our entity structure.
--
-- Additive only. No existing table or column is touched, nothing reads this
-- table until the code that does is deployed, and no enforcement anywhere
-- depends on it being populated.

create table if not exists tdi_facts (
  id uuid primary key default gen_random_uuid(),

  key text not null,

  -- Null means true everywhere. A two-letter state code scopes it to that
  -- state, which is how approved provider and vendor status actually work.
  scope text,

  status text not null
    check (status in ('known', 'unverified', 'not_checked', 'not_published')),

  value text,

  -- school_facts allows contract, researched and school_stated. The first two
  -- carry over unchanged. 'school_stated' cannot apply to a fact about us, and
  -- 'agency_confirmed' is the origin that matters most here: a state agency or
  -- funder told us directly, which is the only authority on whether we are
  -- approved to deliver under their programme.
  origin text
    check (origin in ('contract', 'researched', 'agency_confirmed')),

  source text,
  verified_on date,
  verified_by text,

  created_at timestamptz not null default now(),
  superseded_at timestamptz,
  superseded_by uuid references tdi_facts(id),

  -- Both mirrored from school_facts. A 'known' fact with no provenance is
  -- exactly the state that produced the 48% reading figure nobody could
  -- reproduce, so the table refuses to hold one.
  constraint tdi_facts_known_is_complete
    check (status <> 'known' or (value is not null and origin is not null and verified_on is not null)),
  constraint tdi_facts_unverified_has_a_value
    check (status <> 'unverified' or value is not null)
);

-- One live fact per key and scope. Superseded rows stay for history, so the
-- index only constrains the current ones. Without this, two disagreeing
-- answers to "are we an approved provider in Illinois" could both be live,
-- which is the drift this table exists to end.
create unique index if not exists tdi_facts_one_live_per_key_scope
  on tdi_facts (key, coalesce(scope, ''))
  where superseded_at is null;

create index if not exists tdi_facts_key_idx on tdi_facts (key);

comment on table tdi_facts is
  'What we know about TDI itself, with provenance. The counterpart to school_facts: a fact about us is true across every school at once, so answering it once answers it everywhere. Governed by the same rules in lib/funding/facts.ts.';

comment on column tdi_facts.scope is
  'Null means true everywhere. A state code scopes the fact to that state, which is how approved provider and vendor status actually work.';

comment on column tdi_facts.origin is
  'contract and researched carry the same meaning as in school_facts. agency_confirmed means a state agency or funder told us directly, which is the only real authority on whether we may deliver under their programme.';
