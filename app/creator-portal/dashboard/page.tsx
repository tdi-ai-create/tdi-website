'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Loader2, AlertCircle, Mail, User, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreatorDashboardHeader } from '@/components/creator-portal/CreatorDashboardHeader';
import { PhaseProgress } from '@/components/creator-portal/PhaseProgress';
import { CourseDetailsPanel } from '@/components/creator-portal/CourseDetailsPanel';
import { NotesPanel } from '@/components/creator-portal/NotesPanel';
import type { CreatorDashboardData } from '@/types/creator-portal';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dashboardData, setDashboardData] = useState<CreatorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success messages from query params
  useEffect(() => {
    if (searchParams.get('agreement') === 'signed') {
      setSuccessMessage("Agreement signed! You're officially a TDI Creator 🎉");
      // Clear the URL param without refreshing
      window.history.replaceState({}, '', '/creator-portal/dashboard');
      // Auto-hide after 6 seconds
      setTimeout(() => setSuccessMessage(null), 6000);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      console.log('[Dashboard] Starting auth check...');

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[Dashboard] Session error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
          setIsLoading(false);
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
          setIsLoading(false);
          return;
        }

        setDashboardData(data);
        setIsLoading(false);

      } catch (err) {
        console.error('[Dashboard] Unexpected error:', err);
        setError(err instanceof Error ? err.message : 'Unexpected error loading dashboard');
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!dashboardData) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
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
        {/* Dashboard header with progress */}
        <CreatorDashboardHeader
          creator={dashboardData.creator}
          completedMilestones={dashboardData.completedMilestones}
          totalMilestones={dashboardData.totalMilestones}
          progressPercentage={dashboardData.progressPercentage}
        />

        {/* Content grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Phase progress */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-[#1e2749] mb-4">
              Your Progress
            </h2>
            <PhaseProgress
              phases={dashboardData.phases}
              onMarkComplete={handleMarkComplete}
              isLoading={isSaving}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CourseDetailsPanel creator={dashboardData.creator} />
            <NotesPanel notes={dashboardData.notes} />

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
  );
}
