/**
 * Where the marketing popup is allowed to appear.
 *
 * There used to be four popups, each carrying its own exclusion array. The four
 * arrays had drifted: /get-started was excluded from two of them and not the
 * other two, so a teacher part-way through the free PD plan form could still be
 * interrupted. Roughly half of every list also duplicated rules that
 * MainSiteWrapper already applies upstream.
 *
 * There is now one popup and one list. Add a page here, not in four files.
 *
 * Note: MainSiteWrapper already returns null on /hub, /tdi-admin, /admin,
 * /login, /creator-portal, /partners/, /invoice and any *-dashboard route, so
 * those do not need repeating here.
 */
export const POPUP_BLOCKED_PATHS = [
  // Decision pages. Someone reading what this costs is not interrupted.
  '/for-schools',
  '/join',
  '/love-notes',
  // Forms in progress.
  '/get-started',
  // Somewhere they are already being sold something.
  '/swag',
] as const;

export function isPopupBlocked(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return POPUP_BLOCKED_PATHS.some((path) => pathname.startsWith(path));
}
