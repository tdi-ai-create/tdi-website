'use client';

import Link from 'next/link';
import Image from 'next/image';
import AvatarDisplay from './AvatarDisplay';
import type { HubProfile } from '@/lib/hub-auth';

interface HubAdminNavBarProps {
  profile: HubProfile | null;
  userEmail?: string;
}

export default function HubAdminNavBar({ profile, userEmail }: HubAdminNavBarProps) {
  const firstName = profile?.display_name?.split(' ')[0] || userEmail?.split('@')[0] || 'Admin';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 h-[60px] flex items-center px-4 md:px-6"
      style={{ backgroundColor: '#2B3A67' }}
    >
      {/* Logo + Learning Hub Label */}
      <Link
        href="/hub/admin"
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

      {/* Center - Admin Dashboard Title */}
      <div className="flex-1 flex justify-center">
        <span
          className="text-white font-semibold"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
          }}
        >
          Admin Dashboard
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* View as Teacher link */}
        <Link
          href="/hub"
          className="hidden sm:inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          View as Teacher
        </Link>

        {/* User Avatar and Name */}
        <div className="flex items-center gap-2">
          <AvatarDisplay
            size={32}
            avatarId={profile?.avatar_id}
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
          />
          <span
            className="hidden sm:block text-white text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {firstName}
          </span>
        </div>
      </div>
    </nav>
  );
}
