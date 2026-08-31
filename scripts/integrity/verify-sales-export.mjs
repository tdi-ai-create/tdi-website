#!/usr/bin/env node
/**
 * Does the sales pipeline export actually carry the notes?
 *
 * For months it did not. The "Notes" column was the `sales_opportunities.notes`
 * text column, an old import, so an exported list showed one stale blob per
 * lead and none of the calls, emails or meetings anyone had logged. It looked
 * like a working export, which is why it survived.
 *
 * This builds a real workbook from live data using the same helpers the page
 * uses, then reads the file back and checks the history is in it. A cell that
 * silently loses notes fails here rather than in a spreadsheet someone is
 * about to act on.
 *
 * Usage:
 *   node scripts/integrity/verify-sales-export.mjs
 *   node scripts/integrity/verify-sales-export.mjs --keep   (leave the .xlsx)
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

// The lib files import through the "@/..." alias that Next resolves for them.
const jiti = createJiti(process.cwd(), {
  interopDefault: true,
  esmResolve: true,
  alias: { '@': process.cwd() },
});
const { getAllClientNotesByOpp } = jiti('./lib/sales/client-notes.ts');
const { buildNoteRows, notesToCell } = jiti('./lib/sales/export-notes.ts');

const keep = process.argv.includes('--keep');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log('Skipping sales export check: no Supabase service credentials.');
  console.log('Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to enable.');
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const failures = [];

const { data: leads, error: leadsErr } = await supabase
  .from('sales_opportunities')
  .select('id, name, deleted_at')
  .is('deleted_at', null)
  .limit(20000);

if (leadsErr) {
  console.error('Could not read leads:', leadsErr.message);
  process.exit(1);
}

const notesByOpp = await getAllClientNotesByOpp(supabase);

const totalNotes = Object.values(notesByOpp).reduce((sum, list) => sum + list.length, 0);
const leadsWithNotes = leads.filter((l) => (notesByOpp[l.id] ?? []).length > 0);

console.log(
  `${leads.length} active leads, ${leadsWithNotes.length} with notes, ${totalNotes} notes in total.`
);

if (totalNotes === 0) {
  failures.push('No notes were gathered at all. The export would ship an empty history.');
}

// Build the workbook exactly as the page does.
const mainRows = leads.map((l) => ({
  'District / School': l.name || '',
  Notes: notesToCell(notesByOpp[l.id] ?? []),
}));

const noteRows = buildNoteRows(
  leads.map((l) => ({ id: l.id, name: l.name })),
  notesByOpp
);

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mainRows), 'Pipeline');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(noteRows), 'All Notes');

const dir = mkdtempSync(join(tmpdir(), 'tdi-export-check-'));
const file = join(dir, 'pipeline-check.xlsx');
XLSX.writeFile(wb, file);

// Read it back. Building a sheet in memory proves nothing about the file.
const reopened = XLSX.readFile(file);

if (!reopened.SheetNames.includes('All Notes')) {
  failures.push('The workbook has no All Notes tab.');
}

const readMain = XLSX.utils.sheet_to_json(reopened.Sheets['Pipeline']);
const readNotes = XLSX.utils.sheet_to_json(reopened.Sheets['All Notes'] ?? {});

if (readNotes.length !== noteRows.length) {
  failures.push(
    `All Notes tab holds ${readNotes.length} rows, expected ${noteRows.length}.`
  );
}

// Every lead that has notes must show them in its Notes cell.
const emptyCells = leadsWithNotes.filter((l) => {
  const row = readMain.find((r) => r['District / School'] === (l.name || ''));
  return !row || !String(row.Notes || '').trim();
});

if (emptyCells.length > 0) {
  failures.push(
    `${emptyCells.length} leads have notes but an empty Notes cell, e.g. ${emptyCells
      .slice(0, 3)
      .map((l) => l.name)
      .join(', ')}.`
  );
}

// Nothing may exceed what Excel will open.
const oversize = readMain.filter((r) => String(r.Notes || '').length > 32767);
if (oversize.length > 0) {
  failures.push(`${oversize.length} Notes cells exceed the 32,767 character limit.`);
}

// The stale-import failure this check exists to catch: a lead whose only
// exported note is the legacy blob while real notes exist for it.
const importOnly = leadsWithNotes.filter((l) => {
  const notes = notesByOpp[l.id] ?? [];
  const hasReal = notes.some((n) => !n.body.startsWith('[Imported record]'));
  if (!hasReal) return false;
  const row = readMain.find((r) => r['District / School'] === (l.name || ''));
  const cell = String(row?.Notes || '');
  return cell.startsWith('[Imported record]') && cell.split('\n\n').length === 1;
});

if (importOnly.length > 0) {
  failures.push(
    `${importOnly.length} leads exported only the legacy imported blob despite having real notes.`
  );
}

if (keep) console.log(`Workbook kept at ${file}`);
else rmSync(dir, { recursive: true, force: true });

if (failures.length > 0) {
  console.error('\nSales export check FAILED:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}

const biggest = readMain.reduce(
  (max, r) => Math.max(max, String(r.Notes || '').length),
  0
);

console.log(
  `Export carries the history: ${readNotes.length} note rows on the All Notes tab, ` +
    `largest Notes cell ${biggest} characters.`
);
