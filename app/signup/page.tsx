'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, storeName, email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create merchant account.');
        setLoading(false);
        return;
      }

      const loginRes = await signIn('credentials', {
        email,
        password,
        userType: 'merchant',
        redirect: false,
      });

      if (!loginRes?.error) {
        router.push('/overview');
      } else {
        router.push('/login');
      }
    } catch {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-violet-500/20 mb-2">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Merchant Account</h1>
          <p className="text-xs text-zinc-400">Register your store to govern growth rules & Razorpay checkout.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-zinc-300 block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arjun Sharma"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-300 block mb-1.5">Store / Brand Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Aura Athletics"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-300 block mb-1.5">Work Email</label>
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
            Register & Launch Store
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-3 border-t border-zinc-800/80">
          Already registered?{' '}
          <Link href="/login" className="text-violet-400 font-medium hover:text-violet-300 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
