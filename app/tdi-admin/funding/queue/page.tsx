import { redirect } from 'next/navigation';

/**
 * The Work Queue was folded into the main funding page on 19 Aug 2026.
 *
 * It was the largest page in the funding portal at 717 lines, and it fetched
 * the same /api/funding/queue that the main page already reads. Its one real
 * contribution was letting a person ask "what is waiting on us" without reading
 * every school. That is a filter, and it now lives on the main page as one.
 *
 * Kept as a redirect rather than deleted because it was linked from inside the
 * portal for months and people will have it bookmarked.
 */
export default function QueueRedirect() {
  redirect('/tdi-admin/funding');
}
