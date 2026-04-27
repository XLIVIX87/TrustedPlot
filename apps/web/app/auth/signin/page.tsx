'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DEMO_ACCOUNTS = [
  { label: 'Buyer',     email: 'buyer@trustedplot.com',     icon: 'person_search' },
  { label: 'Seller',    email: 'seller@trustedplot.com',    icon: 'storefront' },
  { label: 'Inspector', email: 'inspector@trustedplot.com', icon: 'home_search' },
  { label: 'Legal',     email: 'legal@trustedplot.com',     icon: 'gavel' },
  { label: 'Admin',     email: 'admin@trustedplot.com',     icon: 'admin_panel_settings' },
  { label: 'Mandate',   email: 'mandate@trustedplot.com',   icon: 'badge' },
];

const TRUST_POINTS = [
  { icon: 'verified',          text: 'Every listing legally vetted' },
  { icon: 'home_search',       text: 'On-site inspector reports' },
  { icon: 'account_balance',   text: 'Escrow-protected transactions' },
  { icon: 'description',       text: 'C of O document vaulting' },
];

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) setError('Invalid email or password. Please try again.');
      else { router.push(callbackUrl); router.refresh(); }
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen flex">
      {/* ── Left: Brand Panel ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] trust-gradient flex-col justify-between p-12 relative overflow-hidden shrink-0">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-60px] w-96 h-96 rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group animate-fade-in">
          <svg width="36" height="36" viewBox="0 0 30 30" fill="none" className="shrink-0">
            <path d="M15 2L3 8v9c0 6.6 4.8 12.8 12 14.9C22.2 29.8 27 23.6 27 17V8L15 2z"
              fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M10 15.5l3.5 3.5L21 11.5"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white font-headline font-black tracking-tighter text-2xl">TrustedPlot</span>
        </Link>

        {/* Hero copy */}
        <div className="space-y-8 animate-fade-in-up stagger-1">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">The Digital Architect Ledger</p>
            <h2 className="text-white text-4xl font-headline font-black tracking-tight leading-[1.15] mb-4">
              Nigeria&apos;s trust<br/>infrastructure for<br/>real estate.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Every property verified. Every transaction escrow-protected. Every document vaulted.
            </p>
          </div>

          <ul className="space-y-4">
            {TRUST_POINTS.map(p => (
              <li key={p.icon} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{p.icon}</span>
                </div>
                <span className="text-white/75 text-sm font-medium">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer tagline */}
        <p className="text-white/25 text-xs animate-fade-in stagger-2">
          © 2024 TrustedPlot · Institutional-grade property intelligence
        </p>
      </div>

      {/* ── Right: Form Panel ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
              <path d="M15 2L3 8v9c0 6.6 4.8 12.8 12 14.9C22.2 29.8 27 23.6 27 17V8L15 2z"
                fill="#0F172A" fillOpacity="0.12" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 15.5l3.5 3.5L21 11.5"
                stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-headline font-black tracking-tighter text-xl text-on-surface">TrustedPlot</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-1">Welcome back</h1>
            <p className="text-on-surface-variant text-sm">Sign in to access your vault and dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-xl border-l-4 border-error flex items-center gap-3 animate-scale-in">
              <span className="material-symbols-outlined text-on-error-container text-sm shrink-0">error</span>
              <p className="text-sm text-on-error-container font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                Email Address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="auth-input"
                placeholder="you@example.com"
                autoComplete="email" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <Link href="/auth/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="auth-input"
                placeholder="Enter your password"
                autoComplete="current-password" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full machined-gradient text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lock_open</span>
                  Sign In to Vault
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            New to the platform?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-outline-variant/15">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 text-center">
              Demo Accounts · password: <code className="font-mono bg-surface-container-low px-1 rounded">password123</code>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(a => (
                <button key={a.email} type="button"
                  onClick={() => { setEmail(a.email); setPassword('password123'); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-center transition-all group">
                  <span className="material-symbols-outlined text-on-surface-variant text-base group-hover:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{a.icon}</span>
                  <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors uppercase tracking-wide">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return <Suspense fallback={null}><SignInForm /></Suspense>;
}
