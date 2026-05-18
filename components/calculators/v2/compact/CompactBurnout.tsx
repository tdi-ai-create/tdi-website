'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Thermometer } from '../visuals/Thermometer';

const stressMap: Record<number, { color: string }> = {
  1: { color: '#80a4ed' }, 2: { color: '#80a4ed' }, 3: { color: '#80a4ed' },
  4: { color: '#ffba06' }, 5: { color: '#ffba06' }, 6: { color: '#ff9438' },
  7: { color: '#F96767' }, 8: { color: '#c2410c' }, 9: { color: '#9a3209' }, 10: { color: '#7c2d12' },
};

export function CompactBurnout() {
  const [stress, setStress] = useState(5);
  const c = stressMap[stress];

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-9 md:p-10 shadow-sm relative">
      <div className="absolute top-0 left-0 w-16 h-1 bg-[#ffba06] rounded-tl-xl" />

      <div className="grid md:grid-cols-[auto_1fr] gap-9 items-center">
        <div className="flex justify-center">
          <Thermometer value={stress} size="small" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-semibold text-[#1e2749] mb-4 leading-tight">
            Where&apos;s your stress today, 1 to 10?
          </h3>
          <div className="flex items-baseline gap-1.5 mb-5">
            <span
              className="font-serif text-4xl font-bold leading-none transition-colors"
              style={{ color: c.color }}
            >
              {stress}
            </span>
            <span className="text-base text-gray-500 font-medium">/10</span>
          </div>
          <input
            type="range"
            min={1} max={10} step={1}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer mb-2"
            style={{ accentColor: c.color }}
          />
          <div className="flex justify-between mb-6 text-xs uppercase tracking-wide text-gray-500 font-semibold">
            <span>Steady</span>
            <span>In crisis</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/calculator?tab=burnout&stress=${stress}`}
              className="inline-block bg-[#ffba06] text-[#1e2749] px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:bg-[#e6a505] hover:-translate-y-0.5 transition-all"
            >
              Join the Hub
            </Link>
            <Link
              href={`/calculator?tab=burnout&stress=${stress}`}
              className="text-sm text-gray-500 font-medium hover:text-[#1e2749]"
            >
              Or check your stress in depth &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
