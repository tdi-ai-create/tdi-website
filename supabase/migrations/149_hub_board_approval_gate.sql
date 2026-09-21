-- Learning Hub database (asdwpkcsbcnpknklchdq), not the main one.
--
-- TEA-737. On 2026-09-21 at 12:00 UTC "Before It Escalates" published itself.
-- It is the first item in a new content category, and by the 9 September rule
-- the first item in a category cannot publish until Rae approves the category.
-- Board approval a766d6f1 had been sitting undecided since 11 September.
--
-- Nothing malfunctioned. QA passed it, Julie slotted it for a date, and the
-- scheduled publisher published it on that date. The publisher has never had
-- any idea that board approvals exist. Approval state lives in Paperclip and
-- publish state lives here, two systems that never speak, so the gate was
-- advisory and the schedule was what actually decided.
--
-- Three more were queued behind the same hole and were pulled by hand.
--
-- This migration gives the Hub row somewhere to hold the answer, so the
-- publisher reads the same field the reviewer writes. It adds columns and a
-- flag and changes no behaviour on its own: nothing reads these yet, the flag
-- ships false, and no constraint or trigger enforces them. Per CLAUDE.md a
-- constraint takes effect instantly for every client with no gradual rollout,
-- and the code that satisfies it arrives minutes to days later.

ALTER TABLE hub_quick_wins
  ADD COLUMN IF NOT EXISTS requires_board_approval BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS board_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS board_approved_by TEXT,
  ADD COLUMN IF NOT EXISTS board_approval_id TEXT;

COMMENT ON COLUMN hub_quick_wins.requires_board_approval IS
  'True when this item cannot publish on agent QA alone. Set it for the four highest-risk student-support topics (self-harm, suicidal ideation, abuse disclosure, grief) and for the first item in any new category. Default false, so existing behaviour is unchanged until something is marked.';

COMMENT ON COLUMN hub_quick_wins.board_approved_at IS
  'When a human decided. NULL means undecided, which is the whole point: the publisher treats NULL as a hold rather than as permission. A row that requires approval and has no timestamp does not go out.';

COMMENT ON COLUMN hub_quick_wins.board_approved_by IS
  'Who decided. A name, never an agent. Approving is recorded under the person signed in, and the queue says so rather than records it when that is not Rae or Kristin.';

COMMENT ON COLUMN hub_quick_wins.board_approval_id IS
  'The Paperclip approval this decision came from. Mirrors content_queue record_board_decision, which refuses a decision with no board record behind it, because a decision nobody can trace back is not a decision.';

-- Off. The publisher will count what it would have held and report that number
-- while still publishing normally, so the blast radius is a measured number
-- before it is an enforced rule. Flip to true only after a live dry run agrees
-- with the SQL, and roll back with a single UPDATE that needs no deploy.
INSERT INTO hub_config (key, value, note)
VALUES (
  'board_approval_gate_enforced',
  'false',
  'TEA-737. When true, the scheduled publisher holds any row with requires_board_approval and no board_approved_at, and reports it as held rather than publishing it. While false it reports the same rows as would_hold and publishes them anyway, so the count can be read before the rule bites. Rollback is UPDATE hub_config SET value = ''false'' WHERE key = ''board_approval_gate_enforced''.'
)
ON CONFLICT (key) DO NOTHING;

-- Finding the held rows is a daily read on a small table, but it is a read the
-- publisher does on every run and the health check will want too.
CREATE INDEX IF NOT EXISTS idx_hub_quick_wins_awaiting_board
  ON hub_quick_wins (scheduled_publish_date)
  WHERE requires_board_approval = true AND board_approved_at IS NULL;
