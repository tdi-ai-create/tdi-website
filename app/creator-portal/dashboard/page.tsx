'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, AlertCircle, Mail, User, CheckCircle, X, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreatorDashboardHeader } from '@/components/creator-portal/CreatorDashboardHeader';
import { PhaseProgress } from '@/components/creator-portal/PhaseProgress';
import { CourseDetailsPanel } from '@/components/creator-portal/CourseDetailsPanel';
import { NotesPanel } from '@/components/creator-portal/NotesPanel';
import { CompletionBanner } from '@/components/creator-portal/CompletionBanner';
import { PastProjects } from '@/components/creator-portal/PastProjects';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import LocationPromptModal from '@/components/creator-portal/LocationPromptModal';
import ProjectedDateCountdown from '@/components/creator-portal/ProjectedDateCountdown';
import { TakeABreakButton } from '@/components/creator-portal/TakeABreak';
import PausedScreen from '@/components/creator-portal/PausedScreen';
import PepTalkCallout from '@/components/creator-portal/PepTalkCallout';
import { FeedbackPortal } from '@/components/creator-portal/FeedbackPortal';
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
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [previewCreatorName, setPreviewCreatorName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
    setSuccessMessage("Agreement signed! You're officially a TDI Creator.");
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

        // Topic-selection gate: redirect creator to topic picker if not chosen yet
        // Only gate creators who haven't selected a content path yet (truly new creators).
        // Existing creators who were onboarded before this feature should not be blocked.
        const { data: creatorTopicCheck } = await supabase
          .from('creators')
          .select('topic_chosen_by_creator, content_path')
          .eq('email', email)
          .maybeSingle();
        if (creatorTopicCheck && !creatorTopicCheck.topic_chosen_by_creator && !creatorTopicCheck.content_path) {
          console.log('[Dashboard] New creator has not chosen topic, redirecting to select-topic');
          router.push('/creator-portal/select-topic');
          return;
        }

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
          // Check if user is admin — support preview mode
          if (data.isAdmin) {
            const urlParams = new URLSearchParams(window.location.search);
            const asCreator = urlParams.get('as_creator');
            if (asCreator) {
              // Admin preview mode: fetch the target creator's dashboard
              const previewRes = await fetch('/api/creator-portal/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorId: asCreator }),
              });
              if (previewRes.ok) {
                const previewData = await previewRes.json();
                setDashboardData(previewData);
                setIsAdminPreview(true);
                setPreviewCreatorName(previewData.creator?.name || 'Creator');
                setDataLoaded(true);
                return;
              }
            }
            // No preview param — redirect to new admin portal
            router.push('/tdi-admin/creators');
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

            {/* Admin Preview Banner */}
            {isAdminPreview && dashboardData && (
              <div style={{
                background: '#EFF6FF',
                borderBottom: '1px solid #BFDBFE',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 13,
                color: '#1E40AF',
              }}>
                <span>Viewing as <strong>{previewCreatorName}</strong> (admin preview mode)</span>
                <a
                  href={`/tdi-admin/creators/${dashboardData.creator.id}`}
                  style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
                >
                  Exit Preview
                </a>
              </div>
            )}

            {/* Paused State Screen — intercepts entire dashboard */}
            {(dashboardData?.creator as any)?.lifecycle_state === 'paused' && dashboardData && (
              <PausedScreen
                creatorId={dashboardData.creator.id}
                creatorEmail={dashboardData.creator.email}
                firstName={dashboardData.creator.name?.split(' ')[0] || 'there'}
                pauseType={(dashboardData.creator as any)?.pause_type || null}
                onUnpaused={() => window.location.reload()}
              />
            )}

            {/* Normal dashboard — only render when NOT paused */}
            {(dashboardData?.creator as any)?.lifecycle_state !== 'paused' && <>

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

                {dashboardData && (
                  <TakeABreakButton
                    creatorId={dashboardData.creator.id}
                    creatorEmail={dashboardData.creator.email}
                    onPaused={() => window.location.reload()}
                  />
                )}
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

              {/* Projected Completion Date Countdown */}
              <div className="mt-6">
                <ProjectedDateCountdown
                  creatorId={dashboardData.creator.id}
                  creatorEmail={dashboardData.creator.email}
                  projectedCompletionDate={(dashboardData.creator as any).projected_completion_date || null}
                  projectedPublishDate={(dashboardData.creator as any).projected_publish_date || null}
                  onDateUpdated={(newDate, publishDate) => {
                    setDashboardData(prev => prev ? {
                      ...prev,
                      creator: {
                        ...prev.creator,
                        projected_completion_date: newDate,
                        projected_publish_date: publishDate,
                      } as any,
                    } : prev)
                  }}
                />
              </div>


              {/* Submissions & Feedback Portal */}
              <div className="mt-6">
                <FeedbackPortal
                  creatorId={dashboardData.creator.id}
                  milestones={dashboardData.phases.flatMap(p =>
                    p.milestones
                      .filter((m: MilestoneWithStatus) => m.isApplicable !== false)
                      .map((m: MilestoneWithStatus) => ({
                        progress_id: m.progress_id || m.id,
                        id: m.id,
                        title: m.title,
                        status: m.status,
                      }))
                  )}
                  onRefresh={refreshDashboard}
                />
              </div>

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

                  {/* Pep talk callout — shows after path selection during onboarding */}
                  {dashboardData.creator.current_phase === 'onboarding' && dashboardData.creator.content_path && (
                    <PepTalkCallout
                      creatorId={dashboardData.creator.id}
                      creatorName={dashboardData.creator.name}
                      creatorEmail={dashboardData.creator.email}
                      contentPath={dashboardData.creator.content_path}
                      pepTalkRequestedAt={(dashboardData.creator as any).pep_talk_requested_at || null}
                    />
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <CourseDetailsPanel creator={dashboardData.creator} />

                  {/* Affiliate Link Card */}
                  {(dashboardData.creator as any).affiliate_slug && (
                    <Link
                      href="/creator-portal/affiliate"
                      className="block bg-gradient-to-r from-[#1e2749] to-[#2a3459] rounded-xl p-5 text-white hover:shadow-lg transition-shadow group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">Your Affiliate Link</h3>
                        <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-white/70 text-xs mb-3">
                        Earn 50% on every paid conversion
                      </p>
                      <div className="bg-white/10 rounded-lg px-3 py-2">
                        <p className="text-xs font-mono text-white/90 truncate">
                          teachersdeserveit.com/r/{(dashboardData.creator as any).affiliate_slug}
                        </p>
                      </div>
                    </Link>
                  )}

                  <NotesPanel
                    notes={dashboardData.notes}
                    creatorId={dashboardData.creator.id}
                    creatorName={dashboardData.creator.name}
                    onNoteReply={refreshDashboard}
                  />

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
                      Questions about your project? Reach out anytime!
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#80a4ed]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-[#80a4ed]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1e2749]">Teachers Deserve It Team</p>
                        <p className="text-sm text-gray-500">Creator Studio Support</p>
                        <a
                          href="mailto:creatorstudio@teachersdeserveit.com"
                          className="inline-flex items-center gap-1.5 text-sm text-[#80a4ed] hover:text-[#1e2749] mt-2 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          creatorstudio@teachersdeserveit.com
                        </a>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <a
                        href="https://drive.google.com/file/d/1pDekiLqVYygJwcTxvTqOWkD7PHhIIPxf/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#80a4ed] hover:text-[#1e2749] transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        TDI Recording Guide (PDF)
                      </a>
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
                    href="mailto:creatorstudio@teachersdeserveit.com"
                    className="text-[#80a4ed] hover:text-[#1e2749]"
                  >
                    creatorstudio@teachersdeserveit.com
                  </a>
                </p>
              </div>
            </footer>

            </>}
          </div>
        )}
      </div>
    </>
  );
}
