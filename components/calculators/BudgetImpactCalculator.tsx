'use client';

import { useState } from 'react';

export function BudgetImpactCalculator() {
  const [budget, setBudget] = useState(50000);
  const [implementation, setImplementation] = useState(15);

  // Calculate outputs
  const currentCostPerStrategy = Math.round(budget / (implementation / 100 * 20));
  const tdiImplementation = 65;
  const tdiCostPerStrategy = Math.round(budget / (tdiImplementation / 100 * 20));
  const valueMultiplier = (tdiImplementation / implementation).toFixed(1);
  const strategiesNow = Math.round(implementation / 100 * 20);
  const strategiesTDI = Math.round(tdiImplementation / 100 * 20);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Input 1: PD Budget */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          What's your annual PD budget?
        </label>
        <input
          type="range"
          min="10000"
          max="200000"
          step="5000"
          value={budget}
          onChange={(e) => {
            setBudget(parseInt(e.target.value));
            window.dispatchEvent(new CustomEvent('calculator-engaged'));
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${(budget - 10000) / 190000 * 100}%, #e5e7eb ${(budget - 10000) / 190000 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-lg font-bold" style={{ color: '#1e2749' }}>$10k</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold" style={{ color: '#1e2749' }}>{formatCurrency(budget)}</span>
          </div>
          <div className="text-right">
            <span className="block text-lg font-bold" style={{ color: '#1e2749' }}>$200k</span>
          </div>
        </div>
      </div>

      {/* Input 2: Implementation Rate */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          How much of your current PD actually gets used in classrooms?
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={implementation}
          onChange={(e) => {
            setImplementation(parseInt(e.target.value));
            window.dispatchEvent(new CustomEvent('calculator-engaged'));
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${implementation}%, #e5e7eb ${implementation}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-lg font-bold" style={{ color: '#ef4444' }}>0%</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>None of it</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold" style={{ color: '#1e2749' }}>{implementation}%</span>
          </div>
          <div className="text-right">
            <span className="block text-lg font-bold" style={{ color: '#22c55e' }}>100%</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>All of it</span>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#f5f5f5' }}>
        <h4 className="font-bold text-lg mb-4" style={{ color: '#1e2749' }}>
          Where Your PD Dollars Go:
        </h4>

        <div className="space-y-4">
          {/* Current vs TDI Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#1e2749', opacity: 0.5 }}>Now</p>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{strategiesNow}</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>strategies actually used</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#1e2749', opacity: 0.5 }}>With TDI</p>
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{strategiesTDI}</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>strategies actually used</p>
            </div>
          </div>

          {/* Value Statement */}
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#fffbeb' }}>
            <p className="text-3xl font-bold" style={{ color: '#ffba06' }}>{valueMultiplier}x</p>
            <p className="text-sm" style={{ color: '#1e2749' }}>more value from the same budget</p>
          </div>

          {/* Context */}
          <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
            Industry average implementation rate is just 10%. TDI partners see 65% implementation because our PD is built for Monday morning, not "someday."
          </p>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <a
            href="/free-pd-plan"
            className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover-glow"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Get Free PD Plan
          </a>
          <a
            href="/contact"
            className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover-lift border-2"
            style={{ borderColor: '#1e2749', color: '#1e2749' }}
          >
            Schedule a Call
          </a>
        </div>

        {/* Sources */}
        <p className="text-xs text-center mt-4" style={{ color: '#1e2749', opacity: 0.5 }}>
          Sources: TNTP "The Mirage", TDI Partner Data
        </p>
      </div>
    </div>
  );
}
