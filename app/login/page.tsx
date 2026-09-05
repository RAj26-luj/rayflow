'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        userType: 'merchant',
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        router.push('/overview');
      }
    } catch {
      setError('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('arjun@auraathletics.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4 selection:bg-amber-100 selection:text-amber-900">
      <div className="w-full max-w-md bg-white rounded-md border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-700 text-white font-bold mb-1">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Merchant Portal</h1>
          <p className="text-xs text-stone-500">Sign in to govern store policies, campaigns, and Razorpay transactions.</p>
        </div>

        {error && (
          <div className="rounded bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
            {error}
          </div>
        )}

        <div className="rounded bg-brand-50 border border-brand-200 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-brand-900">Demo Merchant</span>
            <span className="text-[10px] bg-brand-200/60 text-brand-900 px-1.5 py-0.5 rounded font-semibold">Preloaded</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Sign in as <strong>Aura Athletics</strong> to test the merchant dashboard immediately.
          </p>
          <Button variant="primary" size="sm" fullWidth onClick={handleDemoLogin}>
            Fill Demo Credentials
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Merchant Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arjun@auraathletics.com"
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
            Sign In to Merchant Portal
          </Button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          Need a merchant account?{' '}
          <Link href="/signup" className="text-brand-700 font-semibold hover:underline">
            Register store
          </Link>
        </div>
      </div>
    </div>
  );
}
