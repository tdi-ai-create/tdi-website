-- Which school year an invoice belongs to.
--
-- Allenwood's ANC-00025 is 2025-26 work: On-Campus Observations delivered last
-- school year, $7,920, of which $6,000 was paid. It was filed against the
-- partnership "Allenwood Elementary (2026-27)", whose contract runs 1 Jul 2026
-- to 1 Jul 2027, because that is the only Allenwood record that exists. So a
-- prior year debt sat inside this year's contract, inflating this year's
-- contracted value by $7,920 and leaving no way to report or chase last year's
-- receivables as their own thing.
--
-- sales_opportunities already carries school_year. Invoices did not, so the
-- year was only ever implied by invoice_date, which is wrong precisely when it
-- matters: ANC-00025 is dated 1 July 2026 for work finished the year before.
-- That is also why it missed PGCPS's 30 June fiscal cutoff.
--
-- Nullable and unenforced on purpose. The code that sets it ships first, and
-- nothing depends on it being present.

alter table intelligence_invoices
  add column if not exists school_year text;

comment on column intelligence_invoices.school_year is
  'School year the WORK belongs to, such as 2025-26. Not derivable from invoice_date: ANC-00025 is dated 1 Jul 2026 for 2025-26 observations.';

create index if not exists intelligence_invoices_school_year_idx
  on intelligence_invoices (school_year);
