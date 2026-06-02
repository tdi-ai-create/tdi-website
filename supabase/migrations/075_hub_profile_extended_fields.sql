-- Extended hub_profile fields added live during the June 1 2026 launch.
-- These columns were applied directly via the Supabase SQL editor on launch day
-- so that the onboarding form could collect richer educator context. This file
-- captures the change for documentation/reproducibility. The columns already
-- exist in production — do NOT re-run this against prod.

ALTER TABLE hub_profiles
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS years_in_education TEXT,
  ADD COLUMN IF NOT EXISTS grade_band TEXT,
  ADD COLUMN IF NOT EXISTS proud_of TEXT,
  ADD COLUMN IF NOT EXISTS pet_names TEXT,
  ADD COLUMN IF NOT EXISTS educator_type TEXT;
