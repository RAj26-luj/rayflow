'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export default function CustomerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/customer/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create shopper account.');
        setLoading(false);
        return;
      }

      const loginRes = await signIn('credentials', {
        email,
        password,
        userType: 'customer',
        redirect: false,
      });

      if (!loginRes?.error) {
        router.push('/shop');
      } else {
        router.push('/customer/login');
      }
    } catch {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4 selection:bg-amber-100 selection:text-amber-900">
      <div className="w-full max-w-md bg-white rounded-md border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-700 text-white font-bold mb-1">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Create Customer Account</h1>
          <p className="text-xs text-stone-500">Register to track orders, save shipping info, and checkout faster.</p>
        </div>

        {error && (
          <div className="rounded bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Your Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Sharma"
              className="w-full rounded border border-stone-300 p-2.5 text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Email Address</label>
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
            Create Account & Shop
          </Button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          Already registered?{' '}
          <Link href="/customer/login" className="text-brand-700 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
