'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  MessageCircle,
  Lightbulb,
  Users,
  Coffee,
  ArrowLeft,
  Target,
  Zap,
  TrendingUp,
  Smile,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import { GAMES, COLORS, type GameId } from '../data/gameConfig';
import { TIPS_BY_GAME } from '../data/tips';
import { GROUP_MOMENTS_BY_GAME } from '../data/groupMoments';

const GAME_ICONS = {
  knockout: Target,
  tellorask: Zap,
  levelup: TrendingUp,
  madlibs: Smile,
  makeover: Wrench,
} as const;

interface FacilitatorDashboardProps {
  gameId: GameId;
  onBack: () => void;
  onSlangBreak: () => void;
}

export function FacilitatorDashboard({ gameId, onBack, onSlangBreak }: FacilitatorDashboardProps) {
  const game = GAMES.find((g) => g.id === gameId)!;
  const colorConfig = COLORS[game.color];
  const IconComponent = GAME_ICONS[gameId];
  const tips = TIPS_BY_GAME[gameId];
  const groupMoments = GROUP_MOMENTS_BY_GAME[gameId];

  // Room timer state
  const [timerMinutes, setTimerMinutes] = useState(game.duration);
  const [timerSeconds, setTimerSeconds] = useState(game.duration * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Rotating tip state
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Pause overlay state
  const [isPaused, setIsPaused] = useState(false);

  // Group moment state
  const [showGroupMoment, setShowGroupMoment] = useState(false);
  const [currentGroupMomentIndex, setCurrentGroupMomentIndex] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  // Rotate tips every 20 seconds when running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [isRunning, tips.length]);

  const adjustTimer = useCallback((delta: number) => {
    setTimerMinutes((prev) => Math.max(1, prev + delta));
    setTimerSeconds((prev) => Math.max(60, prev + delta * 60));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerSeconds(timerMinutes * 60);
    setIsRunning(false);
  }, [timerMinutes]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
    setIsRunning(false);
  }, []);

  const triggerGroupMoment = useCallback(() => {
    setShowGroupMoment(true);
    setIsRunning(false);
  }, []);

  const dismissGroupMoment = useCallback(() => {
    setShowGroupMoment(false);
    setCurrentGroupMomentIndex((prev) => (prev + 1) % groupMoments.length);
  }, [groupMoments.length]);

  // Format timer display
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const timerDisplay = `${mins}:${secs.toString().padStart(2, '0')}`;

  // Timer color based on percentage
  const percentage = (timerSeconds / (timerMinutes * 60)) * 100;
  const timerColor = percentage > 50 ? '#27AE60' : percentage > 20 ? '#F1C40F' : '#E74C3C';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
        color: '#ffffff',
      }}
    >
      {/* Pause Overlay */}
      {isPaused && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(10, 22, 40, 0.95)' }}
          onClick={togglePause}
        >
          <Pause size={80} className="text-white/50 mb-6" />
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">PAUSED</h2>
          <p className="text-xl text-gray-400">Click anywhere to resume</p>
        </div>
      )}

      {/* Group Moment Overlay */}
      {showGroupMoment && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8"
          style={{ backgroundColor: 'rgba(10, 22, 40, 0.95)' }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-scale-in"
            style={{ backgroundColor: `${colorConfig.accent}20` }}
          >
            <Users size={48} style={{ color: colorConfig.accent }} />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 text-center">
            Group Moment
          </h2>
          <div
            className="max-w-2xl rounded-2xl p-8 mb-8 animate-reveal-bounce"
            style={{ backgroundColor: colorConfig.bg, border: `2px solid ${colorConfig.border}` }}
          >
            <p className="text-2xl md:text-3xl text-white text-center leading-relaxed">
              {groupMoments[currentGroupMomentIndex]}
            </p>
          </div>
          <button
            onClick={dismissGroupMoment}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
            style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
          >
            Continue
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${colorConfig.border}` }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
          style={{ color: '#8899aa' }}
        >
          <ArrowLeft size={20} />
          Games
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colorConfig.accent}20` }}
          >
            <IconComponent size={20} style={{ color: colorConfig.accent }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: colorConfig.accent }}>
              {game.title}
            </h1>
            <p className="text-xs" style={{ color: '#8899aa' }}>
              FACILITATOR MODE
            </p>
          </div>
        </div>

        <button
          onClick={onSlangBreak}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'rgba(155, 89, 182, 0.15)',
            border: '1px solid rgba(155, 89, 182, 0.4)',
            color: '#9B59B6',
          }}
        >
          <Coffee size={18} />
          Slang Break
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Room Timer */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#8899aa' }}>
            Room Timer
          </p>
          <div
            className="font-mono font-bold text-8xl md:text-9xl transition-colors duration-300"
            style={{
              color: timerColor,
              textShadow: `0 0 40px ${timerColor}40`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {timerDisplay}
          </div>

          {/* Timer controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => adjustTimer(-1)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-lg font-semibold"
            >
              -1
            </button>
            <button
              onClick={toggleTimer}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{
                backgroundColor: isRunning ? '#E74C3C' : '#27AE60',
                color: '#ffffff',
              }}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => adjustTimer(1)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-lg font-semibold"
            >
              +1
            </button>
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Rotating Tip */}
        <div
          className="w-full max-w-2xl rounded-xl p-6 mb-8 transition-all duration-500"
          style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={20} style={{ color: colorConfig.accent }} />
            <p className="text-sm uppercase tracking-wider font-semibold" style={{ color: colorConfig.accent }}>
              Facilitator Tip
            </p>
          </div>
          <p className="text-xl md:text-2xl text-white leading-relaxed animate-fade-in" key={currentTipIndex}>
            {tips[currentTipIndex]}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button
            onClick={togglePause}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(231, 76, 60, 0.15)',
              border: '1px solid rgba(231, 76, 60, 0.4)',
              color: '#E74C3C',
            }}
          >
            <Pause size={20} />
            Pause Room
          </button>
          <button
            onClick={triggerGroupMoment}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: `${colorConfig.accent}15`,
              border: `1px solid ${colorConfig.border}`,
              color: colorConfig.accent,
            }}
          >
            <MessageCircle size={20} />
            Group Moment
          </button>
        </div>
      </main>

      {/* Footer tip for changing tips */}
      <footer className="text-center py-4">
        <p className="text-xs" style={{ color: '#8899aa', opacity: 0.5 }}>
          Tips rotate every 20 seconds while timer is running
        </p>
      </footer>
    </div>
  );
}
