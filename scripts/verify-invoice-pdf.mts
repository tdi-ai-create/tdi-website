/**
 * Proves the invoice PDF renderer works against real data, without a browser
 * and without a signed-in session.
 *
 * Renders every invoice in the billing system to /tmp and reports the page count
 * and byte size of each, so "it built" is distinguishable from "it built an
 * empty page". Read-only: it touches nothing in the database.
 *
 *   npx tsx scripts/verify-invoice-pdf.mts
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

import { loadInvoiceDocument, linesDisagreeWithTotal } from '../lib/billing/invoice-document';
import { renderInvoicePdf, invoiceFileName } from '../lib/billing/invoice-pdf';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const OUT = '/tmp/tdi-invoice-pdfs';
mkdirSync(OUT, { recursive: true });

const { data: invoices, error } = await sb
  .from('intelligence_invoices')
  .select('id, invoice_number')
  .order('invoice_number');
if (error) throw new Error(error.message);

let failures = 0;
for (const inv of invoices ?? []) {
  try {
    const doc = await loadInvoiceDocument(sb, inv.id);
    if (!doc) throw new Error('loader returned null');

    const pdf = await renderInvoicePdf(doc);
    const path = `${OUT}/${invoiceFileName(doc)}`;
    writeFileSync(path, pdf);

    // %PDF header and a page count, so a zero-byte or header-only file cannot pass.
    const head = pdf.subarray(0, 5).toString('latin1');
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    const warn = linesDisagreeWithTotal(doc) ? '  LINES DISAGREE WITH TOTAL' : '';

    if (head !== '%PDF-' || pages < 1) throw new Error(`bad output: header=${head} pages=${pages}`);

    console.log(
      `ok   ${doc.invoiceNumber.padEnd(13)} ${String(doc.lines.length).padStart(2)} line(s)  ` +
        `${pages} page  ${String(pdf.length).padStart(7)} bytes  ${doc.clientName}${warn}`,
    );
  } catch (err) {
    failures++;
    console.log(`FAIL ${inv.invoice_number.padEnd(13)} ${String(err)}`);
  }
}

console.log(`\n${(invoices ?? []).length - failures}/${(invoices ?? []).length} rendered into ${OUT}`);
process.exit(failures ? 1 : 0);
