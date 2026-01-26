'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Mail, User, Eye, EyeOff, Sparkles, Calendar, CheckCircle, Clock, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import type { CreatorDashboardData, PhaseWithMilestones, MilestoneWithStatus, CreatorNote } from '@/types/creator-portal';

// Mock data for the demo
const mockCreator = {
  id: 'demo-creator-123',
  email: 'demo@example.com',
  name: 'Sarah Johnson',
  course_title: 'Classroom Management Strategies That Actually Work',
  course_audience: 'K-5 Elementary Teachers',
  target_launch_month: 'March 2025',
  discount_code: 'SARAH20',
  current_phase: 'course_design' as const,
  created_at: '2024-12-01T00:00:00Z',
  updated_at: '2025-01-20T00:00:00Z',
};

const mockNotes: CreatorNote[] = [
  {
    id: 'note-1',
    creator_id: 'demo-creator-123',
    note: 'Great progress on your course outline! The structure looks solid. Looking forward to our next check-in.',
    created_by: 'Rachel Patragas',
    visible_to_creator: true,
    created_at: '2025-01-15T10:30:00Z',
  },
  {
    id: 'note-2',
    creator_id: 'demo-creator-123',
    note: 'Welcome to the TDI Creator family! So excited to work with you on this course.',
    created_by: 'Rachel Patragas',
    visible_to_creator: true,
    created_at: '2024-12-01T09:00:00Z',
  },
];

const mockPhases: PhaseWithMilestones[] = [
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Get set up and ready to create',
    sort_order: 1,
    created_at: '',
    isComplete: true,
    isCurrentPhase: false,
    milestones: [
      {
        id: 'm1',
        phase_id: 'onboarding',
        title: 'Welcome Call with Rachel',
        description: 'Meet your TDI contact and discuss your course vision',
        sort_order: 1,
        requires_team_action: false,
        calendly_link: 'https://calendly.com/rachel-tdi/welcome',
        created_at: '',
        status: 'completed',
        completed_at: '2024-12-05T00:00:00Z',
        progress_id: 'p1',
      },
      {
        id: 'm2',
        phase_id: 'onboarding',
        title: 'Submit Headshot & Bio',
        description: 'Provide your professional headshot and short bio for marketing',
        sort_order: 2,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'completed',
        completed_at: '2024-12-10T00:00:00Z',
        progress_id: 'p2',
      },
      {
        id: 'm3',
        phase_id: 'onboarding',
        title: 'Creator Portal Access',
        description: 'Get access to your Creator Portal dashboard',
        sort_order: 3,
        requires_team_action: true,
        calendly_link: null,
        created_at: '',
        status: 'completed',
        completed_at: '2024-12-12T00:00:00Z',
        progress_id: 'p3',
      },
    ],
  },
  {
    id: 'agreement',
    name: 'Agreement',
    description: 'Finalize your creator agreement',
    sort_order: 2,
    created_at: '',
    isComplete: true,
    isCurrentPhase: false,
    milestones: [
      {
        id: 'm4',
        phase_id: 'agreement',
        title: 'Review Creator Agreement',
        description: 'Read through the TDI Creator Agreement',
        sort_order: 1,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'completed',
        completed_at: '2024-12-15T00:00:00Z',
        progress_id: 'p4',
      },
      {
        id: 'm5',
        phase_id: 'agreement',
        title: 'Sign Agreement',
        description: 'Digitally sign your creator agreement',
        sort_order: 2,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'completed',
        completed_at: '2024-12-18T00:00:00Z',
        progress_id: 'p5',
      },
    ],
  },
  {
    id: 'course_design',
    name: 'Course Design',
    description: 'Plan and outline your course content',
    sort_order: 3,
    created_at: '',
    isComplete: false,
    isCurrentPhase: true,
    milestones: [
      {
        id: 'm6',
        phase_id: 'course_design',
        title: 'Complete Course Outline Template',
        description: 'Fill out the TDI course outline template with your module structure',
        sort_order: 1,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'completed',
        completed_at: '2025-01-05T00:00:00Z',
        progress_id: 'p6',
      },
      {
        id: 'm7',
        phase_id: 'course_design',
        title: 'Course Design Review Call',
        description: 'Review your course outline with Rachel',
        sort_order: 2,
        requires_team_action: false,
        calendly_link: 'https://calendly.com/rachel-tdi/design-review',
        created_at: '',
        status: 'in_progress',
        completed_at: null,
        progress_id: 'p7',
      },
      {
        id: 'm8',
        phase_id: 'course_design',
        title: 'Finalize Course Structure',
        description: 'Make final adjustments based on feedback',
        sort_order: 3,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'available',
        completed_at: null,
        progress_id: 'p8',
      },
      {
        id: 'm9',
        phase_id: 'course_design',
        title: 'Design Approval',
        description: 'TDI team approves your course design',
        sort_order: 4,
        requires_team_action: true,
        calendly_link: null,
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p9',
      },
    ],
  },
  {
    id: 'test_prep',
    name: 'Test & Prep',
    description: 'Prepare for recording',
    sort_order: 4,
    created_at: '',
    isComplete: false,
    isCurrentPhase: false,
    milestones: [
      {
        id: 'm10',
        phase_id: 'test_prep',
        title: 'Tech Check Call',
        description: 'Test your recording setup with our team',
        sort_order: 1,
        requires_team_action: false,
        calendly_link: 'https://calendly.com/rachel-tdi/tech-check',
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p10',
      },
      {
        id: 'm11',
        phase_id: 'test_prep',
        title: 'Record Test Video',
        description: 'Submit a 2-minute test recording for quality review',
        sort_order: 2,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p11',
      },
    ],
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Record your course content',
    sort_order: 5,
    created_at: '',
    isComplete: false,
    isCurrentPhase: false,
    milestones: [
      {
        id: 'm12',
        phase_id: 'production',
        title: 'Record Module 1',
        description: 'Record all videos for Module 1',
        sort_order: 1,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p12',
      },
      {
        id: 'm13',
        phase_id: 'production',
        title: 'Record Remaining Modules',
        description: 'Complete recording for all remaining modules',
        sort_order: 2,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p13',
      },
      {
        id: 'm14',
        phase_id: 'production',
        title: 'Video Editing Complete',
        description: 'TDI team completes video editing',
        sort_order: 3,
        requires_team_action: true,
        calendly_link: null,
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p14',
      },
    ],
  },
  {
    id: 'launch',
    name: 'Launch',
    description: 'Go live!',
    sort_order: 6,
    created_at: '',
    isComplete: false,
    isCurrentPhase: false,
    milestones: [
      {
        id: 'm15',
        phase_id: 'launch',
        title: 'Review Final Course',
        description: 'Review your complete course before launch',
        sort_order: 1,
        requires_team_action: false,
        calendly_link: null,
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p15',
      },
      {
        id: 'm16',
        phase_id: 'launch',
        title: 'Course Goes Live!',
        description: 'Your course is published on TDI Learning Hub',
        sort_order: 2,
        requires_team_action: true,
        calendly_link: null,
        created_at: '',
        status: 'locked',
        completed_at: null,
        progress_id: 'p16',
      },
    ],
  },
];

// Calculate mock stats
const totalMilestones = mockPhases.reduce((acc, p) => acc + p.milestones.length, 0);
const completedMilestones = mockPhases.reduce(
  (acc, p) => acc + p.milestones.filter((m) => m.status === 'completed').length,
  0
);
const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

// Status icon component
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-[#ffba06]" />;
    case 'available':
      return <div className="w-5 h-5 rounded-full border-2 border-[#80a4ed]" />;
    default:
      return <Lock className="w-4 h-4 text-gray-300" />;
  }
}

export default function CreatorPortalDemoPage() {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['onboarding', 'course_design']);
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // When "Show All" is on, treat all milestones as available
  const getDisplayPhases = () => {
    if (!showAllMilestones) return mockPhases;

    return mockPhases.map((phase) => ({
      ...phase,
      milestones: phase.milestones.map((m) => ({
        ...m,
        status: m.status === 'locked' ? 'available' : m.status,
      })),
    }));
  };

  const displayPhases = getDisplayPhases();

  // Progress circle
  const circleSize = 120;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progressPercentage / 100) * circumference;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Demo Banner */}
      <div className="bg-[#ffba06] text-[#1e2749] py-2 px-4 text-center text-sm font-medium">
        <Eye className="w-4 h-4 inline mr-2" />
        DEMO MODE - This is a preview with sample data
        <Link href="/creator-portal" className="ml-4 underline hover:no-underline">
          Go to real login →
        </Link>
      </div>

      {/* Studio Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={120}
              height={36}
              className="h-9 w-auto"
            />
            <div className="hidden sm:flex items-center">
              <span className="text-gray-300 mx-2">|</span>
              <span className="text-[#ffba06] font-semibold text-sm uppercase tracking-wide">
                Creator Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAllMilestones(!showAllMilestones)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                showAllMilestones
                  ? 'bg-[#ffba06] text-[#1e2749]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showAllMilestones ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAllMilestones ? 'Hide Locked' : 'Show All'}
            </button>

            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e2749] transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard header with progress */}
        <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-grow">
              <div className="flex items-center gap-2 text-[#ffba06] mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Creator Portal</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold">
                {greeting}, {mockCreator.name.split(' ')[0]}!
              </h1>

              <p className="text-white/80 mt-2 text-lg">
                Working on: <span className="text-white font-medium">{mockCreator.course_title}</span>
              </p>

              <p className="text-white/60 text-sm mt-4">
                You&apos;ve completed {completedMilestones} of {totalMilestones} milestones.
                {progressPercentage >= 50 ? " Great progress, keep it up!" : " Let's get started!"}
              </p>
            </div>

            <div className="flex-shrink-0 flex justify-center">
              <div className="relative" style={{ width: circleSize, height: circleSize }}>
                <svg className="transform -rotate-90" width={circleSize} height={circleSize}>
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    stroke="#ffba06"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{progressPercentage}%</span>
                  <span className="text-xs text-white/60">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Phase progress */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-[#1e2749] mb-4">Your Progress</h2>

            <div className="space-y-4">
              {displayPhases.map((phase) => (
                <div
                  key={phase.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                    phase.isCurrentPhase ? 'border-[#ffba06] ring-2 ring-[#ffba06]/20' : 'border-gray-100'
                  }`}
                >
                  {/* Phase header */}
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          phase.isComplete
                            ? 'bg-green-100 text-green-600'
                            : phase.isCurrentPhase
                            ? 'bg-[#ffba06] text-[#1e2749]'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {phase.isComplete ? <CheckCircle className="w-5 h-5" /> : phase.sort_order}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-[#1e2749]">{phase.name}</h3>
                        <p className="text-sm text-gray-500">{phase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {phase.milestones.filter((m) => m.status === 'completed').length}/
                        {phase.milestones.length}
                      </span>
                      {expandedPhases.includes(phase.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Milestones */}
                  {expandedPhases.includes(phase.id) && (
                    <div className="border-t border-gray-100">
                      {phase.milestones.map((milestone, idx) => (
                        <div
                          key={milestone.id}
                          className={`px-6 py-4 flex items-start gap-4 ${
                            idx !== phase.milestones.length - 1 ? 'border-b border-gray-50' : ''
                          } ${milestone.status === 'locked' ? 'opacity-50' : ''}`}
                        >
                          <div className="mt-0.5">
                            <StatusIcon status={milestone.status} />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-[#1e2749]">{milestone.title}</h4>
                            {milestone.description && (
                              <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                            )}
                            {milestone.requires_team_action && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                                TDI Team Action
                              </span>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {milestone.calendly_link && milestone.status !== 'locked' && milestone.status !== 'completed' && (
                              <a
                                href={milestone.calendly_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#80a4ed] text-white text-sm font-medium rounded-lg hover:bg-[#6b93e0] transition-colors"
                              >
                                <Calendar className="w-4 h-4" />
                                Book Call
                              </a>
                            )}
                            {!milestone.calendly_link && milestone.status === 'available' && !milestone.requires_team_action && (
                              <button className="px-4 py-2 bg-[#1e2749] text-white text-sm font-medium rounded-lg hover:bg-[#2a3459] transition-colors">
                                Mark Complete
                              </button>
                            )}
                            {milestone.status === 'completed' && milestone.completed_at && (
                              <span className="text-xs text-gray-400">
                                {new Date(milestone.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#1e2749] mb-4">Course Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Course Title</p>
                  <p className="font-medium text-[#1e2749] mt-1">{mockCreator.course_title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Target Audience</p>
                  <p className="font-medium text-[#1e2749] mt-1">{mockCreator.course_audience}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Target Launch</p>
                  <p className="font-medium text-[#1e2749] mt-1">{mockCreator.target_launch_month}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Your Discount Code</p>
                  <p className="font-mono bg-[#ffba06]/10 text-[#1e2749] px-3 py-2 rounded-lg mt-1 font-bold">
                    {mockCreator.discount_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#1e2749] mb-4">Team Notes</h3>
              {mockNotes.length > 0 ? (
                <div className="space-y-4">
                  {mockNotes.map((note) => (
                    <div key={note.id} className="border-l-2 border-[#80a4ed] pl-4">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {note.created_by} • {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No notes yet.</p>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#1e2749] mb-4">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Questions about your course? Reach out anytime!
              </p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#80a4ed]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#80a4ed]" />
                </div>
                <div>
                  <p className="font-medium text-[#1e2749]">Rachel Patragas</p>
                  <p className="text-sm text-gray-500">Director of Creative Solutions</p>
                  <a
                    href="mailto:rachel@teachersdeserveit.com"
                    className="inline-flex items-center gap-1.5 text-sm text-[#80a4ed] hover:text-[#1e2749] mt-2 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    rachel@teachersdeserveit.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>
            This is a demo page.{' '}
            <Link href="/creator-portal" className="text-[#80a4ed] hover:text-[#1e2749]">
              Go to real Creator Portal →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
