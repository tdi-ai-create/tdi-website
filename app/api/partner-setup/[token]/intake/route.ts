import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUniqueSlug } from '@/lib/generate-slug';

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

// GET - Get partnership for intake wizard (authorized users only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Find partnership by token
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (pError || !partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // Verify user is authorized for this partnership
    const { data: partnershipUser } = await supabase
      .from('partnership_users')
      .select('id')
      .eq('partnership_id', partnership.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!partnershipUser) {
      return NextResponse.json(
        { success: false, error: 'Not authorized for this partnership' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      partnership: {
        id: partnership.id,
        partnership_type: partnership.partnership_type,
        contact_name: partnership.contact_name,
        contact_email: partnership.contact_email,
        status: partnership.status,
      },
    });
  } catch (error) {
    console.error('Error getting partnership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load partnership' },
      { status: 500 }
    );
  }
}

// POST - Save intake step data (2 steps: org info, staff roster)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { step, orgData, staff } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Find partnership by token
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (pError || !partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // Verify user is authorized
    const { data: partnershipUser } = await supabase
      .from('partnership_users')
      .select('id')
      .eq('partnership_id', partnership.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!partnershipUser) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Step 1: Save organization data (simplified: name, city, state only)
    if (step === 1 && orgData) {
      // Generate slug from org name
      const slug = await getUniqueSlug(supabase, orgData.name);

      // Update partnership slug
      await supabase
        .from('partnerships')
        .update({ slug, updated_at: new Date().toISOString() })
        .eq('id', partnership.id);

      // Create or update organization (simplified fields)
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('partnership_id', partnership.id)
        .maybeSingle();

      const orgRecord = {
        name: orgData.name,
        org_type: orgData.org_type,
        address_city: orgData.address_city,
        address_state: orgData.address_state,
      };

      if (existingOrg) {
        await supabase
          .from('organizations')
          .update({
            ...orgRecord,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingOrg.id);
      } else {
        await supabase.from('organizations').insert({
          partnership_id: partnership.id,
          ...orgRecord,
        });
      }

      // Log activity
      await supabase.from('activity_log').insert({
        partnership_id: partnership.id,
        user_id: userId,
        action: 'intake_step1_completed',
        details: { org_name: orgData.name },
      });

      return NextResponse.json({ success: true });
    }

    // Step 2: Save staff roster (final step)
    if (step === 2 && staff) {
      // Delete existing staff
      await supabase
        .from('staff_members')
        .delete()
        .eq('partnership_id', partnership.id);

      // Insert staff members (no building_id since buildings step removed)
      const staffData = staff.map((s: {
        first_name: string;
        last_name: string;
        email: string;
        role_title: string;
      }) => ({
        partnership_id: partnership.id,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        role_title: s.role_title,
        building_id: null, // Building assignment happens later
        hub_enrolled: false,
      }));

      await supabase.from('staff_members').insert(staffData);

      // Create default action items (updated list with 10 items)
      const defaultItems = [
        {
          partnership_id: partnership.id,
          sort_order: 1,
          title: 'Complete Hub Onboarding',
          description: `Ensure all ${staff.length} staff have created Learning Hub accounts and logged in at least once.`,
          category: 'onboarding',
          priority: 'high',
        },
        {
          partnership_id: partnership.id,
          sort_order: 2,
          title: 'Schedule Virtual Session 1',
          description: 'Book your first virtual session with the TDI team to kick things off. Included in your contract.',
          category: 'scheduling',
          priority: 'high',
        },
        {
          partnership_id: partnership.id,
          sort_order: 3,
          title: 'Suggest TDI Champion(s)',
          description: 'Identify a staff member who can help keep Hub momentum going during PLCs and meetings.',
          category: 'engagement',
          priority: 'medium',
        },
        {
          partnership_id: partnership.id,
          sort_order: 4,
          title: 'Add Hub Time to PLCs',
          description: 'Schools that build in 15-30 minutes of protected Hub time see 3x higher implementation rates.',
          category: 'engagement',
          priority: 'medium',
        },
        {
          partnership_id: partnership.id,
          sort_order: 5,
          title: 'Share Your School/District Website',
          description: 'Help us learn more about your community.',
          category: 'documentation',
          priority: 'low',
        },
        {
          partnership_id: partnership.id,
          sort_order: 6,
          title: 'Add Building Details',
          description: 'Tell us about the buildings in your partnership so we can organize your dashboard by school.',
          category: 'documentation',
          priority: 'low',
        },
        {
          partnership_id: partnership.id,
          sort_order: 7,
          title: 'Share Baseline Staff Survey',
          description: 'Upload or schedule a pre-partnership wellness survey so we can measure growth together.',
          category: 'data',
          priority: 'medium',
        },
        {
          partnership_id: partnership.id,
          sort_order: 8,
          title: 'Share School Improvement Plan',
          description: 'Upload your current SIP so we can align PD strategies to your existing goals.',
          category: 'documentation',
          priority: 'low',
        },
        {
          partnership_id: partnership.id,
          sort_order: 9,
          title: 'Confirm Observation Day Dates',
          description: 'Work with your TDI partner to lock in dates for classroom walk-throughs.',
          category: 'scheduling',
          priority: 'low',
        },
        {
          partnership_id: partnership.id,
          sort_order: 10,
          title: 'Schedule Executive Impact Session',
          description: 'Plan a session with leadership to review partnership progress and impact data.',
          category: 'scheduling',
          priority: 'low',
        },
      ];

      await supabase.from('action_items').insert(defaultItems);

      // Get the slug for redirect
      const { data: updatedPartnership } = await supabase
        .from('partnerships')
        .select('slug')
        .eq('id', partnership.id)
        .single();

      // Update partnership status to active
      await supabase
        .from('partnerships')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnership.id);

      // Log activities
      await supabase.from('activity_log').insert([
        {
          partnership_id: partnership.id,
          user_id: userId,
          action: 'intake_step2_completed',
          details: { staff_count: staff.length },
        },
        {
          partnership_id: partnership.id,
          user_id: userId,
          action: 'setup_completed',
          details: {},
        },
      ]);

      return NextResponse.json({
        success: true,
        slug: updatedPartnership?.slug || partnership.id,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid step or missing data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error saving intake data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
