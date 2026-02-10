'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Heart } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import type { HubProfile } from '@/lib/hub-auth';

interface NavItem {
  href: string;
  label: string;
  exact: boolean;
}

interface HubMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  profile: HubProfile | null;
  userEmail?: string;
  navItems: NavItem[];
  onMomentMode: () => void;
}

export default function HubMobileNav({
  isOpen,
  onClose,
  profile,
  userEmail,
  navItems,
  onMomentMode,
}: HubMobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const firstName = profile?.display_name?.split(' ')[0] || userEmail?.split('@')[0] || 'Teacher';

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 animate-slide-in-right"
      style={{ backgroundColor: '#2B3A67' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Close menu"
      >
        <X size={24} />
      </button>

      {/* User Info */}
      <div className="pt-16 px-6 pb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <AvatarDisplay
            size={48}
            avatarId={profile?.avatar_id}
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
          />
          <div>
            <p
              className="text-white text-lg font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {firstName}
            </p>
            {userEmail && (
              <p
                className="text-white/60 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {userEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="px-4 py-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`block py-4 px-4 text-lg rounded-lg transition-colors ${
              isActive(item.href, item.exact)
                ? 'bg-white/10 text-white'
                : 'text-white/80 hover:bg-white/5 hover:text-white'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {item.label}
            {isActive(item.href, item.exact) && (
              <span
                className="ml-2 inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: '#E8B84B' }}
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Moment Mode Button - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
        <button
          onClick={onMomentMode}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Heart size={20} />
          I need a moment
        </button>
      </div>
    </div>
  );
}
