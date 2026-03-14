'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LogOut, AlertCircle, Mail, User, CheckCircle, X, Target, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreatorDashboardHeader } from '@/components/creator-portal/CreatorDashboardHeader';
import { PhaseProgress } from '@/components/creator-portal/PhaseProgress';
import { CourseDetailsPanel } from '@/components/creator-portal/CourseDetailsPanel';
import { NotesPanel } from '@/components/creator-portal/NotesPanel';
import { CompletionBanner } from '@/components/creator-portal/CompletionBanner';
import { PastProjects } from '@/components/creator-portal/PastProjects';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import LocationPromptModal from '@/components/creator-portal/LocationPromptModal';
import type { CreatorDashboardData, MilestoneWithStatus } from '@/types/creator-portal';

// Component to handle search params (must be wrapped in Suspense)
function SearchParamsHandler({
  onAgreementSigned,
}: {
  onAgreementSigned: () => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('agreement') === 'signed') {
      onAgreementSigned();
      // Clear the URL param without refreshing
      window.history.replaceState({}, '', '/creator-portal/dashboard');
    }
  }, [searchParams, onAgreementSigned]);

  return null;
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<CreatorDashboardData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  // Target date state
  const [showTargetDateModal, setShowTargetDateModal] = useState(false);
  const [targetDateInput, setTargetDateInput] = useState('');
  const [isSavingTargetDate, setIsSavingTargetDate] = useState(false);

  // NEW: Three independent gates — ALL must be true to show dashboard
  const [animationComplete, setAnimationComplete] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  // NEW: Hard minimum timer as backup — even if everything else fails,
  // this guarantees the loader shows for at least 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, []); // runs once on mount, never resets

  // Callback for when agreement is signed
  const handleAgreementSigned = () => {
    setSuccessMessage("Agreement signed! You're officially a TDI Creator 🎉");
    // Auto-hide after 6 seconds
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      console.log('[Dashboard] Starting auth check...');

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[Dashboard] Session error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
          setDataLoaded(true);
          return;
        }

        if (!session?.user?.email) {
          console.log('[Dashboard] No session, redirecting to login');
          router.push('/creator-portal');
          return;
        }

        const email = session.user.email;
        console.log('[Dashboard] User email:', email);
        setUserEmail(email);

        // Fetch dashboard data via API (uses service role to bypass RLS)
        console.log('[Dashboard] Fetching dashboard data...');
        const response = await fetch('/api/creator-portal/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log('[Dashboard] API response:', { status: response.status, data });

        if (!response.ok) {
          // Check if user is admin
          if (data.isAdmin) {
            console.log('[Dashboard] User is admin, redirecting...');
            router.push('/admin/creators');
            return;
          }

          setError(data.error || `API error: ${response.status}`);
          setDataLoaded(true);
          return;
        }

        setDashboardData(data);
        setDataLoaded(true);

      } catch (err) {
        console.error('[Dashboard] Unexpected error:', err);
        setError(err instanceof Error ? err.message : 'Unexpected error loading dashboard');
        setDataLoaded(true);
      }
    };

    checkAuthAndLoad();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/creator-portal');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/creator-portal');
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    if (!userEmail) return;
    try {
      const refreshResponse = await fetch('/api/creator-portal/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (refreshResponse.ok) {
        const newData = await refreshResponse.json();
        setDashboardData(newData);
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  };

  // Show location modal when conditions are met
  useEffect(() => {
    // Only show modal once the dashboard is fully visible
    const isDashboardVisible = animationComplete && dataLoaded && timerDone;
    if (isDashboardVisible && dashboardData?.creator) {
      const creator = dashboardData.creator;
      // Show modal if state is null and hasn't been dismissed
      if (creator.state === null && !creator.location_prompt_dismissed) {
        setShowLocationModal(true);
      }
    }
  }, [animationComplete, dataLoaded, timerDone, dashboardData]);

  // Handle location submit
  const handleLocationSubmit = async (state: string) => {
    try {
      const response = await fetch('/api/creator-portal/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });

      if (response.ok) {
        setShowLocationModal(false);
        // Update local state to prevent modal from showing again
        if (dashboardData) {
          setDashboardData({
            ...dashboardData,
            creator: {
              ...dashboardData.creator,
              state,
              location_prompt_dismissed: true,
            },
          });
        }
      }
    } catch (err) {
      console.error('Error saving location:', err);
    }
  };

  // Handle location skip
  const handleLocationSkip = async () => {
    try {
      const response = await fetch('/api/creator-portal/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      });

      if (response.ok) {
        setShowLocationModal(false);
        // Update local state to prevent modal from showing again
        if (dashboardData) {
          setDashboardData({
            ...dashboardData,
            creator: {
              ...dashboardData.creator,
              location_prompt_dismissed: true,
            },
          });
        }
      }
    } catch (err) {
      console.error('Error dismissing location prompt:', err);
    }
  };

  // Show target date modal when Agreement milestone is complete and no target date set
  useEffect(() => {
    const isDashboardVisible = animationComplete && dataLoaded && timerDone;
    if (isDashboardVisible && dashboardData?.creator && !showLocationModal) {
      const creator = dashboardData.creator;
      // Find Agreement milestone
      const agreementMilestone = dashboardData.phases
        .flatMap(p => p.milestones)
        .find((m: MilestoneWithStatus) => m.id === 'sign_agreement');
      // Show modal if agreement is signed, no target date set, and hasn't been dismissed this session
      if (
        agreementMilestone?.status === 'completed' &&
        !creator.target_completion_date
      ) {
        // Small delay to let the location modal close first if needed
        setTimeout(() => setShowTargetDateModal(true), 500);
      }
    }
  }, [animationComplete, dataLoaded, timerDone, dashboardData, showLocationModal]);

  // Handle setting target date
  const handleSetTargetDate = async () => {
    if (!targetDateInput || !dashboardData || !userEmail) return;

    setIsSavingTargetDate(true);
    try {
      const response = await fetch('/api/creator-portal/set-target-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: dashboardData.creator.id,
          targetDate: targetDateInput,
          setBy: userEmail,
        }),
      });

      if (response.ok) {
        setShowTargetDateModal(false);
        setSuccessMessage('Target date set! Check your dashboard for the countdown.');
        setTimeout(() => setSuccessMessage(null), 5000);
        // Update local state
        setDashboardData({
          ...dashboardData,
          creator: {
            ...dashboardData.creator,
            target_completion_date: targetDateInput,
          },
        });
      }
    } catch (err) {
      console.error('Error setting target date:', err);
    } finally {
      setIsSavingTargetDate(false);
    }
  };

  // Handle updating target date
  const handleUpdateTargetDate = async () => {
    if (!targetDateInput || !dashboardData || !userEmail) return;

    setIsSavingTargetDate(true);
    try {
      const response = await fetch('/api/creator-portal/set-target-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: dashboardData.creator.id,
          targetDate: targetDateInput,
          setBy: userEmail,
          notes: 'Updated by creator',
        }),
      });

      if (response.ok) {
        setShowTargetDateModal(false);
        setSuccessMessage('Target date updated!');
        setTimeout(() => setSuccessMessage(null), 3000);
        // Update local state
        setDashboardData({
          ...dashboardData,
          creator: {
            ...dashboardData.creator,
            target_completion_date: targetDateInput,
          },
        });
      }
    } catch (err) {
      console.error('Error updating target date:', err);
    } finally {
      setIsSavingTargetDate(false);
    }
  };

  // Helper to calculate days until target
  const getDaysUntilTarget = () => {
    if (!dashboardData?.creator.target_completion_date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dashboardData.creator.target_completion_date);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleMarkComplete = async (milestoneId: string) => {
    if (!dashboardData || !userEmail) return;

    setIsSaving(true);
    try {
      // Call API to update milestone
      const response = await fetch('/api/creator-portal/update-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: dashboardData.creator.id,
          milestoneId,
          status: 'completed',
          completedBy: userEmail,
        }),
      });

      if (response.ok) {
        // Reload dashboard data
        const refreshResponse = await fetch('/api/creator-portal/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });

        if (refreshResponse.ok) {
          const newData = await refreshResponse.json();
          setDashboardData(newData);
        }
      }
    } catch (err) {
      console.error('Error marking milestone complete:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // THE GATE: dashboard is only visible when ALL THREE are true
  const showDashboard = animationComplete && dataLoaded && timerDone;

  return (
    <>
      {/* Location Prompt Modal */}
      <LocationPromptModal
        isOpen={showLocationModal}
        onSubmit={handleLocationSubmit}
        onSkip={handleLocationSkip}
      />

      {/* Target Date Prompt Modal */}
      {showTargetDateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#ffba06] rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#1e2749]" />
                </div>
                <h2 className="text-xl font-semibold">
                  {dashboardData?.creator.target_completion_date ? 'Update Your Goal' : 'Set Your Launch Goal'}
                </h2>
              </div>
              <p className="text-white/80 text-sm">
                {dashboardData?.creator.target_completion_date
                  ? 'Adjust your target date as needed. Life happens!'
                  : `You're officially in! Set a target date for when you'd like to have your ${
                      dashboardData?.creator.content_path === 'course' ? 'course' :
                      dashboardData?.creator.content_path === 'blog' ? 'blog' :
                      dashboardData?.creator.content_path === 'download' ? 'download' : 'content'
                    } ready to launch.`}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                This is your goal - it&apos;s okay to adjust it as life happens. We&apos;ll send friendly reminders as you get closer.
              </p>

              <label className="block text-sm font-medium text-[#1e2749] mb-2">
                Target Launch Date
              </label>
              <input
                type="date"
                value={targetDateInput}
                onChange={(e) => setTargetDateInput(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[#1e2749] focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTargetDateModal(false);
                    setTargetDateInput('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  {dashboardData?.creator.target_completion_date ? 'Cancel' : 'Set Later'}
                </button>
                <button
                  onClick={dashboardData?.creator.target_completion_date ? handleUpdateTargetDate : handleSetTargetDate}
                  disabled={!targetDateInput || isSavingTargetDate}
                  className="flex-1 px-4 py-3 text-white bg-[#1e2749] rounded-xl hover:bg-[#2a3459] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingTargetDate ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      {dashboardData?.creator.target_completion_date ? 'Update Goal' : 'Set My Goal'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOADER: shows until animation calls onComplete */}
      {!animationComplete && (
        <TDIPortalLoader
          portal="creators"
          onComplete={() => setAnimationComplete(true)}
        />
      )}

      {/* BACKUP: if the animation component somehow unmounts early or glitches,
          show a plain gold screen until the timer finishes */}
      {!showDashboard && animationComplete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'linear-gradient(135deg, #ffba06, #e5a800)',
          transition: 'opacity 500ms ease-out',
          opacity: timerDone && dataLoaded ? 0 : 1,
          pointerEvents: 'none',
        }} />
      )}

      {/* DASHBOARD: completely hidden until gate opens */}
      <div style={{
        visibility: showDashboard ? 'visible' : 'hidden',
        opacity: showDashboard ? 1 : 0,
        transition: 'opacity 300ms ease-in',
      }}>
        {error ? (
          <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-[#1e2749] mb-2">Unable to Load Dashboard</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3459] transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : !dashboardData ? (
          <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No dashboard data available.</p>
              <button
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 text-[#80a4ed] hover:text-[#1e2749]"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-[#f5f5f5]">
            {/* Handle search params with Suspense boundary */}
            <Suspense fallback={null}>
              <SearchParamsHandler onAgreementSigned={handleAgreementSigned} />
            </Suspense>

            {/* Studio Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
              <div className="container-wide py-4 flex items-center justify-between">
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

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e2749] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </header>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border-b border-green-200">
                <div className="container-wide py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Main content */}
            <main className="container-wide py-8">
              {/* Check if creator completed with "hold_off" choice */}
              {(() => {
                // Find the create_again milestone across all phases
                const createAgainMilestone = dashboardData.phases
                  .flatMap(p => p.milestones)
                  .find((m: MilestoneWithStatus) => m.id === 'create_again');

                // Check if completed with "hold_off" choice
                const submissionData = createAgainMilestone?.submission_data;
                const isHoldingOff = createAgainMilestone?.status === 'completed' &&
                  submissionData?.create_again_choice === 'hold_off';

                if (isHoldingOff) {
                  return (
                    <CompletionBanner
                      creatorName={dashboardData.creator.name}
                      contentPath={dashboardData.creator.content_path}
                      creatorId={dashboardData.creator.id}
                    />
                  );
                }
                return null;
              })()}

              {/* Dashboard header with progress */}
              <CreatorDashboardHeader
                creator={dashboardData.creator}
                completedMilestones={dashboardData.completedMilestones}
                totalMilestones={dashboardData.totalMilestones}
                progressPercentage={dashboardData.progressPercentage}
              />

              {/* Target Date Countdown Card */}
              {dashboardData.creator.target_completion_date && (() => {
                const daysUntil = getDaysUntilTarget();
                const targetDate = new Date(dashboardData.creator.target_completion_date);
                const isPast = daysUntil !== null && daysUntil < 0;

                return (
                  <div className={`mt-6 p-6 rounded-xl border ${isPast ? 'bg-amber-50 border-amber-200' : 'bg-gradient-to-r from-[#80a4ed]/10 to-[#ffba06]/10 border-[#80a4ed]/20'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPast ? 'bg-amber-100' : 'bg-[#80a4ed]/20'}`}>
                          <Target className={`w-6 h-6 ${isPast ? 'text-amber-600' : 'text-[#80a4ed]'}`} />
                        </div>
                        <div>
                          {isPast ? (
                            <>
                              <p className="text-amber-800 font-medium">Your target date has passed</p>
                              <p className="text-amber-700 text-sm">Want to set a new goal?</p>
                            </>
                          ) : (
                            <>
                              <p className="text-[#1e2749] font-semibold text-2xl">
                                {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                              </p>
                              <p className="text-gray-600 text-sm">
                                until your launch goal - {targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setTargetDateInput(dashboardData.creator.target_completion_date || '');
                          setShowTargetDateModal(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isPast
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-white/50 text-[#1e2749] hover:bg-white border border-gray-200'
                        }`}
                      >
                        {isPast ? (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Set New Goal
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            Update Goal
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Content grid */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content - Phase progress */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold text-[#1e2749] mb-4">
                    Your Progress
                  </h2>
                  <PhaseProgress
                    phases={dashboardData.phases}
                    creatorId={dashboardData.creator.id}
                    onMarkComplete={handleMarkComplete}
                    onRefresh={refreshDashboard}
                    isLoading={isSaving}
                    teamNotes={dashboardData.notes.filter(n => n.visible_to_creator).map(n => n.content).join('\n\n')}
                    creatorName={dashboardData.creator.name}
                    contentPath={dashboardData.contentPath || dashboardData.creator.content_path}
                    creator={{
                      google_doc_link: dashboardData.creator.google_doc_link,
                      drive_folder_link: dashboardData.creator.drive_folder_link,
                      marketing_doc_link: dashboardData.creator.marketing_doc_link,
                      course_url: dashboardData.creator.course_url,
                      discount_code: dashboardData.creator.discount_code,
                      wants_video_editing: dashboardData.creator.wants_video_editing,
                      wants_download_design: dashboardData.creator.wants_download_design,
                      content_path: dashboardData.creator.content_path,
                    }}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <CourseDetailsPanel creator={dashboardData.creator} />
                  <NotesPanel notes={dashboardData.notes} />

                  {/* Past Projects (if any) */}
                  {dashboardData.pastProjects && dashboardData.pastProjects.length > 0 && (
                    <PastProjects projects={dashboardData.pastProjects} />
                  )}

                  {/* TDI Contact Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-[#1e2749] mb-4">
                      Need Help?
                    </h3>
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
              <div className="container-wide text-center text-sm text-gray-500">
                <p>
                  Questions? Reach out to{' '}
                  <a
                    href="mailto:rachel@teachersdeserveit.com"
                    className="text-[#80a4ed] hover:text-[#1e2749]"
                  >
                    rachel@teachersdeserveit.com
                  </a>
                </p>
              </div>
            </footer>
          </div>
        )}
      </div>
    </>
  );
}
