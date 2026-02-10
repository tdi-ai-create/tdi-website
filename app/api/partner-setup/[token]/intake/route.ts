import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPartnershipById } from '@/lib/partnership-portal-data';
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
        contract_phase: partnership.contract_phase,
        building_count: partnership.building_count,
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

// POST - Save intake step data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { step, orgData, buildings, staff } = body;

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

    // Step 1: Save organization data
    if (step === 1 && orgData) {
      // Generate slug from org name
      const slug = await getUniqueSlug(supabase, orgData.name);

      // Update partnership slug
      await supabase
        .from('partnerships')
        .update({ slug, updated_at: new Date().toISOString() })
        .eq('id', partnership.id);

      // Create or update organization
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('partnership_id', partnership.id)
        .maybeSingle();

      if (existingOrg) {
        await supabase
          .from('organizations')
          .update({
            ...orgData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingOrg.id);
      } else {
        await supabase.from('organizations').insert({
          partnership_id: partnership.id,
          ...orgData,
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

    // Step 2: Save buildings
    if (step === 2 && buildings) {
      // Get organization
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('partnership_id', partnership.id)
        .single();

      if (!org) {
        return NextResponse.json(
          { success: false, error: 'Organization not found. Complete step 1 first.' },
          { status: 400 }
        );
      }

      // Delete existing buildings
      await supabase
        .from('buildings')
        .delete()
        .eq('organization_id', org.id);

      // Insert new buildings
      if (partnership.partnership_type === 'district' && buildings.length > 0) {
        const buildingData = buildings.map((b: {
          name: string;
          building_type: string;
          lead_name: string;
          lead_email: string;
          estimated_staff_count: number;
        }) => ({
          organization_id: org.id,
          name: b.name,
          building_type: b.building_type,
          lead_name: b.lead_name,
          lead_email: b.lead_email,
          estimated_staff_count: b.estimated_staff_count,
        }));

        await supabase.from('buildings').insert(buildingData);
      }

      // Log activity
      await supabase.from('activity_log').insert({
        partnership_id: partnership.id,
        user_id: userId,
        action: 'intake_step2_completed',
        details: { building_count: buildings.length },
      });

      return NextResponse.json({ success: true });
    }

    // Step 3: Save staff roster
    if (step === 3 && staff) {
      // Get buildings for mapping (if district)
      let buildingMap: Record<string, string> = {};
      if (partnership.partnership_type === 'district') {
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('partnership_id', partnership.id)
          .single();

        if (org) {
          const { data: buildings } = await supabase
            .from('buildings')
            .select('id, name')
            .eq('organization_id', org.id);

          if (buildings) {
            buildings.forEach(b => {
              buildingMap[b.name.toLowerCase()] = b.id;
            });
          }
        }
      }

      // Delete existing staff
      await supabase
        .from('staff_members')
        .delete()
        .eq('partnership_id', partnership.id);

      // Insert staff members
      const staffData = staff.map((s: {
        first_name: string;
        last_name: string;
        email: string;
        role_title: string;
        building_name?: string;
      }) => ({
        partnership_id: partnership.id,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        role_title: s.role_title,
        building_id: s.building_name ? buildingMap[s.building_name.toLowerCase()] || null : null,
        hub_enrolled: false,
      }));

      await supabase.from('staff_members').insert(staffData);

      // Create default action items
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
          description: 'Book your first virtual session with the TDI team to kick things off.',
          category: 'scheduling',
          priority: 'high',
        },
        {
          partnership_id: partnership.id,
          sort_order: 3,
          title: 'Suggest TDI Champion(s)',
          description: 'Identify a staff member who can help keep Hub momentum going.',
          category: 'engagement',
          priority: 'medium',
        },
        {
          partnership_id: partnership.id,
          sort_order: 4,
          title: 'Add Hub Time to PLCs',
          description: 'Build in 15-30 minutes of protected Hub time for higher implementation.',
          category: 'engagement',
          priority: 'medium',
        },
        {
          partnership_id: partnership.id,
          sort_order: 5,
          title: 'Share Baseline Staff Survey',
          description: 'Upload or schedule a pre-partnership wellness survey.',
          category: 'data',
          priority: 'medium',
        },
      ];

      await supabase.from('action_items').insert(defaultItems);

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
          action: 'intake_step3_completed',
          details: { staff_count: staff.length },
        },
        {
          partnership_id: partnership.id,
          user_id: userId,
          action: 'setup_completed',
          details: {},
        },
      ]);

      return NextResponse.json({ success: true });
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
