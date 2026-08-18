/**
 * Reduce an address to the mailbox it actually delivers to.
 *
 * Kristin signed in as team+tdi@whatwilllast.com and was refused, because the
 * team table holds team@whatwilllast.com and every lookup compared the raw
 * string. She had just been told her access was fixed, so the wall she hit
 * looked like the same bug rather than a new one. Her alias was a Supabase
 * account created that day, so neither the user_id nor the email matched.
 *
 * Treating a plus tag as equivalent is not a way in for anyone new. A plus
 * address is delivered by the same mailbox as its base, so whoever receives at
 * team+tdi@ already receives at team@, and already had access. The one case
 * where that reasoning fails is a mail host that treats the tag as a distinct
 * mailbox, which requires being able to create mailboxes on a domain we already
 * trust, and anyone who can do that is that domain's administrator.
 *
 * Deliberately narrow: this only ever collapses a plus tag. It does not strip
 * dots, lowercase-fold domains beyond a plain lowercase, or apply any other
 * provider-specific rule, because those are true of some hosts and false of
 * others and guessing wrong silently widens who counts as staff.
 */
export function canonicalEmail(email: string | null | undefined): string {
  if (!email) return '';
  const trimmed = email.toLowerCase().trim();

  const at = trimmed.lastIndexOf('@');
  if (at < 1) return trimmed;

  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!domain) return trimmed;

  const plus = local.indexOf('+');
  // plus > 0 rather than >= 0: "+tag@host" has no base mailbox to fall back to,
  // and collapsing it would produce "@host" and match far too much.
  if (plus > 0) return `${local.slice(0, plus)}@${domain}`;

  return trimmed;
}

/**
 * The addresses a sign-in should be matched against: what they typed, and the
 * mailbox it resolves to. Ordered, deduped, safe to hand to an IN clause.
 */
export function emailMatchSet(email: string | null | undefined): string[] {
  const raw = (email ?? '').toLowerCase().trim();
  if (!raw) return [];
  const canonical = canonicalEmail(raw);
  return canonical && canonical !== raw ? [raw, canonical] : [raw];
}
