'use client';

import React from 'react';
import {
  Users,
  ClipboardList,
  BookOpen,
  Flag,
  Check,
  Calendar,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

// ===================== TypeScript Interfaces =====================

export interface OverviewTabData {
  // Zone 1 - Partnership Snapshot
  educatorsEnrolled: number;
  educatorsLabel?: string; // e.g., "Teachers" or "Paras" or "Educators"
  deliverablesCompleted: number;
  deliverablesTotal: number;
  hubEngagementPercent: number;
  hubEngagementRaw: string; // e.g., "88 of 111"
  currentPhase: 1 | 2 | 3;
  healthStatus: 'Strong' | 'Building' | 'OnTrack' | 'NeedsAttention';
  healthDetailLine: string; // e.g., "Hub above target | Obs on schedule | No blockers"

  // Zone 2A - Timeline
  doneItems: { label: string; date: string }[];
  inProgressItems: { label: string; context: string }[];
  comingSoonItems: { label: string; targetDate: string }[];

  // Zone 2B - Investment (contractTotal is private - never displayed)
  contractTotal: number; // Used ONLY to calculate perEducator - never rendered
  coursesCompletedTotal: number;

  // Zone 2C - Quick Wins
  quickWinsCount: number; // educators with 1+ course completed
  quickWinsLine1?: string; // Custom line 1 text
  quickWinsLine2?: string; // Custom line 2 text

  // Zone 3 - Actions
  nextToUnlock: {
    label: string;
    owner: 'partner' | 'tdi' | 'both';
    deadline?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }[];
  alreadyInMotion: {
    label: string;
    date: string;
    status: 'complete' | 'upcoming';
  }[];
}

interface OverviewTabProps {
  data: OverviewTabData;
  onNavigateToTab?: (tabId: string, sectionId?: string) => void;
}

// ===================== Helper Components =====================

const healthStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  Strong: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  Building: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  OnTrack: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  NeedsAttention: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

const ownerColors: Record<string, { bg: string; text: string; dot: string }> = {
  partner: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  tdi: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  both: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

// ===================== Main Component =====================

export function OverviewTab({ data, onNavigateToTab }: OverviewTabProps) {
  const perEducator = data.educatorsEnrolled > 0
    ? Math.round(data.contractTotal / data.educatorsEnrolled)
    : 0;

  const phasePercent = data.currentPhase === 1 ? 33 : data.currentPhase === 2 ? 66 : 100;
  const phaseName = data.currentPhase === 1 ? 'IGNITE' : data.currentPhase === 2 ? 'ACCELERATE' : 'SUSTAIN';

  const healthColors = healthStatusColors[data.healthStatus] || healthStatusColors.OnTrack;

  return (
    <div className="space-y-6">
      {/* ===================== ZONE 1 - Partnership Snapshot ===================== */}
      <div className="space-y-4">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Educators Card */}
          <button
            onClick={() => onNavigateToTab?.('team')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md hover:border-[#4ecdc4] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#38618C]" />
              <span className="text-xs text-gray-500 uppercase">{data.educatorsLabel || 'Educators'}</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#1e2749]">{data.educatorsEnrolled}</div>
            <div className="text-xs text-[#38618C] font-medium mt-1">enrolled in partnership</div>
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-[#4ecdc4] flex items-center gap-1">
                View team <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Deliverables Card */}
          <button
            onClick={() => onNavigateToTab?.('our-partnership')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md hover:border-[#4ecdc4] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-[#38618C]" />
              <span className="text-xs text-gray-500 uppercase">Deliverables</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#1e2749]">
              {data.deliverablesCompleted}
              <span className="text-lg font-normal text-gray-400">/{data.deliverablesTotal}</span>
            </div>
            <div className="text-xs text-[#38618C] font-medium mt-1">completed vs. contracted</div>
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-[#4ecdc4] flex items-center gap-1">
                View details <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Hub Engagement Card */}
          <button
            onClick={() => onNavigateToTab?.('our-partnership', 'progress-snapshot')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md hover:border-[#4ecdc4] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#38618C]" />
              <span className="text-xs text-gray-500 uppercase">Hub Engagement</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#1e2749]">{data.hubEngagementPercent}%</div>
            <div className="text-xs text-[#38618C] font-medium mt-1">staff logged in</div>
            <div className="text-xs text-gray-400 mt-0.5">{data.hubEngagementRaw}</div>
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-[#4ecdc4] flex items-center gap-1">
                View progress <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Current Phase Card */}
          <button
            onClick={() => onNavigateToTab?.('our-partnership', 'partnership-journey')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md hover:border-[#4ecdc4] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-4 h-4 text-[#38618C]" />
              <span className="text-xs text-gray-500 uppercase">Current Phase</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#1e2749]">{phaseName}</div>
            <div className="text-xs text-[#38618C] font-medium mt-1">Phase {data.currentPhase} of 3</div>
            {/* Mini progress bar */}
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F5C542] rounded-full transition-all"
                style={{ width: `${phasePercent}%` }}
              />
            </div>
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-[#4ecdc4] flex items-center gap-1">
                View journey <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        </div>

        {/* Partnership Health Indicator */}
        <div className={`rounded-xl border p-4 ${healthColors.bg} ${healthColors.border}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className={`font-semibold ${healthColors.text}`}>
              Partnership Momentum: {data.healthStatus}
            </span>
            <span className="hidden sm:inline text-gray-400">|</span>
            <span className="text-sm text-gray-600">{data.healthDetailLine}</span>
          </div>
        </div>
      </div>

      {/* ===================== ZONE 2 - The Story ===================== */}

      {/* Zone 2A - Done / In Progress / Coming Soon Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Done Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Done</h3>
            </div>
            <ul className="space-y-3">
              {data.doneItems.map((item, idx) => (
                <li key={idx} className="text-sm">
                  <div className="text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.date}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* In Progress Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">In Progress</h3>
            </div>
            <ul className="space-y-3">
              {data.inProgressItems.map((item, idx) => (
                <li key={idx} className="text-sm">
                  <div className="text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.context}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Coming Soon Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Coming Soon</h3>
            </div>
            <ul className="space-y-3">
              {data.comingSoonItems.map((item, idx) => (
                <li key={idx} className="text-sm">
                  <div className="text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.targetDate}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Zone 2B - Your Investment, By The Numbers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-[#1e2749] mb-1">Your Investment, By The Numbers</h3>
        <p className="text-sm text-gray-500 mb-4">What your partnership delivers, in dollars and impact.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#1e2749]">${perEducator.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">per educator</div>
            <div className="text-xs text-gray-400 mt-0.5">less than a one-day sub</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#1e2749]">6.5x</div>
            <div className="text-sm text-gray-600 mt-1">implementation return</div>
            <div className="text-xs text-gray-400 mt-0.5">vs. 10% industry average</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#1e2749]">$20K+</div>
            <div className="text-sm text-gray-600 mt-1">protected per retained</div>
            <div className="text-xs text-gray-400 mt-0.5">educator vs. replacement cost</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#1e2749]">{data.coursesCompletedTotal}</div>
            <div className="text-sm text-gray-600 mt-1">courses completed</div>
            <div className="text-xs text-gray-400 mt-0.5">this partnership to date</div>
          </div>
        </div>
      </div>

      {/* Zone 2C - Quick Wins Counter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-4xl mb-3">
          <Sparkles className="w-10 h-10 mx-auto text-[#F5C542]" />
        </div>
        <p className="text-lg md:text-xl text-[#1e2749] font-medium">
          {data.quickWinsLine1 || `${data.quickWinsCount} educators have completed at least one course this partnership.`}
        </p>
        <p className="text-gray-600 mt-2">
          {data.quickWinsLine2 || `That's ${data.coursesCompletedTotal} strategies available to students in your classrooms right now.`}
        </p>
      </div>

      {/* ===================== ZONE 3 - Actions ===================== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Next to Unlock */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#1e2749] mb-4">Next to Unlock</h3>
          <div className="space-y-4">
            {data.nextToUnlock.slice(0, 5).map((item, idx) => {
              const colors = ownerColors[item.owner];
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 ${colors.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${colors.dot}`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      {item.deadline && (
                        <div className="text-xs text-gray-500 mt-1">Due: {item.deadline}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.text} bg-white/50`}>
                          {item.owner === 'partner' ? 'Partner action needed' : item.owner === 'tdi' ? 'TDI handling' : 'Joint action'}
                        </span>
                        {item.ctaUrl && item.ctaLabel && (
                          <a
                            href={item.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#1A6B6B] hover:underline flex items-center gap-1"
                          >
                            {item.ctaLabel} <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Already In Motion */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#1e2749] mb-4">Already In Motion</h3>
          <div className="space-y-3">
            {data.alreadyInMotion.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                {item.status === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.status === 'complete'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.status === 'complete' ? 'Complete' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
