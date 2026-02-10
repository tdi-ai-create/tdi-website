import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

interface BuildingInput {
  name: string;
  building_type: string;
  lead_name: string;
  lead_email: string;
  staff_count: number;
}

// POST - Save data from action item inline forms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnershipId, actionItemId, userId, dataType, data } = body;

    if (!partnershipId || !actionItemId || !userId || !dataType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get the partnership to find the organization
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('id')
      .eq('id', partnershipId)
      .single();

    if (!partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // Get organization linked to this partnership
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('partnership_id', partnershipId)
      .single();

    let message = 'Saved successfully!';

    switch (dataType) {
      case 'website': {
        // Save website URL to organizations table
        if (org) {
          await supabase
            .from('organizations')
            .update({ website: data.website })
            .eq('id', org.id);
        }
        message = 'Website saved!';
        break;
      }

      case 'champion': {
        // Save champion info to partnerships.metadata JSONB or a dedicated column
        // For now, store in partnerships metadata
        const { data: currentPartnership } = await supabase
          .from('partnerships')
          .select('metadata')
          .eq('id', partnershipId)
          .single();

        const metadata = currentPartnership?.metadata || {};
        metadata.champions = metadata.champions || [];
        metadata.champions.push({
          name: data.championName,
          email: data.championEmail,
          added_at: new Date().toISOString(),
        });

        await supabase
          .from('partnerships')
          .update({ metadata })
          .eq('id', partnershipId);

        message = 'TDI Champion added!';
        break;
      }

      case 'buildings': {
        // Insert buildings into buildings table
        if (org && data.buildings && Array.isArray(data.buildings)) {
          const buildingsToInsert = data.buildings
            .filter((b: BuildingInput) => b.name.trim())
            .map((b: BuildingInput) => ({
              organization_id: org.id,
              name: b.name,
              building_type: b.building_type,
              lead_name: b.lead_name || null,
              lead_email: b.lead_email || null,
              staff_count: b.staff_count || 0,
            }));

          if (buildingsToInsert.length > 0) {
            await supabase.from('buildings').insert(buildingsToInsert);
          }
        }
        message = 'Buildings saved!';
        break;
      }

      case 'confirmation': {
        // Just mark as confirmed - no additional data to save
        message = data.confirmationMessage || 'Confirmed!';
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown data type' },
          { status: 400 }
        );
    }

    // Mark the action item as completed
    await supabase
      .from('action_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: userId,
      })
      .eq('id', actionItemId);

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      user_id: userId,
      action: 'action_item_completed',
      details: { action_item_id: actionItemId, data_type: dataType },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error saving action item data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
