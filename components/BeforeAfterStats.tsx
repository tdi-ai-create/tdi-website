'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItem {
  label: string;
  beforeValue: string;
  afterValue: string;
  beforeNum?: number;
  afterNum?: number;
}

interface BeforeAfterStatsProps {
  stats: StatItem[];
  title?: string;
}

function AnimatedNumber({
  value,
  hasAnimated
}: {
  value: number;
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

  return <>{Math.round(count)}</>;
}

export function BeforeAfterStats({ stats, title }: BeforeAfterStatsProps) {
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

  return (
    <section ref={ref} className="py-12 md:py-16" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container-default">
        {title && (
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8" style={{ color: '#1e2749' }}>
            {title}
          </h3>
        )}
        <div className={`grid grid-cols-1 ${stats.length > 1 ? 'md:grid-cols-2' : ''} gap-6 max-w-3xl mx-auto`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md"
              style={{ borderLeft: '4px solid #ffba06' }}
            >
              <p className="text-sm font-medium mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                {stat.label}
              </p>
              <div className="flex items-center justify-center gap-4">
                {/* Before */}
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: '#1e2749', opacity: 0.5 }}>
                    {stat.beforeNum !== undefined ? (
                      <AnimatedNumber value={stat.beforeNum} hasAnimated={hasAnimated} />
                    ) : (
                      stat.beforeValue
                    )}
                  </p>
                  <p className="text-xs uppercase tracking-wide mt-1" style={{ color: '#1e2749', opacity: 0.5 }}>
                    Before
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="#ffba06"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* After */}
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: '#ffba06' }}>
                    {stat.afterValue}
                  </p>
                  <p className="text-xs uppercase tracking-wide mt-1" style={{ color: '#1e2749', opacity: 0.7 }}>
                    After TDI
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
