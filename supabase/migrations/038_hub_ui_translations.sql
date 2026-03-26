-- Hub UI translations cache - stores Google Translate results for UI strings
CREATE TABLE IF NOT EXISTS hub_ui_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text text NOT NULL,
  target_lang text NOT NULL CHECK (target_lang IN ('es')),
  translated_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_text, target_lang)
);

CREATE INDEX IF NOT EXISTS idx_hub_ui_translations_lookup
ON hub_ui_translations(target_lang, source_text);

-- No RLS needed - this is read-only public cache
-- Writes only happen server-side via service role
