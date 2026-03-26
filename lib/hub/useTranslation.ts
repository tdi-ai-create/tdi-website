'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from './useLanguage';

// Global translation cache (persists across component instances)
const translationCache: Record<string, string> = {};

// Batch collection for debounced requests
let pendingStrings: Set<string> = new Set();
let batchTimeout: NodeJS.Timeout | null = null;
let batchPromise: Promise<void> | null = null;
let listeners: Set<() => void> = new Set();

async function flushBatch() {
  if (pendingStrings.size === 0) return;

  const strings = Array.from(pendingStrings);
  pendingStrings = new Set();
  batchPromise = null;

  try {
    const response = await fetch('/api/hub/translate-ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strings, lang: 'es' }),
    });

    if (response.ok) {
      const data = await response.json();
      const translations = data.translations || {};

      // Update cache
      for (const [source, translated] of Object.entries(translations)) {
        translationCache[source] = translated as string;
      }

      // Notify all listeners
      listeners.forEach(listener => listener());
    }
  } catch (error) {
    console.error('Translation batch failed:', error);
  }
}

function queueTranslation(text: string): void {
  if (!text || translationCache[text]) return;

  pendingStrings.add(text);

  // Debounce: wait 50ms to collect more strings
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }

  batchTimeout = setTimeout(() => {
    batchTimeout = null;
    batchPromise = flushBatch();
  }, 50);
}

export function useTranslation() {
  const { language } = useLanguage();
  const [, forceUpdate] = useState(0);

  // Register listener for cache updates
  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  /**
   * Translate a UI string
   * - In English mode: returns the string as-is
   * - In Spanish mode: returns cached translation or queues for translation
   */
  const tUI = useCallback((text: string): string => {
    if (!text) return '';
    if (language !== 'es') return text;

    // Check cache first
    if (translationCache[text]) {
      return translationCache[text];
    }

    // Queue for translation
    queueTranslation(text);

    // Return English while translation loads
    return text;
  }, [language]);

  /**
   * Pre-load translations for multiple strings
   * Call this early to minimize translation delay
   */
  const preloadTranslations = useCallback((strings: string[]) => {
    if (language !== 'es') return;

    for (const text of strings) {
      if (text && !translationCache[text]) {
        queueTranslation(text);
      }
    }
  }, [language]);

  return { tUI, preloadTranslations, language };
}
