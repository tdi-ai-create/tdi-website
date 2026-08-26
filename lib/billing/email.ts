/**
 * All billing email comes from Billing@teachersdeserveit.com and is signed
 * "Billing, TDI Team". Bella does this work but is never personally named on it, so a
 * district chasing an invoice is dealing with a function rather than a person. If a
 * client wants to meet, the reply offers a team member rather than her by name.
 *
 * billing@ redirects to Bella, so replies reach her without her address being exposed.
 *
 * Nothing here sends. Everything is drafted into billing_outbox for review.
 */
export const BILLING_FROM = 'Teachers Deserve It Billing <Billing@teachersdeserveit.com>';
export const BILLING_REPLY_TO = 'Billing@teachersdeserveit.com';
export const BILLING_SIGNOFF = 'Billing, TDI Team';

export function sign(body: string) {
  return `${body.trimEnd()}\n\nThank you,\n${BILLING_SIGNOFF}\nTeachers Deserve It`;
}

/** Offer a conversation without putting anyone's name to it. */
export const MEETING_OFFER =
  'If it would help to talk this through, we can set up a short call with a member of our team.';

export function invoiceEmail(o: { invoiceNumber: string; amount: string; contractNumber?: string | null; dueDate?: string | null }) {
  return {
    subject: `Invoice ${o.invoiceNumber} from Teachers Deserve It`,
    body: sign(
      `Hello,\n\n` +
      `Please find attached invoice ${o.invoiceNumber} for ${o.amount}` +
      (o.contractNumber ? ` under contract ${o.contractNumber}` : '') + `.\n\n` +
      (o.dueDate ? `Payment is due by ${o.dueDate}.\n\n` : '') +
      `Our W-9 is attached for your records. If you need anything else to process payment, ` +
      `reply here and we will send it the same day.`,
    ),
  };
}

export function reminderEmail(o: { invoiceNumber: string; amount: string; dueDate?: string | null; overdue: boolean }) {
  return {
    subject: o.overdue
      ? `Outstanding invoice ${o.invoiceNumber}`
      : `Friendly reminder, invoice ${o.invoiceNumber}`,
    body: sign(
      `Hello,\n\n` +
      `Invoice ${o.invoiceNumber} for ${o.amount}` +
      (o.dueDate ? (o.overdue ? ` was due on ${o.dueDate} and is currently outstanding` : ` is due on ${o.dueDate}`) : '') +
      `.\n\n` +
      `If it has already been processed, let us know the payment date and we will close it out. ` +
      `If you need anything from us to release payment, reply here and we will send it today.\n\n` +
      MEETING_OFFER,
    ),
  };
}

export function resendEmail(o: { invoiceNumber: string; amount: string; newDueDate?: string | null }) {
  return {
    subject: `Invoice ${o.invoiceNumber}, resent`,
    body: sign(
      `Hello,\n\n` +
      `We are resending invoice ${o.invoiceNumber} for ${o.amount}. Our first attempt did not reach your office, ` +
      `so this may be the first time you are seeing it.\n\n` +
      (o.newDueDate ? `The due date has been extended to ${o.newDueDate} to account for the delay.\n\n` : '') +
      `If there is a better address for invoices, please let us know and we will use it from now on.`,
    ),
  };
}

export function poRequestEmail(o: { contractNumber: string }) {
  return {
    subject: `Purchase order request, contract ${o.contractNumber}`,
    body: sign(
      `Hello,\n\n` +
      `Before we send the invoice for contract ${o.contractNumber}, could you provide the purchase order ` +
      `number your office would like referenced on it?\n\n` +
      `Our W-9 is attached in case you need it on file. If there is anything else your accounts payable ` +
      `process requires from us, let us know and we will send it the same day.`,
    ),
  };
}
