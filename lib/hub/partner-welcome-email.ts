/**
 * The welcome email a partner's staff get when their Hub access goes live.
 *
 * This exists because no Hub welcome email ever existed. On 30 September 2026
 * `hub_email_sent_log` held 99 rows for the entire Hub across every client, and
 * not one of them was a welcome. Addison's 147 paras had held live all_access
 * seats since July and had never been told the Hub was theirs.
 *
 * Deliberately not client specific. The cohort, the subject and the three
 * featured items are all arguments, so the next school is a different call
 * rather than a different file.
 *
 * No credentials are ever placed in this email. `/hub/login` has magicLink
 * enabled, so the instruction is to sign in with a work email and take the
 * emailed link. We do not hold most staff passwords and would not send them if
 * we did.
 */

export interface WelcomeFeature {
  /** Absolute URL. Verified reachable before it goes in an email. */
  href: string;
  title: string;
  blurb: string;
}

export interface WelcomeEmailInput {
  /** Omitted entirely when we do not know it. See the greeting note below. */
  firstName?: string | null;
  /** Plain language, client facing. Never the contract label. */
  accessThrough: string;
  features: WelcomeFeature[];
}

const NAVY = '#1e2749';
const GOLD = '#E8B84B';
const LIGHT_BLUE = '#E8F0FD';
const BLUE = '#80a4ed';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The greeting drops the name rather than rendering an empty slot.
 *
 * 11 of Addison's 147 paras have no first name in either the Hub or the roster,
 * so a template that always interpolates would have sent 11 people a headline
 * ending in a comma and a space. Guessing a first name from the email prefix
 * was the other option and it produces things like "Balecksen", which is worse
 * than no name at all.
 */
export function welcomeGreeting(firstName?: string | null): string {
  const trimmed = (firstName || '').trim();
  if (!trimmed) return 'Your Learning Hub access is live';
  return `Your Learning Hub access is live, ${escapeHtml(trimmed)}`;
}

export function renderPartnerWelcomeEmail(input: WelcomeEmailInput): string {
  const featureBlocks = input.features
    .map(
      f => `
    <div style="border-left: 3px solid ${BLUE}; padding: 2px 0 2px 16px; margin-bottom: 20px;">
      <a href="${escapeHtml(f.href)}" style="font-size: 16px; font-weight: 700; color: ${NAVY}; text-decoration: none;">
        ${escapeHtml(f.title)}
      </a>
      <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 6px 0 0;">
        ${escapeHtml(f.blurb)}
      </p>
    </div>`
    )
    .join('');

  return `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: ${NAVY};">

  <div style="padding: 36px 30px 8px;">
    <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 16px; color: ${NAVY};">
      ${welcomeGreeting(input.firstName)}
    </h1>
    <p style="font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 14px;">
      Your district set you up with full access to the TDI Learning Hub through
      ${escapeHtml(input.accessThrough)}. Your account is already created and waiting for
      you. There is nothing to buy and nothing to set up.
    </p>
  </div>

  <div style="background: ${LIGHT_BLUE}; border-radius: 16px; padding: 26px; margin: 12px 30px 28px;">
    <h2 style="font-size: 17px; font-weight: 700; color: ${NAVY}; margin: 0 0 12px;">Signing in takes about ten seconds</h2>
    <p style="font-size: 15px; line-height: 1.7; color: #4a5568; margin: 0 0 18px;">
      Go to the sign in page, type your work email, and choose the option to have a
      sign in link emailed to you. No password to create, and none to remember.
    </p>
    <div style="text-align: center;">
      <a href="https://www.teachersdeserveit.com/hub/login" style="display: inline-block; background: ${GOLD}; color: ${NAVY}; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px;">
        Sign in to the Hub
      </a>
    </div>
  </div>

  <div style="padding: 0 30px;">
    <h2 style="font-size: 17px; font-weight: 700; color: ${NAVY}; margin: 0 0 6px;">Three places to start</h2>
    <p style="font-size: 15px; line-height: 1.7; color: #4a5568; margin: 0 0 20px;">
      These were built for paraprofessionals, not adapted from something written for teachers.
    </p>
${featureBlocks}
    <p style="font-size: 15px; line-height: 1.7; color: #4a5568; margin: 0 0 26px;">
      Everything else on the Hub is open to you as well, and you can look around by what
      you need rather than by your job title.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 22px; margin-bottom: 34px;">
      <p style="font-size: 14px; line-height: 1.7; color: #718096; margin: 0 0 8px;">
        If the sign in link does not arrive or something looks wrong, reply to this email
        and we will fix it for you.
      </p>
      <p style="font-size: 14px; color: ${NAVY}; font-weight: 600; margin: 0;">
        The Teachers Deserve It Team
      </p>
    </div>
  </div>

</div>`;
}
