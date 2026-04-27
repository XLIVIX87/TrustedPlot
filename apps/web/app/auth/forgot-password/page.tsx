'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Phase 1: stub — log to audit and show generic success message regardless of whether email exists
    // (prevents user enumeration). Real email-sending integration is a Phase 2 task.
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {/* ignore */}
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black text-primary tracking-tighter font-headline">TrustedPlot</Link>
          <p className="text-on-surface-variant mt-3 font-medium">Reset your password</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-10 shadow-sm border border-outline-variant/10">
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>mark_email_read</span>
              </div>
              <div>
                <h2 className="font-headline font-bold text-xl mb-2">Check your inbox</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
                  The link will expire in 30 minutes.
                </p>
              </div>
              <div className="bg-secondary-fixed/20 rounded-lg p-4 text-left">
                <p className="text-xs text-on-secondary-fixed font-medium leading-relaxed">
                  <span className="font-bold">Phase 1 note:</span> Email sending is not yet configured.
                  This is a UI placeholder. In production, contact <a href="mailto:support@trustedplot.com" className="underline">support@trustedplot.com</a> to recover your account.
                </p>
              </div>
              <Link href="/auth/signin" className="text-primary font-bold text-sm hover:underline">← Back to sign in</Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all font-headline font-bold text-lg rounded-none"
                    placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading || !email}
                  className="w-full machined-gradient text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-95 transition-all disabled:opacity-50 shadow-lg">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-on-surface-variant mt-8">
                Remembered it? <Link href="/auth/signin" className="text-primary font-bold hover:underline">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
