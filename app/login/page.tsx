'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, ArrowRight, AlertCircle, Sparkles, Store } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemo = async () => {
    setEmail('arjun@auraathletics.com');
    setPassword('demo123');
    setDemoLoading(true);
    try {
      const res = await signIn('credentials', {
        email: 'arjun@auraathletics.com',
        password: 'demo123',
        userType: 'merchant',
        redirect: false,
      });
      if (res?.ok) {
        window.location.href = '/overview';
      }
    } catch {
      setError('Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        userType: 'merchant',
        redirect: false,
      });

      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : (res.error || 'Invalid email or password.'));
      } else if (res?.ok) {
        window.location.href = '/overview';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 mb-1">
            <TrendingUp className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign in to RAYFLOW</h1>
          <p className="text-xs text-slate-400">Merchant Operations & Revenue Platform</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Merchant Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="merchant@yourbrand.com"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center justify-between gap-2">
            <div>
              <div className="font-bold text-[11px] text-white">Testing with Seeded Demo?</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Aura Athletics preloaded store</div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleFillDemo}
              loading={demoLoading}
            >
              Fill Demo Login
            </Button>
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
            Sign In to Merchant Dashboard
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
          Don&apos;t have a merchant account?{' '}
          <Link href="/signup" className="text-blue-400 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

