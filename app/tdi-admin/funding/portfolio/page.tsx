import { redirect } from 'next/navigation';

/**
 * The Portfolio page was folded into the main funding page on 19 Aug 2026.
 *
 * It read the same /api/funding/dashboard the main page reads, so "All Pursuits"
 * and the main school list were two renderings of one dataset. Having two
 * overview pages meant every question started with choosing which one to open.
 *
 * The one thing here that existed nowhere else, Impact Evidence, moved to
 * app/tdi-admin/funding/components/ImpactEvidence.tsx and now sits at the
 * bottom of the main page, collapsed.
 *
 * Kept as a redirect because it was linked from inside the portal for months.
 */
export default function PortfolioRedirect() {
  redirect('/tdi-admin/funding');
}
