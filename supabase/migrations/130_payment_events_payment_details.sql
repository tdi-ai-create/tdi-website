-- 130: payment_events is missing the three columns the pay route writes
--
-- app/api/tdi-admin/intelligence/invoices/[id]/pay/route.ts inserts
-- payment_method, check_number and amount_received. None of them existed, so
-- the insert failed on every click. The invoice status had already been
-- flipped to paid by that point, so the button looked half broken: the
-- invoice recorded as paid, the payment detail vanished, and the route
-- returned 500 before reaching the confirmation email and the Slack alert.
--
-- Bella hit this on 18 Aug 2026 on invoice TDI-2608-003, Saunemin CCSD #438,
-- $1,840. That invoice has zero rows in payment_events.
--
-- BillingTab's PaymentEvent interface already reads all three fields, so the
-- application code is ahead of the schema here rather than behind it.
-- All three are nullable with no constraint, so existing rows and any code
-- that does not set them keep working unchanged.

alter table public.payment_events
  add column if not exists payment_method  text,
  add column if not exists check_number    text,
  add column if not exists amount_received numeric(12,2);

comment on column public.payment_events.payment_method  is 'check, ach, wire, credit_card, other. Set when a payment is recorded.';
comment on column public.payment_events.check_number    is 'Check number, only meaningful when payment_method = check.';
comment on column public.payment_events.amount_received is 'Amount actually received, which can differ from the invoice amount.';
