-- ============================================================
-- Tighten the INSERT policy on hub_qa_posts.
--
-- The existing policy grants INSERT to role `public` with
-- WITH CHECK (true), so anyone holding the public browser key
-- can write a Q&A post under any user_id. The sibling table
-- quick_win_responses already checks auth.uid() = user_id.
--
-- Safe to apply: every Q&A write in the app goes through a
-- server route using the service role key (lib/hub/qa-handler.ts,
-- app/api/hub/quick-wins/[id]/qa), which bypasses RLS.
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can insert qa posts" ON hub_qa_posts;

CREATE POLICY "Users insert own qa posts"
  ON hub_qa_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
