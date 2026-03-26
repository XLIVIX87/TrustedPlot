'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Registration failed'); return; }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) router.push('/auth/signin');
      else { router.push('/dashboard'); router.refresh(); }
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black text-primary tracking-tighter font-headline">TrustedPlot</Link>
          <p className="text-on-surface-variant mt-3 font-medium">Join the Digital Architect Ledger</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-10 shadow-sm border border-outline-variant/10">
          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-lg border-l-4 border-error">
              <p className="text-sm text-on-error-container font-medium">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                placeholder="Your full name" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Account Type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none">
                <option value="BUYER">Buyer / Renter</option>
                <option value="SELLER">Seller / Owner</option>
                <option value="MANDATE">Mandate / Agent</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full machined-gradient text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-95 transition-all disabled:opacity-50 shadow-lg">
              {loading ? 'Creating Vault...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-on-surface-variant mt-8">
            Already a member?{' '}
            <Link href="/auth/signin" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
