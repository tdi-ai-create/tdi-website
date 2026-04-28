-- Intake form submissions from /create-with-us
create table if not exists pending_creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  strategy text,
  referral_source text,
  content_types text,
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

-- RLS: service role only (public insert via API route, admin read via tdi-admin)
alter table pending_creators enable row level security;
