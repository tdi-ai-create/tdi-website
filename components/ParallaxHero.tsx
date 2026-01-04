'use client';

import { useEffect, useRef } from 'react';

export function ParallaxHero() {
  const foregroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (foregroundRef.current) {
        const scrollY = window.scrollY;
        foregroundRef.current.style.transform = `translateY(${scrollY * -0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[600px] lg:h-[650px] overflow-hidden">
      {/* Background Layer - Blurred */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/hero-rae-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right 60%',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(5px)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Foreground Rae Cutout - MUST MATCH background position exactly */}
      <div
        ref={foregroundRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/hero-rae-cutout.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right 60%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Text - Positioned LEFT side */}
      <div className="relative z-10 h-full flex items-center justify-start">
        <div className="ml-8 md:ml-16 lg:ml-20 xl:ml-24">
          <div className="max-w-sm md:max-w-md">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight whitespace-nowrap"
              style={{
                color: '#ffffff',
                textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
              }}
            >
              Teachers Deserve More Than Survival
            </h1>

            <p
              className="text-base md:text-lg font-semibold mb-4"
              style={{
                color: '#ffba06',
                textShadow: '1px 1px 4px rgba(0,0,0,0.7)'
              }}
            >
              Research-Backed. Expert-Designed. Educator-Focused.
            </p>

            <p
              className="text-sm md:text-base mb-2 leading-relaxed"
              style={{
                color: '#ffffff',
                textShadow: '1px 1px 4px rgba(0,0,0,0.7)'
              }}
            >
              You became a teacher to make a difference. Not to drown in lesson plans, sit through pointless PD, and count down to summer. We get it. We've been there.
            </p>

            <p
              className="text-xs md:text-sm mb-6"
              style={{
                color: '#ffffff',
                opacity: 0.85,
                textShadow: '1px 1px 4px rgba(0,0,0,0.7)'
              }}
            >
              Join 87,000+ educators who are done accepting the status quo.
            </p>

            <a
              href="/join"
              className="inline-block px-6 py-3 rounded-lg font-bold text-base transition-all hover:scale-105"
              style={{
                backgroundColor: '#ffba06',
                color: '#1e2749',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
              }}
            >
              Join the Movement
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
