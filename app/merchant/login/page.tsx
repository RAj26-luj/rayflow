'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';

function MerchantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/overview';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        userType: 'merchant',
      });

      if (res?.error) {
        setError('Invalid merchant credentials.');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMerchant = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'arjun@auraathletics.com',
        password: 'demo123',
        userType: 'merchant',
      });

      if (!res?.error) {
        router.push('/overview');
      } else {
        setError('Could not sign in with demo credentials.');
      }
    } catch {
      setError('Failed to sign in as demo merchant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-violet-500/20 mb-2">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Merchant Portal</h1>
        <p className="text-xs text-zinc-400">Sign in to govern revenue policies, campaign rules, and Razorpay settlements.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-300 font-medium">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-zinc-950/70 border border-violet-900/40 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-violet-300">Demo Merchant</span>
          <span className="text-[10px] bg-violet-900/50 text-violet-300 border border-violet-700/50 px-2 py-0.5 rounded-full font-medium">Preloaded</span>
        </div>
        <p className="text-xs text-zinc-400">
          Try <strong className="text-zinc-200">Aura Athletics</strong> preloaded merchant store with sample orders and policies.
        </p>
        <Button variant="primary" size="sm" fullWidth onClick={handleDemoMerchant} isLoading={loading}>
          Try Demo Merchant (Aura Athletics)
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-medium text-zinc-300 block mb-1.5">Merchant Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="arjun@auraathletics.com"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="font-medium text-zinc-300 block mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading} icon={<ArrowRight className="h-4 w-4" />}>
          Sign In as Merchant
        </Button>
      </form>

      <div className="text-center text-xs text-zinc-500 pt-3 border-t border-zinc-800/80 space-y-1.5">
        <div>
          Need a merchant account?{' '}
          <Link href="/signup" className="text-violet-400 font-medium hover:text-violet-300 hover:underline">
            Register store
          </Link>
        </div>
        <div>
          Looking to shop?{' '}
          <Link href="/shop" className="text-zinc-400 font-medium hover:text-zinc-300 hover:underline">
            Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MerchantLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />

      <Suspense fallback={<div className="text-xs text-zinc-400 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-violet-400" /> Loading login form...</div>}>
        <MerchantLoginForm />
      </Suspense>
    </div>
  );
}
