'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
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
      else { router.push('/dashboard'); router.refresh(); }
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full machined-gradient text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-95 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Authenticating...' : 'Sign In to Vault'}
            </button>
          </form>
          <p className="text-center text-sm text-on-surface-variant mt-8">
            New to the platform?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
