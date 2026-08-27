/**
 * Three independent facts about a contract line:
 *   delivery_state  did the work happen
 *   billing_state   did we invoice, did they pay
 *   funding_hold    is it waiting on a grant
 *
 * These used to be one column, delivery_status, which meant "we did the work and have
 * not billed it" was not a state the database could express. Nothing reads that column
 * any more and nothing writes it. It is kept on the table for one more release as a
 * fallback, then dropped.
 *
 * Every write goes through a helper here, so a route cannot update one fact and forget
 * another. Callers spread the result into their existing update or insert payload.
 */

export type DeliveryState = 'scheduled' | 'delivered' | 'cancelled';
export type BillingState = 'not_billed' | 'invoiced' | 'paid' | 'written_off';

/** The work happened. Says nothing about money. */
export function asDelivered() {
  return { delivery_state: 'delivered' as DeliveryState };
}

/** It is on an invoice. Says nothing about whether the work happened. */
export function asInvoiced() {
  return { billing_state: 'invoiced' as BillingState };
}

/** They paid. */
export function asPaid() {
  return { billing_state: 'paid' as BillingState };
}

/** Back to billable, e.g. an invoice was voided. */
export function asNotBilled() {
  return { billing_state: 'not_billed' as BillingState };
}

/** A grant landed, so the line is billable again. The hold was never a delivery state. */
export function asReleasedFromFunding() {
  return { funding_hold: false };
}

/** A new line from a signed contract. */
export function asNewLine(waitingOnFunding: boolean) {
  return {
    delivery_state: 'scheduled' as DeliveryState,
    billing_state: 'not_billed' as BillingState,
    funding_hold: waitingOnFunding,
  };
}

/** A line is ready to bill when the work is done, it is unbilled, and no grant is holding it. */
export const READY_TO_BILL = {
  delivery_state: 'delivered' as DeliveryState,
  billing_state: 'not_billed' as BillingState,
  funding_hold: false,
};
