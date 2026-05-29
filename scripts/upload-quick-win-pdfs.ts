/**
 * Upload quick win PDFs to Hub Supabase Storage and update file_url
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://asdwpkcsbcnpknklchdq.supabase.co';
const SERVICE_KEY = process.env.HUB_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Chris's slug mapping: file name -> DB slug
const SLUG_MAP: Record<string, string> = {
  'exec-functioning-educator': 'executive-functioning-educator-guide',
  'exec-functioning-pa-guide': 'executive-functioning-pa-guide',
  'teacher-para-planner': 'teacher-para-partnership-planner',
  'what-to-do-when-pocket-guide': 'para-what-to-do-when',
  'beyond-stop-that-pocket-guide': 'beyond-stop-that',
  'bip-data-collection-ideas': 'bip-data-collection',
  'prek-scenario-pack': 'pre-k-scenario-pack',
  'prek-para-toolkit': 'pre-k-para-toolkit',
  'prek-teaching-moves-card': 'pre-k-teaching-moves',
  'sped-feedback-formula-card': 'sped-feedback-formula',
  'funding-pd-guide': 'funding-pd-that-works-expert-team',
  'copy-paste-parent-messages': 'copy-paste-messages-partnering-parents',
  'personalized-pd-plan': 'personalized-pd-plan-goal-setting',
  'holiday-break-protection-toolkit': 'holiday-break-protection-bundle',
  'sustainable-leadership-planner': 'sustainable-leadership-weekly-planning',
  'connection-builder-checklist': 'connection-builders-daily-checklist',
  'calm-response-scripts': 'calm-response-scripts',
  'sustainable-teaching-self-check': 'sustainable-teaching-self-check',
  'ell-empathy-audit': 'ell-empathy-audit',
  'language-playbook': 'language-playbook',
  'kindergarten-ell-communication-tool': 'kindergarten-ell-quick-communication-tool',
  'phone-call-meeting-preparation-checklist': 'phone-call-meeting-prep-checklist',
  'funding-your-dream-classroom': 'funding-dream-classroom',
  'reset-without-the-guilt': 'reset-without-guilt-reclaim-time-energy',
  'end-of-year-checklist': 'end-of-year-checklist-guilt-free-summer',
  'mastery-learning-pd-model': 'mastery-learning-tdi-pd-model',
  'time-saving-prompts': 'time-saving-prompts-teachers',
  'small-group-support-toolkit': 'small-group-support-toolkit-paras',
  'strategic-planning-tool': 'strategic-planning-teacher-first-tool',
  '10-low-lift-ways': '10-low-lift-ways-solution',
  '3-tiny-wellness-habits': '3-tiny-wellness-habits-educators',
  'classroom-systems-starter-pack': 'classroom-systems-starter-pack',
  'professional-email-practices-quick-reference': 'professional-email-practices-quick-reference',
  'structured-parent-observation-protocol': 'structured-parent-observation-protocol',
  'class-skipping-intervention-plan': 'class-skipping-intervention-plan',
  'helping-families-navigate-middle-school': 'helping-families-navigate-middle-school',
  'parent-homework-support-strategies': 'parent-homework-support-strategies',
  'conversation-starter-cheat-sheet': 'conversation-starter-cheat-sheet',
  'weekly-communication-checklist': 'weekly-communication-checklist',
  'sentence-starter-guide': 'sentence-starter-guide',
  'teacher-para-communication-kit': 'teacher-para-communication-kit',
};

const BASE_DIR = '/Users/raehughart/Desktop/hub-downloads-migration';
const BUCKET = 'resource-files';

async function main() {
  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET);
  if (!bucketExists) {
    console.log(`Creating bucket: ${BUCKET}`);
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) {
      console.error('Bucket creation error:', error.message);
      // Try with the bucket anyway
    }
  }

  // Get all published quick wins
  const { data: quickWins, error: qwError } = await supabase
    .from('hub_quick_wins')
    .select('id, slug, title')
    .eq('is_published', true);

  if (qwError) {
    console.error('Error fetching quick wins:', qwError.message);
    return;
  }

  console.log(`Found ${quickWins?.length} published quick wins`);

  // Build slug -> quick win ID map
  const slugToQW: Record<string, { id: string; title: string }> = {};
  for (const qw of quickWins || []) {
    slugToQW[qw.slug] = { id: qw.id, title: qw.title };
  }

  // Find all PDF/PNG files
  const allFiles: string[] = [];
  for (let batch = 1; batch <= 5; batch++) {
    const batchDir = path.join(BASE_DIR, `batch-0${batch}`);
    if (fs.existsSync(batchDir)) {
      const files = fs.readdirSync(batchDir);
      for (const f of files) {
        if (f.endsWith('.pdf') || f.endsWith('.png')) {
          allFiles.push(path.join(batchDir, f));
        }
      }
    }
  }

  console.log(`Found ${allFiles.length} files to upload`);

  let uploaded = 0;
  let matched = 0;
  let failed = 0;
  const unmatched: string[] = [];

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    const fileNameNoExt = fileName.replace(/\.(pdf|png)$/, '');
    const ext = path.extname(fileName);

    // Try to match to a DB slug
    const dbSlug = SLUG_MAP[fileNameNoExt] || fileNameNoExt;
    const qw = slugToQW[dbSlug];

    if (!qw) {
      unmatched.push(`${fileName} -> ${dbSlug} (no match)`);
      continue;
    }

    matched++;

    // Upload to storage
    const storagePath = `quick-wins/${qw.id}/${dbSlug}${ext}`;
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = ext === '.png' ? 'image/png' : 'application/pdf';

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Upload error for ${fileName}:`, uploadError.message);
      failed++;
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      console.error(`No public URL for ${storagePath}`);
      failed++;
      continue;
    }

    // Update hub_quick_wins
    const { error: updateError } = await supabase
      .from('hub_quick_wins')
      .update({
        file_url: publicUrl,
        file_path: storagePath,
        file_type: ext === '.png' ? 'image/png' : 'application/pdf',
        storage_path: storagePath,
      })
      .eq('id', qw.id);

    if (updateError) {
      console.error(`DB update error for ${dbSlug}:`, updateError.message);
      failed++;
    } else {
      uploaded++;
      process.stdout.write('.');
    }
  }

  console.log(`\n\nResults:`);
  console.log(`  Matched: ${matched}`);
  console.log(`  Uploaded + linked: ${uploaded}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Unmatched files: ${unmatched.length}`);

  if (unmatched.length > 0) {
    console.log(`\nUnmatched files:`);
    for (const u of unmatched) {
      console.log(`  ${u}`);
    }
  }

  // Verify
  const { count } = await supabase
    .from('hub_quick_wins')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)
    .not('file_url', 'is', null);

  console.log(`\nQuick wins with file_url: ${count} / ${quickWins?.length}`);
}

main().catch(console.error);
