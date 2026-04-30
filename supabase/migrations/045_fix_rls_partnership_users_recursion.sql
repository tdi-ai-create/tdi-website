-- Migration 045: Fix RLS infinite recursion on partnership_users
-- TEA-1896
--
-- Root cause: The "Users view own partnership_users" policy on partnership_users
-- does SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()
-- inside its own USING clause, triggering infinite recursion when evaluated.
-- Every other table's RLS policy that subqueries partnership_users also hits
-- the recursive policy, causing all client-side partner queries to fail.
--
-- Fix: Create a SECURITY DEFINER function that bypasses RLS to look up the
-- current user's partnership IDs, then rewrite all affected policies to call
-- that function instead of subquerying partnership_users directly.

BEGIN;

-- ============================================================================
-- STEP 1: Create helper function (bypasses RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_my_partnership_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partnership_id
  FROM partnership_users
  WHERE user_id = auth.uid();
$$;

-- ============================================================================
-- STEP 2: Fix the self-referential policy on partnership_users
-- ============================================================================

DROP POLICY IF EXISTS "Users view own partnership_users" ON partnership_users;
CREATE POLICY "Users view own partnership_users" ON partnership_users FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 3: Rewrite policies on partnerships table
-- ============================================================================

DROP POLICY IF EXISTS "Users view own partnership" ON partnerships;
CREATE POLICY "Users view own partnership" ON partnerships FOR SELECT
  USING (id IN (SELECT get_my_partnership_ids()));

DROP POLICY IF EXISTS "Users update own partnership status" ON partnerships;
CREATE POLICY "Users update own partnership status" ON partnerships FOR UPDATE
  USING (id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 4: Rewrite policies on organizations table
-- ============================================================================

DROP POLICY IF EXISTS "Users view own organizations" ON organizations;
CREATE POLICY "Users view own organizations" ON organizations FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

DROP POLICY IF EXISTS "Users insert own organizations" ON organizations;
CREATE POLICY "Users insert own organizations" ON organizations FOR INSERT
  WITH CHECK (partnership_id IN (SELECT get_my_partnership_ids()));

DROP POLICY IF EXISTS "Users update own organizations" ON organizations;
CREATE POLICY "Users update own organizations" ON organizations FOR UPDATE
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 5: Rewrite policies on buildings table
-- ============================================================================

DROP POLICY IF EXISTS "Users view own buildings" ON buildings;
CREATE POLICY "Users view own buildings" ON buildings FOR SELECT
  USING (organization_id IN (
    SELECT o.id FROM organizations o
    WHERE o.partnership_id IN (SELECT get_my_partnership_ids())
  ));

DROP POLICY IF EXISTS "Users insert own buildings" ON buildings;
CREATE POLICY "Users insert own buildings" ON buildings FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT o.id FROM organizations o
    WHERE o.partnership_id IN (SELECT get_my_partnership_ids())
  ));

-- ============================================================================
-- STEP 6: Rewrite policies on staff_members table
-- ============================================================================

DROP POLICY IF EXISTS "Users view own staff" ON staff_members;
CREATE POLICY "Users view own staff" ON staff_members FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

DROP POLICY IF EXISTS "Users insert own staff" ON staff_members;
CREATE POLICY "Users insert own staff" ON staff_members FOR INSERT
  WITH CHECK (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 7: Rewrite policies on action_items table
-- ============================================================================

DROP POLICY IF EXISTS "Users view own action_items" ON action_items;
CREATE POLICY "Users view own action_items" ON action_items FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

DROP POLICY IF EXISTS "Users update own action_items" ON action_items;
CREATE POLICY "Users update own action_items" ON action_items FOR UPDATE
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 8: Rewrite policies on activity_log table
-- ============================================================================

DROP POLICY IF EXISTS "Users view own activity_log" ON activity_log;
CREATE POLICY "Users view own activity_log" ON activity_log FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

DROP POLICY IF EXISTS "Users insert own activity_log" ON activity_log;
CREATE POLICY "Users insert own activity_log" ON activity_log FOR INSERT
  WITH CHECK (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 9: Rewrite policies on dashboard_views table
-- ============================================================================

DROP POLICY IF EXISTS "Users insert own dashboard_views" ON dashboard_views;
CREATE POLICY "Users insert own dashboard_views" ON dashboard_views FOR INSERT
  WITH CHECK (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 10: Rewrite policies on metric_snapshots table
-- ============================================================================

DROP POLICY IF EXISTS "Users view own metric_snapshots" ON metric_snapshots;
CREATE POLICY "Users view own metric_snapshots" ON metric_snapshots FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 11: Rewrite policies on survey_responses table (from 001 and 003)
-- ============================================================================

DROP POLICY IF EXISTS "Users view own survey_responses" ON survey_responses;
DROP POLICY IF EXISTS "Users view own survey data" ON survey_responses;
CREATE POLICY "Users view own survey data" ON survey_responses FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

-- ============================================================================
-- STEP 12: Rewrite policies on timeline_events table (from 015)
-- ============================================================================

DROP POLICY IF EXISTS "Partners view own timeline_events" ON timeline_events;
CREATE POLICY "Partners view own timeline_events" ON timeline_events FOR SELECT
  USING (partnership_id IN (SELECT get_my_partnership_ids()));

COMMIT;
