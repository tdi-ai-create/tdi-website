'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import React from 'react';

export type SetupLanguage = 'en' | 'es';

interface SetupLanguageContextValue {
  language: SetupLanguage;
  setLanguage: (lang: SetupLanguage) => void;
  t: (en: string, es: string) => string;
}

const SetupLanguageContext = createContext<SetupLanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (en: string) => en,
});

export function SetupLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SetupLanguage>('en');

  const t = useCallback(
    (en: string, es: string): string => {
      return language === 'es' ? es : en;
    },
    [language]
  );

  return React.createElement(
    SetupLanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
}

export function useSetupLanguage() {
  return useContext(SetupLanguageContext);
}
