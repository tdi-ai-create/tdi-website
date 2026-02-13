'use client';

import { ArrowLeft, Target, Zap, TrendingUp, Smile, Wrench, Award, Check, X } from 'lucide-react';
import { COLORS, type GameId } from '../data/gameConfig';
import { ConfettiBurst } from './ConfettiBurst';

// Icon map for games
export const GAME_ICONS = {
  knockout: Target,
  tellorask: Zap,
  levelup: TrendingUp,
  madlibs: Smile,
  makeover: Wrench,
} as const;

interface GameWrapperProps {
  gameId: GameId;
  title: string;
  color: keyof typeof COLORS;
  onBack: () => void;
  children: React.ReactNode;
}

export function GameWrapper({ gameId, title, color, onBack, children }: GameWrapperProps) {
  const colorConfig = COLORS[color];
  const IconComponent = GAME_ICONS[gameId];

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
        style={{ borderBottom: `1px solid ${colorConfig.border}` }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm md:text-base font-medium transition-colors hover:opacity-80"
          style={{ color: '#8899aa' }}
        >
          <ArrowLeft size={20} />
          Games
        </button>

        <div className="flex items-center gap-2">
          <IconComponent size={24} style={{ color: colorConfig.accent }} />
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
  gameId: GameId;
  title: string;
  color: keyof typeof COLORS;
  rules: string[];
  onStart: () => void;
  extraContent?: React.ReactNode;
}

export function IntroScreen({ gameId, title, color, rules, onStart, extraContent }: IntroScreenProps) {
  const colorConfig = COLORS[color];
  const IconComponent = GAME_ICONS[gameId];

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: colorConfig.bg, border: `2px solid ${colorConfig.accent}` }}
      >
        <IconComponent size={48} style={{ color: colorConfig.accent }} />
      </div>
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
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
        style={{
          backgroundColor: colorConfig.accent,
          color: color === 'yellow' ? '#0a1628' : '#ffffff',
          ['--glow-color' as string]: colorConfig.accent + '40',
        }}
      >
        Let's Go →
      </button>
    </div>
  );
}

// Done screen component
interface DoneScreenProps {
  title: string;
  message: string;
  subMessage?: string;
  tableTalk: string;
  color: keyof typeof COLORS;
  onBack: () => void;
  extraContent?: React.ReactNode;
}

export function DoneScreen({
  title,
  message,
  subMessage,
  tableTalk,
  color,
  onBack,
  extraContent,
}: DoneScreenProps) {
  const colorConfig = COLORS[color];
  const confettiColors = [colorConfig.accent, '#FFD700', '#FFFFFF'];

  return (
    <div className="flex flex-col items-center text-center">
      <ConfettiBurst colors={confettiColors} particleCount={60} />

      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 animate-scale-in"
        style={{ backgroundColor: colorConfig.bg, border: `2px solid ${colorConfig.accent}` }}
      >
        <Award size={48} style={{ color: colorConfig.accent }} />
      </div>
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
        className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
      >
        <ArrowLeft size={20} />
        Back to Games
      </button>
    </div>
  );
}

// Result card for reveal animations
interface ResultCardProps {
  isCorrect: boolean;
  title: string;
  explanation: string;
  shake?: boolean;
}

export function ResultCard({ isCorrect, title, explanation, shake }: ResultCardProps) {
  const bgColor = isCorrect ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)';
  const borderColor = isCorrect ? '#27AE60' : '#E74C3C';
  const IconComponent = isCorrect ? Check : X;

  return (
    <div
      className={`w-full rounded-xl p-6 text-center animate-reveal-bounce ${shake ? 'animate-shake' : ''}`}
      style={{ backgroundColor: bgColor, border: `2px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <IconComponent size={28} style={{ color: borderColor }} />
        <p className="text-2xl md:text-3xl font-bold" style={{ color: borderColor }}>
          {title}
        </p>
      </div>
      <p className="text-white">{explanation}</p>
    </div>
  );
}
