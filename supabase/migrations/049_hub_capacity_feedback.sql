-- Phase 9: User Capacity Feedback
-- Schema reviewed and approved by Rodrigo Vega (TEA-1967) for Desi AI analytics compatibility.
-- educator_key is HMAC(user_id, stable_secret) — pseudonymous, joinable to educator segments.

CREATE TABLE capacity_feedback (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type      TEXT        NOT NULL CHECK (content_type IN ('course', 'quick_win')),
  content_id        UUID        NOT NULL,
  official_capacity TEXT        NOT NULL CHECK (official_capacity IN ('low', 'medium', 'high')),
  response          TEXT        NOT NULL CHECK (response IN ('lower_than_rated', 'about_right', 'higher_than_rated')),
  educator_key      TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON capacity_feedback (content_type, content_id);
CREATE INDEX ON capacity_feedback (response);
CREATE INDEX ON capacity_feedback (created_at);

-- Enable RLS; inserts go through the server-side API using the service role key
ALTER TABLE capacity_feedback ENABLE ROW LEVEL SECURITY;
