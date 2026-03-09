'use client';

import React, { useState } from 'react';
import {
  Check,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Sparkles,
  MessageCircle,
  Building,
  Flag,
  Users,
  BookOpen,
  BarChart3,
  Star,
  TrendingUp,
  Award,
  ExternalLink,
  Quote,
  Download,
  Play,
  FileText,
} from 'lucide-react';

// ===================== TypeScript Interfaces =====================

export interface OurPartnershipData {
  goal: {
    statement: string;
    subline?: string; // Optional: principal theme/motto
  };

  observations: {
    days: {
      number: number;
      date: string;
      status: 'complete' | 'scheduled';
      classrooms?: number;
      loveNotes?: number;
      type?: 'Half Day' | 'Full Day';
      aiSummary?: string; // 2-3 sentence TDI-written summary - always visible
      narrative?: string[]; // Full paragraphs - hidden until "View details"
      highlights?: string[]; // Named staff celebrations - positive only
      quote?: { text: string; attribution: string };
      resources?: {
        type: 'download' | 'course';
        title: string;
        description: string;
        url?: string;
        duration?: string;
      }[];
      nextFocus?: string[];
    }[];
  };

  snapshot?: {
    staffTypes: string;
    buildings: string;
    successMetrics: string;
    quickWinGoal: string;
    topPriority: string;
  };

  phases: {
    current: 1 | 2 | 3;
    deliverables: {
      phase: number;
      label: string;
      complete: boolean;
    }[];
  };

  sessions: {
    completed: {
      name: string;
      date: string;
      type: string;
      reportUrl?: string;
    }[];
    upcoming: {
      name: string;
      date?: string;
      type: string;
      schedulingUrl?: string;
      confirmed: boolean;
      isBlock?: boolean; // true for multi-session group cards
      blockDates?: { number: number; date: string }[];
    }[];
  };

  progressSnapshot?: {
    implementationRate: number;
    industryMultiplier: string; // e.g., "1.5x"
    coursesCompleted: number;
    hubLoginPercent: number;
    hubLoginFraction: string; // e.g., "88 of 111"
    selfDirectedCount: number;
  };

  teamPulse?: {
    surveys: {
      date: string;
      responseCount: number;
      responseRate: number;
      confidence: { label: string; score: number }[];
      stabilityPercent: number;
      challenges: { label: string; count: number }[];
      hubActivePercent: number;
      hubPlanningPercent: number;
    }[];
  };

  whatWereLearning?: {
    sessionCount: number;
    practiceReps: number;
    moves: {
      name: string;
      implementationPercent: number;
      rawCount: string;
      usingRegularly: number;
      triedItOut: number;
      readyToTry: number;
    }[];
    confidenceScores: { label: string; percent: number }[];
  };

  champions?: {
    instructionalText: string;
    staff: {
      rank: number;
      name: string;
      loginCount: number;
      lastActive: string;
      recentlyActive: boolean;
      highFiveEmailSubject: string;
      highFiveEmailBody: string;
      highFiveEmailTo: string;
    }[];
    footerStat: string;
  };

  whatsResonating?: {
    courses: {
      name: string;
      hubUrl: string;
      started: number;
      completed: number;
    }[];
    totalCoursesExplored: number;
    totalCompletions: number;
    dataAsOf: string;
  };

  hubBarriers?: {
    responses: { label: string; count: number }[];
    recommendedActions: string[];
  };

  // D41 Hub-only specific
  isHubOnly?: boolean;
  seatActivation?: {
    active: number;
    total: number;
  };
}

interface OurPartnershipTabProps {
  data: OurPartnershipData;
  onNavigateToTab?: (tabId: string, sectionId?: string) => void;
  partnershipType?: 'school' | 'district';
}

// ===================== Helper Components =====================

const CollapsibleSection = ({
  id,
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

// ===================== Main Component =====================

export function OurPartnershipTab({ data, onNavigateToTab, partnershipType = 'school' }: OurPartnershipTabProps) {
  const [expandedObservations, setExpandedObservations] = useState<number[]>([]);
  const [showAllCourses, setShowAllCourses] = useState(false);

  const toggleObservation = (dayNumber: number) => {
    setExpandedObservations(prev =>
      prev.includes(dayNumber)
        ? prev.filter(n => n !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  // Visibility conditions
  const hasCompletedSessions = data.sessions.completed.length > 0;
  const hasHighHubLogin = (data.progressSnapshot?.hubLoginPercent ?? 0) > 50;
  const showProgressSnapshot = hasCompletedSessions && hasHighHubLogin;
  const showTeamPulse = data.teamPulse && data.teamPulse.surveys.length > 0;
  const showWhatWereLearning = data.whatWereLearning && data.whatWereLearning.moves.length > 0;
  const showChampions = data.champions && data.champions.staff.length >= 3;
  const showWhatsResonating = data.whatsResonating && data.whatsResonating.courses.length >= 5;
  const showHubBarriers = data.hubBarriers && data.hubBarriers.responses.length > 0;
  const showSnapshot = !!data.snapshot;

  // D41 Hub-only mode
  if (data.isHubOnly) {
    return (
      <div className="space-y-6">
        {/* Section 1 - Goal */}
        <Section1Goal goal={data.goal} />

        {/* Section 4 - Journey (reduced) */}
        <CollapsibleSection
          id="partnership-journey"
          title="Your Partnership Journey"
          icon={<Flag className="w-5 h-5 text-[#38618C]" />}
          defaultOpen={false}
        >
          <PhaseTimeline phases={data.phases} onNavigateToTab={onNavigateToTab} />
        </CollapsibleSection>

        {/* Seat Activation Status */}
        {data.seatActivation && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-[#38618C]" />
              <h3 className="text-sm font-semibold text-gray-900">Seat Activation</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-[#1e2749]">
                {data.seatActivation.active}/{data.seatActivation.total}
              </div>
              <div className="text-sm text-gray-600">seats active</div>
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4ecdc4] rounded-full"
                style={{ width: `${(data.seatActivation.active / data.seatActivation.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Section 10 - What's Resonating */}
        {showWhatsResonating && (
          <CollapsibleSection
            id="whats-resonating"
            title="What's Resonating"
            icon={<Star className="w-5 h-5 text-[#38618C]" />}
            defaultOpen={false}
          >
            <WhatsResonatingContent data={data.whatsResonating!} showAll={showAllCourses} setShowAll={setShowAllCourses} />
          </CollapsibleSection>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1 - Your Partnership Goal (VISIBLE) */}
      <Section1Goal goal={data.goal} />

      {/* Section 2 - Classroom Observations (HERO - VISIBLE) */}
      <Section2Observations
        observations={data.observations}
        expandedObservations={expandedObservations}
        toggleObservation={toggleObservation}
      />

      {/* Section 3 - School/District Snapshot (COLLAPSED, Conditional) */}
      {showSnapshot && (
        <CollapsibleSection
          id="school-snapshot"
          title={partnershipType === 'district' ? 'District Snapshot' : 'School Snapshot'}
          icon={<Building className="w-5 h-5 text-white" />}
          defaultOpen={false}
        >
          <SnapshotContent snapshot={data.snapshot!} />
        </CollapsibleSection>
      )}

      {/* Section 4 - Your Partnership Journey (COLLAPSED) */}
      <CollapsibleSection
        id="partnership-journey"
        title="Your Partnership Journey"
        icon={<Flag className="w-5 h-5 text-[#38618C]" />}
        defaultOpen={false}
      >
        <PhaseTimeline phases={data.phases} onNavigateToTab={onNavigateToTab} />
      </CollapsibleSection>

      {/* Section 5 - Sessions + Leadership Meetings (COLLAPSED) */}
      <CollapsibleSection
        id="sessions-meetings"
        title="Sessions + Leadership Meetings"
        icon={<Calendar className="w-5 h-5 text-[#38618C]" />}
        defaultOpen={false}
      >
        <SessionsContent sessions={data.sessions} />
      </CollapsibleSection>

      {/* Section 6 - Progress Snapshot (COLLAPSED, Conditional) */}
      {showProgressSnapshot && data.progressSnapshot && (
        <CollapsibleSection
          id="progress-snapshot"
          title="Progress Snapshot"
          icon={<BarChart3 className="w-5 h-5 text-[#38618C]" />}
          defaultOpen={false}
        >
          <ProgressSnapshotContent data={data.progressSnapshot} />
        </CollapsibleSection>
      )}

      {/* Section 7 - Team Pulse (COLLAPSED, Conditional) */}
      {showTeamPulse && (
        <CollapsibleSection
          id="team-pulse"
          title="Team Pulse"
          icon={<Heart className="w-5 h-5 text-[#38618C]" />}
          defaultOpen={false}
        >
          <TeamPulseContent data={data.teamPulse!} />
        </CollapsibleSection>
      )}

      {/* Section 8 - What We're Learning (COLLAPSED, Conditional) */}
      {showWhatWereLearning && (
        <CollapsibleSection
          id="what-were-learning"
          title="What We're Learning"
          icon={<TrendingUp className="w-5 h-5 text-[#38618C]" />}
          defaultOpen={false}
        >
          <WhatWereLearningContent data={data.whatWereLearning!} />
        </CollapsibleSection>
      )}

      {/* Section 9 - Staff Champions (COLLAPSED, Conditional) */}
      {showChampions && (
        <CollapsibleSection
          id="staff-champions"
          title="Staff Champions"
          icon={<Award className="w-5 h-5 text-[#38618C]" />}
          defaultOpen={false}
        >
          <ChampionsContent data={data.champions!} />
        </CollapsibleSection>
      )}

      {/* Section 10 - What's Resonating (COLLAPSED, Conditional) */}
      {showWhatsResonating && (
        <CollapsibleSection
          id="whats-resonating"
          title="What's Resonating"
          icon={<Star className="w-5 h-5 text-[#38618C]" />}
          defaultOpen={false}
        >
          <WhatsResonatingContent data={data.whatsResonating!} showAll={showAllCourses} setShowAll={setShowAllCourses} />
        </CollapsibleSection>
      )}

      {/* Section 11 - Your Team's Top Ask (COLLAPSED, Conditional) */}
      {showHubBarriers && (
        <CollapsibleSection
          id="team-top-ask"
          title="Your Team's Top Ask"
          icon={<MessageCircle className="w-5 h-5 text-[#38618C]" />}
          defaultOpen={false}
        >
          <HubBarriersContent data={data.hubBarriers!} />
        </CollapsibleSection>
      )}
    </div>
  );
}

// ===================== Section Components =====================

// Section 1 - Your Partnership Goal
function Section1Goal({ goal }: { goal: OurPartnershipData['goal'] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex">
        <div className="w-1 bg-[#1B2A4A] flex-shrink-0" />
        <div className="p-6 md:p-8 text-center w-full">
          <p className="text-lg md:text-xl text-[#1e2749] leading-relaxed font-medium">
            &ldquo;{goal.statement}&rdquo;
          </p>
          {goal.subline && (
            <p className="text-sm text-[#1A6B6B] mt-4 font-medium">{goal.subline}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Section 2 - Classroom Observations (HERO)
function Section2Observations({
  observations,
  expandedObservations,
  toggleObservation,
}: {
  observations: OurPartnershipData['observations'];
  expandedObservations: number[];
  toggleObservation: (day: number) => void;
}) {
  const completedDays = observations.days.filter(d => d.status === 'complete');
  const scheduledDays = observations.days.filter(d => d.status === 'scheduled');

  return (
    <div id="classroom-observations" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#4ecdc4] rounded-full flex items-center justify-center">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1e2749]">Classroom Observations</h2>
          <p className="text-sm text-gray-500">Personalized insights from your partnership</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Completed Observation Days */}
        {completedDays.map((day) => (
          <div key={day.number} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Row Header - Always Visible */}
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1e2749]">Observation Day {day.number}</span>
                    <span className="text-gray-500 ml-2 text-sm">{day.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {day.classrooms && <span>{day.classrooms} classrooms</span>}
                  {day.loveNotes && (
                    <span className="flex items-center gap-1 text-pink-600">
                      <Heart className="w-4 h-4" /> {day.loveNotes} Love Notes
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Summary - Always Visible */}
            {day.aiSummary && (
              <div className="px-4 py-3 bg-white border-t border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{day.aiSummary}</p>
              </div>
            )}

            {/* View Details Toggle */}
            <button
              onClick={() => toggleObservation(day.number)}
              className="w-full px-4 py-2 text-sm text-[#1A6B6B] hover:bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1"
            >
              {expandedObservations.includes(day.number) ? 'Hide details' : 'View details'}
              {expandedObservations.includes(day.number) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Expanded Details */}
            {expandedObservations.includes(day.number) && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                {/* Narrative */}
                {day.narrative && day.narrative.length > 0 && (
                  <div className="pt-4">
                    {day.narrative.map((para, idx) => (
                      <p key={idx} className="text-sm text-gray-700 mb-3">{para}</p>
                    ))}
                  </div>
                )}

                {/* Staff Highlights */}
                {day.highlights && day.highlights.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Staff Highlights
                    </h4>
                    <ul className="space-y-1">
                      {day.highlights.map((h, idx) => (
                        <li key={idx} className="text-sm text-amber-700">{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quote */}
                {day.quote && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#1e2749]">
                    <Quote className="w-5 h-5 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-700 italic">&ldquo;{day.quote.text}&rdquo;</p>
                    <p className="text-xs text-gray-500 mt-2">- {day.quote.attribution}</p>
                  </div>
                )}

                {/* Resources */}
                {day.resources && day.resources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Resources</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {day.resources.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {res.type === 'download' ? (
                            <Download className="w-4 h-4 text-[#38618C] mt-0.5" />
                          ) : (
                            <Play className="w-4 h-4 text-[#38618C] mt-0.5" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-[#1e2749]">{res.title}</div>
                            <div className="text-xs text-gray-500">{res.description}</div>
                            {res.duration && <div className="text-xs text-gray-400">{res.duration}</div>}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Focus */}
                {day.nextFocus && day.nextFocus.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Focus for Next Observation</h4>
                    <ul className="space-y-1">
                      {day.nextFocus.map((f, idx) => (
                        <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Scheduled Observation Days */}
        {scheduledDays.map((day) => (
          <div key={day.number} className="border border-blue-200 rounded-xl p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-[#1e2749]">Observation Day {day.number}</span>
                  <span className="text-gray-500 ml-2 text-sm">{day.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {day.type && <span className="text-xs text-gray-500">{day.type}</span>}
                <span className="text-xs px-2 py-0.5 bg-[#4ecdc4] text-white rounded-full">Scheduled</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Section 3 - Snapshot Content
function SnapshotContent({ snapshot }: { snapshot: NonNullable<OurPartnershipData['snapshot']> }) {
  return (
    <div className="bg-[#1E2749] rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">From Partner Data Form</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/60 uppercase tracking-wide">Staff Types Served</p>
          <p className="text-sm mt-1">{snapshot.staffTypes}</p>
        </div>
        <div>
          <p className="text-xs text-white/60 uppercase tracking-wide">Buildings</p>
          <p className="text-sm mt-1">{snapshot.buildings}</p>
        </div>
        <div>
          <p className="text-xs text-white/60 uppercase tracking-wide">Success Metrics</p>
          <p className="text-sm mt-1">{snapshot.successMetrics}</p>
        </div>
        <div>
          <p className="text-xs text-white/60 uppercase tracking-wide">Top Priority</p>
          <p className="text-sm mt-1">{snapshot.topPriority}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-white/60 uppercase tracking-wide">Quick Win Goal</p>
          <p className="text-sm mt-1">{snapshot.quickWinGoal}</p>
        </div>
      </div>
    </div>
  );
}

// Section 4 - Phase Timeline
function PhaseTimeline({
  phases,
  onNavigateToTab,
}: {
  phases: OurPartnershipData['phases'];
  onNavigateToTab?: (tabId: string, sectionId?: string) => void;
}) {
  const phaseNames = ['IGNITE', 'ACCELERATE', 'SUSTAIN'];
  const phaseDescriptions = ['Build the foundation', 'Scale to full staff', 'Embed for lasting change'];

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((phaseNum) => {
          const isActive = phases.current === phaseNum;
          const isPast = phases.current > phaseNum;
          const isFuture = phases.current < phaseNum;

          return (
            <div
              key={phaseNum}
              className={`relative rounded-xl p-4 border-2 transition-all ${
                isActive
                  ? 'border-[#F5C542] bg-[#F5C542]/10'
                  : isPast
                  ? 'border-[#4ecdc4] bg-[#4ecdc4]/5'
                  : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100'
              }`}
              onClick={() => isFuture && onNavigateToTab?.('blueprint')}
            >
              {isActive && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#4ecdc4] text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                  YOU ARE HERE
                </span>
              )}
              <div className="text-center">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    isPast ? 'bg-[#4ecdc4]' : isActive ? 'bg-[#1B2A4A]' : 'bg-gray-300'
                  }`}
                >
                  {isPast ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">{phaseNum}</span>
                  )}
                </div>
                <h4 className={`font-bold text-sm ${isFuture ? 'text-gray-400' : 'text-[#1e2749]'}`}>
                  {phaseNames[phaseNum - 1]}
                </h4>
                <p className={`text-xs mt-1 ${isFuture ? 'text-gray-400' : 'text-gray-600'}`}>
                  {phaseDescriptions[phaseNum - 1]}
                </p>
              </div>

              {/* Deliverables for current phase */}
              {isActive && phases.deliverables.filter(d => d.phase === phaseNum).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ul className="space-y-1">
                    {phases.deliverables
                      .filter(d => d.phase === phaseNum)
                      .map((d, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          {d.complete ? (
                            <Check className="w-3 h-3 text-[#4ecdc4]" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-gray-300" />
                          )}
                          <span className={d.complete ? 'text-gray-700' : 'text-gray-500'}>{d.label}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {isFuture && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Coming soon
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Section 5 - Sessions Content
function SessionsContent({ sessions }: { sessions: OurPartnershipData['sessions'] }) {
  return (
    <div className="space-y-6">
      {/* Completed */}
      {sessions.completed.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4" /> Completed
          </h4>
          <div className="space-y-2">
            {sessions.completed.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{session.name}</div>
                    <div className="text-xs text-gray-500">{session.date} - {session.type}</div>
                  </div>
                </div>
                {session.reportUrl && (
                  <a
                    href={session.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1A6B6B] hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> View Report
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {sessions.upcoming.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming
          </h4>
          <div className="space-y-2">
            {sessions.upcoming.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{session.name}</div>
                    <div className="text-xs text-gray-500">
                      {session.date || 'Date TBD'} - {session.type}
                    </div>
                    {session.isBlock && session.blockDates && (
                      <div className="mt-1 text-xs text-gray-500">
                        {session.blockDates.map((d, i) => (
                          <span key={i} className="mr-2">#{d.number}: {d.date}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.confirmed ? (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Confirmed</span>
                  ) : session.schedulingUrl ? (
                    <a
                      href={session.schedulingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1 bg-[#1A6B6B] text-white rounded-lg hover:bg-[#155555] flex items-center gap-1"
                    >
                      Schedule <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Scheduling soon</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Section 6 - Progress Snapshot Content
function ProgressSnapshotContent({ data }: { data: NonNullable<OurPartnershipData['progressSnapshot']> }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-5">
          <div className="text-3xl font-bold text-amber-800">{data.implementationRate}%</div>
          <div className="text-sm text-amber-700 mt-1">Implementation Rate</div>
          <div className="text-xs text-amber-600 mt-2">
            Your staff are {data.industryMultiplier} more likely to apply learning
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-5">
          <div className="text-3xl font-bold text-green-800">{data.coursesCompleted}</div>
          <div className="text-sm text-green-700 mt-1">Courses Completed</div>
          <div className="text-xs text-green-600 mt-2">
            {data.hubLoginPercent}% Hub login rate - Strong foundation built
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#1e2749]">{data.hubLoginFraction}</div>
          <div className="text-xs text-gray-500">Hub Access</div>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4ecdc4] rounded-full" style={{ width: `${data.hubLoginPercent}%` }} />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#1e2749]">{data.selfDirectedCount}</div>
          <div className="text-xs text-gray-500">Self-Directed Learning</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#1e2749]">{data.coursesCompleted}</div>
          <div className="text-xs text-gray-500">Total Completions</div>
        </div>
      </div>
    </div>
  );
}

// Section 7 - Team Pulse Content
function TeamPulseContent({ data }: { data: NonNullable<OurPartnershipData['teamPulse']> }) {
  const [showPrevious, setShowPrevious] = useState(false);
  const latestSurvey = data.surveys[0];
  const previousSurveys = data.surveys.slice(1);

  if (!latestSurvey) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs px-2 py-0.5 bg-[#1e2749] text-white rounded-full">{latestSurvey.date}</span>
            <span className="text-xs text-gray-500 ml-2">
              {latestSurvey.responseCount} responses ({latestSurvey.responseRate}% rate)
            </span>
          </div>
        </div>

        {/* Confidence Scores */}
        {latestSurvey.confidence.length > 0 && (
          <div className="mb-4">
            <h5 className="text-xs font-semibold text-gray-700 mb-2">Confidence in Key Moves</h5>
            <div className="grid grid-cols-2 gap-2">
              {latestSurvey.confidence.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{c.label}</span>
                  <span className="font-medium text-[#1e2749]">{c.score.toFixed(2)}/5</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Stability */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">Team Stability:</div>
          <div className="text-lg font-bold text-[#1e2749]">{latestSurvey.stabilityPercent}%</div>
          <div className="text-xs text-gray-500">confirmed returning next year</div>
        </div>

        {/* Challenges */}
        {latestSurvey.challenges.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <h5 className="text-xs font-semibold text-gray-700 mb-2">What Staff Are Telling Us</h5>
            {latestSurvey.challenges.map((ch, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#38618C] rounded-full"
                    style={{ width: `${(ch.count / latestSurvey.responseCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-24">{ch.label}</span>
                <span className="text-xs text-gray-500 w-8">{ch.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hub Engagement */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <span className="font-medium text-[#1e2749]">{latestSurvey.hubActivePercent}%</span> actively engaging
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium text-[#1e2749]">{latestSurvey.hubPlanningPercent}%</span> planning to use
          </div>
        </div>
      </div>

      {previousSurveys.length > 0 && (
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className="text-sm text-[#1A6B6B] hover:underline flex items-center gap-1"
        >
          {showPrevious ? 'Hide' : 'View'} previous check-ins
          {showPrevious ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// Section 8 - What We're Learning Content
function WhatWereLearningContent({ data }: { data: NonNullable<OurPartnershipData['whatWereLearning']> }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        After {data.sessionCount} Sessions: What the Data Shows
      </p>

      {data.moves.map((move, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-[#1e2749]">{move.name}</h5>
            <span className="text-lg font-bold text-[#4ecdc4]">{move.implementationPercent}%</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{move.rawCount}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2">
              <div className="text-sm font-semibold text-green-600">{move.usingRegularly}</div>
              <div className="text-xs text-gray-500">Using regularly</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-sm font-semibold text-blue-600">{move.triedItOut}</div>
              <div className="text-xs text-gray-500">Tried it out</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-sm font-semibold text-amber-600">{move.readyToTry}</div>
              <div className="text-xs text-gray-500">Ready to try</div>
            </div>
          </div>
        </div>
      ))}

      {data.confidenceScores.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {data.confidenceScores.map((score, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#1e2749]">{score.percent}%</div>
              <div className="text-xs text-gray-600">{score.label}</div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        After {data.sessionCount} sessions and {data.practiceReps} practice reps. Confidence continues to build with each touchpoint.
      </p>
    </div>
  );
}

// Section 9 - Champions Content
function ChampionsContent({ data }: { data: NonNullable<OurPartnershipData['champions']> }) {
  const openHighFive = (staff: typeof data.staff[0]) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(staff.highFiveEmailTo)}&su=${encodeURIComponent(staff.highFiveEmailSubject)}&body=${encodeURIComponent(staff.highFiveEmailBody)}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
        {data.instructionalText}
      </p>

      <div className="space-y-2">
        {data.staff.map((person) => (
          <div key={person.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F5C542] rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-[#1e2749]">{person.rank}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{person.name}</div>
                <div className="text-xs text-gray-500">
                  {person.loginCount} logins - Last active: {person.lastActive}
                </div>
              </div>
              {person.recentlyActive && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Recently Active</span>
              )}
            </div>
            <button
              onClick={() => openHighFive(person)}
              className="text-xs px-3 py-1 bg-[#F5C542] text-[#1e2749] rounded-lg hover:bg-[#e5b43a] font-medium"
            >
              High Five
            </button>
          </div>
        ))}
      </div>

      <div className="bg-green-50 p-3 rounded-lg text-center">
        <p className="text-sm text-green-700">{data.footerStat}</p>
      </div>
    </div>
  );
}

// Section 10 - What's Resonating Content
function WhatsResonatingContent({
  data,
  showAll,
  setShowAll,
}: {
  data: NonNullable<OurPartnershipData['whatsResonating']>;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
}) {
  const displayedCourses = showAll ? data.courses : data.courses.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {displayedCourses.map((course, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#38618C]">{idx + 1}.</span>
              <a
                href={course.hubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#1A6B6B] hover:underline"
              >
                {course.name}
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{course.started} started</span>
              <span>{course.completed} completed</span>
            </div>
          </div>
        ))}
      </div>

      {data.courses.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-[#1A6B6B] hover:underline"
        >
          {showAll ? 'Show less' : 'Show more'}
        </button>
      )}

      <p className="text-xs text-gray-500 text-center">
        {data.totalCoursesExplored} courses explored - {data.totalCompletions} total completions - Data as of {data.dataAsOf}
      </p>
    </div>
  );
}

// Section 11 - Hub Barriers Content
function HubBarriersContent({ data }: { data: NonNullable<OurPartnershipData['hubBarriers']> }) {
  const maxCount = Math.max(...data.responses.map(r => r.count));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {data.responses.map((response, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full bg-[#38618C] rounded flex items-center px-2"
                style={{ width: `${(response.count / maxCount) * 100}%` }}
              >
                <span className="text-xs text-white truncate">{response.label}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{response.count}</span>
          </div>
        ))}
      </div>

      {data.recommendedActions.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <h5 className="text-sm font-semibold text-amber-800 mb-2">Recommended Actions for Admin</h5>
          <ul className="space-y-1">
            {data.recommendedActions.map((action, idx) => (
              <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OurPartnershipTab;
