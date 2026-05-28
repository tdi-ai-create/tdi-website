/**
 * Gift Element Copy
 *
 * Approved copy for the Gift mechanic -- a 24-hour All-Access trial pass.
 * Five states with distinct messaging.
 */

export const GIFT_COPY = {
  /** State 1: Eligible, plenty of time */
  eligible: {
    label: 'A gift is waiting',
    expandedTitle: 'Your 24-Hour All-Access Pass',
    expandedDescription:
      'One full day of everything TDI has to offer. Every course, every resource, every tool -- unlocked. No credit card. No strings. Just a thank-you for being here.',
    claimButton: 'Open my gift',
  },

  /** State 2: Eligible, last week before deadline */
  urgent: {
    label: (daysLeft: number) =>
      daysLeft === 1 ? '1 day left' : `${daysLeft} days left`,
    expandedTitle: 'Your gift expires soon',
    expandedDescription:
      'Your 24-hour All-Access pass is still here, but the window is closing. Claim it before it is gone.',
    claimButton: 'Open my gift',
  },

  /** State 3: Trial active (24-hour window) */
  active: {
    label: (hoursLeft: number) =>
      `All-Access \u00B7 ${hoursLeft} hrs left`,
    title: 'Your All-Access pass is live',
    description:
      'You have full access to everything. Explore courses, download resources, go deep. This is your day.',
  },

  /** State 4: Claimed (trial used) */
  claimed: {
    label: (claimedDate: string) => `Claimed ${claimedDate}`,
    description: 'You used your gift. Hope it was worth it.',
  },
} as const;
