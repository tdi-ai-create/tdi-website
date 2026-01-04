'use client';

export function ParallaxHero() {
  return (
    <section className="relative h-[600px] lg:h-[650px] overflow-hidden">
      {/* Background Image - No blur, just the photo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/hero-rae-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right 25%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Navy Gradient Overlay - Left side for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(30, 39, 73, 0.9) 0%, rgba(30, 39, 73, 0.7) 35%, rgba(30, 39, 73, 0.3) 55%, transparent 70%)'
        }}
      />

      {/* Text Content - Left side */}
      <div className="relative z-10 h-full flex items-center justify-start">
        <div className="ml-8 md:ml-16 lg:ml-20 xl:ml-24">
          <div className="max-w-sm md:max-w-md">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              style={{ color: '#ffffff' }}
            >
              Teachers Deserve More Than Survival
            </h1>

            <p
              className="text-base md:text-lg font-semibold mb-4"
              style={{ color: '#ffba06' }}
            >
              Research-Backed. Expert-Designed. Educator-Focused.
            </p>

            <p
              className="text-sm md:text-base mb-2 leading-relaxed"
              style={{ color: '#ffffff', opacity: 0.9 }}
            >
              You became a teacher to make a difference. Not to drown in lesson plans, sit through pointless PD, and count down to summer. We get it. We've been there.
            </p>

            <p
              className="text-xs md:text-sm mb-6"
              style={{ color: '#ffffff', opacity: 0.8 }}
            >
              Join 87,000+ educators who are done accepting the status quo.
            </p>

            <a
              href="/join"
              className="inline-block px-6 py-3 rounded-lg font-bold text-base transition-all hover:scale-105"
              style={{
                backgroundColor: '#ffba06',
                color: '#1e2749',
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
