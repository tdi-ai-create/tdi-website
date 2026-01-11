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
          <div className="max-w-md md:max-w-lg">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              style={{ color: '#ffffff' }}
            >
              You're the<br className="md:hidden" /> Leader Who<br className="md:hidden" /> Notices.
            </h1>

            <p
              className="text-base md:text-lg font-semibold mb-4"
              style={{ color: '#ffba06' }}
            >
              Research-Backed. Expert-Designed. Educator-Focused. Admin-Approved.
            </p>

            <p
              className="text-sm md:text-base mb-2 leading-relaxed"
              style={{ color: '#ffffff', opacity: 0.9 }}
            >
              Now let's do something about it. TDI helps you support your teachers in ways that actually stick, so they stay, grow, and your students feel the difference.
            </p>

            <p
              className="text-xs md:text-sm mb-6 font-bold"
              style={{ color: '#ffffff', opacity: 0.8 }}
            >
              Join 87,000+ educators who are done accepting the status quo.
            </p>

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
                Schedule a Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
