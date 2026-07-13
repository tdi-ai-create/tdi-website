import { NextRequest, NextResponse } from 'next/server';

const PARTNER_COOKIE = 'tdi_partnership_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const partnerParam = req.nextUrl.searchParams.get('partnership_id');

  if (partnerParam) {
    // Non-httpOnly so client JS can read for attribution at signup
    response.cookies.set(PARTNER_COOKIE, partnerParam, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return response;
}

export const config = { matcher: ['/((?!api|_next|favicon.ico).*)'] };
