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
    pathname === path
      ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1'
      : 'text-slate-500 hover:text-slate-900 transition-colors';

  return (
    <header className="fixed top-0 w-full z-50 glass-header border-b border-slate-200/20 shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-slate-900 tracking-tighter font-headline">
            TrustedPlot
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/listings" className={`font-headline tracking-tight font-bold ${isActive('/listings')}`}>
              Listings
            </Link>
            {(role === 'SELLER' || role === 'MANDATE') && (
              <Link href="/dashboard" className={`font-headline tracking-tight font-bold ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
            )}
            {role === 'BUYER' && (
              <Link href="/inspections" className={`font-headline tracking-tight font-bold ${isActive('/inspections')}`}>
                Inspections
              </Link>
            )}
            {(role === 'LEGAL_OPS' || role === 'ADMIN') && (
              <Link href="/verification" className={`font-headline tracking-tight font-bold ${isActive('/verification')}`}>
                Verification
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link href="/admin" className={`font-headline tracking-tight font-bold ${isActive('/admin')}`}>
                Admin
              </Link>
            )}
            {status === 'authenticated' && !['SELLER', 'MANDATE', 'LEGAL_OPS', 'ADMIN'].includes(role) && (
              <Link href="/dashboard" className={`font-headline tracking-tight font-bold ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {status === 'authenticated' ? (
            <>
              <span className="hidden lg:flex items-center gap-2 text-sm">
                <span className="text-on-surface-variant font-headline font-bold">{user?.name}</span>
                <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {role}
                </span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-slate-500 hover:text-slate-900 font-headline text-sm font-bold transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-slate-500 hover:text-slate-900 font-headline text-sm font-bold transition-colors hidden sm:inline">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="machined-gradient text-white px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:scale-95 transition-all duration-150"
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
