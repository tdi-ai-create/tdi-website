'use client';

import Image from 'next/image';
import { ArrowLeft, Monitor, Coffee } from 'lucide-react';
import { GAMES, COLORS, type GameId } from '../data/gameConfig';

interface FacilitatorHomeProps {
  onSelectGame: (gameId: GameId) => void;
  onPlayerMode: () => void;
  onSlangBreak: () => void;
}

export function FacilitatorHome({ onSelectGame, onPlayerMode, onSlangBreak }: FacilitatorHomeProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
        color: '#ffffff',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 md:mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Monitor size={24} style={{ color: '#3498DB' }} />
          <p
            className="text-xs md:text-sm uppercase tracking-widest"
            style={{ color: '#3498DB' }}
          >
            Facilitator Mode
          </p>
        </div>
        <h1
          className="text-5xl md:text-7xl font-black mb-3"
          style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}
        >
          GAME TIME
        </h1>
        <p className="text-base md:text-lg font-light" style={{ color: '#8899aa' }}>
          Select a game to manage from your projected screen
        </p>
      </div>

      {/* Game cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl">
        {GAMES.map((game, index) => {
          const colorConfig = COLORS[game.color];
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-200 hover:-translate-y-1 animate-slide-up"
              style={{
                backgroundColor: colorConfig.bg,
                border: `2px solid ${colorConfig.border}`,
                animationDelay: `${index * 0.1}s`,
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
              <div className="relative w-full aspect-[5/2]">
                <Image
                  src={game.thumbnail}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
                <span
                  className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', color: '#ffffff' }}
                >
                  {game.duration} min
                </span>
              </div>
              <div className="p-6">
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
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onSlangBreak}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'rgba(155, 89, 182, 0.15)',
            border: '1px solid rgba(155, 89, 182, 0.4)',
            color: '#9B59B6',
          }}
        >
          <Coffee size={20} />
          Slang Break
        </button>
        <button
          onClick={onPlayerMode}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#8899aa',
          }}
        >
          <ArrowLeft size={20} />
          Player Mode
        </button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs" style={{ color: '#8899aa', opacity: 0.5 }}>
        Teachers Deserve It Workshop Tools
      </p>
    </div>
  );
}
