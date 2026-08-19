import { NextRequest, NextResponse } from 'next/server';
import { resolveBillingContact, greetingName, billingContactFooterHtml } from '@/lib/billing-contact';
import { getServiceSupabase } from '@/lib/supabase';
import { slackNotify } from '@/lib/slack-notify';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/invoice-followup
 *
 * Runs daily at 9 AM CT. Each stage below sends at most once per invoice, tracked by
 * reminder_stage in payment_events. Checks all unpaid invoices and:
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

    // ?dryRun=1 walks the real decision path and reports who would be emailed,
    // while sending nothing and writing nothing.
    const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

    const supabase = getServiceSupabase();
    const now = new Date();

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
    const reminderDetails: string[] = [];
    const escalationDetails: string[] = [];
    const logFailures: string[] = [];

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
        .select('contact_name, contact_email, primary_contact_name, primary_contact_email, billing_contact_name, billing_contact_email, billing_contact_title, billing_contact_source, billing_token, org_name')
        .eq('id', deliverable.partnership_id)
        .single();

      if (!partnership) continue;

      // Each stage fires once per invoice, ever. The day checks below are ranges so a
      // missed cron run does not skip a stage, which means this log is the only thing
      // stopping a repeat send tomorrow. It used to write an event_type the
      // payment_events CHECK constraint rejects, nothing read the error, and every
      // unpaid invoice got the same reminder every single morning.
      const { data: sentEvents, error: sentEventsError } = await supabase
        .from('payment_events')
        .select('reminder_stage')
        .eq('invoice_id', inv.id)
        .not('reminder_stage', 'is', null);

      if (sentEventsError) {
        console.error(`[invoice-followup] Cannot read reminder history for ${inv.invoice_number}, skipping rather than risk a repeat send:`, sentEventsError);
        logFailures.push(`${inv.invoice_number}: could not read reminder history, skipped`);
        continue;
      }

      const alreadySent = new Set((sentEvents || []).map((e) => e.reminder_stage));

      // Reminders chase money, so they go to whoever handles money. Falls back
      // to the signer when no billing contact is known, which is what isFallback
      // reports, and that also decides how the footer asks the question.
      const billing = resolveBillingContact(partnership);
      const recipientEmail = billing.email;
      const firstName = greetingName(billing.name);
      const schoolName = partnership.org_name || partnership.contact_name || 'your school';
      const billingFooter = billingContactFooterHtml(partnership.billing_token, billing.isFallback);

      if (!recipientEmail) {
        console.error(`[invoice-followup] No contact email for invoice ${inv.invoice_number}, skipping`);
        continue;
      }

      // Day 14: Friendly reminder
      if (daysSinceInvoice >= 14 && daysSinceInvoice < 30 && daysOverdue < 0 && !alreadySent.has('reminder_14d')) {
        if (!dryRun) {
          await sendReminder(inv, recipientEmail, firstName, schoolName, 'friendly', deliverable.label, billingFooter);
          await logEvent(supabase, inv.id, 'reminder_14d', 'email_sent', `14-day reminder sent to ${recipientEmail}`, logFailures, inv.invoice_number);
        }
        reminderDetails.push(`${schoolName} -- $${Number(inv.amount).toLocaleString()} (14-day reminder)`);
        reminders++;
      }

      // Status is a fact about the invoice, not a reminder, so it updates every run.
      if (daysOverdue >= 0 && inv.status !== 'overdue' && !dryRun) {
        await supabase.from('intelligence_invoices').update({ status: 'overdue' }).eq('id', inv.id);
      }

      // Day 30 (due date): Firmer reminder
      if (daysOverdue >= 0 && daysOverdue < 15 && !alreadySent.has('reminder_due')) {
        if (!dryRun) {
          await sendReminder(inv, recipientEmail, firstName, schoolName, 'due', deliverable.label, billingFooter);
          await logEvent(supabase, inv.id, 'reminder_due', 'email_sent', `Due date reminder sent. Invoice marked overdue.`, logFailures, inv.invoice_number);
        }
        reminderDetails.push(`${schoolName} -- $${Number(inv.amount).toLocaleString()} (overdue, due ${inv.due_date})`);
        reminders++;
      }

      // Day 45: Escalate to Omar
      if (daysOverdue >= 15 && daysOverdue < 30 && !alreadySent.has('escalation_45d')) {
        if (!dryRun) {
          await sendInternalAlert(
            'omar@secureplusfinancial.com',
            `Invoice ${inv.invoice_number} is 45 days old`,
            `${schoolName} has not paid invoice ${inv.invoice_number} ($${Number(inv.amount).toLocaleString()}) for "${deliverable.label}". It was due ${inv.due_date}. This may need a direct call to their AP department.`,
            inv.invoice_number,
          );
          await logEvent(supabase, inv.id, 'escalation_45d', 'escalated', `45-day escalation sent to Omar`, logFailures, inv.invoice_number);
        }
        escalationDetails.push(`${schoolName} -- $${Number(inv.amount).toLocaleString()} (45 days, escalated to Omar)`);
        escalations++;
      }

      // Day 60: Escalate to Rae
      if (daysOverdue >= 30 && !alreadySent.has('escalation_60d')) {
        if (!dryRun) {
          await sendInternalAlert(
            'Rae@TeachersDeserveIt.com',
            `Invoice ${inv.invoice_number} is 60+ days overdue`,
            `${schoolName} still has not paid invoice ${inv.invoice_number} ($${Number(inv.amount).toLocaleString()}) for "${deliverable.label}". Due date was ${inv.due_date}. Omar was notified at Day 45. This may need your direct outreach to the principal.`,
            inv.invoice_number,
          );
          await logEvent(supabase, inv.id, 'escalation_60d', 'escalated', `60-day escalation sent to Rae`, logFailures, inv.invoice_number);
        }
        escalationDetails.push(`${schoolName} -- $${Number(inv.amount).toLocaleString()} (60+ days, escalated to Rae)`);
        escalations++;
      }
    }

    const backlog = await checkBacklog(supabase);

    // Slack summary with details
    if (reminders > 0 || escalations > 0 || logFailures.length > 0 || (backlog && backlog.uninvoiced_services > 0)) {
      const lines = [`*Invoice followup:* ${invoices.length} unpaid invoice${invoices.length > 1 ? 's' : ''} total.`]
      if (reminderDetails.length > 0) {
        lines.push(`\n*Reminders sent today (${reminderDetails.length}):*`)
        reminderDetails.forEach(d => lines.push(`  ${d}`))
      }
      if (escalationDetails.length > 0) {
        lines.push(`\n*Escalations:*`)
        escalationDetails.forEach(d => lines.push(`  ${d}`))
      }
      if (logFailures.length > 0) {
        lines.push(`\n*Needs attention (${logFailures.length}):*`)
        logFailures.forEach(d => lines.push(`  ${d}`))
      }
      if (backlog?.uninvoiced_services > 0) {
        lines.push(`\n${backlog.uninvoiced_services} service${backlog.uninvoiced_services > 1 ? 's' : ''} delivered but not yet invoiced.`)
      }
      if (!dryRun) slackNotify('financials', lines.join('\n'))
    }

    return NextResponse.json({
      success: true,
      dry_run: dryRun,
      unpaid_invoices: invoices.length,
      reminders_sent: reminders,
      reminder_details: reminderDetails,
      escalation_details: escalationDetails,
      log_failures: logFailures,
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
  billingFooter = '',
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
      ${billingFooter}
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

// event_type has to be one of the values payment_events_event_type_check allows, so the
// stage name lives in reminder_stage instead. A failed insert here means tomorrow's run
// will send the same email again, so it is loud rather than swallowed.
async function logEvent(
  supabase: ReturnType<typeof getServiceSupabase>,
  invoiceId: string,
  stage: string,
  eventType: 'email_sent' | 'escalated',
  summary: string,
  logFailures: string[],
  invoiceNumber: string,
) {
  const { error } = await supabase.from('payment_events').insert({
    invoice_id: invoiceId,
    event_type: eventType,
    reminder_stage: stage,
    event_date: new Date().toISOString().split('T')[0],
    summary,
  });

  if (error) {
    console.error(`[invoice-followup] Failed to log ${stage} for ${invoiceNumber}. It will resend tomorrow unless this is fixed:`, error);
    logFailures.push(`${invoiceNumber}: ${stage} sent but not logged, it will resend tomorrow`);
  }
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
