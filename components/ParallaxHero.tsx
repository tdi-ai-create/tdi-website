'use client';

import { useEffect, useRef } from 'react';

export function ParallaxHero() {
  const foregroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (foregroundRef.current) {
        const scrollY = window.scrollY;
        foregroundRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden">
      {/* Background Layer - Full image, blurred, NO color overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/hero-rae-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(6px) brightness(0.9)',
          transform: 'scale(1.08)',
        }}
      />

      {/* Subtle dark gradient on LEFT only - for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 30%, transparent 50%)'
        }}
      />

      {/* Foreground Rae Cutout - Parallax layer */}
      <div
        ref={foregroundRef}
        className="absolute bottom-0 right-0 w-[280px] md:w-[400px] lg:w-[500px] h-[400px] md:h-[550px] lg:h-[620px] pointer-events-none"
        style={{
          backgroundImage: "url('/images/hero-rae-cutout.png')",
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Text Content - FAR LEFT */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-default">
          <div className="max-w-sm md:max-w-md lg:max-w-lg">
            {/* Main Headline */}
            <h1
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight"
              style={{
                color: '#ffffff',
                textShadow: '2px 2px 8px rgba(0,0,0,0.6)'
              }}
            >
              Teachers Deserve More Than Survival
            </h1>

            {/* Tagline */}
            <p
              className="text-sm md:text-base lg:text-lg font-semibold mb-4"
              style={{
                color: '#ffba06',
                textShadow: '1px 1px 4px rgba(0,0,0,0.6)'
              }}
            >
              Research-Backed. Expert-Designed. Educator-Focused.
            </p>

            {/* Description */}
            <p
              className="text-sm md:text-base mb-2 leading-relaxed"
              style={{
                color: '#ffffff',
                opacity: 0.95,
                textShadow: '1px 1px 4px rgba(0,0,0,0.6)'
              }}
            >
              You became a teacher to make a difference. Not to drown in lesson plans, sit through pointless PD, and count down to summer. We get it. We've been there.
            </p>

            {/* Social Proof */}
            <p
              className="text-xs md:text-sm mb-6"
              style={{
                color: '#ffffff',
                opacity: 0.8,
                textShadow: '1px 1px 4px rgba(0,0,0,0.6)'
              }}
            >
              Join 87,000+ educators who are done accepting the status quo.
            </p>

            {/* CTA Button */}
            <a
              href="/join"
              className="inline-block px-5 md:px-7 py-3 rounded-lg font-bold text-sm md:text-base transition-all hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: '#ffba06',
                color: '#1e2749',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
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
