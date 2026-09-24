# Browser pass

## What this change touches

The Money tab at /tdi-admin/billing/money, and the Void button on a billing
line.

## Why

The database constraint on intelligence_invoices.status permits 'void'. Every
check in the code tested for 'voided', a value the constraint does not allow.

Two consequences. A voided invoice was never recognised as cancelled, so
Allenwood's $7,920 duplicate, which PGCPS refused and which was voided on
15 September, was being counted as overdue money. And the Void button writes
'voided', so it has never been able to void anything.

## What I did

- Opened: http://localhost:3005/tdi-admin/billing/money as Review Admin
- Saw before: "OVERDUE $13,152", "PRIOR YEAR $9,020.00", and the Voided filter
  reading "Voided (0)" despite one invoice carrying voided_at.
- Saw after: "OVERDUE $5,232", "PRIOR YEAR $1,100.00", and "Voided (1)". The
  filter row also moved from "All (14), Invoices (13)" to "All (13),
  Invoices (12)", because the cancelled invoice is no longer counted as live.
- Saw: "COLLECTED $20,412, 7 payments" and "OUT, NOT DUE $2,500, sent invoices"
  both unchanged, so the fix did not disturb anything else.
- Saw: $5,232 matches the database exactly. Three overdue invoices, ANC-00006
  at $1,100, TDI-2608-002 at $2,332.20 and TDI-2608-001 at $1,800.

## Proof the constraint is the authority

Ran the opposite fix inside a transaction and it failed:

  update intelligence_invoices set status = 'voided' where invoice_number = 'ANC-00025';
  ERROR: 23514 violates check constraint "intelligence_invoices_status_check"

So the row was right and the code was wrong, rather than the other way round.

## What I did not press

The Void button. Pressing it would void a real client invoice. It is now
writing a value the constraint accepts, which is more than it did before, but
that it actually completes is unproven and is written here as such.

## What I could not verify

That voiding works end to end. See above.

The four remaining uses of 'voided' in lib/billing/invoice-document.ts and
invoice-pdf.tsx are deliberately untouched. Those derive a document status from
voided_at rather than reading the database column, and are internally
consistent.

Signed in as Review Admin rather than Rae.
