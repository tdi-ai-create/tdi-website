import PDQuadrant from './PDQuadrant';

export default function DiagnosticHero() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/hero-workshop.webp)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(30, 39, 73, 0.9)' }}
      />

      {/* Content */}
      <div className="container-default relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            The 4 Types of PD
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-6" style={{ color: '#ffba06' }}>
            A Self-Assessment for School Leaders
          </p>
          <p className="text-base md:text-lg mb-8" style={{ color: '#ffffff', opacity: 0.9 }}>
            Not all professional development is created equal. Research shows that PD structures fall into four distinct quadrants... each with predictable outcomes for teacher practice and student achievement.
          </p>

          {/* 2x2 Quadrant Visual */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xl max-w-xl mx-auto mb-8">
            <PDQuadrant />
          </div>

          <p className="text-sm md:text-base font-medium" style={{ color: '#ffffff', opacity: 0.8 }}>
            Most leaders can identify their position immediately.
          </p>
          <p className="text-lg md:text-xl font-bold mt-2" style={{ color: '#ffffff' }}>
            Take the diagnostic below to confirm.
          </p>
        </div>
      </div>
    </section>
  );
}
