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
        email: 'priya@example.com',
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
    <div className="w-full max-w-md bg-white rounded-md border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-5">
      <div className="text-center space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-700 text-white font-bold mb-1">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Customer Sign In</h1>
        <p className="text-xs text-stone-500">Sign in to view order history and checkout faster with Razorpay.</p>
      </div>

      {error && (
        <div className="rounded bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
          {error}
        </div>
      )}

      <div className="rounded bg-brand-50 border border-brand-200 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-brand-900">Demo Customer</span>
          <span className="text-[10px] bg-brand-200/60 text-brand-900 px-1.5 py-0.5 rounded font-semibold">Instant</span>
        </div>
        <p className="text-[11px] text-stone-600">
          Sign in as <strong>Priya Sharma</strong> to test customer checkout and order history.
        </p>
        <Button variant="primary" size="sm" fullWidth onClick={handleDemoCustomer} isLoading={loading}>
          Continue as Demo Customer (Priya)
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-semibold text-stone-700 block mb-1">Customer Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya@example.com"
            className="w-full rounded border border-stone-300 p-2.5 text-stone-900 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="font-semibold text-stone-700 block mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded border border-stone-300 p-2.5 text-stone-900 focus:outline-none focus:border-brand-500"
          />
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading} icon={<ArrowRight className="h-4 w-4" />}>
          Sign In to Shop
        </Button>
      </form>

      <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100 space-y-1">
        <div>
          New customer?{' '}
          <Link href="/customer/signup" className="text-brand-700 font-semibold hover:underline">
            Create shopper account
          </Link>
        </div>
        <div>
          Are you a store owner?{' '}
          <Link href="/merchant/login" className="text-stone-700 font-semibold hover:underline">
            Merchant Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4 selection:bg-amber-100 selection:text-amber-900">
      <Suspense fallback={<div className="text-xs text-stone-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading login form...</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
