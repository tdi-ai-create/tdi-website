import PDQuadrant from './PDQuadrant';

export default function DiagnosticHero() {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center py-16 md:py-24">

      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/hero-schools.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 39, 73, 0.92) 0%, rgba(27, 73, 101, 0.88) 50%, rgba(30, 39, 73, 0.85) 100%)',
        }}
      />

      {/* Content */}
      <div className="container-default relative z-20">
        <div className="max-w-3xl mx-auto text-center">

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The 4 Types of PD
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-6">
            A Self-Assessment for School and District Leaders
          </p>

          {/* Intro Text */}
          <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Is your current PD structure producing the outcomes you expect?
            This diagnostic helps you see where your PD sits — and what that typically predicts for growth, retention, and culture.
          </p>

          {/* The Quadrant Visual */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-2xl">
            <PDQuadrant interactive={true} />
          </div>

          {/* Scroll prompt */}
          <p className="text-white/60 text-sm mt-8 animate-pulse">
            ↓ Take the diagnostic below to confirm your position
          </p>

        </div>
      </div>
    </section>
  );
}
