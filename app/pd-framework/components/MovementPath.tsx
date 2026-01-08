'use client';

import { ClipboardCheck, Sparkles, Puzzle, Target, ArrowRight } from 'lucide-react';

export default function MovementPath() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            How Schools Move Forward
          </h2>
          <p className="text-center text-lg mb-12" style={{ color: '#1e2749', opacity: 0.7 }}>
            Every school starts somewhere. The goal isn't judgment, it's clarity.
          </p>

          {/* Visual Flow */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm mb-12">
            {/* Movement arrows visualization */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Compliance */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <ClipboardCheck className="text-slate-600" size={28} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1e2749' }}>Compliance</p>
              </div>

              {/* Inspiration */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <Sparkles className="text-blue-600" size={28} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1e2749' }}>Inspiration</p>
              </div>

              {/* Fragmented */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                  <Puzzle className="text-amber-600" size={28} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1e2749' }}>Fragmented</p>
              </div>

              {/* Embedded */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center mb-3 ring-4 ring-emerald-200">
                  <Target className="text-emerald-600" size={28} />
                </div>
                <p className="text-sm font-bold" style={{ color: '#1e2749' }}>Embedded</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>The Goal</p>
              </div>
            </div>

            {/* Arrows showing all paths lead to Embedded */}
            <div className="flex justify-center items-center gap-2 mb-6">
              <ArrowRight className="text-emerald-500" size={20} />
              <span className="text-sm font-medium" style={{ color: '#1e2749', opacity: 0.7 }}>
                All paths can lead to Embedded Practice
              </span>
              <ArrowRight className="text-emerald-500" size={20} />
            </div>

            <p className="text-center text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
              The path from Compliance → Inspiration → Fragmented → Embedded is common, but not the only way forward. Some schools skip stages. Others move in unexpected directions. What matters is intentional progress.
            </p>
          </div>

          {/* Timeline stat */}
          <div className="text-center mb-12">
            <div
              className="inline-block rounded-full px-6 py-3"
              style={{ backgroundColor: '#1e2749' }}
            >
              <p className="text-white font-medium">
                Schools typically see measurable movement within one semester.
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm italic mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
                "We started as Compliance-Focused. Eighteen months later, our teachers describe our PD as 'actually useful.' We're not perfect, but we're moving."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>
                [TESTIMONIAL NEEDED]
              </p>
              <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
                School Administrator
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm italic mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
                "I used to dread PD days. Now I actually look forward to them because I know I'll walk away with something I can use tomorrow."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>
                [TESTIMONIAL NEEDED]
              </p>
              <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
                Classroom Teacher
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
