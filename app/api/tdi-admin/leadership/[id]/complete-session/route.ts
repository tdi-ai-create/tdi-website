import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serviceDelivered } from '@/lib/billing-slack';

// Service Supabase client
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

// Check if TDI admin
function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      sessionType,
      sessionNumber,
      sessionDate,
      loveNotesCount,
      internalNotes,
      quotes, // array of { quote_text, teacher_role }
    } = await request.json();

    const supabase = getServiceSupabase();

    // 1. Create session record
    const { data: sessionRecord, error: sessionError } = await supabase
      .from('session_records')
      .insert({
        partnership_id: id,
        session_type: sessionType,
        session_number: sessionNumber,
        session_date: sessionDate,
        love_notes_count: loveNotesCount || 0,
        internal_notes: internalNotes || null,
        completed_by: email,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session record:', sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // 2. Save teacher quotes
    if (quotes && quotes.length > 0) {
      const validQuotes = quotes
        .filter((q: { quote_text?: string }) => q.quote_text?.trim())
        .map((q: { quote_text: string; teacher_role?: string }) => ({
          partnership_id: id,
          session_record_id: sessionRecord.id,
          quote_text: q.quote_text.trim(),
          teacher_role: q.teacher_role || null,
          session_type: sessionType,
        }));

      if (validQuotes.length > 0) {
        await supabase.from('teacher_quotes').insert(validQuotes);
      }
    }

    // 3. Update partnership session count
    const fieldMap: Record<string, string> = {
      observation: 'observation_days_used',
      virtual_session: 'virtual_sessions_used',
      executive_session: 'executive_sessions_used',
    };

    const field = fieldMap[sessionType];
    if (field) {
      const { data: partnership } = await supabase
        .from('partnerships')
        .select(field)
        .eq('id', id)
        .single();

      const partnershipData = partnership as Record<string, unknown> | null;
      const currentCount = (partnershipData?.[field] as number) || 0;
      await supabase
        .from('partnerships')
        .update({
          [field]: currentCount + 1,
          data_updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    // 4. Mark next matching contract deliverable as delivered
    if (field) {
      const serviceTypeMap: Record<string, string> = {
        observation: 'observation',
        virtual_session: 'virtual_session',
        executive_session: 'executive_session',
      }
      const deliverableType = serviceTypeMap[sessionType]
      if (deliverableType) {
        const { data: nextDeliverable } = await supabase
          .from('contract_deliverables')
          .select('id')
          .eq('partnership_id', id)
          .eq('service_type', deliverableType)
          .in('delivery_status', ['pending', 'scheduled'])
          .order('sequence_number', { ascending: true })
          .limit(1)
          .single()

        if (nextDeliverable) {
          await supabase
            .from('contract_deliverables')
            .update({
              delivery_status: 'delivered',
              delivery_date: sessionDate,
              delivered_by: email,
              delivery_notes: internalNotes || null,
              session_record_id: sessionRecord.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', nextDeliverable.id)
        }
      }
    }

    // 5. Update love notes count if this session had any
    if (loveNotesCount > 0) {
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('love_notes_count')
        .eq('id', id)
        .single();

      const currentNotes = partnership?.love_notes_count || 0;
      await supabase
        .from('partnerships')
        .update({ love_notes_count: currentNotes + loveNotesCount })
        .eq('id', id);
    }

    // 5. Auto-create timeline event
    const sessionLabels: Record<string, string> = {
      observation: 'Observation Day',
      virtual_session: 'Virtual Session',
      executive_session: 'Executive Session',
    };

    const label = sessionLabels[sessionType] || 'Session';
    const eventTitle =
      loveNotesCount > 0
        ? `${label} ${sessionNumber} - ${loveNotesCount} Love Notes delivered`
        : `${label} ${sessionNumber} complete`;

    await supabase.from('timeline_events').insert({
      partnership_id: id,
      event_title: eventTitle,
      event_type: sessionType,
      event_date: sessionDate,
      status: 'completed',
      sort_order: 100, // Will appear after manually set events
    });

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: id,
      action: 'session_completed',
      details: {
        session_type: sessionType,
        session_number: sessionNumber,
        love_notes_count: loveNotesCount || 0,
        completed_by: email,
      },
    });

    // Slack notification
    serviceDelivered(id, '', `${label} ${sessionNumber}`, email || 'unknown').catch(() => {})

    return NextResponse.json({
      success: true,
      sessionRecord,
      message: `${label} ${sessionNumber} marked complete.`,
    });
  } catch (error) {
    console.error('Error in complete-session:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
