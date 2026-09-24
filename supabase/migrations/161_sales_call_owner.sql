-- 161: Who is making the call.
--
-- The call list was a boolean, on_jims_call_sheet, so the board could say a
-- lead needed a call but never who was making it. Rae, 24 September 2026: the
-- phone button should "create a drop down to indicate who is assigned to that
-- call ... that way we can scan and filter quickly to see who's in charge of
-- calls".
--
-- Nullable, no constraint, no default. Applied to production 24 September 2026.
alter table sales_opportunities
  add column if not exists call_owner text;

comment on column sales_opportunities.call_owner is
  'Email of whoever is making the call on this lead. Null means it is not on the call list. The legacy on_jims_call_sheet boolean is kept in sync with (call_owner is not null) so older readers keep working.';

-- Backfill from the assignee, which on the live board was exactly right: of the
-- 20 leads carrying the old flag, 18 were Jim's and 2 were Rae's.
update sales_opportunities
   set call_owner = assigned_to_email
 where deleted_at is null
   and on_jims_call_sheet = true
   and call_owner is null
   and assigned_to_email in (
     'rae@teachersdeserveit.com',
     'hello@teachersdeserveit.com',
     'kristin@whatwilllast.com',
     'jim@teachersdeserveit.com'
   );

-- "Show me Bella's calls" is the query this column exists for.
create index if not exists sales_opportunities_call_owner_idx
  on sales_opportunities (call_owner)
  where call_owner is not null;
