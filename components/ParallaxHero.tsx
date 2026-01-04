'use client';

import { useEffect, useRef } from 'react';

export function ParallaxHero() {
  const foregroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (foregroundRef.current) {
        const scrollY = window.scrollY;
        // Parallax: foreground moves slower than scroll
        foregroundRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[520px] md:h-[580px] lg:h-[620px] overflow-hidden">
      {/* Background Layer - Full image, blurred */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-rae-background.png')",
          backgroundPosition: 'center center',
          filter: 'blur(3px) brightness(0.85)',
          transform: 'scale(1.05)', // Prevents blur edge artifacts
        }}
      />

      {/* Foreground Rae Layer - Sharp, parallax movement */}
      <div
        ref={foregroundRef}
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/images/hero-rae-background.png')",
          backgroundPosition: 'right center', // Rae positioned on RIGHT
        }}
      />

      {/* Gradient Overlay - darker on left for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(30, 39, 73, 0.7) 0%, rgba(30, 39, 73, 0.4) 50%, rgba(30, 39, 73, 0.2) 100%)'
        }}
      />

      {/* Text Content - LEFT aligned */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-default">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Main Headline */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight"
              style={{
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Teachers Deserve More Than Survival
            </h1>

            {/* Tagline */}
            <p
              className="text-base md:text-lg lg:text-xl font-semibold mb-4"
              style={{
                color: '#ffba06',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Research-Backed. Expert-Designed. Educator-Focused.
            </p>

            {/* Description */}
            <p
              className="text-base md:text-lg mb-2 leading-relaxed"
              style={{
                color: '#ffffff',
                opacity: 0.95,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              You became a teacher to make a difference. Not to drown in lesson plans, sit through pointless PD, and count down to summer. We get it. We've been there.
            </p>

            {/* Social Proof */}
            <p
              className="text-sm md:text-base mb-6"
              style={{
                color: '#ffffff',
                opacity: 0.8,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Join 87,000+ educators who are done accepting the status quo.
            </p>

            {/* CTA Button */}
            <a
              href="/join"
              className="inline-block px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: '#ffba06',
                color: '#1e2749',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
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
