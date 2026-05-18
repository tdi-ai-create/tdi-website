'use client';

import { useState } from 'react';
import { AdminBoardMemo } from './AdminBoardMemo';
import { BurnoutCheck } from './BurnoutCheck';
import { JoyRestoration } from './JoyRestoration';

type CalcTab = 'admin' | 'burnout' | 'joy';

interface CalculatorSuiteProps {
  defaultTab?: CalcTab;
}

export function CalculatorSuite({ defaultTab = 'admin' }: CalculatorSuiteProps) {
  const [activeTab, setActiveTab] = useState<CalcTab>(defaultTab);

  const tabs: { id: CalcTab; label: string; sublabel: string }[] = [
    { id: 'admin', label: 'For School Leaders', sublabel: 'Board memo + funding match' },
    { id: 'burnout', label: 'Burnout Check', sublabel: 'For teachers' },
    { id: 'joy', label: 'Joy Restoration', sublabel: 'For teachers' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8 sticky top-0 bg-white z-10">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 md:px-4 py-4 border-b-[3px] transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#ffba06] text-[#1e2749]'
                  : 'border-transparent text-gray-500 hover:text-[#1e2749]'
              }`}
            >
              <div className="font-semibold text-base">{tab.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{tab.sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'admin' && <AdminBoardMemo />}
        {activeTab === 'burnout' && <BurnoutCheck />}
        {activeTab === 'joy' && <JoyRestoration />}
      </div>
    </div>
  );
}
