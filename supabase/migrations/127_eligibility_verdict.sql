-- Runs against the CREATOR PORTAL project (tauzahhnawejouvtbvuw).
--
-- Stores the eligibility screen's decision on a path, so a block can be
-- explained, audited, and argued with later.
--
-- Blocking is on from day one, which was a deliberate choice. That makes the
-- reason text load-bearing rather than decorative: a block nobody can explain
-- is indistinguishable from a bug, and the person who meets it is not a grant
-- expert. Every verdict therefore carries plain-language prose, never a rule id.
--
-- Nullable, no constraints, no backfill. Existing paths keep working exactly as
-- they do until something requests a draft on them.

alter table public.funding_opportunities
  add column if not exists eligibility_verdict    text,
  add column if not exists eligibility_reason     text,
  add column if not exists eligibility_rule       text,
  add column if not exists eligibility_checked_at timestamptz,
  add column if not exists eligibility_overridden boolean not null default false;

comment on column public.funding_opportunities.eligibility_verdict is
  'clear, stop or ask_first. Set when a draft is requested. stop means the path cannot win whatever we write; ask_first means we are missing a fact, not that the path is dead.';
comment on column public.funding_opportunities.eligibility_reason is
  'Why, in words a person can read and disagree with. Never a rule identifier.';
comment on column public.funding_opportunities.eligibility_overridden is
  'True when a human deliberately pushed a blocked path through. Kept so an override is visible rather than silent.';
