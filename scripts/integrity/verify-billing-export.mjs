#!/usr/bin/env node
/**
 * Does the billing export actually carry the money, and keep the ledgers apart?
 *
 * Two things can go wrong with an export and neither is visible from the button.
 * The file can look complete while its amounts are text, so Excel shows them and
 * refuses to add them up. And client money and grant money can end up in one
 * place, where a single AutoSum reports two thirds of a contingent pipeline as
 * collectable. The sales export shipped for months silently dropping its notes
 * column, which is why this style of check exists here at all.
 *
 * So this builds the real workbook from live data using the same helpers the
 * route uses, writes it, reads it back, and asserts against the database.
 *
 * Usage:
 *   node scripts/integrity/verify-billing-export.mjs
 *   node scripts/integrity/verify-billing-export.mjs --keep   (leave the .xlsx)
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import createJiti from 'jiti';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const jiti = createJiti(process.cwd(), {
  interopDefault: true,
  esmResolve: true,
  alias: { '@': process.cwd() },
});
const { buildForecastWorkbook, buildLinesWorkbook } = jiti('./lib/billing/export-workbook.ts');
const { forecastLine, isForecastable } = jiti('./lib/billing/forecast.ts');

const KEEP = process.argv.includes('--keep');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const problems = [];
const fail = (m) => problems.push(m);
const money = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const sb = createClient(url, key);

async function main() {
  const { data: lines, error } = await sb
    .from('contract_deliverables')
    .select('id, label, service_type, quantity, unit_price, total_amount, is_complimentary, funding_hold, delivery_state, billing_state, delivery_date, delivered_by, planned_date, planned_confidence, sequence_number, sequence_total, district_id, partnership_id, quote_id, invoice_id');
  if (error) throw new Error(error.message);

  const pick = (k) => [...new Set(lines.map((l) => l[k]).filter(Boolean))];
  const [districts, partnerships, quotes, invoices] = await Promise.all([
    sb.from('districts').select('id, name'),
    sb.from('partnerships').select('id, contract_start').in('id', pick('partnership_id')),
    sb.from('quotes').select('id, quote_number').in('id', pick('quote_id')),
    pick('invoice_id').length
      ? sb.from('intelligence_invoices').select('id, invoice_number, status, amount, invoice_date, due_date').in('id', pick('invoice_id'))
      : Promise.resolve({ data: [] }),
  ]);

  const [allInvoices, payments] = await Promise.all([
    sb.from('intelligence_invoices').select('id, invoice_number, status, amount, invoice_date, due_date, po_number, district_id').neq('status', 'void'),
    sb.from('billing_payment_applications').select('invoice_id, amount'),
  ]);
  const appliedTo = new Map();
  for (const p of payments.data ?? []) appliedTo.set(p.invoice_id, (appliedTo.get(p.invoice_id) ?? 0) + Number(p.amount));

  const lookups = {
    invoices: (allInvoices.data ?? []).map((i) => ({ ...i, applied: appliedTo.get(i.id) ?? 0 })),
    districtName: new Map((districts.data ?? []).map((d) => [d.id, d.name])),
    contractStart: new Map((partnerships.data ?? []).map((p) => [p.id, p.contract_start])),
    quoteNumber: new Map((quotes.data ?? []).map((q) => [q.id, q.quote_number])),
    invoice: new Map((invoices.data ?? []).map((i) => [i.id, i])),
  };

  // What the database says, computed independently of the workbook.
  const rows = lines.filter(isForecastable).map((l) =>
    forecastLine({
      ...l,
      district_name: l.district_id ? lookups.districtName.get(l.district_id) ?? null : null,
      contract_start: l.partnership_id ? lookups.contractStart.get(l.partnership_id) ?? null : null,
    }),
  );
  const expect = {
    client: rows.filter((r) => r.ledger === 'client').reduce((s, r) => s + r.amount, 0),
    grant: rows.filter((r) => r.ledger === 'grant').reduce((s, r) => s + r.amount, 0),
    clientRows: rows.filter((r) => r.ledger === 'client').length,
    grantRows: rows.filter((r) => r.ledger === 'grant').length,
    compRows: rows.filter((r) => r.ledger === 'complimentary').length,
  };

  const dir = mkdtempSync(join(tmpdir(), 'tdi-billing-export-'));
  const today = new Date().toISOString().slice(0, 10);

  for (const [kind, wb] of [
    ['forecast', buildForecastWorkbook(lines, lookups, today)],
    ['lines', buildLinesWorkbook(lines, lookups, today)],
  ]) {
    const file = join(dir, `${kind}.xlsx`);
    XLSX.writeFile(wb, file);
    const back = XLSX.readFile(file);

    // 1. The ledgers are on their own sheets. This is the whole point.
    const required = kind === 'forecast'
      ? ['Position', 'Receivables', 'Cash forecast', 'Ready to invoice', 'Client money', 'Grant money', 'Complimentary']
      : ['Client money', 'Grant money', 'Complimentary'];
    for (const name of required) {
      if (!back.SheetNames.includes(name)) fail(`${kind}: no "${name}" sheet. The file has ${back.SheetNames.join(', ')}.`);
    }

    // 2. It opens on the money. A workbook opens on its first sheet, and this
    //    one used to open on a page of prose with the figures hidden behind
    //    tabs. Rae, 23 September 2026: "this is not helpful at all."
    if (back.SheetNames[0] !== required[0]) {
      fail(`${kind}: opens on "${back.SheetNames[0]}" rather than "${required[0]}". The first sheet is what someone sees, so it has to carry the numbers.`);
    }
    if (problems.length) continue;

    const sheet = (n) => XLSX.utils.sheet_to_json(back.Sheets[n], { header: 1, defval: '' }).slice(1);
    const client = sheet('Client money');
    const grant = sheet('Grant money');
    const comp = sheet('Complimentary');

    // 3. Amounts are numbers. A formatted string looks right and sums to zero.
    const amountCol = kind === 'forecast' ? 5 : 7;
    for (const [name, rs] of [['Client money', client], ['Grant money', grant]]) {
      const textAmounts = rs.filter((r) => r[amountCol] !== '' && r[amountCol] !== null && typeof r[amountCol] !== 'number');
      if (textAmounts.length) {
        fail(`${kind} / ${name}: ${textAmounts.length} amount cell(s) are text, not numbers. Excel will not add them up. First: ${JSON.stringify(textAmounts[0][amountCol])}`);
      }
    }

    // 4. No grant money leaked onto the client sheet, in either direction.
    if (kind === 'forecast') {
      const sum = (rs) => rs.reduce((s, r) => s + (typeof r[amountCol] === 'number' ? r[amountCol] : 0), 0);
      if (client.length !== expect.clientRows) fail(`forecast: Client money has ${client.length} rows, database says ${expect.clientRows}.`);
      if (grant.length !== expect.grantRows) fail(`forecast: Grant money has ${grant.length} rows, database says ${expect.grantRows}.`);
      if (comp.length !== expect.compRows) fail(`forecast: Complimentary has ${comp.length} rows, database says ${expect.compRows}.`);
      if (Math.abs(sum(client) - expect.client) > 0.005) fail(`forecast: Client money totals ${money(sum(client))}, database says ${money(expect.client)}.`);
      if (Math.abs(sum(grant) - expect.grant) > 0.005) fail(`forecast: Grant money totals ${money(sum(grant))}, database says ${money(expect.grant)}.`);
      if (sum(comp) !== 0) fail(`forecast: Complimentary totals ${money(sum(comp))}. Complimentary work is never money.`);

      // 5. A grant row can never carry a ready date. Rae, 22 September 2026:
      //    funding work is only allowed once funding has been awarded.
      const datedGrant = grant.filter((r) => r[0]);
      if (datedGrant.length) fail(`forecast: ${datedGrant.length} grant row(s) carry a ready date. A grant line cannot be scheduled before the award lands.`);

      // 6. The receivables sheet accounts for every dollar still owed. A
      //    billing file that omits what a client owes is the gap Rae found.
      const owedInDb = (allInvoices.data ?? []).reduce((s, i) => s + Math.max(Number(i.amount) - (appliedTo.get(i.id) ?? 0), 0), 0);
      const recv = XLSX.utils.sheet_to_json(back.Sheets['Receivables'], { header: 1, defval: '' });
      const anyCellHas = (v) => recv.some((r) => r.some((c) => typeof c === 'number' && Math.abs(c - v) < 0.005));
      if (owedInDb > 0 && !anyCellHas(owedInDb)) {
        fail(`forecast / Receivables: the database says ${money(owedInDb)} is owed and no cell on the sheet carries that total.`);
      }

      // 7. Every undated row says why, or the queue is just an absence.
      const silent = client.concat(grant).filter((r) => !r[0] && !r[8]);
      if (silent.length) fail(`forecast: ${silent.length} undated row(s) give no reason. An undated line without a reason is not a finding.`);
    }

    if (!KEEP) rmSync(file, { force: true });
  }

  if (!KEEP) rmSync(dir, { recursive: true, force: true });
  else console.log(`Workbooks left in ${dir}`);

  if (problems.length) {
    console.error('The billing export is not carrying what it should:\n');
    for (const p of problems) console.error(`  ${p}`);
    console.error('');
    process.exit(1);
  }

  console.log('Billing export verified.');
  console.log(`  Client money : ${money(expect.client)} across ${expect.clientRows} lines`);
  console.log(`  Grant money  : ${money(expect.grant)} across ${expect.grantRows} lines, none dated`);
  console.log(`  Complimentary: ${expect.compRows} lines, no money`);
  console.log('  Opens on Position, ledgers on separate sheets, every amount a number.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
