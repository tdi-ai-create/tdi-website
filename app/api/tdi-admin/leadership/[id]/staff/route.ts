import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase'

const PERMANENT_ROLES = ['teacher', 'coach', 'para', 'paraprofessional']

function isPermanentStaffRole(role: string | null): boolean {
  if (!role) return false
  const lower = role.toLowerCase()
  return PERMANENT_ROLES.some(r => lower.includes(r))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url)
    const permanentOnly = searchParams.get('permanentOnly') === 'true'
    const search = searchParams.get('q')

    const supabase = getServiceSupabase()

    // There are two staff tables and this route read the wrong one.
    //
    // Everything that writes a roster writes staff_members: the intake form,
    // the roster upload, the roster update, provisioning. partnership_staff is
    // the older table and holds 28 rows nothing has added to in a long time.
    // So this returned nothing for seven of the nine active partnerships. St.
    // Peter Chanel has 25 people on its roster and this page said "No staff
    // members in roster yet".
    //
    // It also selected four photo columns that exist on neither table, so the
    // query failed outright rather than merely returning the wrong rows. Photos
    // upload to the staff-photos storage bucket and then have nowhere to be
    // recorded, which is a separate decision rather than something to guess at
    // here, so they are returned as null until that column exists.
    //
    // The fallback to partnership_staff stays because St. Mary's ten and
    // Roosevelt's eighteen only exist there, and dropping this route back to
    // the current table must not lose them.
    const selectCurrent = 'id, first_name, last_name, email, role_title, hub_enrolled'

    let query = supabase
      .from('staff_members')
      .select(selectCurrent)
      .eq('partnership_id', partnershipId)
      .order('last_name', { ascending: true })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,role_title.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: current, error } = await query

    if (error) {
      console.error('[leadership/staff] staff_members read failed:', error.message)
      return NextResponse.json({ error: `Failed to fetch staff: ${error.message}` }, { status: 500 })
    }

    type StaffRow = { id: string; first_name: string | null; last_name: string | null; email: string | null; role_group: string | null; hub_enrolled: boolean | null; photo_url: null; photo_thumb_url: null; photo_uploaded_at: null; photo_source: null }

    const shape = (r: Record<string, unknown>, roleField: string): StaffRow => ({
      id: r.id as string,
      first_name: (r.first_name as string) ?? null,
      last_name: (r.last_name as string) ?? null,
      email: (r.email as string) ?? null,
      role_group: (r[roleField] as string) ?? null,
      hub_enrolled: (r.hub_enrolled as boolean) ?? null,
      photo_url: null,
      photo_thumb_url: null,
      photo_uploaded_at: null,
      photo_source: null,
    })

    let rows: StaffRow[] = (current ?? []).map((r) => shape(r as Record<string, unknown>, 'role_title'))

    if (rows.length === 0) {
      const { data: legacy, error: legacyError } = await supabase
        .from('partnership_staff')
        .select('id, first_name, last_name, email, role_group, hub_enrolled')
        .eq('partnership_id', partnershipId)
        .order('last_name', { ascending: true })

      if (legacyError) {
        console.error('[leadership/staff] partnership_staff fallback failed:', legacyError.message)
      } else {
        rows = (legacy ?? []).map((r) => shape(r as Record<string, unknown>, 'role_group'))
      }
    }

    let filtered = rows
    if (permanentOnly) {
      filtered = filtered.filter(s => isPermanentStaffRole(s.role_group))
    }

    return NextResponse.json({
      staff: filtered,
      total: filtered.length
    })
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
