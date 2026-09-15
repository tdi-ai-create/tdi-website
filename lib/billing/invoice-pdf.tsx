/** @jsxImportSource react */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import type { InvoiceDocument } from './invoice-document';

/**
 * The invoice, as a document.
 *
 * The layout is the one already sent to clients from the deliverables send path,
 * kept deliberately so a re-download does not look like a different company from
 * the invoices already in their inbox. Two things changed:
 *
 *  - It renders every line item. The old one rendered exactly one, because it was
 *    built from a single deliverable rather than from the invoice.
 *  - Billing questions point at Billing@teachersdeserveit.com. The old one used
 *    Info@, which nobody watches.
 */

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 48, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid #1e2749' },
  logoText: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1e2749' },
  logoSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  invoiceBadge: { backgroundColor: '#1e2749', borderRadius: 4, padding: '6 14' },
  invoiceBadgeText: { color: '#E8B84B', fontSize: 10, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  invoiceNumber: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#1e2749', textAlign: 'right', marginTop: 6 },
  stamp: { marginTop: 6, alignSelf: 'flex-end', borderRadius: 4, padding: '3 10' },
  stampText: { fontSize: 9, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  parties: { flexDirection: 'row', gap: 40, marginBottom: 28 },
  partyBlock: { flex: 1 },
  partyLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  partyName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  partyDetail: { fontSize: 10, color: '#4b5563', marginBottom: 2 },
  detailsRow: { flexDirection: 'row', marginBottom: 24 },
  detailBox: { flex: 1, padding: '10 14', backgroundColor: '#f8fafc', borderRadius: 4, marginRight: 8 },
  detailLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  detailValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e2749' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e2749', padding: '8 12', borderRadius: 4 },
  tableHeaderCell: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', padding: '10 12', borderBottom: '1px solid #f3f4f6' },
  tableCell: { fontSize: 11, color: '#374151' },
  lineSub: { fontSize: 9, color: '#9ca3af', marginTop: 2 },
  totalRow: { flexDirection: 'row', padding: '14 12', backgroundColor: '#f0fdfa', borderTop: '2px solid #2A9D8F', marginTop: 4, borderRadius: 4 },
  totalLabel: { flex: 1, fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1e2749' },
  totalAmount: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e2749', textAlign: 'right' },
  creditRow: { flexDirection: 'row', padding: '8 12', borderBottom: '1px solid #f3f4f6' },
  creditLabel: { flex: 1, fontSize: 11, color: '#4b5563' },
  creditAmount: { fontSize: 11, color: '#4b5563', textAlign: 'right' },
  paymentBox: { marginTop: 24, padding: '16 20', border: '1px solid #99F6E4', borderRadius: 6, backgroundColor: '#f0fdfa' },
  paymentTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0D9488', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  paymentText: { fontSize: 10, color: '#134E4A', lineHeight: 1.6, marginBottom: 2 },
  notesBox: { marginTop: 16, padding: '12 16', border: '1px solid #e5e7eb', borderRadius: 6 },
  notesTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  notesText: { fontSize: 10, color: '#4b5563', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 12 },
  footerText: { fontSize: 9, color: '#9ca3af' },
});

const COL = { desc: 3.4, qty: 0.7, unit: 1, amount: 1.1 };

const usd = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * 2026-08-04 -> 4 Aug 2026.
 *
 * Written out rather than left to toLocaleDateString, which is not consistent
 * with itself: en-GB abbreviates September to "Sept" and August to "Aug", so an
 * invoice dated 4 Aug and due 3 Sept looked like two different documents. It
 * also keeps 08/09 off a page read on both sides of the Atlantic.
 */
function longDate(iso: string | null): string {
  if (!iso) return 'Not set';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, year, month, day] = m;
  const name = MONTHS[Number(month) - 1];
  if (!name) return iso;
  return `${Number(day)} ${name} ${year}`;
}

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function Stamp({ status }: { status: string }) {
  if (status === 'paid') {
    return (
      <View style={[styles.stamp, { backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7' }]}>
        <Text style={[styles.stampText, { color: '#047857' }]}>PAID IN FULL</Text>
      </View>
    );
  }
  if (status === 'voided') {
    return (
      <View style={[styles.stamp, { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }]}>
        <Text style={[styles.stampText, { color: '#B91C1C' }]}>VOID</Text>
      </View>
    );
  }
  if (status === 'draft') {
    return (
      <View style={[styles.stamp, { backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }]}>
        <Text style={[styles.stampText, { color: '#475569' }]}>DRAFT, NOT SENT</Text>
      </View>
    );
  }
  return null;
}

export function InvoicePDF({ doc }: { doc: InvoiceDocument }) {
  const partPaid = doc.amountPaid > 0 && doc.amountPaid < doc.amount;
  const serviceDates = doc.lines.map((l) => l.deliveredOn).filter(Boolean) as string[];
  const serviceDate = serviceDates.length
    ? longDate(serviceDates.sort()[serviceDates.length - 1])
    : 'Not recorded';

  return (
    <Document
      title={`Invoice ${doc.invoiceNumber}`}
      author="Teachers Deserve It, LLC"
      subject={`Invoice ${doc.invoiceNumber} for ${doc.clientName}`}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>Teachers Deserve It</Text>
            <Text style={styles.logoSub}>teachersdeserveit.com</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>INVOICE</Text>
            </View>
            <Text style={styles.invoiceNumber}>{doc.invoiceNumber}</Text>
            <Stamp status={doc.status} />
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>Teachers Deserve It, LLC</Text>
            <Text style={styles.partyDetail}>c/o Secure Plus Financial</Text>
            <Text style={styles.partyDetail}>4002 Paredes In Rd, Ste 15</Text>
            <Text style={styles.partyDetail}>Brownsville, TX 78526</Text>
            <Text style={[styles.partyDetail, { marginTop: 4 }]}>Billing: Billing@teachersdeserveit.com</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{doc.clientName}</Text>
            {doc.billToName ? <Text style={styles.partyDetail}>{doc.billToName}</Text> : null}
            {doc.billToEmail ? <Text style={styles.partyDetail}>{doc.billToEmail}</Text> : null}
            {doc.poNumber ? (
              <Text style={[styles.partyDetail, { marginTop: 4, fontFamily: 'Helvetica-Bold' }]}>PO #{doc.poNumber}</Text>
            ) : null}
            {doc.contractNumber ? (
              <Text style={[styles.partyDetail, { marginTop: 4 }]}>Contract {doc.contractNumber}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Invoice Date</Text>
            <Text style={styles.detailValue}>{longDate(doc.invoiceDate)}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{longDate(doc.dueDate)}</Text>
          </View>
          <View style={[styles.detailBox, { marginRight: 0 }]}>
            <Text style={styles.detailLabel}>{doc.schoolYear ? 'School Year' : 'Service Date'}</Text>
            <Text style={styles.detailValue}>{doc.schoolYear ?? serviceDate}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: COL.desc }]}>Description</Text>
          <Text style={[styles.tableHeaderCell, { flex: COL.qty, textAlign: 'center' }]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, { flex: COL.unit, textAlign: 'right' }]}>Unit</Text>
          <Text style={[styles.tableHeaderCell, { flex: COL.amount, textAlign: 'right' }]}>Amount</Text>
        </View>

        {doc.lines.map((line, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <View style={{ flex: COL.desc }}>
              <Text style={styles.tableCell}>{line.label}</Text>
              {line.serviceType || line.deliveredOn ? (
                <Text style={styles.lineSub}>
                  {[
                    line.serviceType ? titleCase(line.serviceType) : null,
                    line.deliveredOn ? `Delivered ${longDate(line.deliveredOn)}` : null,
                  ]
                    .filter(Boolean)
                    .join('  |  ')}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.tableCell, { flex: COL.qty, textAlign: 'center' }]}>{line.quantity}</Text>
            <Text style={[styles.tableCell, { flex: COL.unit, textAlign: 'right' }]}>{usd(line.unitPrice)}</Text>
            <Text style={[styles.tableCell, { flex: COL.amount, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
              {usd(line.amount)}
            </Text>
          </View>
        ))}

        {/* A part paid invoice that shows only its face value is how a client gets
            chased for money they have already sent. Show both, always. */}
        {doc.amountPaid > 0 ? (
          <>
            <View style={styles.creditRow}>
              <Text style={styles.creditLabel}>Invoice total</Text>
              <Text style={styles.creditAmount}>{usd(doc.amount)}</Text>
            </View>
            <View style={styles.creditRow}>
              <Text style={styles.creditLabel}>Payments received</Text>
              <Text style={styles.creditAmount}>-{usd(doc.amountPaid)}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {doc.status === 'paid' && doc.amountDue === 0 ? 'Paid in Full' : partPaid ? 'Balance Due' : 'Amount Due'}
          </Text>
          <Text style={styles.totalAmount}>{usd(doc.amountDue)}</Text>
        </View>

        {doc.status !== 'paid' && doc.status !== 'voided' ? (
          <View style={styles.paymentBox}>
            <Text style={styles.paymentTitle}>Payment Information</Text>
            <Text style={styles.paymentText}>Please make checks payable to Teachers Deserve It, LLC</Text>
            <Text style={styles.paymentText}>Mail to: 4002 Paredes In Rd, Ste 15, Brownsville, TX 78526</Text>
            <Text style={[styles.paymentText, { marginTop: 6 }]}>
              Billing questions? Email Billing@teachersdeserveit.com
            </Text>
          </View>
        ) : null}

        {doc.status === 'voided' && doc.voidReason ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Void reason</Text>
            <Text style={styles.notesText}>{doc.voidReason}</Text>
          </View>
        ) : null}

        {/* `intelligence_invoices.notes` is deliberately NOT printed. It reads like
            a description on some rows ("Learning Hub Membership x23 for Saunemin")
            and like a private ledger on others. ANC-00025 holds "OUTSTANDING ISSUE:
            PGCPS require actual dates of service ... which may be why it has never
            been paid ... Rae does not have them", which is TDI's own collections
            reasoning about the very client who would receive the page. One column
            cannot be both, so nothing from it goes on the document. Client-facing
            wording needs its own field before it can appear here. */}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Teachers Deserve It, LLC</Text>
          <Text style={styles.footerText}>teachersdeserveit.com</Text>
          <Text style={styles.footerText}>{doc.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}

/** The one place a PDF is produced, so the viewer, the download and the email agree. */
export async function renderInvoicePdf(doc: InvoiceDocument): Promise<Buffer> {
  return renderToBuffer(<InvoicePDF doc={doc} />);
}

/** `TDI-2608-002 Glen Ellyn D41.pdf`, so a downloads folder is readable. */
export function invoiceFileName(doc: InvoiceDocument): string {
  const client = doc.clientName.replace(/[^A-Za-z0-9 .#-]/g, '').trim();
  return `${doc.invoiceNumber}${client ? ` ${client}` : ''}.pdf`;
}
