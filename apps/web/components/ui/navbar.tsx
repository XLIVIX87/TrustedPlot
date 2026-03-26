'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const role = user?.role;

  const isActive = (path: string) =>
    pathname === path ? 'text-brand-primary font-medium' : 'text-gray-600 hover:text-brand-primary';

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold text-brand-dark">
            TrustedPlot
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            <Link href="/listings" className={`text-sm ${isActive('/listings')}`}>
              Browse
            </Link>
            {(role === 'SELLER' || role === 'MANDATE') && (
              <Link href="/dashboard" className={`text-sm ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
            )}
            {role === 'BUYER' && (
              <Link href="/inspections" className={`text-sm ${isActive('/inspections')}`}>
                Inspections
              </Link>
            )}
            {(role === 'LEGAL_OPS' || role === 'ADMIN') && (
              <Link href="/verification" className={`text-sm ${isActive('/verification')}`}>
                Verification
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link href="/admin" className={`text-sm ${isActive('/admin')}`}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {status === 'authenticated' ? (
            <>
              <span className="text-sm text-gray-500 hidden md:inline">
                {user?.name}
                <span className="ml-1.5 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-gray-600">
                  {role}
                </span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm text-gray-600 hover:text-brand-primary"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-brand-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
