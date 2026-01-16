'use client';

import { useEffect, useRef } from 'react';

export function ParallaxHero() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Parallax: Background moves at 50% of scroll speed
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }

      // Fade + Rise: Content fades out and moves up as you scroll
      if (contentRef.current) {
        const opacity = Math.max(0, 1 - scrollY / 400);
        const translateY = scrollY * 0.3;
        contentRef.current.style.opacity = String(opacity);
        contentRef.current.style.transform = `translateY(-${translateY}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[600px] lg:h-[650px] overflow-hidden pt-32 sm:pt-24 md:pt-20">
      {/* Background Image - Mobile (smaller file) */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: "url('/images/hero-rae-background-mobile.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Background Image - Desktop (parallax layer) */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 will-change-transform hidden md:block"
        style={{
          backgroundImage: "url('/images/hero-rae-background.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'right 15%',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Mobile: Full solid overlay */}
      <div
        className="absolute inset-0 md:hidden"
        style={{ backgroundColor: 'rgba(30, 39, 73, 0.80)' }}
      />

      {/* Desktop: Gradient Overlay */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background: 'linear-gradient(90deg, rgba(30, 39, 73, 0.9) 0%, rgba(30, 39, 73, 0.7) 35%, rgba(30, 39, 73, 0.3) 55%, transparent 70%)'
        }}
      />

      {/* Text Content - Fades and rises on scroll */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex items-center justify-start will-change-transform"
      >
        <div className="ml-8 md:ml-16 lg:ml-20 xl:ml-24">
          <div className="max-w-md md:max-w-xl">
            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-snug"
              style={{ color: '#ffffff' }}
            >
              Research-Backed Professional Development for School Leaders
            </h1>

            {/* Value Props - 3 phrases */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#ffba06' }} />
                <p className="text-sm md:text-base" style={{ color: '#ffffff', opacity: 0.95 }}>
                  Creates a clear path to student and school outcomes admins care about
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#ffba06' }} />
                <p className="text-sm md:text-base" style={{ color: '#ffffff', opacity: 0.95 }}>
                  Proven methods designed by education experts across multiple disciplines
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#ffba06' }} />
                <p className="text-sm md:text-base" style={{ color: '#ffffff', opacity: 0.95 }}>
                  Instantly applicable learning for teachers, support staff, and specialists
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/free-pd-plan"
                className="inline-block px-6 py-3 rounded-lg font-bold text-base transition-all hover-glow"
                style={{
                  backgroundColor: '#ffba06',
                  color: '#1e2749',
                }}
              >
                Get Your Free PD Plan
              </a>
              <a
                href="/contact"
                className="inline-block px-6 py-3 rounded-lg font-bold text-base border-2 transition-all hover-lift"
                style={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                }}
              >
                Start the Conversation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
