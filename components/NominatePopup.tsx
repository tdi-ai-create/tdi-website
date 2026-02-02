'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';

const STORAGE_KEY = 'tdi_nominate_popup_dismissed';
const EXPIRY_DATE = new Date('2026-08-01');
const DISMISS_DURATION_DAYS = 21;
const ALLOWED_PATHS = ['/', '/for-schools', '/how-we-partner', '/about'];

export function NominatePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasTriggeredRef = useRef(false);
  const pathname = usePathname();

  // Check if current date is past expiry
  const isExpired = new Date() >= EXPIRY_DATE;

  // Check if current path is allowed
  const isAllowedPath = ALLOWED_PATHS.includes(pathname || '');

  useEffect(() => {
    // Don't show if expired or not on allowed path
    if (isExpired || !isAllowedPath) return;

    // Check localStorage for previous dismissal
    const dismissedTimestamp = localStorage.getItem(STORAGE_KEY);
    if (dismissedTimestamp) {
      const dismissedDate = new Date(parseInt(dismissedTimestamp, 10));
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
        return; // Still within the 21-day cooldown
      }
    }

    const showPopup = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      setIsAnimating(true);
      setIsVisible(true);

      // GA4 tracking - popup shown
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'nominate_popup_shown', { page: pathname });
      }
    };

    // Time trigger - 30 seconds
    const timer = setTimeout(showPopup, 30000);

    // Scroll trigger - 50% of page
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50) {
        showPopup();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isExpired, isAllowedPath, pathname]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }, 300); // Wait for fade out animation
  };

  const handleButtonClick = () => {
    // GA4 tracking - button clicked
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_popup_clicked', { page: pathname });
    }
    handleDismiss();
  };

  // Don't render anything if expired, not allowed path, or not visible
  if (isExpired || !isAllowedPath || !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-[480px] w-full mx-4 p-8 max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* NEW badge */}
          <span
            className="inline-block text-xs font-semibold uppercase px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: 'rgba(255, 186, 6, 0.15)', color: '#b8860b' }}
          >
            NEW
          </span>

          {/* Heading */}
          <h2
            className="text-xl lg:text-2xl font-bold mb-3"
            style={{ color: '#1B2A4A' }}
          >
            Know a School<br />
            That Deserves<br />
            Better PD?
          </h2>

          {/* Body text */}
          <p className="text-sm lg:text-base text-gray-600 leading-relaxed mb-6">
            Nominate a school for a TDI partnership. If they join, we give you a budget to celebrate your entire teaching staff - dinner, gift cards, swag, the works.
          </p>

          {/* Primary CTA button */}
          <Link
            href="/nominate"
            onClick={handleButtonClick}
            className="block w-full py-3 rounded-full font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#ffba06' }}
          >
            Nominate a School
          </Link>

          {/* Dismiss text */}
          <button
            onClick={handleDismiss}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
