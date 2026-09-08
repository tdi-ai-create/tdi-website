-- When an agent last actually checked a funder's application window.
--
-- find_work hands Amara the funders she has found whose window nobody has
-- established, and floors that at 14 days so she is not asked the same
-- unanswerable question every hour. The floor keyed on `updated_at`, with a
-- comment saying "the row's updated_at moves when she writes her note, so it
-- doubles as when did anyone last look at this".
--
-- That assumption is wrong. Every job that touches the row moves updated_at.
-- Measured 8 September 2026: six opportunities matched the branch and not one
-- was being offered to her. Five were stamped on 2 September within a minute of
-- each other, which is a batch write rather than five research sessions, and
-- two more were pushed out to 22 September by a write earlier the same day.
--
-- So the agent's queue was empty while Bella held five action items asking the
-- same question, and she asked in Slack whether she should just answer them
-- herself. The system had stopped asking the only party that could research it.
--
-- Only a write of window_status, window_opens or window_closes moves this
-- column, so it means what its name says. Null means never checked, which is
-- why every existing row becomes eligible again the moment this ships.

alter table funding_opportunities
  add column if not exists window_checked_at timestamptz;

comment on column funding_opportunities.window_checked_at is
  'When an agent last actually checked this funder''s application window. Only a write of window_status, window_opens or window_closes moves it. The recheck floor in find_work keys on this rather than updated_at, because anything touching the row moved updated_at and silently suppressed the agent''s queue.';
