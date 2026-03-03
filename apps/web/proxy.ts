import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'better-auth.session_token';
const SECURE_AUTH_COOKIE = '__Secure-better-auth.session_token';
const AUTH_ROUTES = ['/login', '/verify-otp'];

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.has(AUTH_COOKIE) || request.cookies.has(SECURE_AUTH_COOKIE);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/household', request.url));
  }

  if (!isAuthenticated && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
