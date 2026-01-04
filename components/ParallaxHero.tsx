'use client';

import { useEffect, useRef } from 'react';

export function ParallaxHero() {
  const foregroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (foregroundRef.current) {
        const scrollY = window.scrollY;
        // Cutout moves slower than scroll = appears to float above content
        foregroundRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden">
      {/* Background Layer - Full image, blurred, shows full scene */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/hero-rae-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top', // Show more of the top/face area
          backgroundRepeat: 'no-repeat',
          filter: 'blur(4px) brightness(0.8)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Dark Overlay - Gradient darker on left for text */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(30, 39, 73, 0.75) 0%, rgba(30, 39, 73, 0.5) 40%, rgba(30, 39, 73, 0.3) 70%, rgba(30, 39, 73, 0.4) 100%)'
        }}
      />

      {/* Foreground Rae Cutout - Parallax layer (requires cutout PNG) */}
      {/* This layer will move slower on scroll, creating 3D depth */}
      <div
        ref={foregroundRef}
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          backgroundImage: "url('/images/hero-rae-cutout.png')", // Transparent PNG cutout
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Text Content - LEFT side */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-default">
          <div className="max-w-lg lg:max-w-xl">
            {/* Main Headline */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              style={{
                color: '#ffffff',
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
              }}
            >
              Teachers Deserve More Than Survival
            </h1>

            {/* Tagline */}
            <p
              className="text-base md:text-lg lg:text-xl font-semibold mb-4"
              style={{
                color: '#ffba06',
                textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
              }}
            >
              Research-Backed. Expert-Designed. Educator-Focused.
            </p>

            {/* Description */}
            <p
              className="text-sm md:text-base lg:text-lg mb-2 leading-relaxed"
              style={{
                color: '#ffffff',
                opacity: 0.95,
                textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
              }}
            >
              You became a teacher to make a difference. Not to drown in lesson plans, sit through pointless PD, and count down to summer. We get it. We've been there.
            </p>

            {/* Social Proof */}
            <p
              className="text-sm mb-6"
              style={{
                color: '#ffffff',
                opacity: 0.8,
                textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
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
