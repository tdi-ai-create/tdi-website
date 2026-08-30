import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { createClient } from '@supabase/supabase-js';

// Service Supabase client with admin privileges
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

// GET - Fetch all action items across all partnerships
export async function GET(_request: NextRequest) {
  try {
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

    const supabase = getServiceSupabase();

    // Fetch all action items with partnership info
    const { data: actionItems, error } = await supabase
      .from('action_items')
      .select(`
        id,
        partnership_id,
        title,
        description,
        category,
        priority,
        status,
        due_date,
        created_at
      `)
      .neq('status', 'completed')
      .order('priority', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching action items:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch action items' },
        { status: 500 }
      );
    }

    // Get unique partnership IDs
    const partnershipIds = [...new Set(actionItems?.map((item) => item.partnership_id) || [])];

    // Fetch partnership info for each
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, org_name, contact_name, slug')
      .in('id', partnershipIds);

    // Fetch organization names
    const { data: organizations } = await supabase
      .from('organizations')
      .select('partnership_id, name')
      .in('partnership_id', partnershipIds);

    // Create a map of partnership info
    const partnershipMap = new Map<string, { org_name?: string; contact_name?: string; slug?: string }>();
    partnerships?.forEach((p) => {
      const org = organizations?.find((o) => o.partnership_id === p.id);
      partnershipMap.set(p.id, {
        // partnerships.org_name first. This read only the organizations table,
        // and Addison and Tidioute have no row there, so their action items
        // fell back to the contact and the list showed "Melissa Mahaney" where
        // every other row showed a school. The detail route was fixed for the
        // same reason in August; this one was missed.
        org_name: p.org_name || org?.name,
        contact_name: p.contact_name,
        slug: p.slug,
      });
    });

    // Enrich action items with partnership info
    const enrichedActionItems = actionItems?.map((item) => ({
      ...item,
      partnership: partnershipMap.get(item.partnership_id) || null,
    }));

    // Sort by priority (high > medium > low) then by due date
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    enrichedActionItems?.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;

      return 0;
    });

    return NextResponse.json({
      success: true,
      actionItems: enrichedActionItems || [],
    });
  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch action items' },
      { status: 500 }
    );
  }
}
