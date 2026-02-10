'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  getCurrentUser,
  getHubProfile,
  createHubProfile,
  type HubProfile,
} from '@/lib/hub-auth';
import { HubProvider } from './HubContext';
import type { User } from '@supabase/supabase-js';

interface HubAuthGuardProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/hub/verify'];

// Routes that skip the onboarding redirect check
const SKIP_ONBOARDING_CHECK_ROUTES = ['/hub/onboarding', '/hub/login', '/hub/auth'];

export default function HubAuthGuard({ children }: HubAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<HubProfile | null>(null);

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Check if current route should skip onboarding check
  const skipOnboardingCheck = SKIP_ONBOARDING_CHECK_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    async function checkAuth() {
      // Skip auth check for public routes
      if (isPublicRoute) {
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          // Not logged in - redirect to login
          // Store intended destination for redirect after login
          const returnUrl = encodeURIComponent(pathname);
          router.push(`/hub/login?returnUrl=${returnUrl}`);
          return;
        }

        setUser(currentUser);

        // Check for existing profile
        let userProfile = await getHubProfile(currentUser.id);

        // If no profile exists, create one
        if (!userProfile) {
          userProfile = await createHubProfile(currentUser.id, {
            display_name: currentUser.user_metadata?.full_name || null,
          });
        }

        setProfile(userProfile);

        // Check if onboarding is complete
        // Redirect to onboarding if not completed and not already on an excluded route
        if (userProfile && !userProfile.onboarding_completed && !skipOnboardingCheck) {
          router.push('/hub/onboarding');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname, router, isPublicRoute, skipOnboardingCheck]);

  // Show loading state
  if (isLoading && !isPublicRoute) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"
            style={{ backgroundColor: '#E8B84B' }}
          />
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Loading your Hub...
          </p>
        </div>
      </div>
    );
  }

  // For public routes, render without provider wrapper
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Render with context provider
  return (
    <HubProvider user={user} profile={profile} isLoading={isLoading}>
      {children}
    </HubProvider>
  );
}
