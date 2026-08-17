-- Runs against the CREATOR PORTAL project (tauzahhnawejouvtbvuw).
--
-- Location is not stored as data, only as a free-text address, so nothing
-- location-specific can be searched for. An agent can be told to find the
-- county farm bureau and the system cannot tell it which county.
--
-- That single absence is why local funding has never been found for anyone.
-- Every family worth searching is defined by place or sector: service clubs,
-- veteran posts, the county employer base, community foundations, rural
-- electric co-ops, farm bureaus, diocesan offices. None is reachable from a
-- string like "2590 Louisiana Hwy. 44  Paulina, LA 70763-2705".
--
-- Sector matters as much as place. A private Catholic school and a rural public
-- district in the same county have almost no funders in common, and two of the
-- six paths seeded for a Catholic school could never have applied because a
-- private school is not in the state accountability system at all.
--
-- All nullable, no constraints, no backfill. Existing rows keep working exactly
-- as they do, and code that does not know about these columns is unaffected.

alter table public.funding_pursuits
  add column if not exists city          text,
  add column if not exists county        text,
  add column if not exists state_code    text,
  add column if not exists sector        text,
  add column if not exists authorizer    text,
  add column if not exists employer_base text;

comment on column public.funding_pursuits.county is
  'County or parish. The key that unlocks farm bureaus, community foundations, utility co-ops and county-level service clubs.';
comment on column public.funding_pursuits.sector is
  'public district, diocesan, charter or independent. Decides which whole families of funding are possible at all.';
comment on column public.funding_pursuits.authorizer is
  'Diocese, charter authorizer or governing body where one applies. The correct path for a parochial school and one the standard template ignores entirely.';
comment on column public.funding_pursuits.employer_base is
  'Notable employers in or adjacent to the county. Plant-level community giving is real money and is almost never listed anywhere searchable.';
