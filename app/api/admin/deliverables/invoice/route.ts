import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/admin/deliverables/invoice
 *
 * One-click invoice: creates an intelligence_invoice from a delivered
 * service, links it to the deliverable, emails the school contact,
 * and updates the deliverable status to 'invoiced'.
 *
 * Body: { deliverableId, partnershipId, sendEmail?: boolean }
 */
export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  if (!email || !email.toLowerCase().endsWith('@teachersdeserveit.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { deliverableId, partnershipId, sendEmail = true } = await request.json();

  if (!deliverableId || !partnershipId) {
    return NextResponse.json({ error: 'deliverableId and partnershipId required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Get the deliverable
  const { data: deliverable, error: dErr } = await supabase
    .from('contract_deliverables')
    .select('*')
    .eq('id', deliverableId)
    .single();

  if (dErr || !deliverable) {
    return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
  }

  if (deliverable.invoice_id) {
    return NextResponse.json({ error: 'Already invoiced' }, { status: 400 });
  }

  if (deliverable.is_complimentary) {
    return NextResponse.json({ error: 'Cannot invoice complimentary services' }, { status: 400 });
  }

  // Get the partnership for contact info
  const { data: partnership } = await supabase
    .from('partnerships')
    .select('contact_name, contact_email, primary_contact_email, org_name, slug')
    .eq('id', partnershipId)
    .single();

  if (!partnership) {
    return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
  }

  // Generate invoice number: TDI-YYMM-NNN
  const now = new Date();
  const yearMonth = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { count } = await supabase
    .from('intelligence_invoices')
    .select('id', { count: 'exact', head: true })
    .ilike('invoice_number', `TDI-${yearMonth}%`);

  const seqNum = String((count || 0) + 1).padStart(3, '0');
  const invoiceNumber = `TDI-${yearMonth}-${seqNum}`;

  // Due date: 30 days from now
  const dueDate = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

  // Create the invoice
  const { data: invoice, error: iErr } = await supabase
    .from('intelligence_invoices')
    .insert({
      district_id: deliverable.district_id || null,
      invoice_number: invoiceNumber,
      invoice_date: now.toISOString().split('T')[0],
      due_date: dueDate,
      service_date_exact: deliverable.delivery_date || now.toISOString().split('T')[0],
      amount: deliverable.total_amount || 0,
      status: 'sent',
      notes: `${deliverable.label} for ${partnership.org_name || partnership.contact_name}. Auto-generated from service delivery.`,
    })
    .select()
    .single();

  if (iErr || !invoice) {
    return NextResponse.json({ error: iErr?.message || 'Failed to create invoice' }, { status: 500 });
  }

  // Create collections_workflow record
  await supabase.from('collections_workflow').insert({
    invoice_id: invoice.id,
    current_stage: 'sent',
    risk_flag: false,
  });

  // Link the deliverable to the invoice
  await supabase
    .from('contract_deliverables')
    .update({
      invoice_id: invoice.id,
      invoice_type: 'intelligence_invoice',
      invoiced_at: now.toISOString(),
      delivery_status: 'invoiced',
      updated_at: now.toISOString(),
    })
    .eq('id', deliverableId);

  // Log a payment event
  await supabase.from('payment_events').insert({
    invoice_id: invoice.id,
    event_type: 'invoice_sent',
    event_date: now.toISOString().split('T')[0],
    summary: `Invoice ${invoiceNumber} sent to ${partnership.contact_email} for ${deliverable.label}`,
  });

  // Send invoice email
  const recipientEmail = partnership.primary_contact_email || partnership.contact_email;
  if (sendEmail && RESEND_API_KEY && recipientEmail) {
    const firstName = (partnership.contact_name || '').split(' ')[0] || 'there';
    const amount = Number(deliverable.total_amount || 0);

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
        <div style="background:#1e2749;border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#E8B84B;">Invoice</p>
          <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:white;">${invoiceNumber}</p>
        </div>

        <div style="background:white;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:32px 24px;">
          <p style="margin:0 0 20px;font-size:15px;">${firstName},</p>

          <p style="margin:0 0 24px;font-size:15px;color:#64748B;">Thank you for your partnership with Teachers Deserve It. Below is an invoice for a recent service.</p>

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
            <tr>
              <td style="padding:16px 20px;background:#F8FAFC;border-radius:10px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;">Service</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e2749;text-align:right;">${deliverable.label}</td>
                  </tr>
                  ${deliverable.delivery_date ? `
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;">Date of Service</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e2749;text-align:right;">${new Date(deliverable.delivery_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;">Invoice Date</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e2749;text-align:right;">${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748B;">Due Date</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e2749;text-align:right;">${new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:12px 0 0;border-top:1px solid #E5E7EB;"></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:15px;font-weight:700;color:#1e2749;">Amount Due</td>
                    <td style="padding:6px 0;font-size:20px;font-weight:700;color:#1e2749;text-align:right;">$${amount.toLocaleString()}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="background:#F0FDFA;border-radius:10px;padding:16px 20px;border:1px solid #99F6E4;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0D9488;">Payment Information</p>
            <p style="margin:0;font-size:14px;color:#134E4A;line-height:1.6;">
              Please make checks payable to <strong>Teachers Deserve It, LLC</strong> and mail to:<br/>
              Teachers Deserve It<br/>
              Rae Hughart<br/>
              Please reply to this email with any questions about this invoice.
            </p>
          </div>

          <p style="margin:0;font-size:14px;color:#64748B;">
            If you need a W-9 or have specific AP requirements, just reply to this email and we will get that to you right away.
          </p>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0 16px;" />
          <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center;">
            Teachers Deserve It | ${invoiceNumber}
          </p>
        </div>
      </div>
    `;

    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Teachers Deserve It <hello@teachersdeserveit.com>',
          reply_to: 'Rae@TeachersDeserveIt.com',
          to: recipientEmail,
          subject: `Invoice ${invoiceNumber} from Teachers Deserve It`,
          html,
        }),
      });

      if (!resp.ok) {
        console.error('[invoice-email] Failed:', await resp.text());
      }
    } catch (e) {
      console.error('[invoice-email] Error:', e);
    }
  }

  return NextResponse.json({
    success: true,
    invoice: {
      id: invoice.id,
      invoice_number: invoiceNumber,
      amount: deliverable.total_amount,
      due_date: dueDate,
      sent_to: recipientEmail,
    },
  });
}
