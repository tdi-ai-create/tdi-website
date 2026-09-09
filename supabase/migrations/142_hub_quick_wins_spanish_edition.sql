-- ============================================================
-- Give a Quick Win somewhere to keep its Spanish edition.
--
-- The ES toggle has translated titles and descriptions since 9 September 2026,
-- but hub_quick_wins has never had a column for a Spanish file. So the download
-- button serves the English PDF no matter what the toggle says, and a Spanish
-- speaking teacher gets a bilingual card attached to an English document.
--
-- A Spanish edition is the same payload rendered again through the same
-- template, not a second document, so these columns mirror the English ones
-- exactly. See docs/hub-bilingual-resource-spec.md.
--
-- Every column is nullable and additive, and nothing here constrains, defaults
-- or triggers. 197 of 224 published downloads have no source payload at all
-- today, so any rule requiring Spanish would fail almost the whole library the
-- instant it was created. Enforcement never outruns the content: see
-- docs/hub-publish-gate-runbook.md. An item with no Spanish edition behaves
-- after this migration exactly as it did before it.
-- ============================================================

BEGIN;

ALTER TABLE public.hub_quick_wins
  ADD COLUMN IF NOT EXISTS guide_sections_es jsonb,
  ADD COLUMN IF NOT EXISTS tool_content_es   jsonb,
  ADD COLUMN IF NOT EXISTS file_url_es       text,
  ADD COLUMN IF NOT EXISTS file_path_es      text,
  ADD COLUMN IF NOT EXISTS tool_file_url_es  text,
  ADD COLUMN IF NOT EXISTS tool_file_path_es text,
  ADD COLUMN IF NOT EXISTS objectives_es     text,
  ADD COLUMN IF NOT EXISTS translated_at     timestamptz,
  ADD COLUMN IF NOT EXISTS translated_by     text;

COMMENT ON COLUMN public.hub_quick_wins.guide_sections_es IS
  'Spanish guide payload. Same shape as guide_sections, translated. The source a Spanish guide is rendered from, so a damaged PDF is regenerated rather than rewritten.';

COMMENT ON COLUMN public.hub_quick_wins.tool_content_es IS
  'Spanish tool payload. Same shape as tool_content, translated.';

COMMENT ON COLUMN public.hub_quick_wins.file_url_es IS
  'Rendered Spanish guide. NULL means no Spanish edition exists and the Hub serves the English file.';

COMMENT ON COLUMN public.hub_quick_wins.tool_file_url_es IS
  'Rendered Spanish tool. NULL means no Spanish edition exists and the Hub serves the English file.';

COMMENT ON COLUMN public.hub_quick_wins.translated_at IS
  'When the Spanish edition last passed language review. Same role as reviewed_at, and deliberately separate: an English item can be reviewed while its Spanish edition is not.';

COMMENT ON COLUMN public.hub_quick_wins.translated_by IS
  'Who ran the Spanish language review. Same role as reviewed_by.';

-- Answers "which live items still have no Spanish edition", which is the only
-- number that says whether this programme is moving.
CREATE INDEX IF NOT EXISTS idx_quick_wins_spanish_edition
  ON public.hub_quick_wins (is_published)
  WHERE file_url_es IS NOT NULL;

COMMIT;
