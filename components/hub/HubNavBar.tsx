'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Heart, Shield, Building } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import HubMobileNav from './HubMobileNav';
import MomentMode from './MomentMode';
import { checkTrackerEligibility } from '@/lib/hub/transformation';
import { isAdmin } from '@/lib/hub/admin';
import { isChampion } from '@/lib/hub/champion';
import type { HubProfile } from '@/lib/hub-auth';

interface HubNavBarProps {
  profile: HubProfile | null;
  userEmail?: string;
  userId?: string;
}

interface NavItem {
  href: string;
  label: string;
  exact: boolean;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { href: '/hub', label: 'Dashboard', exact: true },
  { href: '/hub/courses', label: 'Courses', exact: false },
  { href: '/hub/quick-wins', label: 'Quick Wins', exact: false },
  { href: '/hub/certificates', label: 'Certificates', exact: false },
  { href: '/hub/settings', label: 'Settings', exact: false },
];

export default function HubNavBar({ profile, userEmail, userId }: HubNavBarProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [momentModeOpen, setMomentModeOpen] = useState(false);
  const [trackerEligible, setTrackerEligible] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isUserChampion, setIsUserChampion] = useState(false);

  // Check tracker eligibility, admin status, and champion status
  useEffect(() => {
    async function checkUserStatus() {
      if (!userId) return;
      try {
        const [trackerResult, adminResult, championResult] = await Promise.all([
          checkTrackerEligibility(userId),
          isAdmin(userId, userEmail),
          isChampion(userId),
        ]);
        setTrackerEligible(trackerResult.isEligible);
        setIsUserAdmin(adminResult);
        setIsUserChampion(championResult);
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    }
    checkUserStatus();
  }, [userId, userEmail]);

  // Build nav items with conditional "My Growth", "School", and "Admin"
  const navItems = useMemo(() => {
    const items = [...BASE_NAV_ITEMS];
    if (trackerEligible) {
      // Insert "My Growth" after Dashboard
      items.splice(1, 0, { href: '/hub/transformation', label: 'My Growth', exact: false });
    }
    if (isUserChampion) {
      // Add "School" after Settings
      items.push({ href: '/hub/champion', label: 'School', exact: false });
    }
    if (isUserAdmin) {
      // Add "Admin" at the end (after Settings/School)
      items.push({ href: '/hub/admin', label: 'Admin', exact: false });
    }
    return items;
  }, [trackerEligible, isUserChampion, isUserAdmin]);

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const firstName = profile?.display_name?.split(' ')[0] || userEmail?.split('@')[0] || 'Teacher';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 h-[60px] flex items-center px-4 md:px-6"
        style={{ backgroundColor: '#2B3A67' }}
      >
        {/* Logo + Learning Hub Label */}
        <Link
          href="/hub"
          className="flex-shrink-0 flex items-center"
        >
          <Image
            src="/images/logo.webp"
            alt="Teachers Deserve It"
            width={160}
            height={48}
            className="h-9 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
            priority
          />
          {/* Divider */}
          <div
            className="hidden min-[400px]:block"
            style={{
              width: '1px',
              height: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              margin: '0 12px',
            }}
          />
          {/* Learning Hub Label */}
          <span
            className="hidden min-[400px]:block"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#E8B84B',
              letterSpacing: '0.1em',
            }}
          >
            LEARNING HUB
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center justify-center flex-1 gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const isAdminLink = item.href === '/hub/admin';
            const isSchoolLink = item.href === '/hub/champion';
            return (
              <Link
                key={item.href}
                href={item.href}
                className="hub-nav-link"
                style={{
                  color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                  borderBottomColor: active ? '#E8B84B' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                {isSchoolLink && <Building size={14} />}
                {isAdminLink && <Shield size={14} />}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {/* I need a moment button */}
          <button
            onClick={() => setMomentModeOpen(true)}
            className="hub-btn-ghost text-sm"
          >
            I need a moment
          </button>

          {/* User Avatar and Name */}
          <Link href="/hub/settings/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <AvatarDisplay
              size={32}
              avatarId={profile?.avatar_id}
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
            />
            <span
              className="text-white text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {firstName}
            </span>
          </Link>
        </div>

        {/* Mobile Right Side */}
        <div className="flex md:hidden items-center gap-3 ml-auto">
          {/* Moment Mode Icon */}
          <button
            onClick={() => setMomentModeOpen(true)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="I need a moment"
          >
            <Heart size={20} />
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 text-white"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <HubMobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        profile={profile}
        userEmail={userEmail}
        navItems={navItems}
        onMomentMode={() => {
          setMobileNavOpen(false);
          setMomentModeOpen(true);
        }}
      />

      {/* Moment Mode Overlay */}
      <MomentMode
        isOpen={momentModeOpen}
        onClose={() => setMomentModeOpen(false)}
      />
    </>
  );
}
