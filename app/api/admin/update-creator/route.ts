import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_FIELDS = [
  'email',
  'name',
  'content_path',
  'course_title',
  'course_audience',
  'target_publish_month',
  'discount_code',
  'status',
  'display_on_website',
  'website_display_name',
  'website_title',
  'website_bio',
  'display_order',
];

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await request.json();
    const { creatorId, field, value, adminEmail } = body;

    if (!creatorId || !field) {
      return NextResponse.json({
        success: false,
        error: 'Missing creatorId or field'
      }, { status: 400 });
    }

    // Validate field is allowed
    if (!ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json({
        success: false,
        error: `Field "${field}" is not editable`
      }, { status: 400 });
    }

    // Get current value for audit trail
    const { data: currentCreator, error: fetchError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (fetchError || !currentCreator) {
      return NextResponse.json({
        success: false,
        error: 'Creator not found'
      }, { status: 404 });
    }

    const oldValue = currentCreator[field];

    // Validate email format if updating email
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email format'
        }, { status: 400 });
      }

      // Check for duplicate email
      const { data: existing } = await supabase
        .from('creators')
        .select('id')
        .eq('email', value)
        .neq('id', creatorId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          success: false,
          error: 'Email already in use by another creator'
        }, { status: 400 });
      }
    }

    // Validate content_path
    if (field === 'content_path' && value) {
      if (!['blog', 'download', 'course'].includes(value)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid content path'
        }, { status: 400 });
      }
    }

    // Validate status
    if (field === 'status' && value) {
      if (!['active', 'inactive', 'paused', 'completed'].includes(value)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid status'
        }, { status: 400 });
      }
    }

    // Update the field
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[update-creator] Update error:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 });
    }

    // Create audit note
    const fieldLabels: Record<string, string> = {
      email: 'Email',
      name: 'Name',
      content_path: 'Content Path',
      course_title: 'Content Title',
      course_audience: 'Target Audience',
      target_publish_month: 'Target Launch Date',
      discount_code: 'Discount Code',
      status: 'Status',
      display_on_website: 'Website Visibility',
      website_display_name: 'Website Display Name',
      website_title: 'Website Title',
      website_bio: 'Website Bio',
      display_order: 'Display Order',
    };

    const formatValue = (val: unknown): string => {
      if (val === null || val === undefined) return '(not set)';
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      return String(val);
    };

    const adminName = adminEmail?.split('@')[0] || 'Admin';
    const noteContent = `[Auto] ${fieldLabels[field] || field} updated by ${adminName}: "${formatValue(oldValue)}" → "${formatValue(value)}"`;

    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: noteContent,
        author: 'System',
        visible_to_creator: false,
      });

    return NextResponse.json({
      success: true,
      message: `${fieldLabels[field] || field} updated successfully`,
      oldValue,
      newValue: value,
    });
  } catch (error) {
    console.error('[update-creator] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update creator'
    }, { status: 500 });
  }
}
