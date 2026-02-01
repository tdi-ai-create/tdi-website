'use client';

import { useEffect, useState } from 'react';

interface ConfettiBurstProps {
  colors?: string[];
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotateEnd: number;
  drift: number;
  isRect: boolean;
}

export function ConfettiBurst({
  colors = ['#FFD700', '#FFFFFF', '#FF7847'],
  particleCount = 60,
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Generate particles on mount
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.5,
      rotateEnd: 360 + Math.random() * 720,
      drift: -100 + Math.random() * 200,
      isRect: Math.random() > 0.5,
    }));
    setParticles(newParticles);

    // Cleanup after animations complete
    const maxDuration = Math.max(...newParticles.map(p => p.duration + p.delay));
    const timer = setTimeout(() => {
      setIsActive(false);
    }, maxDuration * 1000 + 100);

    return () => clearTimeout(timer);
  }, [colors, particleCount]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-50"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: '-20px',
            width: particle.isRect ? particle.size * 1.5 : particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.isRect ? '2px' : '50%',
            animation: `confettiFall ${particle.duration}s ease-out ${particle.delay}s forwards`,
            ['--rotate-end' as string]: `${particle.rotateEnd}deg`,
            ['--drift' as string]: `${particle.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
