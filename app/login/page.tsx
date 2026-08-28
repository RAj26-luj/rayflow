'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Lock, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemo = () => {
    setEmail('arjun@auraathletics.com');
    setPassword('demo123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || 'Invalid email or password.');
      } else if (res?.ok) {
        router.push('/overview');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Sign in to RAYFLOW</h1>
          <p className="text-xs text-slate-500">Autonomous AI Revenue Agent for Razorpay</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Merchant Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1.5 rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
              placeholder="merchant@yourbrand.com"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1.5 rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between gap-2">
            <div>
              <div className="font-bold text-[11px]">Testing with Seeded Demo?</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Use pre-seeded Aura Athletics store data</div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="rounded-md bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 font-semibold px-2.5 py-1 text-[10px] transition-colors border border-blue-200 flex-shrink-0"
            >
              Fill Demo Login
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Merchant Dashboard'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don&apos;t have a merchant account?{' '}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
