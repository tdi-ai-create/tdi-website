'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

interface TimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  size?: 'normal' | 'large';
}

export function Timer({
  totalSeconds,
  isRunning,
  onComplete,
  onTick,
  size = 'normal'
}: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  // Reset when totalSeconds changes
  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        const newVal = prev - 1;
        onTick?.(newVal);
        return newVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete, onTick]);

  const percentage = (remaining / totalSeconds) * 100;

  // Color based on percentage
  const getColor = useCallback(() => {
    if (percentage > 50) return '#27AE60'; // green
    if (percentage > 20) return '#F1C40F'; // yellow
    return '#E74C3C'; // red
  }, [percentage]);

  const color = getColor();
  const isPulsing = remaining <= 10 && remaining > 0;
  const isFlashing = remaining === 0;

  // Format time as MM:SS
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const fontSize = size === 'large' ? 'text-6xl md:text-8xl' : 'text-5xl md:text-7xl';
  const barWidth = size === 'large' ? 'max-w-[400px]' : 'max-w-[300px]';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Timer digits */}
      <div
        className={`font-mono font-bold transition-colors duration-300 ${fontSize} ${
          isPulsing ? 'animate-timer-pulse' : ''
        } ${isFlashing ? 'animate-timer-flash' : ''}`}
        style={{
          color,
          textShadow: `0 0 30px ${color}40`,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {timeDisplay}
      </div>

      {/* Progress bar */}
      <div
        className={`w-full ${barWidth} h-2 rounded-full overflow-hidden`}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

// Timer controls component
interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset?: () => void;
  accentColor?: string;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  accentColor = '#27AE60'
}: TimerControlsProps) {
  return (
    <div className="flex gap-3 justify-center">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#27AE60' }}
        >
          <Play size={20} />
          Start Timer
        </button>
      ) : (
        <button
          onClick={onPause}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#E74C3C' }}
        >
          <Pause size={20} />
          Pause
        </button>
      )}
      {onReset && (
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#8899aa' }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

// Room timer for facilitator mode (shows minutes)
interface RoomTimerProps {
  minutes: number;
  onAdjust: (delta: number) => void;
  isRunning: boolean;
  onToggle: () => void;
}

export function RoomTimer({ minutes, onAdjust, isRunning, onToggle }: RoomTimerProps) {
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    setRemaining(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const percentage = (remaining / (minutes * 60)) * 100;
  const getColor = () => {
    if (percentage > 50) return '#27AE60';
    if (percentage > 20) return '#F1C40F';
    return '#E74C3C';
  };

  const color = getColor();
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onAdjust(-1)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        -1
      </button>
      <button
        onClick={onToggle}
        className="font-mono text-2xl md:text-3xl font-bold transition-colors"
        style={{
          color,
          textShadow: `0 0 20px ${color}40`,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {display}
      </button>
      <button
        onClick={() => onAdjust(1)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        +1
      </button>
    </div>
  );
}
