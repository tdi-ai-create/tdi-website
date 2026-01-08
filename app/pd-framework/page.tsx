'use client';

import { useEffect } from 'react';
import PDQuadrant from '../pd-diagnostic/components/PDQuadrant';
import FrameworkHero from './components/FrameworkHero';
import QuadrantDeepDive from './components/QuadrantDeepDive';
import MovementPath from './components/MovementPath';
import TDIPhases from './components/TDIPhases';
import ToolsGrid from './components/ToolsGrid';
import LeadCapture from './components/LeadCapture';
import FinalCTA from './components/FinalCTA';

// Map quadrant IDs to section IDs for scrolling
const quadrantToSectionId: Record<string, string> = {
  A: 'compliance',
  B: 'inspiration',
  C: 'fragmented',
  D: 'embedded',
};

// GA4 event helper
const sendGAEvent = (eventName: string, params: Record<string, string>) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', eventName, params);
  }
};

export default function PDFrameworkPage() {
  // Track page view
  useEffect(() => {
    sendGAEvent('page_view', {
      page_title: 'PD Framework',
      page_location: window.location.href,
    });
  }, []);

  // Handle quadrant selection - scroll to deep dive section
  const handleQuadrantSelect = (quadrantId: string) => {
    const sectionId = quadrantToSectionId[quadrantId];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      sendGAEvent('quadrant_click', {
        quadrant_id: quadrantId,
        location: 'framework_visual',
      });
    }
  };

  // Track CTA clicks
  const handleCtaClick = (ctaName: string, ctaLocation: string) => {
    sendGAEvent('cta_click', {
      cta_name: ctaName,
      cta_location: ctaLocation,
      page: 'pd_framework',
    });
  };

  // Track section expansion
  const handleSectionExpand = (sectionId: string) => {
    sendGAEvent('section_expand', {
      section_id: sectionId,
      page: 'pd_framework',
    });
  };

  // Track tool clicks
  const handleToolClick = (toolName: string) => {
    sendGAEvent('tool_click', {
      tool_name: toolName,
      location: 'tools_grid',
      page: 'pd_framework',
    });
  };

  // Track lead capture submission
  const handleLeadSubmit = (email: string, quadrant: string) => {
    sendGAEvent('lead_capture', {
      quadrant_selected: quadrant,
      location: 'framework_page',
    });
    // Note: In production, this would also submit to your email service
    console.log('Lead captured:', { email, quadrant });
  };

  return (
    <main className="min-h-screen">
      {/* Section 1: Hero */}
      <FrameworkHero onCtaClick={handleCtaClick} />

      {/* Section 2: Interactive Framework Visual */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
              The Four Types of PD
            </h2>
            <p className="text-center text-lg mb-8" style={{ color: '#1e2749', opacity: 0.7 }}>
              Click any quadrant to learn more about it.
            </p>

            <div className="bg-slate-50 rounded-3xl p-6 md:p-10">
              <PDQuadrant
                interactive={true}
                onSelect={handleQuadrantSelect}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Deep Dive Sections */}
      <QuadrantDeepDive onSectionExpand={handleSectionExpand} />

      {/* Section 4: Movement Path */}
      <MovementPath />

      {/* Section 5: How TDI Helps You Move */}
      <TDIPhases onCtaClick={handleCtaClick} />

      {/* Section 6: Tools to Help You */}
      <ToolsGrid onToolClick={handleToolClick} />

      {/* Section 7: Lead Capture */}
      <LeadCapture onSubmit={handleLeadSubmit} />

      {/* Section 8: Final CTA */}
      <FinalCTA onCtaClick={handleCtaClick} />
    </main>
  );
}
