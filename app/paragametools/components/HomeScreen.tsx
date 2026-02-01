'use client';

import { GAMES, GAME_COLORS, GameId } from './gameData';

interface HomeScreenProps {
  onSelectGame: (gameId: GameId) => void;
}

export function HomeScreen({ onSelectGame }: HomeScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
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

      {/* Game cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl">
        {GAMES.map((game) => {
          const colorConfig = GAME_COLORS[game.color];
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group relative p-6 rounded-2xl text-left transition-all duration-200 hover:-translate-y-1"
              style={{
                backgroundColor: colorConfig.bg,
                border: `2px solid ${colorConfig.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colorConfig.accent;
                e.currentTarget.style.boxShadow = `0 8px 32px ${colorConfig.accent}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colorConfig.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{game.icon}</span>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#8899aa' }}
                >
                  {game.time}
                </span>
              </div>
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#ffffff' }}
              >
                {game.title}
              </h2>
              <p
                className="text-sm md:text-base"
                style={{ color: '#8899aa' }}
              >
                {game.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs" style={{ color: '#8899aa', opacity: 0.5 }}>
        Teachers Deserve It Workshop Tools
      </p>
    </div>
  );
}
