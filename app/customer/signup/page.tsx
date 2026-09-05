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
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 selection:bg-violet-900 selection:text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-900/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl text-white">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-600 text-white font-bold mb-1 shadow-lg shadow-violet-950/60">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Customer Account</h1>
          <p className="text-xs text-zinc-400">Register to track orders, save shipping info, and checkout faster.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">Your Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Sharma"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-300 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@example.com"
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
            Create Account & Shop
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-3 border-t border-zinc-800/80">
          Already registered?{' '}
          <Link href="/customer/login" className="text-violet-300 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
