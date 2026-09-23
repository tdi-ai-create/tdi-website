/**
 * What a contracted service is called when a school reads it.
 *
 * Contract line labels are written for us, not for them, and they carry things
 * a client should never be shown: "(50% off)", "(legacy pricing, 40% off)",
 * "discount recovery", "Base Contract". Putting a planned date on a partner
 * dashboard means putting its label there too, so the label has to be built
 * from the service type rather than copied from the contract.
 *
 * This is deliberately a small closed list. A service type nobody has named
 * here falls back to a plain phrase rather than leaking the raw label.
 */

const NAMES: Record<string, string> = {
  observation: 'In-Person Observation Day',
  virtual_session: 'Virtual Strategy Session',
  executive_session: 'Executive Impact Session',
  pd_day: 'Professional Development Day',
  hub_membership: 'Learning Hub Access',
  book: 'TDI Books',
  custom: 'Partnership Session',
};

export function clientFacingServiceName(
  serviceType: string,
  sequenceNumber?: number | null,
  sequenceTotal?: number | null,
): string {
  const base = NAMES[serviceType] ?? 'Partnership Session';
  // "(2 of 2)" only helps when there is more than one, and only when we are
  // confident which one this is.
  if (sequenceTotal && sequenceTotal > 1 && sequenceNumber) {
    return `${base} (${sequenceNumber} of ${sequenceTotal})`;
  }
  return base;
}

/**
 * Held dates are on a school's dashboard because Rae asked for every client to
 * see their dates. The wording has to carry that they are not agreed, or the
 * dashboard turns a pencilled date into a commitment the school will plan
 * around and we never made.
 */
export function plannedDateNote(confidence: string | null): string {
  return confidence === 'held'
    ? 'This date is provisional. It is held so it does not get taken, and can move to suit you.'
    : 'Confirmed with your team.';
}
