import { redirect } from 'next/navigation';

/**
 * My Growth moved inside Achievements on 18 Aug 2026.
 *
 * This route is kept as a redirect rather than deleted, because it was a
 * top-level nav item for months and members will have it bookmarked. The
 * ?view=growth param puts them on the panel they were actually asking for.
 */
export default function TransformationRedirect() {
  redirect('/hub/certificates?view=growth');
}
