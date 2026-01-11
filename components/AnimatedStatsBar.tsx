'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  subtext?: string;
}

interface AnimatedStatsBarProps {
  stats: StatItem[];
  backgroundColor?: string;
}

function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
  hasAnimated
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  hasAnimated: boolean;
}) {
  const [count, setCount] = useState(0);
  const duration = 800;

  useEffect(() => {
    if (!hasAnimated) {
      setCount(0);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = value * easeOut;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated, value]);

  const displayValue = value >= 1000
    ? Math.round(count).toLocaleString()
    : Math.round(count);

  return (
    <>
      {prefix}{displayValue}{suffix}
    </>
  );
}

export function AnimatedStatsBar({ stats, backgroundColor = '#1e2749' }: AnimatedStatsBarProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const gridCols = stats.length === 4
    ? 'grid-cols-2 md:grid-cols-4'
    : stats.length === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2';

  return (
    <section ref={ref} className="py-8" style={{ backgroundColor }}>
      <div className="container-default">
        <div className={`grid ${gridCols} gap-6 text-center`}>
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-3xl md:text-4xl font-bold" style={{ color: '#ffffff' }}>
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  hasAnimated={hasAnimated}
                />
              </p>
              <p className="text-sm md:text-base font-medium" style={{ color: '#ffffff', opacity: 0.9 }}>
                {stat.label}
              </p>
              {stat.subtext && (
                <p className="text-xs mt-1" style={{ color: '#ffba06' }}>
                  {stat.subtext}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
