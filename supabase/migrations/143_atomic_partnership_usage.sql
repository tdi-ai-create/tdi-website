-- ============================================================
-- Count a delivered session without losing one.
--
-- POST /api/admin/timeline-events advances a partnership's used count by
-- reading the current value, adding one, and writing it back. Two completions
-- logged close together both read N and both write N+1, so one delivered
-- session disappears. Nothing errors. Both writes succeed. The count is simply
-- wrong, and error checking cannot catch it, which is why #469 fixed the
-- missing error check and left this open.
--
-- These counters are not internal bookkeeping. The partnership page shows
-- "used / total", remaining_count is total minus used, and the school's own
-- dashboard reads them. An undercount shows a school more sessions remaining
-- than it has, and we deliver work nobody bought.
--
-- One function rather than three, because the same rule in three places is how
-- the missing error check ended up in all three blocks in the first place.
--
-- No dynamic SQL. The counter name is checked against a fixed list and applied
-- with CASE, so an unexpected value raises rather than reaching the table.
--
-- COALESCE on every column: the columns were added with DEFAULT 0 in migration
-- 015, but NULL + 1 is NULL, and a counter silently becoming NULL would be a
-- worse version of the bug this fixes.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.increment_partnership_usage(
  p_partnership_id uuid,
  p_counter        text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_new integer;
BEGIN
  IF p_counter NOT IN (
    'observation_days_used',
    'virtual_sessions_used',
    'executive_sessions_used'
  ) THEN
    RAISE EXCEPTION 'increment_partnership_usage: unknown counter %', p_counter;
  END IF;

  UPDATE public.partnerships SET
    observation_days_used = COALESCE(observation_days_used, 0)
      + CASE WHEN p_counter = 'observation_days_used'    THEN 1 ELSE 0 END,
    virtual_sessions_used = COALESCE(virtual_sessions_used, 0)
      + CASE WHEN p_counter = 'virtual_sessions_used'    THEN 1 ELSE 0 END,
    executive_sessions_used = COALESCE(executive_sessions_used, 0)
      + CASE WHEN p_counter = 'executive_sessions_used'  THEN 1 ELSE 0 END
  WHERE id = p_partnership_id
  RETURNING CASE p_counter
    WHEN 'observation_days_used'   THEN observation_days_used
    WHEN 'virtual_sessions_used'   THEN virtual_sessions_used
    ELSE                                executive_sessions_used
  END
  INTO v_new;

  -- No row updated means the partnership id does not exist. Returning 0 would
  -- read as "counted, now zero", so this raises instead.
  IF v_new IS NULL THEN
    RAISE EXCEPTION 'increment_partnership_usage: no partnership %', p_partnership_id;
  END IF;

  RETURN v_new;
END;
$$;

COMMENT ON FUNCTION public.increment_partnership_usage(uuid, text) IS
  'Atomically advance one of the partnership session counters and return its new value. Replaces a read-then-write increment that lost a session when two completions landed together.';

GRANT EXECUTE ON FUNCTION public.increment_partnership_usage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_partnership_usage(uuid, text) TO service_role;

COMMIT;
