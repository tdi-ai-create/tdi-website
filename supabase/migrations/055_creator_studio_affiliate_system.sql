-- ============================================================
-- RECONCILIATION MIGRATION: Affiliate Link System
-- Captures schema changes applied directly to production Supabase
-- on 2026-05-12 as part of the Creator Studio overhaul.
-- This migration documents production state for repo parity.
-- ============================================================

-- 1. Add affiliate_slug to creators table
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS affiliate_slug text UNIQUE;

-- 2. Affiliate clicks — every click on /r/{slug}
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  slug text NOT NULL,
  clicked_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  session_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_creator_id ON public.affiliate_clicks(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_slug ON public.affiliate_clicks(slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON public.affiliate_clicks(clicked_at);

-- 3. Affiliate signups — when a tracked visitor signs up
CREATE TABLE IF NOT EXISTS public.affiliate_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  click_id uuid REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  user_email text,
  signed_up_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_affiliate_signups_creator_id ON public.affiliate_signups(creator_id);

-- 4. Affiliate conversions — paid conversions with auto-computed creator payout
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  signup_id uuid REFERENCES public.affiliate_signups(id) ON DELETE SET NULL,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL DEFAULT 0,
  creator_payout_cents integer NOT NULL DEFAULT 0,
  payout_percentage numeric(5,2) NOT NULL DEFAULT 50.00,
  converted_at timestamptz DEFAULT now() NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_creator_id ON public.affiliate_conversions(creator_id);

-- 5. Affiliate payouts — monthly batched payouts
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_clicks integer NOT NULL DEFAULT 0,
  total_signups integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  total_revenue_cents integer NOT NULL DEFAULT 0,
  payout_amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
  paid_at timestamptz,
  paid_by text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_creator_id ON public.affiliate_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON public.affiliate_payouts(status);

-- 6. RLS — service role only (privacy by design)
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role full access" ON public.affiliate_clicks
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.affiliate_signups
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.affiliate_conversions
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.affiliate_payouts
  FOR ALL USING (auth.role() = 'service_role');
