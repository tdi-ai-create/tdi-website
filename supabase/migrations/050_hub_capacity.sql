-- Add capacity rating to hub_courses and hub_quick_wins
-- Capacity measures educator effort/bandwidth to implement a resource
-- Values: 'low' (grab-and-go), 'medium' (some prep), 'high' (significant investment)

ALTER TABLE hub_courses
  ADD COLUMN IF NOT EXISTS capacity TEXT,
  ADD CONSTRAINT hub_courses_capacity_check
    CHECK (capacity IN ('low', 'medium', 'high'));

ALTER TABLE hub_quick_wins
  ADD COLUMN IF NOT EXISTS capacity TEXT,
  ADD CONSTRAINT hub_quick_wins_capacity_check
    CHECK (capacity IN ('low', 'medium', 'high'));

CREATE INDEX IF NOT EXISTS hub_courses_capacity_idx ON hub_courses (capacity);
CREATE INDEX IF NOT EXISTS hub_quick_wins_capacity_idx ON hub_quick_wins (capacity);
