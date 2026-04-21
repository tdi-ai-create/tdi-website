-- Migration 041: pending_creators table
-- Stores intake form submissions awaiting review before being added to creators table.
-- RLS: service role only (no public access).

create table if not exists pending_creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  strategy text not null,
  content_types text not null,
  referral_dropdown text not null,
  other_referral text,
  submitted_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  notes text
);

alter table pending_creators enable row level security;

-- Only service role can access
create policy "service role only" on pending_creators
  using (false)
  with check (false);
