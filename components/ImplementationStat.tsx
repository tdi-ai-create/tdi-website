'use client';

import { useEffect, useRef, useState } from 'react';

interface ImplementationStatProps {
  value: number;
  suffix?: string;
  label: string;
  subtext: string;
}

export function ImplementationStat({ value, suffix = '%', label, subtext }: ImplementationStatProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const duration = 800;

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

  return (
    <section ref={ref} className="py-8 md:py-10" style={{ backgroundColor: '#1e2749' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>
            {Math.round(count)}{suffix}
          </p>
          <p className="text-lg md:text-xl font-medium mb-2" style={{ color: '#ffffff' }}>
            {label}
          </p>
          <p className="text-sm" style={{ color: '#ffba06' }}>
            {subtext}
          </p>
        </div>
      </div>
    </section>
  );
}
