'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminBoardMemo } from './AdminBoardMemo';
import { BurnoutCheck } from './BurnoutCheck';
import { JoyRestoration } from './JoyRestoration';

type CalcTab = 'admin' | 'burnout' | 'joy';

interface CalculatorSuiteProps {
  defaultTab?: CalcTab;
}

export function CalculatorSuite({ defaultTab = 'admin' }: CalculatorSuiteProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const resolvedDefault: CalcTab =
    tabParam === 'burnout' || tabParam === 'joy' || tabParam === 'admin'
      ? tabParam
      : defaultTab;
  const [activeTab, setActiveTab] = useState<CalcTab>(resolvedDefault);

  const tabs: { id: CalcTab; label: string; sublabel: string }[] = [
    { id: 'admin', label: 'For School Leaders', sublabel: 'Board memo + funding match' },
    { id: 'burnout', label: 'Burnout Check', sublabel: 'For teachers' },
    { id: 'joy', label: 'Joy Restoration', sublabel: 'For teachers' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8 sticky top-0 bg-white z-10">
        <div className="flex gap-8 md:gap-12 overflow-x-auto justify-center md:justify-start max-w-4xl mx-auto px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-5 border-b-[3px] transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#ffba06] text-[#1e2749]'
                  : 'border-transparent text-gray-500 hover:text-[#1e2749]'
              }`}
            >
              <div className="font-semibold text-lg">{tab.label}</div>
              <div className="text-sm text-gray-500 mt-1">{tab.sublabel}</div>
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
