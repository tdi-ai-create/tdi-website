import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/invoice-followup
 *
 * Runs daily at 9 AM CT. Checks all unpaid invoices and:
 * - Day 14: Sends a friendly reminder email to the school
 * - Day 30: Flags as overdue, sends firmer reminder
 * - Day 45: Internal alert to Omar for escalation
 * - Day 60+: Internal alert to Rae
 *
 * Also surfaces "ready to invoice" backlog (delivered but not invoiced).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });

    const supabase = getServiceSupabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get all unpaid invoices with their linked deliverables
    const { data: invoices } = await supabase
      .from('intelligence_invoices')
      .select('id, invoice_number, amount, status, invoice_date, due_date, notes')
      .in('status', ['sent', 'overdue'])
      .order('due_date', { ascending: true });

    if (!invoices || invoices.length === 0) {
      // Check for uninvoiced deliverables
      const backlog = await checkBacklog(supabase);
      return NextResponse.json({ success: true, actions: 0, backlog });
    }

    let reminders = 0;
    let escalations = 0;

    for (const inv of invoices) {
      const invoiceDate = new Date(inv.invoice_date);
      const dueDate = inv.due_date ? new Date(inv.due_date) : null;
      const daysSinceInvoice = Math.floor((now.getTime() - invoiceDate.getTime()) / 86400000);
      const daysOverdue = dueDate ? Math.floor((now.getTime() - dueDate.getTime()) / 86400000) : 0;

      // Get the linked deliverable for context
      const { data: deliverable } = await supabase
        .from('contract_deliverables')
        .select('id, label, partnership_id, total_amount')
        .eq('invoice_id', inv.id)
        .eq('invoice_type', 'intelligence_invoice')
        .limit(1)
        .single();

      if (!deliverable) continue;

      // Get partnership for contact info
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('contact_name, contact_email, primary_contact_email, org_name')
        .eq('id', deliverable.partnership_id)
        .single();

      if (!partnership) continue;

      // Check if we already sent a reminder at this stage today
      const { data: existingEvents } = await supabase
        .from('payment_events')
        .select('id')
        .eq('invoice_id', inv.id)
        .eq('event_date', today)
        .limit(1);

      if (existingEvents && existingEvents.length > 0) continue;

      const recipientEmail = partnership.primary_contact_email || partnership.contact_email;
      const firstName = (partnership.contact_name || '').split(' ')[0] || 'there';
      const schoolName = partnership.org_name || partnership.contact_name || 'your school';

      // Day 14: Friendly reminder
      if (daysSinceInvoice >= 14 && daysSinceInvoice < 15 && daysOverdue < 0) {
        await sendReminder(inv, recipientEmail, firstName, schoolName, 'friendly', deliverable.label);
        await logEvent(supabase, inv.id, 'reminder_14d', `14-day reminder sent to ${recipientEmail}`);
        reminders++;
      }

      // Day 30 (due date): Firmer reminder + mark overdue
      if (daysOverdue >= 0 && daysOverdue < 1) {
        await supabase.from('intelligence_invoices').update({ status: 'overdue' }).eq('id', inv.id);
        await sendReminder(inv, recipientEmail, firstName, schoolName, 'due', deliverable.label);
        await logEvent(supabase, inv.id, 'reminder_due', `Due date reminder sent. Invoice marked overdue.`);
        reminders++;
      }

      // Day 45: Escalate to Omar
      if (daysOverdue >= 15 && daysOverdue < 16) {
        await sendInternalAlert(
          'omar@secureplusfinancial.com',
          `Invoice ${inv.invoice_number} is 45 days old`,
          `${schoolName} has not paid invoice ${inv.invoice_number} ($${Number(inv.amount).toLocaleString()}) for "${deliverable.label}". It was due ${inv.due_date}. This may need a direct call to their AP department.`,
          inv.invoice_number,
        );
        await logEvent(supabase, inv.id, 'escalation_45d', `45-day escalation sent to Omar`);
        escalations++;
      }

      // Day 60: Escalate to Rae
      if (daysOverdue >= 30 && daysOverdue < 31) {
        await sendInternalAlert(
          'Rae@TeachersDeserveIt.com',
          `Invoice ${inv.invoice_number} is 60+ days overdue`,
          `${schoolName} still has not paid invoice ${inv.invoice_number} ($${Number(inv.amount).toLocaleString()}) for "${deliverable.label}". Due date was ${inv.due_date}. Omar was notified at Day 45. This may need your direct outreach to the principal.`,
          inv.invoice_number,
        );
        await logEvent(supabase, inv.id, 'escalation_60d', `60-day escalation sent to Rae`);
        escalations++;
      }
    }

    const backlog = await checkBacklog(supabase);

    return NextResponse.json({
      success: true,
      unpaid_invoices: invoices.length,
      reminders_sent: reminders,
      escalations_sent: escalations,
      backlog,
    });
  } catch (error) {
    console.error('[invoice-followup] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function sendReminder(
  inv: { invoice_number: string; amount: number; due_date: string },
  to: string,
  firstName: string,
  schoolName: string,
  tone: 'friendly' | 'due',
  serviceLabel: string,
) {
  const amount = Number(inv.amount).toLocaleString();
  const dueDate = new Date(inv.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const friendlyBody = `
    <p style="margin:0 0 16px;">Just a quick note that invoice <strong>${inv.invoice_number}</strong> for <strong>${serviceLabel}</strong> ($${amount}) is still open. The due date is ${dueDate}.</p>
    <p style="margin:0 0 16px;">If this has already been processed, no action needed. If you need a copy of the invoice or have any questions, just reply to this email.</p>
  `;

  const dueBody = `
    <p style="margin:0 0 16px;">Invoice <strong>${inv.invoice_number}</strong> for <strong>${serviceLabel}</strong> ($${amount}) was due on ${dueDate}.</p>
    <p style="margin:0 0 16px;">If payment has already been sent, we appreciate it. If there are any issues with processing, please let us know so we can help resolve them quickly.</p>
    <p style="margin:0 0 16px;">If your accounts payable department needs any additional documentation (W-9, PO reference, or a different invoice format), we are happy to provide it.</p>
  `;

  const html = `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
      <p style="margin:0 0 16px;">${firstName},</p>
      ${tone === 'friendly' ? friendlyBody : dueBody}
      <p style="margin:0;">Thank you for your partnership.</p>
      <p style="margin:16px 0 0;font-size:14px;color:#64748B;">Teachers Deserve It Team</p>
      <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0 12px;" />
      <p style="font-size:11px;color:#9CA3AF;margin:0;">Invoice ${inv.invoice_number} | ${schoolName}</p>
    </div>
  `;

  const subject = tone === 'friendly'
    ? `Friendly reminder: Invoice ${inv.invoice_number}`
    : `Payment due: Invoice ${inv.invoice_number}`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
      reply_to: 'hello@teachersdeserveit.com',
      to,
      subject,
      html,
    }),
  });
}

async function sendInternalAlert(to: string, subject: string, body: string, invoiceNumber: string) {
  const html = `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#991B1B;">INVOICE ESCALATION</p>
      </div>
      <p style="margin:0 0 16px;">${body}</p>
      <p style="margin:0;font-size:13px;color:#64748B;">View in the Leadership Dashboard &rarr; Billing tab to see full history and notes.</p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'TDI System <hello@teachersdeserveit.com>',
      to,
      subject: `[Action Required] ${subject}`,
      html,
    }),
  });
}

async function logEvent(supabase: ReturnType<typeof getServiceSupabase>, invoiceId: string, eventType: string, summary: string) {
  await supabase.from('payment_events').insert({
    invoice_id: invoiceId,
    event_type: eventType,
    event_date: new Date().toISOString().split('T')[0],
    summary,
  });
}

async function checkBacklog(supabase: ReturnType<typeof getServiceSupabase>) {
  const { count } = await supabase
    .from('contract_deliverables')
    .select('id', { count: 'exact', head: true })
    .eq('delivery_status', 'delivered')
    .is('invoice_id', null)
    .eq('is_complimentary', false);

  return { uninvoiced_services: count || 0 };
}
