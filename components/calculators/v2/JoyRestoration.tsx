'use client';

import { useState } from 'react';
import { Battery } from './visuals';

const joyMap: Record<number, { color: string; light: string; label: string }> = {
  1:  { color: '#57534e', light: '#a8a29e', label: 'Just clocking in' },
  2:  { color: '#78716c', light: '#a8a29e', label: 'Disconnected' },
  3:  { color: '#a16207', light: '#d97706', label: 'Going through the motions' },
  4:  { color: '#d97706', light: '#fbbf24', label: 'Some bright spots' },
  5:  { color: '#ffba06', light: '#ffd54a', label: 'Some good days' },
  6:  { color: '#ca8a04', light: '#facc15', label: 'Reconnecting' },
  7:  { color: '#14a098', light: '#5eb5b8', label: 'Finding the why again' },
  8:  { color: '#0d7377', light: '#14a098', label: 'In it for the right reasons' },
  9:  { color: '#0d7377', light: '#14a098', label: 'Alive in the work' },
  10: { color: '#0a5d61', light: '#14a098', label: 'This is what I came for' },
};

const joyInsights = {
  low: { text: 'When teachers reclaim 4+ hours per week, they report 2x more meaningful student moments and a measurable return of purpose within one semester.', src: 'TDI Partner Data, 2025' },
  mid: { text: "The shift from surviving to thriving isn't about working less. It's about working on the right things with the right support.", src: 'Rae Hughart, Teachers Deserve It' },
  high: { text: 'Teachers operating from purpose are the most retention-resistant educators in the building, and the ones whose students remember them for decades.', src: 'Education Week, 2024' },
};

export function JoyRestoration() {
  const [joy, setJoy] = useState(4);

  const c = joyMap[joy];
  const future3 = Math.min(10, Math.round(joy + (10 - joy) * 0.3));
  const future6 = Math.min(10, Math.round(joy + (10 - joy) * 0.55));
  const future12 = Math.min(10, Math.round(joy + (10 - joy) * 0.75));
  const tier = joy <= 4 ? 'low' : joy <= 7 ? 'mid' : 'high';
  const insight = joyInsights[tier];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0d7377] to-[#ffba06] text-white rounded-xl p-10 md:p-12 mb-8 relative overflow-hidden">
        <div className="text-xs uppercase tracking-widest text-white/85 font-semibold mb-3">For Teachers</div>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight mb-3">
          The joy isn&apos;t gone. It&apos;s buried under systems that don&apos;t support you.
        </h2>
        <p className="text-base md:text-lg text-white/95 leading-relaxed">
          One question. A trajectory. A reminder of why you started, and what it looks like to come back to it.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 md:p-10 relative">
        <div className="absolute top-0 left-0 w-16 h-1 bg-[#ffba06] rounded-tl-xl" />

        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-[#1e2749] text-center mb-8 leading-tight">
          How connected do you feel to your purpose as a teacher right now?
        </h3>

        {/* Battery + number + slider */}
        <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center mb-8">
          <div className="flex justify-center">
            <Battery value={joy} size="medium" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span
                className="font-serif text-6xl md:text-7xl font-bold leading-none transition-colors"
                style={{ color: c.color }}
              >
                {joy}
              </span>
              <span className="text-xl text-gray-500 font-medium">/10</span>
            </div>
            <div className="font-serif text-xl italic mb-7" style={{ color: c.color }}>{c.label}</div>

            <input
              type="range"
              min={1} max={10} step={1}
              value={joy}
              onChange={(e) => setJoy(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: c.color }}
            />
            <div className="flex justify-between mt-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <span>Disconnected</span>
              <span>Fully alive in it</span>
            </div>
          </div>
        </div>

        <div
          className="border-l-4 p-5 mb-7 rounded"
          style={{ borderColor: c.color, background: `${c.color}10` }}
        >
          <p className="font-serif text-base italic text-gray-900 leading-relaxed mb-2">
            &ldquo;{insight.text}&rdquo;
          </p>
          <p className="text-sm text-gray-500">&mdash; {insight.src}</p>
        </div>

        <div className="border-t border-gray-200 pt-7 mb-7">
          <h4 className="font-serif text-xl font-semibold text-[#1e2749] text-center mb-5">
            Your joy trajectory with the right support
          </h4>
          <div className="grid grid-cols-4 gap-3">
            <TimelineStop when="Today" value={joy} color={c.color} current />
            <TimelineStop when="3 mo" value={future3} color="#0d7377" />
            <TimelineStop when="6 mo" value={future6} color="#0d7377" />
            <TimelineStop when="12 mo" value={future12} color="#0d7377" />
          </div>
        </div>

        {/* Movement CTA */}
        <div className="bg-gradient-to-br from-[#0d7377] to-[#0a5d61] rounded-lg p-7 text-center text-white">
          <h4 className="font-serif text-xl font-semibold mb-2">You don&apos;t have to do this alone.</h4>
          <p className="text-base text-white/90 mb-5 leading-relaxed">
            Join 100,000+ educators getting weekly strategies that actually work. Free, no spam.
          </p>
          <a
            href="https://raehughart.substack.com"
            target="_blank"
            rel="noopener"
            className="inline-block px-8 py-4 bg-[#ffba06] text-[#1e2749] font-semibold rounded-lg hover:bg-[#e6a505] transition-colors"
          >
            Join the Movement
          </a>
        </div>
      </div>
    </div>
  );
}

function TimelineStop({ when, value, color, current }: { when: string; value: number; color: string; current?: boolean }) {
  return (
    <div
      className={`text-center p-5 rounded-lg border ${current ? 'border-2' : 'border-gray-200'}`}
      style={current ? { borderColor: color, background: `${color}10` } : { background: '#fafafa' }}
    >
      <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2.5">{when}</div>
      <div className="flex justify-center mb-2.5">
        <Battery value={value} size="small" />
      </div>
      <div className="font-serif text-2xl font-bold leading-none" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
