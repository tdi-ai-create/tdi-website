'use client';

import { useEffect, useRef } from 'react';
import FrameworkHero from './components/FrameworkHero';
import MovementPath from './components/MovementPath';
import TDIPhases from './components/TDIPhases';
import ToolsGrid from './components/ToolsGrid';

// GA4 event helper
const sendGAEvent = (eventName: string, params: Record<string, string | number>) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', eventName, params);
  }
};

export default function PDFrameworkPage() {
  const scrollDepthsTracked = useRef<Set<number>>(new Set());

  // Track page view
  useEffect(() => {
    sendGAEvent('framework_page_view', {
      page_title: 'PD Framework',
      page_location: window.location.href,
    });
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !scrollDepthsTracked.current.has(milestone)) {
          scrollDepthsTracked.current.add(milestone);
          sendGAEvent('scroll_depth', {
            percent_scrolled: milestone,
            page: 'pd_framework',
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track CTA clicks
  const handleCtaClick = (ctaName: string, ctaLocation: string) => {
    sendGAEvent('cta_click', {
      cta_name: ctaName,
      cta_location: ctaLocation,
      page: 'pd_framework',
    });
  };

  // Track tool clicks
  const handleToolClick = (toolName: string) => {
    sendGAEvent('tool_card_click', {
      tool_name: toolName,
      page: 'pd_framework',
    });
  };

  // Track funding callout click
  const handleFundingClick = () => {
    sendGAEvent('funding_callout_click', {
      page: 'pd_framework',
    });
  };

  return (
    <main className="min-h-screen">
      {/* Section 1: Minimal Header */}
      <FrameworkHero onCtaClick={handleCtaClick} />

      {/* Section 2: Movement Path (LEAD WITH THIS) */}
      <MovementPath />

      {/* Section 3: How TDI Helps You Move */}
      <TDIPhases onCtaClick={handleCtaClick} onFundingClick={handleFundingClick} />

      {/* Section 4: Tools to Help You */}
      <ToolsGrid onToolClick={handleToolClick} />
    </main>
  );
}
