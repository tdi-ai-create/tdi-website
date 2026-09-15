// ---------------------------------------------------------------------------
// Who the funding follow-up cron is allowed to email.
//
// This list is the only thing standing between a scheduled job and a school's
// inbox. Anything addressed to someone not on it is saved as a draft for Bella
// instead of being sent, which is the rule Rae confirmed on 15 September: every
// grant package goes to a school because Bella opened it and pressed send.
//
// It lived as a const inside the cron, where adding one address or flipping one
// boolean would have started sending to schools with nothing to notice. Moved
// here so a guard can hold it, because "we all know not to do that" is the same
// kind of protection as a comment.
// ---------------------------------------------------------------------------

/** Our own domain. Everything on the list has to be inside it. */
export const TDI_DOMAIN = 'teachersdeserveit.com';

/**
 * Off would mean the cron emails whoever an item names, including schools.
 * There is no supported reason to turn this off; a real send goes through
 * send-to-client or the outreach queue, where a person presses the button.
 */
export const ALLOWLIST_ENABLED = true;

export const SEND_ALLOWLIST: string[] = [
  'rae@teachersdeserveit.com',
  'hello@teachersdeserveit.com',
  'bella@teachersdeserveit.com',
];

export function isOnAllowlist(email: string): boolean {
  return SEND_ALLOWLIST.some((a) => a.toLowerCase() === String(email ?? '').toLowerCase());
}

export interface AllowlistProblem {
  entry: string;
  why: string;
}

/**
 * Everything wrong with the list as it stands.
 *
 * Returns problems rather than throwing, so a guard can name them and a caller
 * can log them without taking a cron down mid-run.
 */
export function allowlistProblems(
  list: string[] = SEND_ALLOWLIST,
  enabled: boolean = ALLOWLIST_ENABLED,
): AllowlistProblem[] {
  const problems: AllowlistProblem[] = [];

  if (!enabled) {
    problems.push({
      entry: 'ALLOWLIST_ENABLED',
      why: 'Turned off, so this cron would email schools directly instead of drafting for Bella.',
    });
  }

  if (list.length === 0) {
    problems.push({ entry: '(empty)', why: 'An empty list is not a safe list, it is an unread one.' });
  }

  for (const raw of list) {
    const entry = String(raw ?? '').trim().toLowerCase();

    if (!entry.includes('@')) {
      problems.push({ entry: raw, why: 'Not an email address.' });
      continue;
    }
    // A wildcard or a bare domain would let anything through.
    if (entry.startsWith('@') || entry.includes('*')) {
      problems.push({ entry: raw, why: 'A pattern rather than a person. Every entry must be one address.' });
      continue;
    }
    if (!entry.endsWith(`@${TDI_DOMAIN}`)) {
      problems.push({
        entry: raw,
        why: `Outside ${TDI_DOMAIN}. A scheduled job may only email us. Anything for a school is drafted for Bella and sent by her.`,
      });
    }
  }

  return problems;
}
