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
          const { error: dataError } = await supabase
            .from('organizations')
            .update({ website: data.website })
            .eq('id', org.id);

          if (dataError) {
            console.error('[partners/action-item-data] action item data not saved:', dataError.message);
          }
        }
        message = 'Website saved!';
        break;
      }

      case 'champion': {
        // This used to read and write partnerships.metadata, a column that does
        // not exist. The select failed, the update failed with 42703, both
        // errors were discarded, and the school was told "TDI Champion added!".
        // Every champion named through this route was thrown away.
        //
        // It is recorded on the timeline rather than in a new column, because
        // partnership_users has no email field and inventing a schema for a
        // product concept is not this change's job. The name and email are
        // preserved in details, so nothing is lost and it is visible on the
        // partnership record while the right home is decided.
        const { error: championError } = await supabase.from('activity_log').insert({
          partnership_id: partnershipId,
          action: 'tdi_champion_named',
          details: {
            name: data.championName,
            email: data.championEmail,
          },
        });

        if (championError) {
          console.error('[partners/action-item-data] champion not recorded:', championError.message);
          return NextResponse.json(
            { error: `Could not save ${data.championName} as your TDI Champion: ${championError.message}` },
            { status: 500 }
          );
        }

        message = 'TDI Champion added!';
        break;
      }

      case 'buildings': {
        /**
         * The column is `estimated_staff_count`. This wrote `staff_count`,
         * which does not exist on `buildings`, so Postgres rejected the entire
         * insert every time. The error was only logged and the route still
         * answered "Buildings saved!", so a school filled the step in, saw
         * success, and got nothing.
         *
         * That is why on 30 September 2026 not one of the nine active
         * partnerships had a single building row, and why Addison's Schools tab
         * showed an example district called Harmony Elementary instead of their
         * own eight schools.
         */
        if (!org) {
          console.error('[partners/action-item-data] no organizations row, buildings cannot be saved');
          return NextResponse.json(
            { error: 'This partnership has no organization record yet, so buildings cannot be saved.' },
            { status: 409 }
          );
        }

        if (data.buildings && Array.isArray(data.buildings)) {
          const buildingsToInsert = data.buildings
            .filter((b: BuildingInput) => b.name.trim())
            .map((b: BuildingInput) => ({
              organization_id: org.id,
              name: b.name,
              building_type: b.building_type,
              lead_name: b.lead_name || null,
              lead_email: b.lead_email || null,
              estimated_staff_count: b.staff_count || 0,
            }));

          if (buildingsToInsert.length > 0) {
            const { data: inserted, error: buildingsError } = await supabase
              .from('buildings')
              .insert(buildingsToInsert)
              .select('id');

            // Never report success the database did not give us.
            if (buildingsError) {
              console.error('[partners/action-item-data] buildings not saved:', buildingsError.message);
              return NextResponse.json(
                { error: `Buildings were not saved: ${buildingsError.message}` },
                { status: 500 }
              );
            }

            const savedCount = inserted?.length ?? 0;
            if (savedCount !== buildingsToInsert.length) {
              console.error(
                `[partners/action-item-data] expected ${buildingsToInsert.length} buildings, saved ${savedCount}`
              );
              return NextResponse.json(
                { error: 'Some buildings were not saved. Nothing has been confirmed.' },
                { status: 500 }
              );
            }

            message = `${savedCount} building${savedCount === 1 ? '' : 's'} saved.`;
            break;
          }
        }

        message = 'No buildings to save.';
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
    const { error: itemError } = await supabase
      .from('action_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: userId,
      })
      .eq('id', actionItemId);

    if (itemError) {
      console.error('[partners/action-item-data] action item not updated:', itemError.message);
    }

    // Log activity
    const { error: logError } = await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      user_id: userId,
      action: 'action_item_completed',
      details: { action_item_id: actionItemId, data_type: dataType },
    });

    if (logError) {
      console.error('[partners/action-item-data] activity_log insert failed:', logError.message);
    }

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
