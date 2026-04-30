import { NextRequest, NextResponse } from 'next/server'
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
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const permanentOnly = searchParams.get('permanentOnly') === 'true'
    const search = searchParams.get('q')

    const supabase = getServiceSupabase()

    let query = supabase
      .from('partnership_staff')
      .select('id, first_name, last_name, email, role_group, photo_url, photo_thumb_url, photo_uploaded_at, photo_source, hub_enrolled')
      .eq('partnership_id', partnershipId)
      .order('last_name', { ascending: true })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,role_group.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: staff, error } = await query

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    let filtered = staff || []
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
