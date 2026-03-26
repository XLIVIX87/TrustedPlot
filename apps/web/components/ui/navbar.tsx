'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const role = user?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path
      ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1'
      : 'text-slate-500 hover:text-slate-900 transition-colors';

  const mobileActive = (path: string) =>
    pathname === path
      ? 'text-primary font-bold bg-primary-fixed/10'
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low';

  const navLinks = [
    { href: '/listings', label: 'Listings', show: true },
    { href: '/dashboard', label: 'Dashboard', show: role === 'SELLER' || role === 'MANDATE' || (status === 'authenticated' && !['LEGAL_OPS', 'ADMIN'].includes(role)) },
    { href: '/inspections', label: 'Inspections', show: role === 'BUYER' || role === 'INSPECTOR' },
    { href: '/verification', label: 'Verification', show: role === 'LEGAL_OPS' || role === 'ADMIN' },
    { href: '/admin', label: 'Admin', show: role === 'ADMIN' },
  ].filter(l => l.show);

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-header border-b border-slate-200/20 shadow-sm">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 md:h-20 max-w-full">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter font-headline">
              TrustedPlot
            </Link>
            <nav className="hidden md:flex gap-8 items-center">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={`font-headline tracking-tight font-bold ${isActive(link.href)}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {status === 'authenticated' ? (
              <>
                <span className="hidden lg:flex items-center gap-2 text-sm">
                  <span className="text-on-surface-variant font-headline font-bold">{user?.name}</span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {role}
                  </span>
                </span>
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden sm:inline text-slate-500 hover:text-slate-900 font-headline text-sm font-bold transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-slate-500 hover:text-slate-900 font-headline text-sm font-bold transition-colors hidden sm:inline">
                  Sign In
                </Link>
                <Link href="/auth/signup"
                  className="machined-gradient text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-widest hover:scale-95 transition-all duration-150">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1">
              <span className="material-symbols-outlined text-on-surface">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-16 right-0 w-72 bg-surface shadow-xl rounded-bl-2xl border-l border-b border-outline-variant/20 p-4 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-bold transition-colors ${mobileActive(link.href)}`}>
                {link.label}
              </Link>
            ))}
            {status === 'authenticated' && (
              <>
                <div className="border-t border-outline-variant/20 my-2" />
                <div className="px-4 py-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">{user?.name}</span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">{role}</span>
                </div>
                <button onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-error hover:bg-error-container/30 transition-colors">
                  Sign Out
                </button>
              </>
            )}
            {status !== 'authenticated' && (
              <>
                <div className="border-t border-outline-variant/20 my-2" />
                <Link href="/auth/signin" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
