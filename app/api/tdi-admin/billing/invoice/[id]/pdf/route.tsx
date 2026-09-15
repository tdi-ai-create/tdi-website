/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { loadInvoiceDocument, linesDisagreeWithTotal } from '@/lib/billing/invoice-document';
import { renderInvoicePdf, invoiceFileName } from '@/lib/billing/invoice-pdf';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tdi-admin/billing/invoice/[id]/pdf
 *
 * The invoice as a PDF, for any invoice, at any time.
 *
 * Until this existed there was no way to look at an invoice TDI had sent. The
 * only renderer lived inside the send path, built its PDF in memory, attached it
 * to one email and discarded it, so a client asking "can you resend that" could
 * not be answered from the portal at all.
 *
 *   ?download=1  Content-Disposition attachment rather than inline
 *   ?meta=1      the assembled document as JSON, without rendering, for checking
 *                what a PDF would say before producing one
 *
 * The document is rebuilt from the record every time rather than served from a
 * cached file. Once an invoice is sent its line items are locked to
 * billing_state 'invoiced', so the record behind it does not move and the same
 * bytes come back. A part payment is the one thing that does change, and an
 * invoice that shows a stale balance is worse than one regenerated.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // An x-user-email header is a claim, not proof. requireAdminAuth verifies the
  // actual signed-in session. An invoice PDF carries a client's billing contact
  // and what they owe, so this must never be reachable without one.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const sb = getServiceSupabase();
  const doc = await loadInvoiceDocument(sb, id);
  if (!doc) {
    return NextResponse.json({ error: 'No invoice with that id' }, { status: 404 });
  }

  if (request.nextUrl.searchParams.get('meta') === '1') {
    return NextResponse.json({
      ...doc,
      file_name: invoiceFileName(doc),
      lines_disagree_with_total: linesDisagreeWithTotal(doc),
    });
  }

  let pdf: Buffer;
  try {
    pdf = await renderInvoicePdf(doc);
  } catch (err) {
    // Say which invoice failed. A bare "PDF generation failed" sent Billing
    // hunting through nine invoices the last time this path broke.
    console.error(`[billing/invoice/pdf] ${doc.invoiceNumber} failed to render`, err);
    return NextResponse.json(
      { error: `Could not build the PDF for ${doc.invoiceNumber}: ${String(err)}` },
      { status: 500 },
    );
  }

  const download = request.nextUrl.searchParams.get('download') === '1';
  const disposition = download ? 'attachment' : 'inline';

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdf.length),
      'Content-Disposition': `${disposition}; filename="${invoiceFileName(doc)}"`,
      // A client's balance must not sit in a shared cache.
      'Cache-Control': 'private, no-store',
    },
  });
}
