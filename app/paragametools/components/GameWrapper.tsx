'use client';

import { GAME_COLORS } from './gameData';

interface GameWrapperProps {
  title: string;
  icon: string;
  color: keyof typeof GAME_COLORS;
  onBack: () => void;
  children: React.ReactNode;
}

export function GameWrapper({ title, icon, color, onBack, children }: GameWrapperProps) {
  const colorConfig = GAME_COLORS[color];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
      }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4"
        style={{ borderBottom: `2px solid ${colorConfig.border}` }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm md:text-base font-medium transition-colors hover:opacity-80"
          style={{ color: '#8899aa' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Games
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h1
            className="text-lg md:text-xl font-bold"
            style={{ color: colorConfig.accent }}
          >
            {title}
          </h1>
        </div>

        {/* Spacer for centering */}
        <div className="w-20" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Intro screen component
interface IntroScreenProps {
  icon: string;
  title: string;
  color: keyof typeof GAME_COLORS;
  rules: string[];
  onStart: () => void;
  extraContent?: React.ReactNode;
}

export function IntroScreen({ icon, title, color, rules, onStart, extraContent }: IntroScreenProps) {
  const colorConfig = GAME_COLORS[color];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-7xl md:text-8xl mb-4">{icon}</div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{title}</h2>

      {/* Rules box */}
      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
      >
        <ul className="space-y-3 text-left">
          {rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white">
              <span style={{ color: colorConfig.accent }}>•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {extraContent}

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: colorConfig.accent,
          color: color === 'yellow' ? '#0a1628' : '#ffffff',
        }}
      >
        Let's Go →
      </button>
    </div>
  );
}

// Done screen component
interface DoneScreenProps {
  icon: string;
  title: string;
  message: string;
  subMessage?: string;
  tableTalk: string;
  color: keyof typeof GAME_COLORS;
  onBack: () => void;
  extraContent?: React.ReactNode;
}

export function DoneScreen({
  icon,
  title,
  message,
  subMessage,
  tableTalk,
  color,
  onBack,
  extraContent,
}: DoneScreenProps) {
  const colorConfig = GAME_COLORS[color];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-7xl md:text-8xl mb-4">{icon}</div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>

      <p className="text-lg md:text-xl text-white mb-2 max-w-lg">{message}</p>
      {subMessage && (
        <p className="text-base text-gray-400 mb-6 max-w-lg">{subMessage}</p>
      )}

      {extraContent}

      {/* Table Talk box */}
      <div
        className="w-full max-w-lg rounded-xl p-6 mb-8"
        style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
      >
        <p className="text-sm uppercase tracking-wider mb-2" style={{ color: colorConfig.accent }}>
          Table Talk
        </p>
        <p className="text-white text-lg">{tableTalk}</p>
      </div>

      <button
        onClick={onBack}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
      >
        ← Back to Games
      </button>
    </div>
  );
}
