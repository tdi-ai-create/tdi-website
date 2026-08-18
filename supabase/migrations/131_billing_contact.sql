-- 131: a school's billing contact is not its principal
--
-- Invoices resolved to partnerships.primary_contact_email / contact_email, which
-- is whoever signed the contract. In K-12 that is a principal or superintendent,
-- and they almost never handle accounts payable. Invoices landed with the wrong
-- person, and correcting it meant someone at TDI hearing about it on a call.
--
-- All columns are nullable and every read falls back to the existing contact, so
-- nothing changes for a partnership until a billing contact is actually set.
--
-- billing_token is deliberately NOT invite_token. invite_token grants partner
-- setup and account creation; it must not travel in every invoice email.

alter table public.partnerships
  add column if not exists billing_contact_name       text,
  add column if not exists billing_contact_email      text,
  add column if not exists billing_contact_title      text,
  add column if not exists billing_contact_source     text,
  add column if not exists billing_contact_updated_at timestamptz,
  add column if not exists billing_token              text;

update public.partnerships
   set billing_token = encode(gen_random_bytes(24), 'hex')
 where billing_token is null;

create unique index if not exists partnerships_billing_token_key
  on public.partnerships (billing_token);

comment on column public.partnerships.billing_contact_email  is 'Where invoices, reminders and receipts go. Falls back to primary_contact_email then contact_email when null.';
comment on column public.partnerships.billing_contact_source is 'onboarding | school | tdi. Who last set this, so we can tell a guess from a confirmation.';
comment on column public.partnerships.billing_token          is 'Unguessable id for the no-login billing contact page. Separate from invite_token, which grants account setup.';
