-- Migration: Milestone Backfill Function
-- Creates a function to sync milestones for existing creators when new milestones are added
-- Run this SQL in Supabase SQL Editor

-- =============================================================
-- PART 1: Create the backfill function
-- =============================================================

-- Function to sync missing milestones for all creators
-- This ensures that when new milestones are added, existing creators get them too
CREATE OR REPLACE FUNCTION sync_creator_milestones()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  creator_record RECORD;
  milestone_record RECORD;
  inserted_count INTEGER := 0;
  skipped_count INTEGER := 0;
  creator_count INTEGER := 0;
  result_details jsonb := '[]'::jsonb;
BEGIN
  -- Loop through all creators
  FOR creator_record IN
    SELECT id, content_path, email, name
    FROM creators
    WHERE status IS DISTINCT FROM 'archived' -- Skip archived creators
  LOOP
    creator_count := creator_count + 1;

    -- Loop through all active milestones (not collapsed/retired)
    FOR milestone_record IN
      SELECT m.id, m.applies_to, m.sort_order, m.phase_id
      FROM milestones m
      WHERE m.is_collapsed_into IS NULL
    LOOP
      -- Check if this milestone applies to this creator's content path
      -- A milestone applies if:
      -- 1. applies_to is NULL (applies to all paths)
      -- 2. applies_to is empty array (applies to all paths)
      -- 3. creator has no content_path yet (give them all milestones)
      -- 4. creator's content_path is in the applies_to array
      IF (
        milestone_record.applies_to IS NULL
        OR array_length(milestone_record.applies_to, 1) IS NULL
        OR creator_record.content_path IS NULL
        OR creator_record.content_path = ANY(milestone_record.applies_to)
      ) THEN
        -- Try to insert, but skip if already exists (ON CONFLICT DO NOTHING)
        INSERT INTO creator_milestones (
          creator_id,
          milestone_id,
          status,
          created_at,
          updated_at,
          metadata
        )
        VALUES (
          creator_record.id,
          milestone_record.id,
          'locked',  -- Default to locked; progression logic will unlock as appropriate
          NOW(),
          NOW(),
          jsonb_build_object('backfilled', true, 'backfilled_at', NOW())
        )
        ON CONFLICT (creator_id, milestone_id) DO NOTHING;

        -- Check if we actually inserted
        IF FOUND THEN
          inserted_count := inserted_count + 1;
        ELSE
          skipped_count := skipped_count + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'creators_processed', creator_count,
    'milestones_inserted', inserted_count,
    'milestones_skipped', skipped_count,
    'message', format('Processed %s creators. Inserted %s missing milestones. Skipped %s existing records.',
      creator_count, inserted_count, skipped_count)
  );
END;
$$;

-- Grant execute permission to authenticated users (admin check happens in API)
GRANT EXECUTE ON FUNCTION sync_creator_milestones() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_creator_milestones() TO service_role;

-- =============================================================
-- PART 2: Create a function to sync milestones for a single creator
-- =============================================================

-- Function to sync milestones for a specific creator
-- Useful when a creator's content path changes
CREATE OR REPLACE FUNCTION sync_creator_milestones_for_creator(p_creator_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  creator_record RECORD;
  milestone_record RECORD;
  inserted_count INTEGER := 0;
  skipped_count INTEGER := 0;
BEGIN
  -- Get creator info
  SELECT id, content_path, email, name
  INTO creator_record
  FROM creators
  WHERE id = p_creator_id;

  IF creator_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Creator not found'
    );
  END IF;

  -- Loop through all active milestones
  FOR milestone_record IN
    SELECT m.id, m.applies_to, m.sort_order, m.phase_id
    FROM milestones m
    WHERE m.is_collapsed_into IS NULL
  LOOP
    -- Check if this milestone applies to this creator's content path
    IF (
      milestone_record.applies_to IS NULL
      OR array_length(milestone_record.applies_to, 1) IS NULL
      OR creator_record.content_path IS NULL
      OR creator_record.content_path = ANY(milestone_record.applies_to)
    ) THEN
      -- Try to insert, skip if exists
      INSERT INTO creator_milestones (
        creator_id,
        milestone_id,
        status,
        created_at,
        updated_at,
        metadata
      )
      VALUES (
        creator_record.id,
        milestone_record.id,
        'locked',
        NOW(),
        NOW(),
        jsonb_build_object('backfilled', true, 'backfilled_at', NOW())
      )
      ON CONFLICT (creator_id, milestone_id) DO NOTHING;

      IF FOUND THEN
        inserted_count := inserted_count + 1;
      ELSE
        skipped_count := skipped_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'creator_id', p_creator_id,
    'milestones_inserted', inserted_count,
    'milestones_skipped', skipped_count,
    'message', format('Synced milestones for creator. Inserted %s, skipped %s existing.',
      inserted_count, skipped_count)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION sync_creator_milestones_for_creator(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_creator_milestones_for_creator(UUID) TO service_role;

-- =============================================================
-- PART 3: Run immediate backfill for all existing creators
-- =============================================================

-- Execute the backfill now to sync any missing milestones
SELECT sync_creator_milestones();

-- =============================================================
-- PART 4: Create optional trigger for automatic sync on new milestones
-- (Commented out by default - can be enabled if desired)
-- =============================================================

/*
-- Trigger function to auto-sync when a new milestone is added
CREATE OR REPLACE FUNCTION trigger_sync_new_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only run for INSERT (new milestones)
  IF TG_OP = 'INSERT' THEN
    -- Sync all creators to pick up the new milestone
    PERFORM sync_creator_milestones();
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger (disabled by default)
DROP TRIGGER IF EXISTS sync_milestone_on_insert ON milestones;
CREATE TRIGGER sync_milestone_on_insert
  AFTER INSERT ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_new_milestone();
*/

-- =============================================================
-- NOTES
-- =============================================================
--
-- Usage:
-- 1. Manual full sync: SELECT sync_creator_milestones();
-- 2. Single creator sync: SELECT sync_creator_milestones_for_creator('uuid-here');
-- 3. Can be called from API: supabase.rpc('sync_creator_milestones')
--
-- The backfilled milestones are marked with metadata: { "backfilled": true }
-- This helps track which milestones were added retroactively.
--
-- The function does NOT:
-- - Modify existing milestone records (status, completed_at, etc.)
-- - Delete any milestone records
-- - Change the progression/unlock logic
--
-- After running this, you may need to manually unlock appropriate milestones
-- based on each creator's current progress using the existing progression logic.
