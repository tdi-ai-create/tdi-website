-- Migration 047: Olivia OAuth Credentials
-- Stores refresh tokens for Olivia's Google Calendar integration.
-- Access restricted to service role only (RLS denies all authenticated/anon).

CREATE TABLE olivia_oauth_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_key TEXT UNIQUE NOT NULL,
    credential_value TEXT NOT NULL,
    scope TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE olivia_oauth_credentials ENABLE ROW LEVEL SECURITY;
