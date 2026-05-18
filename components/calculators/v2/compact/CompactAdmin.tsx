'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClassroomClock } from '../visuals/ClassroomClock';

export function CompactAdmin() {
  const [budget, setBudget] = useState(50000);
  const fmt = (n: number) => '$' + n.toLocaleString();

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-9 md:p-10 shadow-sm relative">
      <div className="absolute top-0 left-0 w-16 h-1 bg-[#ffba06] rounded-tl-xl" />

      <div className="grid md:grid-cols-[auto_1fr] gap-9 items-center">
        <div className="flex justify-center">
          <ClassroomClock variant="tdi-only" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-semibold text-[#1e2749] mb-4 leading-tight">
            See what your PD budget could actually do.
          </h3>
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-base font-medium text-gray-700">Annual PD budget</span>
            <span className="font-serif text-xl font-bold text-[#1e2749]">{fmt(budget)}</span>
          </div>
          <input
            type="range"
            min={10000} max={200000} step={5000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#1e2749] mb-2"
          />
          <div className="flex justify-between mb-6 text-xs uppercase tracking-wide text-gray-500 font-semibold">
            <span>$10K</span>
            <span>$200K</span>
          </div>
          <p className="text-sm text-gray-700 mb-6 leading-relaxed">
            Most schools fund this through <strong className="text-[#1e2749]">Title II-A</strong> they already receive.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/calculator?tab=admin&budget=${budget}`}
              className="inline-block bg-[#ffba06] text-[#1e2749] px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:bg-[#e6a505] hover:-translate-y-0.5 transition-all"
            >
              Build your board memo
            </Link>
            <Link
              href="/free-pd-plan"
              className="text-sm text-gray-500 font-medium hover:text-[#1e2749]"
            >
              Or get your free PD plan &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
