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
import { Badge, Button } from '@/components/ui';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-600">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2.5 mb-6 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">RAYFLOW</span>
        </Link>
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/70 px-3 py-0.5 text-[11px] font-semibold text-blue-300 mb-1">
            <Store className="h-3 w-3 text-blue-400" />
            Merchant Control Center
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Merchant Portal
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to govern revenue policies, simulations, and Razorpay settlements
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-8 shadow-2xl rounded-2xl backdrop-blur space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-950/60 p-3.5 text-xs text-rose-300 border border-rose-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Merchant Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@auraathletics.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              loading={loading}
              disabled={loading || demoLoading}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In as Merchant
            </Button>
          </form>

          {/* 1-Click Demo Merchant Button */}
          <div className="pt-4 border-t border-slate-800">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Evaluating the Platform?</span>
                </div>
                <Badge variant="indigo" size="sm">Preloaded</Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Explore RAYFLOW instantly using preloaded demo store data (<span className="text-slate-300 font-medium">Aura Athletics</span>).
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleDemoMerchant}
                loading={demoLoading}
                disabled={loading || demoLoading}
                icon={<Store className="h-3.5 w-3.5" />}
              >
                Try Demo Merchant (Aura Athletics)
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
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
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors mt-1"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-blue-400" />
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      }
    >
      <MerchantLoginForm />
    </Suspense>
  );
}

