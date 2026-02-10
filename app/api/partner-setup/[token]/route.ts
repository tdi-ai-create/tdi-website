import { NextRequest, NextResponse } from 'next/server';
import { getPartnershipByToken } from '@/lib/partnership-portal-data';

// GET - Fetch partnership by invite token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const partnership = await getPartnershipByToken(token);

    if (!partnership) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Return limited partnership info for security
    return NextResponse.json({
      success: true,
      partnership: {
        id: partnership.id,
        partnership_type: partnership.partnership_type,
        contact_name: partnership.contact_name,
        contact_email: partnership.contact_email,
        contract_phase: partnership.contract_phase,
        invite_token: partnership.invite_token,
        invite_accepted_at: partnership.invite_accepted_at,
        status: partnership.status,
      },
    });
  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partnership' },
      { status: 500 }
    );
  }
}
