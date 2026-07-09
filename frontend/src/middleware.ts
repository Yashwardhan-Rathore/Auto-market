import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all static/internal paths through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Root path → redirect to dashboard (client will redirect to login if not authed)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Allow public pages through always
  if (isPublic) {
    return NextResponse.next();
  }

  // For protected routes: check cookie-based token (set by server actions or SSO)
  // For our MVP with localStorage-only auth, let the client-side guard handle it
  // The middleware just allows through — client Zustand store + route guard handles protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
