/**
 * Who gets the invoice.
 *
 * A school's billing contact is rarely the person who signed the contract. In
 * K-12 the signer is a principal or superintendent and the payer is a business
 * office. Before this existed, invoices went to whoever signed, and correcting
 * it depended on someone at TDI hearing about it on a call.
 *
 * Every read falls back to the old behaviour, so a partnership with no billing
 * contact set behaves exactly as it did before.
 */

export type BillingContactSource = 'onboarding' | 'school' | 'tdi';

export interface PartnershipContactFields {
  contact_name?: string | null;
  contact_email?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  billing_contact_name?: string | null;
  billing_contact_email?: string | null;
  billing_contact_title?: string | null;
  billing_contact_source?: string | null;
  org_name?: string | null;
}

export interface ResolvedBillingContact {
  email: string | null;
  name: string | null;
  title: string | null;
  /** true when we are falling back to the signer because no billing contact is set */
  isFallback: boolean;
  source: string | null;
}

/**
 * Resolve where a billing email should go.
 *
 * Order: an explicit billing contact, then the partnership's primary contact,
 * then its original contact. `isFallback` tells the caller whether we actually
 * know who handles invoicing or are merely guessing, which is what decides
 * whether the "tell us who is" prompt appears.
 */
export function resolveBillingContact(
  p: PartnershipContactFields | null | undefined
): ResolvedBillingContact {
  if (!p) {
    return { email: null, name: null, title: null, isFallback: true, source: null };
  }

  const billing = p.billing_contact_email?.trim();
  if (billing) {
    return {
      email: billing,
      name: p.billing_contact_name?.trim() || null,
      title: p.billing_contact_title?.trim() || null,
      isFallback: false,
      source: p.billing_contact_source || null,
    };
  }

  const fallbackEmail =
    p.primary_contact_email?.trim() || p.contact_email?.trim() || null;
  const fallbackName =
    p.primary_contact_name?.trim() || p.contact_name?.trim() || null;

  return {
    email: fallbackEmail,
    name: fallbackName,
    title: null,
    isFallback: true,
    source: null,
  };
}

/** First name only, for greetings. Falls back to a neutral word, never to an empty string. */
export function greetingName(name: string | null | undefined): string {
  return (name || '').trim().split(/\s+/)[0] || 'there';
}

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://www.teachersdeserveit.com';

export function billingContactUrl(billingToken: string): string {
  return `${SITE}/billing-contact/${billingToken}`;
}

/**
 * The line that appears at the bottom of every billing email.
 *
 * This is the whole mechanism for keeping the record true. Nobody at TDI has to
 * chase it, and the school spends about ten seconds. The wording differs when we
 * are guessing, because "not the right person?" reads as an accusation to
 * somebody who IS the right person.
 */
export function billingContactFooterHtml(
  billingToken: string | null | undefined,
  isFallback: boolean
): string {
  if (!billingToken) return '';
  const url = billingContactUrl(billingToken);
  const prompt = isFallback
    ? 'Should invoices go to someone else, like your business office?'
    : 'Not the right person for billing?';
  return `
    <p style="color:#6b7280;font-size:13px;margin:24px 0 0;">
      ${prompt}
      <a href="${url}" style="color:#B8860B;font-weight:600;">Tell us who is.</a>
      It takes about ten seconds and only changes where invoices go.
    </p>`;
}

export function billingContactFooterText(
  billingToken: string | null | undefined,
  isFallback: boolean
): string {
  if (!billingToken) return '';
  const prompt = isFallback
    ? 'Should invoices go to someone else, like your business office?'
    : 'Not the right person for billing?';
  return `\n\n${prompt} Tell us who is: ${billingContactUrl(billingToken)}\nIt takes about ten seconds and only changes where invoices go.`;
}
