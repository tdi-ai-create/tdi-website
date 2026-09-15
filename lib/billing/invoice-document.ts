import { resolveBillingContact } from '@/lib/billing-contact';

/**
 * Everything that has to appear on an invoice PDF, assembled from the record.
 *
 * This exists because an invoice was never a document here. It was a row in
 * `intelligence_invoices` plus some line items pointing back at it, and the only
 * code that ever turned that into a PDF built the PDF inline, emailed it, and
 * threw the buffer away. Nothing was stored, so nothing could be re-opened.
 *
 * One loader, used by the viewer, the download, and the send path, so a client
 * cannot be looking at a different document from the one Billing is looking at.
 *
 * It deliberately does not read `billing_invoice_notes`, and must not. That
 * table holds the team's own collections commentary about the client who would
 * receive this page: who was called, who is stalling, what to try next. The
 * same mistake in a milder form already reached page two of a client PDF via
 * `intelligence_invoices.notes`. Nothing internal belongs on this document.
 */

export interface InvoiceLine {
  label: string;
  serviceType: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
  deliveredOn: string | null;
}

export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  status: string;
  invoiceDate: string | null;
  dueDate: string | null;
  poNumber: string | null;
  contractNumber: string | null;
  schoolYear: string | null;
  notes: string | null;
  voidReason: string | null;

  clientName: string;
  billToName: string | null;
  billToEmail: string | null;

  lines: InvoiceLine[];
  /** Face value of the invoice, always the stored amount rather than a re-sum of the lines. */
  amount: number;
  /** What the line items actually add up to. Equal to `amount` unless something has drifted. */
  lineTotal: number;
  amountPaid: number;
  amountDue: number;
}

/** The columns this loader reads, so the row mappers are not typed `any`. */
interface DeliverableRow {
  label: string | null;
  service_type: string | null;
  quantity: number | null;
  unit_price: number | string | null;
  total_amount: number | string | null;
  delivery_date: string | null;
  partnership_id: string | null;
  line_item_index: number | null;
}

interface PaymentApplicationRow {
  amount: number | string | null;
}

/** A line total that disagrees with the invoice is a data fault, not a rounding artefact. */
export function linesDisagreeWithTotal(doc: InvoiceDocument): boolean {
  return Math.abs(doc.lineTotal - doc.amount) > 0.005;
}

/**
 * Build the document for one invoice.
 *
 * Returns null when the invoice does not exist. Everything else degrades to a
 * readable placeholder rather than throwing, because a missing billing contact
 * must not be the reason Billing cannot open a PDF of an invoice already sent.
 */
export async function loadInvoiceDocument(
  sb: any,
  invoiceId: string,
): Promise<InvoiceDocument | null> {
  const { data: invoice } = await sb
    .from('intelligence_invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  if (!invoice) return null;

  const [{ data: district }, { data: quote }, { data: lines }, { data: applications }] =
    await Promise.all([
      sb.from('districts').select('name').eq('id', invoice.district_id).maybeSingle(),
      invoice.quote_id
        ? sb.from('quotes').select('quote_number').eq('id', invoice.quote_id).maybeSingle()
        : Promise.resolve({ data: null }),
      sb
        .from('contract_deliverables')
        .select('label, service_type, quantity, unit_price, total_amount, delivery_date, partnership_id, line_item_index')
        .eq('invoice_id', invoiceId)
        .order('line_item_index', { ascending: true }),
      sb.from('billing_payment_applications').select('amount').eq('invoice_id', invoiceId),
    ]);

  // The billing contact lives on the partnership, and the partnership is reached
  // through the line items. An invoice with no lines therefore has no contact to
  // resolve, which is a real state and not an error.
  const partnershipId =
    (lines as DeliverableRow[] | null ?? []).find((l) => l.partnership_id)?.partnership_id ?? null;
  const { data: partnership } = partnershipId
    ? await sb
        .from('partnerships')
        .select(
          'org_name, contact_name, contact_email, primary_contact_name, primary_contact_email, ' +
            'billing_contact_name, billing_contact_email, billing_contact_title, billing_contact_source',
        )
        .eq('id', partnershipId)
        .maybeSingle()
    : { data: null };

  const contact = resolveBillingContact(partnership);

  const docLines: InvoiceLine[] = (lines as DeliverableRow[] | null ?? []).map((l) => ({
    label: l.label ?? 'Service',
    serviceType: l.service_type ?? null,
    quantity: Number(l.quantity ?? 1),
    unitPrice: Number(l.unit_price ?? 0),
    amount: Number(l.total_amount ?? 0),
    deliveredOn: l.delivery_date ?? null,
  }));

  // An invoice with no line items still has to produce a document, because the
  // client is holding one with that number on it. The label stays generic on
  // purpose: `notes` is an internal ledger field on some rows and must never
  // reach a client-facing page. See the comment in invoice-pdf.tsx.
  if (docLines.length === 0) {
    docLines.push({
      label: 'Services rendered',
      serviceType: null,
      quantity: 1,
      unitPrice: Number(invoice.amount ?? 0),
      amount: Number(invoice.amount ?? 0),
      deliveredOn: null,
    });
  }

  const amount = Number(invoice.amount ?? 0);
  const amountPaid = (applications as PaymentApplicationRow[] | null ?? [])
    .reduce((sum, a) => sum + Number(a.amount ?? 0), 0);

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    status: invoice.voided_at ? 'voided' : invoice.status,
    invoiceDate: invoice.invoice_date ?? null,
    dueDate: invoice.due_date ?? null,
    poNumber: invoice.po_number ?? null,
    contractNumber: quote?.quote_number ?? null,
    schoolYear: invoice.school_year ?? null,
    notes: invoice.notes ?? null,
    voidReason: invoice.void_reason ?? null,

    clientName: partnership?.org_name?.trim() || district?.name || 'Unknown client',
    billToName: contact.name,
    billToEmail: contact.email,

    lines: docLines,
    amount,
    lineTotal: docLines.reduce((s, l) => s + l.amount, 0),
    amountPaid,
    amountDue: Math.max(0, amount - amountPaid),
  };
}
