import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TranslateRequest {
  strings: string[];
  lang: 'es';
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { strings, lang } = body;

    if (!strings || !Array.isArray(strings) || strings.length === 0) {
      return NextResponse.json({ translations: {} });
    }

    if (lang !== 'es') {
      return NextResponse.json({ error: 'Only Spanish (es) is supported' }, { status: 400 });
    }

    // Filter out empty strings
    const validStrings = strings.filter(s => s && s.trim());
    if (validStrings.length === 0) {
      return NextResponse.json({ translations: {} });
    }

    // Check Supabase cache first
    const { data: cached } = await supabase
      .from('hub_ui_translations')
      .select('source_text, translated_text')
      .eq('target_lang', lang)
      .in('source_text', validStrings);

    const cachedMap: Record<string, string> = {};
    if (cached) {
      for (const row of cached) {
        cachedMap[row.source_text] = row.translated_text;
      }
    }

    // Find strings that need translation
    const needsTranslation = validStrings.filter(s => !cachedMap[s]);

    // If all strings are cached, return immediately
    if (needsTranslation.length === 0) {
      return NextResponse.json({ translations: cachedMap });
    }

    // Batch translate missing strings via Google Translate
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!googleApiKey) {
      // Return cached + English fallback for untranslated
      const result: Record<string, string> = { ...cachedMap };
      for (const s of needsTranslation) {
        result[s] = s; // Fallback to English
      }
      return NextResponse.json({ translations: result });
    }

    try {
      // Google Translate API v2 batch request
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: needsTranslation,
            source: 'en',
            target: lang,
            format: 'text',
          }),
        }
      );

      if (!response.ok) {
        console.error('Google Translate API error:', await response.text());
        // Fallback to English for failed translations
        const result: Record<string, string> = { ...cachedMap };
        for (const s of needsTranslation) {
          result[s] = s;
        }
        return NextResponse.json({ translations: result });
      }

      const data = await response.json();
      const translations = data.data?.translations || [];

      // Build result and cache new translations
      const result: Record<string, string> = { ...cachedMap };
      const toCache: { source_text: string; target_lang: string; translated_text: string }[] = [];

      for (let i = 0; i < needsTranslation.length; i++) {
        const source = needsTranslation[i];
        const translated = translations[i]?.translatedText || source;
        result[source] = translated;
        toCache.push({
          source_text: source,
          target_lang: lang,
          translated_text: translated,
        });
      }

      // Cache translations (ignore errors - cache is optional)
      if (toCache.length > 0) {
        await supabase
          .from('hub_ui_translations')
          .upsert(toCache, { onConflict: 'source_text,target_lang' })
          .then(() => {});
      }

      return NextResponse.json({ translations: result });
    } catch (translateError) {
      console.error('Translation error:', translateError);
      // Fallback to English
      const result: Record<string, string> = { ...cachedMap };
      for (const s of needsTranslation) {
        result[s] = s;
      }
      return NextResponse.json({ translations: result });
    }
  } catch (error) {
    console.error('translate-ui error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
