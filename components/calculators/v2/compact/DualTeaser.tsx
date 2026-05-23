'use client';

import Link from 'next/link';
import { Thermometer } from '../visuals/Thermometer';
import { Battery } from '../visuals/Battery';

export function DualTeaser() {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-10 md:p-12 shadow-sm relative">
      <div className="absolute top-0 left-0 w-16 h-1 bg-[#ffba06] rounded-tl-xl" />

      <h3 className="font-serif text-3xl md:text-4xl font-semibold text-[#1e2749] text-center mb-3 leading-tight">
        Where are you today?
      </h3>
      <p className="text-center text-gray-500 text-lg mb-10">
        Two ways in. Same destination: support that actually works.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {/* STRESS CARD */}
        <Link
          href="/calculator?tab=burnout"
          className="flex flex-col items-center text-center p-9 px-6 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg"
          style={{
            background: 'linear-gradient(180deg, #fff5f0 0%, #fce8e6 100%)',
            borderColor: '#fadad1',
          }}
        >
          <div className="flex items-center justify-center h-[150px] mb-5">
            <Thermometer value={7} size="small" />
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2.5">Stress Check</div>
          <h4 className="font-serif text-2xl font-semibold text-[#1e2749] mb-3">Carrying too much?</h4>
          <p className="text-base text-gray-700 leading-relaxed mb-5 max-w-xs">
            See where your stress is and where it could be in 12 months.
          </p>
          <span className="bg-white text-[#1e2749] px-5 py-3 rounded-md border-[1.5px] border-[#1e2749] text-sm font-bold transition-colors hover:bg-[#1e2749] hover:text-white">
            Check in with yourself &rarr;
          </span>
        </Link>

        {/* JOY CARD */}
        <Link
          href="/calculator?tab=joy"
          className="flex flex-col items-center text-center p-9 px-6 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg"
          style={{
            background: 'linear-gradient(180deg, #f3f7ff 0%, #e6efff 100%)',
            borderColor: '#d4ddf5',
          }}
        >
          <div className="flex items-center justify-center h-[150px] mb-5">
            <Battery value={4} size="small" />
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2.5">Joy Check</div>
          <h4 className="font-serif text-2xl font-semibold text-[#1e2749] mb-3">Lost the spark?</h4>
          <p className="text-base text-gray-700 leading-relaxed mb-5 max-w-xs">
            See what reconnecting to purpose looks like with the right support.
          </p>
          <span className="bg-white text-[#1e2749] px-5 py-3 rounded-md border-[1.5px] border-[#1e2749] text-sm font-bold transition-colors hover:bg-[#1e2749] hover:text-white">
            Reclaim your why &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
