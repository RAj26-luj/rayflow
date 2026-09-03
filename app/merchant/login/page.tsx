'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  ShoppingBag,
} from 'lucide-react';

function MerchantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/overview';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        userType: 'merchant',
      });

      if (res?.error) {
        setError(res.error || 'Invalid merchant credentials');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoMerchant = async () => {
    setError(null);
    setDemoLoading(true);
    setEmail('arjun@auraathletics.com');
    setPassword('demo123');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'arjun@auraathletics.com',
        password: 'demo123',
        userType: 'merchant',
      });

      if (res?.error) {
        setError('Demo merchant login failed. Please try again.');
        setDemoLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Failed to login as Demo Merchant');
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-600">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2.5 mb-6 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">RAYFLOW</span>
        </Link>
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/60 px-3 py-1 text-[11px] font-medium text-blue-300 mb-2">
            <Store className="h-3 w-3 text-blue-400" />
            Merchant Control Center
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Merchant Portal
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to govern revenue policies, AI simulations, and Razorpay settlements
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-950/90 border border-slate-800 py-8 px-6 sm:px-8 shadow-2xl rounded-2xl backdrop-blur">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-950/60 p-3.5 text-xs text-red-300 border border-red-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Merchant Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Merchant</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Merchant Button */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-1">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Want to test the platform?</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Explore RAYFLOW using preloaded demo store data (<span className="text-slate-300 font-medium">Aura Athletics</span>).
              </p>
              <button
                onClick={handleDemoMerchant}
                disabled={loading || demoLoading}
                type="button"
                className="w-full rounded-lg bg-indigo-600/90 border border-indigo-500/40 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Loading Demo Store...</span>
                  </>
                ) : (
                  <>
                    <Store className="h-3.5 w-3.5 text-indigo-200" />
                    <span>Try Demo Merchant (Aura Athletics)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-400">
            <div>
              New store owner?{' '}
              <Link
                href="/signup"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Register merchant account
              </Link>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors mt-2"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" />
              <span>Looking to shop? Go to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MerchantLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      }
    >
      <MerchantLoginForm />
    </Suspense>
  );
}
