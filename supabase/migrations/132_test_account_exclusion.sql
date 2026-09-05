-- Runs against the LEARNING HUB project (asdwpkcsbcnpknklchdq).
--
-- Maya (Educator UX) has been unable to audit the Hub as a first-time educator
-- for 41 days, because signing up would mean a real account against production
-- and there is no way to tell a test account apart from a teacher afterwards.
--
-- That matters more than it sounds. Hub engagement counts, enrollments and
-- lesson completions feed funder reporting. A test account with no marker
-- inflates those numbers permanently and invisibly, and nobody would know which
-- rows to subtract later. TEA-267 correctly refused to guess.
--
-- One column, defaulting to false, so every existing row keeps its current
-- meaning and no query changes behavior until it is asked to.
--
-- Ships dark on purpose. The reporting filter lands in the same PR, but the
-- column has to exist before any code can reference it.

alter table hub_profiles
  add column if not exists is_test_account boolean not null default false;

comment on column hub_profiles.is_test_account is
  'Internal account used for UX audits and QA walkthroughs, never a real educator. Excluded from every number that leaves the building: funder reporting, briefings, admin analytics. Set it when the account is created, never after it has accumulated activity.';

-- Reporting reads this constantly and always with the same predicate, so a
-- partial index on the real accounts keeps the common path cheap.
create index if not exists hub_profiles_real_accounts_idx
  on hub_profiles (id)
  where is_test_account = false;
