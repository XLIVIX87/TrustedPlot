import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/inspections', '/escrow', '/documents'];
const ADMIN_ROUTES = ['/admin'];
const LEGAL_ROUTES = ['/verification'];
const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect authenticated routes
  if (PROTECTED_ROUTES.some(r => pathname.startsWith(r)) && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin-only routes
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Legal ops routes
  if (LEGAL_ROUTES.some(r => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    if (role !== 'LEGAL_OPS' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/verification/:path*',
    '/inspections/:path*',
    '/escrow/:path*',
    '/documents/:path*',
    '/auth/:path*',
  ],
};
