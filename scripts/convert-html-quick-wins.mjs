/**
 * Convert the published Quick Wins whose download is an HTML file into real PDFs.
 *
 * Twenty-one published downloads point at an .html file. They are not merely the
 * wrong container: Supabase serves them as `text/plain` with `x-content-type-options:
 * nosniff`, so a browser refuses to render them. A teacher who clicks Download on
 * any of these gets a wall of CSS and markup. Confirmed against the live bucket
 * on 2026-09-01, and it has been that way since they were published.
 *
 * The content behind them is good. All 21 carry 3,200 to 7,000 characters of real
 * material, and their CSS already declares `@page { size: 8.5in 11in; margin: 0 }`
 * and sizes everything in inches. Somebody built them print-ready and the serving
 * broke it.
 *
 * So this prints each page through a real browser rather than re-typesetting the
 * content into a generic template. The author's layout survives.
 *
 * The original .html objects are left in storage untouched. Only `file_url` moves.
 *
 *   node scripts/convert-html-quick-wins.mjs            # dry run, writes nothing
 *   node scripts/convert-html-quick-wins.mjs --apply    # convert, upload, repoint
 */
import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')

for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // Not present. The next file, or the real environment, may still have it.
  }
}

const URL = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
const KEY = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
if (!URL || !KEY) {
  console.error('Needs LEARNING_HUB_SUPABASE_URL and LEARNING_HUB_SUPABASE_SERVICE_KEY.')
  process.exit(1)
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })
const BUCKET = 'resource-files'

const { data: rows, error } = await supabase
  .from('hub_quick_wins')
  .select('id, slug, title, file_url, storage_path, tool_type')
  .eq('is_published', true)
  .eq('quick_win_type', 'download')
  .order('slug')
if (error) throw new Error(error.message)

const targets = (rows || []).filter(r => r.file_url && !/\.pdf(\?|#|$)/i.test(r.file_url))
console.log(`${targets.length} published downloads still point at a non-PDF file.\n`)
if (targets.length === 0) process.exit(0)

const browser = await chromium.launch()
let converted = 0, failed = 0

for (const row of targets) {
  const label = row.slug.padEnd(44)
  try {
    // Fetch the object directly rather than through file_url, whose ?download=
    // query string is part of what made these behave badly in the first place.
    const src = `${URL}/storage/v1/object/public/${BUCKET}/${row.storage_path}`
    const res = await fetch(src)
    if (!res.ok) { console.log(`${label} SKIP  source ${res.status}`); failed++; continue }
    const html = await res.text()

    const page = await browser.newPage()
    // setContent rather than a file path so the Google Fonts link in the head
    // still resolves. Without the fonts the layout reflows and the print-ready
    // sizing stops being print-ready.
    await page.setContent(html, { waitUntil: 'networkidle' })
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    await page.close()

    const pdfPath = row.storage_path.replace(/\.html$/i, '.pdf')

    if (!APPLY) {
      console.log(`${label} would write ${String(pdf.length).padStart(7)}b -> ${pdfPath}`)
      converted++
      continue
    }

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(pdfPath, pdf, { contentType: 'application/pdf', upsert: true })
    if (upErr) { console.log(`${label} FAIL  upload: ${upErr.message}`); failed++; continue }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(pdfPath)
    const publicUrl = pub?.publicUrl
    if (!publicUrl) { console.log(`${label} FAIL  no public url`); failed++; continue }

    const stamp = new Date().toISOString()
    const note = `${stamp.slice(0, 10)} converted from HTML to PDF. The .html was served as text/plain with nosniff, so it rendered as source code for every teacher who opened it. Layout preserved by printing the original page. Original object left in storage.`

    const { error: updErr } = await supabase
      .from('hub_quick_wins')
      .update({
        file_url: publicUrl,
        file_path: pdfPath,
        storage_path: pdfPath,
        file_type: 'application/pdf',
        content_type: 'pdf',
        qa_notes: row.qa_notes ? `${row.qa_notes}\n${note}` : note,
        updated_at: stamp,
      })
      .eq('id', row.id)
    if (updErr) { console.log(`${label} FAIL  update: ${updErr.message}`); failed++; continue }

    // Read back and confirm the served bytes really are a PDF now, rather than
    // trusting the update. The whole reason these shipped broken is that nobody
    // checked what the URL actually returned.
    const check = await fetch(publicUrl)
    const ctype = check.headers.get('content-type') || ''
    const bytes = (await check.arrayBuffer()).byteLength
    const good = check.ok && ctype.includes('application/pdf') && bytes > 1000
    console.log(`${label} ${good ? 'OK   ' : 'CHECK'} ${String(bytes).padStart(7)}b  ${ctype}`)
    good ? converted++ : failed++
  } catch (err) {
    console.log(`${label} FAIL  ${err instanceof Error ? err.message : 'unknown'}`)
    failed++
  }
}

await browser.close()
console.log(`\n${APPLY ? 'converted' : 'would convert'}: ${converted}   failed: ${failed}`)
if (!APPLY) console.log('Dry run. Nothing was written. Re-run with --apply.')
