/**
 * contract_deliverables.delivery_status held delivery and money in one column
 * (pending / pending_funding / invoiced / paid), so "we did the work and have not
 * billed it" was not a state the database could express. That is why a
 * Ready-to-bill queue could not exist and why no screen could say where a client stood.
 *
 * It is split into three independent facts:
 *   delivery_state  did the work happen
 *   billing_state   did we invoice, did they pay
 *   funding_hold    is it waiting on a grant
 *
 * Until every read is flipped over, both shapes are written together. Every write
 * goes through a helper here so a route cannot update one and forget the other.
 * Callers spread the result into their existing update/insert payload.
 */

export type DeliveryState = 'scheduled' | 'delivered' | 'cancelled';
export type BillingState = 'not_billed' | 'invoiced' | 'paid' | 'written_off';

/** The work happened. Says nothing about money. */
export function asDelivered() {
  return { delivery_status: 'delivered', delivery_state: 'delivered' as DeliveryState };
}

/** It is on an invoice. Says nothing about whether the work happened. */
export function asInvoiced() {
  return { delivery_status: 'invoiced', billing_state: 'invoiced' as BillingState };
}

/** They paid. */
export function asPaid() {
  return { delivery_status: 'paid', billing_state: 'paid' as BillingState };
}

/** Back to billable, e.g. an invoice was voided. */
export function asNotBilled() {
  return { delivery_status: 'pending', billing_state: 'not_billed' as BillingState };
}

/** A grant landed, so the line is billable again. The hold was never a delivery state. */
export function asReleasedFromFunding() {
  return { delivery_status: 'pending', funding_hold: false };
}

/** A new line from a signed contract. */
export function asNewLine(waitingOnFunding: boolean) {
  return {
    delivery_status: waitingOnFunding ? 'pending_funding' : 'pending',
    delivery_state: 'scheduled' as DeliveryState,
    billing_state: 'not_billed' as BillingState,
    funding_hold: waitingOnFunding,
  };
}

/**
 * Map a legacy delivery_status coming from an older caller onto the new columns,
 * so a route that still speaks the old vocabulary keeps both shapes in step.
 */
export function fromLegacyStatus(status: string) {
  switch (status) {
    case 'delivered': return asDelivered();
    case 'invoiced': return asInvoiced();
    case 'paid': return asPaid();
    case 'cancelled':
      return { delivery_status: 'cancelled', delivery_state: 'cancelled' as DeliveryState };
    case 'pending_funding':
      return { delivery_status: 'pending_funding', billing_state: 'not_billed' as BillingState, funding_hold: true };
    case 'pending':
    case 'scheduled':
      return { delivery_status: 'pending', delivery_state: 'scheduled' as DeliveryState, billing_state: 'not_billed' as BillingState };
    default:
      return { delivery_status: status };
  }
}

/** A line is ready to bill when the work is done, it is unbilled, and no grant is holding it. */
export const READY_TO_BILL = {
  delivery_state: 'delivered' as DeliveryState,
  billing_state: 'not_billed' as BillingState,
  funding_hold: false,
};
