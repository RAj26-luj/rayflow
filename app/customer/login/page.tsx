'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/shop';

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
        userType: 'customer',
      });

      if (res?.error) {
        setError('Invalid customer credentials.');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomer = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'priya@auraathletics.com',
        password: 'demo123',
        userType: 'customer',
      });

      if (!res?.error) {
        router.push('/shop');
      } else {
        setError('Could not sign in as demo customer.');
      }
    } catch {
      setError('Failed to sign in as demo customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl text-white">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-600 text-white font-bold mb-1 shadow-lg shadow-violet-950/60">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Customer Sign In</h1>
        <p className="text-xs text-zinc-400">Sign in to view order history and checkout faster with Razorpay.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-violet-950/60 border border-violet-800/60 p-4 space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-violet-300">Demo Customer</span>
          <span className="text-[10px] bg-violet-900/80 text-violet-200 border border-violet-700/60 px-2 py-0.5 rounded-full font-bold">Instant</span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Sign in as <strong>Priya Sharma</strong> to test customer checkout and order history.
        </p>
        <Button variant="primary" size="sm" fullWidth onClick={handleDemoCustomer} isLoading={loading}>
          Continue as Demo Customer (Priya)
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Customer Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya@auraathletics.com"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading} icon={<ArrowRight className="h-4 w-4" />}>
          Sign In to Shop
        </Button>
      </form>

      <div className="text-center text-xs text-zinc-400 pt-3 border-t border-zinc-800/80 space-y-1.5">
        <div>
          New customer?{' '}
          <Link href="/customer/signup" className="text-violet-300 font-bold hover:underline">
            Create shopper account
          </Link>
        </div>
        <div>
          Are you a store owner?{' '}
          <Link href="/merchant/login" className="text-zinc-300 font-bold hover:underline">
            Merchant Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 selection:bg-violet-900 selection:text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-900/20 blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-xs text-zinc-400 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-violet-400" /> Loading login form...</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
