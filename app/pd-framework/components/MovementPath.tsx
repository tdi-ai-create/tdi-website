'use client';

import { ClipboardCheck, Sparkles, Puzzle, Target, ArrowRight } from 'lucide-react';

export default function MovementPath() {
  return (
    <section className="py-10 md:py-14" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: '#1e2749' }}>
            How Schools Move Forward
          </h2>
          <p className="text-center text-base mb-6" style={{ color: '#1e2749', opacity: 0.7 }}>
            Every school starts somewhere. The goal isn't judgment, it's clarity.
          </p>

          {/* Visual Flow */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm mb-6">
            {/* Movement arrows visualization */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {/* Compliance */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                  <ClipboardCheck className="text-slate-600" size={22} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1e2749' }}>Compliance</p>
              </div>

              {/* Inspiration */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                  <Sparkles className="text-blue-600" size={22} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1e2749' }}>Inspiration</p>
              </div>

              {/* Fragmented */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                  <Puzzle className="text-amber-600" size={22} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1e2749' }}>Fragmented</p>
              </div>

              {/* Embedded */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center mb-2 ring-2 ring-emerald-200">
                  <Target className="text-emerald-600" size={22} />
                </div>
                <p className="text-sm font-bold" style={{ color: '#1e2749' }}>Embedded</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>The Goal</p>
              </div>
            </div>

            {/* Arrows showing all paths lead to Embedded */}
            <div className="flex justify-center items-center gap-2 mb-3">
              <ArrowRight className="text-emerald-500" size={18} />
              <span className="text-sm font-medium" style={{ color: '#1e2749', opacity: 0.7 }}>
                All paths can lead to Embedded Practice
              </span>
              <ArrowRight className="text-emerald-500" size={18} />
            </div>

            <p className="text-center text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
              The path from Compliance → Inspiration → Fragmented → Embedded is common, but not the only way forward. Some schools skip stages. Others move in unexpected directions. What matters is intentional progress.
            </p>
          </div>

          {/* Timeline stat */}
          <div className="text-center mb-6">
            <div
              className="inline-block rounded-full px-5 py-2"
              style={{ backgroundColor: '#1e2749' }}
            >
              <p className="text-white text-sm font-medium">
                Schools typically see measurable movement within one semester.
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.8 }}>
                "We started as Compliance-Focused. Eighteen months later, our teachers describe our PD as 'actually useful.' We're not perfect, but we're moving."
              </p>
              <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
                School Administrator
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.8 }}>
                "I used to dread PD days. Now I actually look forward to them because I know I'll walk away with something I can use tomorrow."
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
