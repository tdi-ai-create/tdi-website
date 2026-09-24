import { redirect } from 'next/navigation';

/**
 * The board was folded into Funding Home on 24 September 2026.
 *
 * Everything it held is now a view there: the pipeline is Work, the Outreach
 * Queue is Queue, and Funders and Awarded kept their names. The one thing that
 * existed only here, the Impact Evidence panel, is gone rather than moved: it
 * was reference metrics for writing an application, and agents write the
 * applications.
 *
 * Kept as a redirect rather than deleted because it was the funding portal for
 * months and people will have it bookmarked.
 */
export default function BoardRedirect() {
  redirect('/tdi-admin/funding');
}
