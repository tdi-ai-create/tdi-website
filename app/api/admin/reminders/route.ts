import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// GET - List reminders for a partnership
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const partnershipId = searchParams.get('partnership_id');

    if (!partnershipId) {
      return NextResponse.json(
        { success: false, error: 'partnership_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reminders:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reminders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error('Error in GET /api/admin/reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create and optionally send a reminder
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      partnership_id,
      reminder_type,
      subject,
      body: reminderBody,
      recipient_email,
      status = 'sent', // V1: always mark as sent since Rae sends manually
    } = body;

    if (!partnership_id || !reminder_type || !subject || !reminderBody || !recipient_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get user ID from email for created_by
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find((u) => u.email === email);

    // Insert reminder
    const { data: reminder, error: insertError } = await supabase
      .from('reminders')
      .insert({
        partnership_id,
        reminder_type,
        subject,
        body: reminderBody,
        recipient_email,
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting reminder:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create reminder' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id,
      action: 'reminder_sent',
      details: {
        reminder_id: reminder.id,
        reminder_type,
        subject,
        recipient_email,
        sent_by: email,
      },
    });

    return NextResponse.json({
      success: true,
      reminder,
      message: 'Reminder logged successfully. Copy the content to send manually.',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
