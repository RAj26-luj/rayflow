'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/shop';

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
        userType: 'customer',
      });

      if (res?.error) {
        setError(res.error || 'Invalid email or password');
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

  const handleDemoCustomer = async () => {
    setError(null);
    setDemoLoading(true);
    setEmail('priya@auraathletics.com');
    setPassword('demo123');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'priya@auraathletics.com',
        password: 'demo123',
        userType: 'customer',
      });

      if (res?.error) {
        setError('Demo customer login failed. Please try again.');
        setDemoLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Failed to login as Demo Customer');
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2.5 mb-6 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">RAYFLOW</span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Welcome back to Shopping
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Sign in to complete checkout and view your purchase history
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200/80 rounded-2xl">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Customer Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Want to explore without registering?</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                Use preloaded demo customer data with seeded order history and recommendations.
              </p>
              <button
                onClick={handleDemoCustomer}
                disabled={loading || demoLoading}
                type="button"
                className="w-full rounded-lg bg-white border border-blue-200 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    <span>Loading Demo Customer...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Try Demo Customer (Priya Sharma)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-500">
            <div>
              Don&apos;t have an account?{' '}
              <Link
                href={`/customer/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                Create customer account
              </Link>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors mt-2"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Just exploring? Continue shopping</span>
            </Link>
          </div>
        </div>

        {/* Link to Merchant Portal */}
        <div className="mt-6 text-center">
          <Link
            href="/merchant/login"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Are you a merchant? <span className="underline font-semibold text-slate-700">Go to Merchant Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}
