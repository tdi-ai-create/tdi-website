'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function Timer({ totalSeconds, isRunning, onComplete, onTick }: TimerProps) {
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

  // Format time as MM:SS
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Timer digits */}
      <div
        className="font-mono text-5xl md:text-7xl font-bold transition-colors duration-300"
        style={{
          color,
          textShadow: `0 0 20px ${color}40`,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {timeDisplay}
      </div>

      {/* Progress bar */}
      <div
        className="w-full max-w-[300px] h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
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
}

export function TimerControls({ isRunning, onStart, onPause, onReset }: TimerControlsProps) {
  return (
    <div className="flex gap-3 justify-center">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#27AE60' }}
        >
          Start Timer
        </button>
      ) : (
        <button
          onClick={onPause}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#E74C3C' }}
        >
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
