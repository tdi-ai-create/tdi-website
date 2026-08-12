'use client';

import { useSetupLanguage } from '@/lib/partner-setup/useSetupLanguage';

export default function SetupLanguageToggle() {
  const { language, setLanguage } = useSetupLanguage();

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded transition-colors ${
          language === 'en'
            ? 'text-[#c9a84c] font-semibold'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLanguage('es')}
        className={`px-2 py-1 rounded transition-colors ${
          language === 'es'
            ? 'text-[#c9a84c] font-semibold'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Cambiar a espa\u00f1ol"
      >
        ES
      </button>
    </div>
  );
}
