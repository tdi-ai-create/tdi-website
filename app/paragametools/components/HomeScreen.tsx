'use client';

import { Monitor } from 'lucide-react';
import { COLORS, type GameId } from '../data/gameConfig';

// Card data with emoji icons and updated copy
const GAME_CARDS = [
  {
    id: 'knockout' as GameId,
    icon: '🎯',
    title: 'Question Knockout',
    description: 'Real scenarios. Respond with ONLY questions. Can you resist telling?',
    time: '15 min',
    format: 'Partner Drill',
    color: 'orange' as const,
  },
  {
    id: 'tellorask' as GameId,
    icon: '⚡',
    title: 'Tell or Ask?',
    description: 'Spot disguised commands wearing question costumes.',
    time: '10 min',
    format: 'Table Debate',
    color: 'yellow' as const,
  },
  {
    id: 'levelup' as GameId,
    icon: '📈',
    title: 'Feedback Level Up',
    description: 'Rate feedback quality from Level 1-4. Find the Level 2 trap.',
    time: '12 min',
    format: 'Group Voting',
    color: 'green' as const,
  },
  {
    id: 'madlibs' as GameId,
    icon: '😂',
    title: 'Feedback Madlibs',
    description: 'Fill in silly blanks, then write the real version. Proof the formula works.',
    time: '10 min',
    format: 'Pattern Practice',
    color: 'purple' as const,
  },
  {
    id: 'makeover' as GameId,
    icon: '🔧',
    title: 'Feedback Makeover',
    description: 'Transform terrible feedback into Level 3 using the formula. The final exam.',
    time: '15 min',
    format: 'Advanced Practice',
    color: 'red' as const,
  },
];

interface HomeScreenProps {
  onSelectGame: (gameId: GameId) => void;
  onFacilitatorMode?: () => void;
}

export function HomeScreen({ onSelectGame, onFacilitatorMode }: HomeScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 md:px-6 py-8"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <p
          className="text-xs md:text-sm uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255, 120, 71, 0.5)' }}
        >
          The Moves That Matter
        </p>
        <h1
          className="text-5xl md:text-7xl font-black mb-3"
          style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}
        >
          GAME TIME
        </h1>
        <p className="text-base md:text-lg font-light" style={{ color: '#8899aa' }}>
          Pick a game to play with your tables
        </p>
      </div>

      {/* Game cards - single column, full width */}
      <div className="flex flex-col gap-6 w-full max-w-[600px]">
        {GAME_CARDS.map((game, index) => {
          const colorConfig = COLORS[game.color];
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
                  {game.title}
                </h2>
              </div>

              {/* Description */}
              <p
                className="text-base md:text-lg mb-3 leading-relaxed"
                style={{ color: '#8899aa' }}
              >
                {game.description}
              </p>

              {/* Metadata line */}
              <p className="text-sm mb-4" style={{ color: '#667788' }}>
                ⏱ {game.time} • {game.format}
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
                PLAY GAME
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
          Facilitator Mode
        </button>
      )}

      {/* Footer */}
      <p className="mt-8 text-xs" style={{ color: '#8899aa', opacity: 0.5 }}>
        Teachers Deserve It Workshop Tools
      </p>
    </div>
  );
}
