'use client';

import { Monitor, Globe } from 'lucide-react';
import { COLORS, type GameId } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { UI_TRANSLATIONS } from '../data/translations';

// Card data with emoji icons and updated copy
const GAME_CARDS: {
  id: GameId;
  icon: string;
  color: 'orange' | 'yellow' | 'green' | 'purple' | 'red';
}[] = [
  { id: 'knockout', icon: '🎯', color: 'orange' },
  { id: 'tellorask', icon: '⚡', color: 'yellow' },
  { id: 'levelup', icon: '📈', color: 'green' },
  { id: 'madlibs', icon: '😂', color: 'purple' },
  { id: 'makeover', icon: '🔧', color: 'red' },
];

const TIMES: Record<GameId, string> = {
  knockout: '15 min',
  tellorask: '10 min',
  levelup: '12 min',
  madlibs: '10 min',
  makeover: '15 min',
};

interface HomeScreenProps {
  onSelectGame: (gameId: GameId) => void;
  onFacilitatorMode?: () => void;
}

export function HomeScreen({ onSelectGame, onFacilitatorMode }: HomeScreenProps) {
  const { language, setLanguage } = useLanguage();
  const t = UI_TRANSLATIONS;
  const games = t.games;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 md:px-6 py-8"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
        color: '#ffffff',
      }}
    >
      {/* Language Toggle */}
      <div className="w-full max-w-[600px] flex justify-end mb-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
          }}
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'Español' : 'English'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <p
          className="text-xs md:text-sm uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255, 120, 71, 0.5)' }}
        >
          {t.homeSubtitle[language]}
        </p>
        <h1
          className="text-5xl md:text-7xl font-black mb-3"
          style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}
        >
          {t.homeTitle[language]}
        </h1>
        <p className="text-base md:text-lg font-light" style={{ color: '#8899aa' }}>
          {t.homeDescription[language]}
        </p>
      </div>

      {/* Game cards - single column, full width */}
      <div className="flex flex-col gap-6 w-full max-w-[600px]">
        {GAME_CARDS.map((game, index) => {
          const colorConfig = COLORS[game.color];
          const gameTranslations = games[game.id];
          return (
            <div
              key={game.id}
              className="w-full rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 animate-slide-up"
              style={{
                backgroundColor: colorConfig.bg,
                border: `2px solid ${colorConfig.border}`,
                animationDelay: `${index * 0.08}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colorConfig.accent;
                e.currentTarget.style.boxShadow = `0 8px 24px ${colorConfig.accent}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colorConfig.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon + Title row */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[28px]">{game.icon}</span>
                <h2 className="text-2xl md:text-[28px] font-bold text-white">
                  {gameTranslations.title[language]}
                </h2>
              </div>

              {/* Description */}
              <p
                className="text-base md:text-lg mb-3 leading-relaxed"
                style={{ color: '#8899aa' }}
              >
                {gameTranslations.description[language]}
              </p>

              {/* Metadata line */}
              <p className="text-sm mb-4" style={{ color: '#667788' }}>
                ⏱ {TIMES[game.id]} • {gameTranslations.format[language]}
              </p>

              {/* Play button */}
              <button
                onClick={() => onSelectGame(game.id)}
                className="w-full min-h-[48px] text-lg font-bold rounded-xl transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                style={{
                  backgroundColor: colorConfig.accent,
                  color: '#ffffff',
                }}
              >
                {t.playGame[language]}
              </button>
            </div>
          );
        })}
      </div>

      {/* Facilitator mode button */}
      {onFacilitatorMode && (
        <button
          onClick={onFacilitatorMode}
          className="mt-8 flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'rgba(52, 152, 219, 0.15)',
            border: '1px solid rgba(52, 152, 219, 0.4)',
            color: '#3498DB',
          }}
        >
          <Monitor size={20} />
          {t.facilitatorMode[language]}
        </button>
      )}

      {/* Footer */}
      <p className="mt-8 text-xs" style={{ color: '#8899aa', opacity: 0.5 }}>
        {t.footer[language]}
      </p>
    </div>
  );
}
