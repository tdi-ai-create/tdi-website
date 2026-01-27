'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LogOut,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  ExternalLink,
  Send,
  X,
  Hourglass,
  Info,
  PartyPopper,
} from 'lucide-react';
import type { CreatorNote } from '@/types/creator-portal';

// Milestone type for demo
interface DemoMilestone {
  id: string;
  phase_id: string;
  title: string;
  description: string;
  sort_order: number;
  requires_team_action: boolean;
  created_at: string;
  completed_at: string | null;
  progress_id: string;
  action_type: 'calendly' | 'submit_link' | 'confirm' | 'review' | 'sign_agreement' | 'team_action';
  action_config?: {
    url?: string;
    label?: string;
    link_type?: string;
    placeholder?: string;
    notify_team?: boolean;
  };
}

interface DemoPhase {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  milestones: DemoMilestone[];
}

// Mock data
const mockCreator = {
  name: 'Sarah Johnson',
  course_title: 'Classroom Management Strategies That Actually Work',
  course_audience: 'K-5 Elementary Teachers',
  target_launch_month: 'March 2025',
  discount_code: 'SARAH20',
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

// Initial phases data (without status - we'll compute that)
const initialPhases: DemoPhase[] = [
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Get set up and ready to create',
    sort_order: 1,
    milestones: [
      {
        id: 'm1',
        phase_id: 'onboarding',
        title: 'Welcome Call with Rachel',
        description: 'Meet your TDI contact and discuss your course vision',
        sort_order: 1,
        requires_team_action: false,
        created_at: '',
        completed_at: '2024-12-05T00:00:00Z',
        progress_id: 'p1',
        action_type: 'calendly',
        action_config: { url: 'https://calendly.com/rae-teachersdeserveit/creator-chat', label: 'Book Welcome Call' },
      },
      {
        id: 'm2',
        phase_id: 'onboarding',
        title: 'Submit Headshot & Bio',
        description: 'Provide your professional headshot and short bio for marketing',
        sort_order: 2,
        requires_team_action: false,
        created_at: '',
        completed_at: '2024-12-10T00:00:00Z',
        progress_id: 'p2',
        action_type: 'submit_link',
        action_config: { label: 'Submit Headshot & Bio', link_type: 'google_drive', placeholder: 'Paste Google Drive folder link' },
      },
      {
        id: 'm3',
        phase_id: 'onboarding',
        title: 'Creator Portal Access',
        description: 'Get access to your Creator Portal dashboard',
        sort_order: 3,
        requires_team_action: true,
        created_at: '',
        completed_at: '2024-12-12T00:00:00Z',
        progress_id: 'p3',
        action_type: 'team_action',
      },
    ],
  },
  {
    id: 'agreement',
    name: 'Agreement',
    description: 'Finalize your creator agreement',
    sort_order: 2,
    milestones: [
      {
        id: 'm4',
        phase_id: 'agreement',
        title: 'Sign Agreement',
        description: 'Digitally sign your creator agreement',
        sort_order: 1,
        requires_team_action: false,
        created_at: '',
        completed_at: '2024-12-15T00:00:00Z',
        progress_id: 'p4',
        action_type: 'sign_agreement',
        action_config: { label: 'Sign Agreement' },
      },
    ],
  },
  {
    id: 'course_design',
    name: 'Course Design',
    description: 'Plan and outline your course content',
    sort_order: 3,
    milestones: [
      {
        id: 'm6',
        phase_id: 'course_design',
        title: 'Complete Course Outline Template',
        description: 'Fill out the TDI course outline template with your module structure',
        sort_order: 1,
        requires_team_action: false,
        created_at: '',
        completed_at: '2025-01-05T00:00:00Z',
        progress_id: 'p6',
        action_type: 'submit_link',
        action_config: { label: 'Submit Course Outline', link_type: 'google_doc', placeholder: 'Paste your Google Doc link' },
      },
      {
        id: 'm7',
        phase_id: 'course_design',
        title: 'Course Design Review Call',
        description: 'Review your course outline with Rachel',
        sort_order: 2,
        requires_team_action: false,
        created_at: '',
        completed_at: null,
        progress_id: 'p7',
        action_type: 'calendly',
        action_config: { url: 'https://calendly.com/rae-teachersdeserveit/creator-chat', label: 'Book Design Review' },
      },
      {
        id: 'm8',
        phase_id: 'course_design',
        title: 'Finalize Course Structure',
        description: 'Make final adjustments based on feedback',
        sort_order: 3,
        requires_team_action: false,
        created_at: '',
        completed_at: null,
        progress_id: 'p8',
        action_type: 'confirm',
        action_config: { label: 'Mark Complete' },
      },
      {
        id: 'm9',
        phase_id: 'course_design',
        title: 'Design Approval',
        description: 'TDI team approves your course design',
        sort_order: 4,
        requires_team_action: true,
        created_at: '',
        completed_at: null,
        progress_id: 'p9',
        action_type: 'team_action',
      },
    ],
  },
  {
    id: 'test_prep',
    name: 'Test & Prep',
    description: 'Prepare for recording',
    sort_order: 4,
    milestones: [
      {
        id: 'm10',
        phase_id: 'test_prep',
        title: 'Tech Check Call',
        description: 'Test your recording setup with our team',
        sort_order: 1,
        requires_team_action: false,
        created_at: '',
        completed_at: null,
        progress_id: 'p10',
        action_type: 'calendly',
        action_config: { url: 'https://calendly.com/rae-teachersdeserveit/creator-chat', label: 'Book Tech Check' },
      },
      {
        id: 'm11',
        phase_id: 'test_prep',
        title: 'Record Test Video',
        description: 'Submit a 2-minute test recording for quality review',
        sort_order: 2,
        requires_team_action: false,
        created_at: '',
        completed_at: null,
        progress_id: 'p11',
        action_type: 'submit_link',
        action_config: { label: 'Submit Test Video', link_type: 'video', placeholder: 'Paste Loom or Google Drive link' },
      },
    ],
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Record your course content',
    sort_order: 5,
    milestones: [
      {
        id: 'm12',
        phase_id: 'production',
        title: 'Record Module 1',
        description: 'Record all videos for Module 1',
        sort_order: 1,
        requires_team_action: false,
        created_at: '',
        completed_at: null,
        progress_id: 'p12',
        action_type: 'submit_link',
        action_config: { label: 'Submit Module 1 Videos', link_type: 'google_drive', placeholder: 'Paste Google Drive folder link' },
      },
      {
        id: 'm13',
        phase_id: 'production',
        title: 'Record Remaining Modules',
        description: 'Complete recording for all remaining modules',
        sort_order: 2,
        requires_team_action: false,
        created_at: '',
        completed_at: null,
        progress_id: 'p13',
        action_type: 'submit_link',
        action_config: { label: 'Submit All Modules', link_type: 'google_drive', placeholder: 'Paste Google Drive folder link' },
      },
      {
        id: 'm14',
        phase_id: 'production',
        title: 'Video Editing Complete',
        description: 'TDI team completes video editing',
        sort_order: 3,
        requires_team_action: true,
        created_at: '',
        completed_at: null,
        progress_id: 'p14',
        action_type: 'team_action',
      },
    ],
  },
  {
    id: 'launch',
    name: 'Launch',
    description: 'Go live!',
    sort_order: 6,
    milestones: [
      {
        id: 'm15',
        phase_id: 'launch',
        title: 'Review Final Course',
        description: 'Review your complete course before launch',
        sort_order: 1,
        requires_team_action: false,
        created_at: '',
        completed_at: null,
        progress_id: 'p15',
        action_type: 'review',
        action_config: { label: "I've Reviewed the Final Course" },
      },
      {
        id: 'm16',
        phase_id: 'launch',
        title: 'Course Goes Live!',
        description: 'Your course is published on TDI Learning Hub',
        sort_order: 2,
        requires_team_action: true,
        created_at: '',
        completed_at: null,
        progress_id: 'p16',
        action_type: 'team_action',
      },
    ],
  },
];

// Get all milestone IDs in order
const allMilestoneIds = initialPhases.flatMap(p => p.milestones.map(m => m.id));

// Initial completed milestones (only onboarding is complete)
const initialCompleted = ['m1', 'm2', 'm3'];

export default function CreatorPortalDemoPage() {
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(initialCompleted);
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['agreement']);
  const allPhaseIds = initialPhases.map(p => p.id);
  const [showSubmitModal, setShowSubmitModal] = useState<DemoMilestone | null>(null);
  const [submitLink, setSubmitLink] = useState('');
  const [submitNotes, setSubmitNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [confetti, setConfetti] = useState(false);

  // Handle agreement signed query parameter (supports both ?agreement=signed and ?signed=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const agreementSigned = params.get('agreement') === 'signed' || params.get('signed') === 'true';
      if (agreementSigned) {
        // Mark agreement milestone as complete
        setCompletedMilestones(prev => {
          const newCompleted = [...prev];
          if (!newCompleted.includes('m4')) newCompleted.push('m4');
          return newCompleted;
        });
        // Show success message and confetti
        setToast({ message: "Agreement signed! Welcome to the TDI Creator family!", type: 'success' });
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
        setTimeout(() => setToast(null), 5000);
        // Expand the Agreement phase to show the completion
        setExpandedPhases(prev => prev.includes('agreement') ? prev : [...prev, 'agreement']);
        // Clear the URL param without refreshing
        window.history.replaceState({}, '', '/creator-portal/demo');
      }
    }
  }, []);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset demo to initial state
  const handleResetDemo = () => {
    setCompletedMilestones(initialCompleted);
    setExpandedPhases(['agreement']);
    setShowSubmitModal(null);
    setSubmitLink('');
    setSubmitNotes('');
    setToast(null);
    setConfetti(false);
    showToast('Demo reset - starting at Agreement phase', 'info');
  };

  // Handle completing a milestone
  const handleComplete = (milestoneId: string, message?: string) => {
    if (completedMilestones.includes(milestoneId)) return;

    setCompletedMilestones(prev => [...prev, milestoneId]);
    showToast(message || 'Milestone completed!', 'success');

    // Show confetti for special milestones
    if (['m4', 'm9', 'm16'].includes(milestoneId)) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }
  };

  // Handle submit modal
  const handleSubmit = () => {
    if (!showSubmitModal) return;
    handleComplete(showSubmitModal.id, `"${showSubmitModal.title}" submitted for review!`);
    setShowSubmitModal(null);
    setSubmitLink('');
    setSubmitNotes('');
  };

  // Get milestone status based on completion state
  const getMilestoneStatus = (milestone: DemoMilestone): 'completed' | 'in_progress' | 'available' | 'locked' => {
    if (completedMilestones.includes(milestone.id)) return 'completed';

    // Find this milestone's index in the global order
    const milestoneIndex = allMilestoneIds.indexOf(milestone.id);

    // First milestone is always available if not completed
    if (milestoneIndex === 0) return 'available';

    // Check if previous milestone is completed
    const prevMilestoneId = allMilestoneIds[milestoneIndex - 1];
    if (completedMilestones.includes(prevMilestoneId)) {
      // This is the next available milestone - mark as in_progress if it's the first uncompleted
      const firstUncompletedIndex = allMilestoneIds.findIndex(id => !completedMilestones.includes(id));
      if (milestoneIndex === firstUncompletedIndex) return 'in_progress';
      return 'available';
    }

    return 'locked';
  };

  // Calculate stats
  const totalMilestones = allMilestoneIds.length;
  const completedCount = completedMilestones.length;
  const progressPercentage = Math.round((completedCount / totalMilestones) * 100);

  // Determine current phase
  const getCurrentPhaseId = () => {
    for (const phase of initialPhases) {
      const phaseComplete = phase.milestones.every(m => completedMilestones.includes(m.id));
      if (!phaseComplete) return phase.id;
    }
    return initialPhases[initialPhases.length - 1].id;
  };
  const currentPhaseId = getCurrentPhaseId();

  // Auto-expand current phase when it changes
  useEffect(() => {
    if (!expandedPhases.includes(currentPhaseId)) {
      setExpandedPhases(prev => [...prev, currentPhaseId]);
    }
  }, [currentPhaseId, expandedPhases]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // Progress circle
  const circleSize = 120;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progressPercentage / 100) * circumference;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Render action button based on type and status
  const renderAction = (milestone: DemoMilestone, status: string) => {
    if (status === 'completed') {
      return (
        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Done
        </span>
      );
    }

    if (status === 'locked') {
      return null;
    }

    const config = milestone.action_config || {};

    switch (milestone.action_type) {
      case 'calendly':
        return (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <a
              href={config.url || 'https://calendly.com/rae-teachersdeserveit/creator-chat'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              {config.label || 'Book Call'}
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => handleComplete(milestone.id, `"${milestone.title}" marked as scheduled!`)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              I&apos;ve Scheduled
            </button>
          </div>
        );

      case 'submit_link':
        return (
          <button
            onClick={() => setShowSubmitModal(milestone)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            {config.label || 'Submit'}
          </button>
        );

      case 'confirm':
      case 'review':
        return (
          <button
            onClick={() => handleComplete(milestone.id, `"${milestone.title}" marked as complete!`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            {config.label || 'Mark Complete'}
          </button>
        );

      case 'sign_agreement':
        return (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <a
              href="/creator-portal/agreement?demo=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              {config.label || 'Sign Agreement'}
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => {
                handleComplete(milestone.id, 'Agreement signed! Welcome to the TDI Creator family!');
                setConfetti(true);
                setTimeout(() => setConfetti(false), 3000);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Skip (Demo)
            </button>
          </div>
        );

      case 'team_action':
        return (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm">
              <Hourglass className="w-4 h-4" />
              Waiting on TDI
            </span>
            <button
              onClick={() => handleComplete(milestone.id, `"${milestone.title}" approved by TDI!`)}
              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
            >
              ✓ Simulate Approval
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Status icon
  const StatusIcon = ({ status }: { status: string }) => {
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
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#ffba06', '#80a4ed', '#1e2749', '#22c55e', '#f97316'][Math.floor(Math.random() * 5)],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-[#1e2749] text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5 text-[#ffba06]" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1e2749]">
                {showSubmitModal.action_config?.label || 'Submit Your Work'}
              </h3>
              <button
                onClick={() => {
                  setShowSubmitModal(null);
                  setSubmitLink('');
                  setSubmitNotes('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demo mode notice */}
            <div className="bg-[#ffba06]/10 border border-[#ffba06] rounded-lg p-3 mb-4">
              <p className="text-sm text-[#1e2749] flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span><strong>Demo Mode</strong> - Try it out! Nothing is saved.</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {showSubmitModal.action_config?.link_type === 'google_doc' ? 'Google Doc Link' :
                   showSubmitModal.action_config?.link_type === 'video' ? 'Video Link (Loom or Google Drive)' :
                   showSubmitModal.action_config?.link_type === 'google_drive' ? 'Google Drive Folder Link' : 'Link'}
                </label>
                <input
                  type="url"
                  value={submitLink}
                  onChange={(e) => setSubmitLink(e.target.value)}
                  placeholder={showSubmitModal.action_config?.placeholder || 'Paste your link here'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes for the TDI Team (optional)
                </label>
                <textarea
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  placeholder="Any questions or things you'd like feedback on?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSubmitModal(null);
                  setSubmitLink('');
                  setSubmitNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Banner */}
      <div className="bg-[#ffba06] text-[#1e2749] py-2 px-4 text-center text-sm font-medium">
        <Eye className="w-4 h-4 inline mr-2" />
        DEMO MODE - All buttons are interactive! Try completing milestones.
        <Link href="/creator-portal" className="ml-4 underline hover:no-underline">
          Go to real login
        </Link>
      </div>

      {/* Studio Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
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
              onClick={handleResetDemo}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Reset Demo
            </button>
            <button
              onClick={() => {
                if (expandedPhases.length === allPhaseIds.length) {
                  setExpandedPhases(['agreement']);
                } else {
                  setExpandedPhases(allPhaseIds);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                expandedPhases.length === allPhaseIds.length
                  ? 'bg-[#ffba06] text-[#1e2749]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {expandedPhases.length === allPhaseIds.length ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {expandedPhases.length === allPhaseIds.length ? 'Collapse All' : 'Expand All'}
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
                You&apos;ve completed {completedCount} of {totalMilestones} milestones.
                {progressPercentage >= 75 ? ' Almost there!' : progressPercentage >= 50 ? ' Great progress!' : " Let's keep going!"}
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
                    className="transition-all duration-700 ease-out"
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
              {initialPhases.map((phase) => {
                const phaseComplete = phase.milestones.every(m => completedMilestones.includes(m.id));
                const isCurrentPhase = phase.id === currentPhaseId;

                return (
                  <div
                    key={phase.id}
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                      isCurrentPhase ? 'border-[#ffba06] ring-2 ring-[#ffba06]/20' :
                      phaseComplete ? 'border-green-300' : 'border-gray-100'
                    }`}
                  >
                    {/* Phase header */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            phaseComplete
                              ? 'bg-green-100 text-green-600'
                              : isCurrentPhase
                              ? 'bg-[#ffba06] text-[#1e2749]'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {phaseComplete ? <CheckCircle className="w-5 h-5" /> : phase.sort_order}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#1e2749]">{phase.name}</h3>
                            {isCurrentPhase && (
                              <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-0.5 rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{phase.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {phase.milestones.filter(m => completedMilestones.includes(m.id)).length}/
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
                        {phase.milestones.map((milestone, idx) => {
                          const status = getMilestoneStatus(milestone);

                          return (
                            <div
                              key={milestone.id}
                              className={`px-6 py-4 flex items-start gap-4 transition-all ${
                                idx !== phase.milestones.length - 1 ? 'border-b border-gray-50' : ''
                              } ${status === 'locked' ? 'opacity-50' : ''} ${
                                status === 'in_progress' ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              <div className="mt-0.5">
                                <StatusIcon status={status} />
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className={`font-medium ${status === 'locked' ? 'text-gray-500' : 'text-[#1e2749]'}`}>
                                  {milestone.title}
                                </h4>
                                {milestone.description && (
                                  <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                                )}
                                {milestone.requires_team_action && status === 'locked' && (
                                  <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                                    TDI Team Action
                                  </span>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {renderAction(milestone, status)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Completion celebration */}
            {progressPercentage === 100 && (
              <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-white text-center">
                <PartyPopper className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                <p className="text-white/90">
                  You&apos;ve completed all milestones in the demo. Your course is ready to launch!
                </p>
                <button
                  onClick={handleResetDemo}
                  className="mt-4 px-6 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  Reset Demo
                </button>
              </div>
            )}

            {/* Try Actions Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#ffba06]" />
                <h3 className="text-lg font-semibold text-[#1e2749]">Try All Action Types</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Test each button type. Calendly opens in a new tab, others work in demo mode.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Book a Call</p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/creator-chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Call
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => showToast("Call scheduled!", 'success')}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      I&apos;ve Scheduled
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Submit Link</p>
                  <button
                    onClick={() => setShowSubmitModal({
                      id: 'demo-submit',
                      phase_id: 'demo',
                      title: 'Demo Submission',
                      description: '',
                      sort_order: 1,
                      requires_team_action: false,
                      created_at: '',
                      completed_at: null,
                      progress_id: 'demo',
                      action_type: 'submit_link',
                      action_config: { label: 'Submit Link', link_type: 'google_doc', placeholder: 'Paste your Google Doc link' },
                    })}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    Submit Link
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Mark Complete</p>
                  <button
                    onClick={() => showToast('Demo action completed!', 'success')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Review</p>
                  <button
                    onClick={() => showToast("Confirmed: You've reviewed this!", 'success')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    I&apos;ve Reviewed This
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Sign Agreement</p>
                  <button
                    onClick={() => {
                      setConfetti(true);
                      setTimeout(() => setConfetti(false), 3000);
                      showToast('Agreement signed! Welcome to TDI!', 'success');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-all hover:scale-105 active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    Sign Agreement
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Team Action</p>
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm">
                      <Hourglass className="w-4 h-4" />
                      Waiting on TDI
                    </span>
                    <button
                      onClick={() => showToast('TDI approved this step!', 'success')}
                      className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                    >
                      ✓ Simulate Approval
                    </button>
                  </div>
                </div>
              </div>
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
              <div className="space-y-4">
                {mockNotes.map((note) => (
                  <div key={note.id} className="border-l-2 border-[#80a4ed] pl-4">
                    <p className="text-sm text-gray-700">{note.note}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {note.created_by} - {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
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
              Go to real Creator Portal
            </Link>
          </p>
        </div>
      </footer>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
