'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) setError('Invalid email or password');
      else { router.push(callbackUrl); router.refresh(); }
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black text-primary tracking-tighter font-headline">TrustedPlot</Link>
          <p className="text-on-surface-variant mt-3 font-medium">Access the Digital Architect Ledger</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-10 shadow-sm border border-outline-variant/10">
          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-lg border-l-4 border-error">
              <p className="text-sm text-on-error-container font-medium">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <Link href="/auth/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Forgot?</Link>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                placeholder="Enter password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full machined-gradient text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-95 transition-all disabled:opacity-50 shadow-lg">
              {loading ? 'Authenticating...' : 'Sign In to Vault'}
            </button>
          </form>
          <p className="text-center text-sm text-on-surface-variant mt-8">
            New to the platform?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 text-center">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
              <button type="button" onClick={() => { setEmail('buyer@trustedplot.com'); setPassword('password123'); }} className="text-left p-2 rounded bg-surface-container-low hover:bg-surface-container">buyer@…</button>
              <button type="button" onClick={() => { setEmail('seller@trustedplot.com'); setPassword('password123'); }} className="text-left p-2 rounded bg-surface-container-low hover:bg-surface-container">seller@…</button>
              <button type="button" onClick={() => { setEmail('legal@trustedplot.com'); setPassword('password123'); }} className="text-left p-2 rounded bg-surface-container-low hover:bg-surface-container">legal@…</button>
              <button type="button" onClick={() => { setEmail('admin@trustedplot.com'); setPassword('password123'); }} className="text-left p-2 rounded bg-surface-container-low hover:bg-surface-container">admin@…</button>
              <button type="button" onClick={() => { setEmail('inspector@trustedplot.com'); setPassword('password123'); }} className="text-left p-2 rounded bg-surface-container-low hover:bg-surface-container">inspector@…</button>
              <button type="button" onClick={() => { setEmail('mandate@trustedplot.com'); setPassword('password123'); }} className="text-left p-2 rounded bg-surface-container-low hover:bg-surface-container">mandate@…</button>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-3 text-center">Password for all: <code className="font-mono">password123</code></p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return <Suspense fallback={null}><SignInForm /></Suspense>;
}
