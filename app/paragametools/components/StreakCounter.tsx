'use client';

import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StreakCounterProps {
  count: number;
  color?: string;
}

export function StreakCounter({ count, color = '#FF7847' }: StreakCounterProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count]);

  if (count < 2) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-transform ${
        animate ? 'animate-streak-pop' : ''
      }`}
      style={{
        backgroundColor: `${color}20`,
        border: `2px solid ${color}`,
      }}
    >
      <Flame
        size={24}
        style={{ color }}
        className="animate-pulse"
      />
      <span
        className="font-bold text-lg"
        style={{ color }}
      >
        {count} in a row!
      </span>
    </div>
  );
}
