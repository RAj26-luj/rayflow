'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, ArrowRight, AlertCircle, CheckCircle2, Store } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          storeName: storeName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Failed to create merchant account.');
        setLoading(false);
        return;
      }

      // Automatically sign in the user
      const loginRes = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (loginRes?.ok) {
        window.location.href = '/overview';
      } else {
        window.location.href = '/merchant/login';
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur">
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 mb-1">
            <TrendingUp className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Merchant Account</h1>
          <p className="text-xs text-slate-400">Launch commerce operations & growth rules</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g. Arjun Sharma"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Store / Brand Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g. Aura Athletics"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Work Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="merchant@yourbrand.com"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            loading={loading}
            disabled={loading}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Register & Launch Store
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
          Already have an account?{' '}
          <Link href="/merchant/login" className="text-blue-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

