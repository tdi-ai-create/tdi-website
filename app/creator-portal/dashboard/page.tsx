'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getCreatorByEmail,
  getCreatorDashboardData,
  updateMilestoneStatus,
} from '@/lib/creator-portal-data';
import { CreatorDashboardHeader } from '@/components/creator-portal/CreatorDashboardHeader';
import { PhaseProgress } from '@/components/creator-portal/PhaseProgress';
import { CourseDetailsPanel } from '@/components/creator-portal/CourseDetailsPanel';
import { NotesPanel } from '@/components/creator-portal/NotesPanel';
import type { CreatorDashboardData } from '@/types/creator-portal';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<CreatorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadDashboard = useCallback(async (email: string) => {
    const creator = await getCreatorByEmail(email);
    if (!creator) {
      router.push('/creator-portal');
      return;
    }

    const data = await getCreatorDashboardData(creator.id);
    if (data) {
      setDashboardData(data);
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.push('/creator-portal');
        return;
      }

      setUserEmail(session.user.email);
      await loadDashboard(session.user.email);
    };

    checkAuth();

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
  }, [router, loadDashboard]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/creator-portal');
  };

  const handleMarkComplete = async (milestoneId: string) => {
    if (!dashboardData || !userEmail) return;

    setIsSaving(true);
    try {
      // Mark as waiting_approval first (for team-action milestones) or completed
      const milestone = dashboardData.phases
        .flatMap((p) => p.milestones)
        .find((m) => m.id === milestoneId);

      if (!milestone) return;

      // Creator actions go straight to completed
      const newStatus = 'completed';

      const success = await updateMilestoneStatus(
        dashboardData.creator.id,
        milestoneId,
        newStatus,
        userEmail
      );

      if (success) {
        // Reload dashboard data
        await loadDashboard(userEmail);
      }
    } catch (error) {
      console.error('Error marking milestone complete:', error);
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

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load dashboard. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Image
            src="/images/logo.webp"
            alt="Teachers Deserve It"
            width={140}
            height={42}
            className="h-10 w-auto"
          />

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e2749] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

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
