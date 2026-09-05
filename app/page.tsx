'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Store,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui';

const ProductScene = dynamic(() => import('@/components/three/ProductScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] sm:h-[420px] rounded-xl bg-stone-900 flex items-center justify-center text-stone-400 text-xs">
      Loading scene...
    </div>
  ),
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      <nav className="border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700 text-white font-bold shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-stone-900">RAYFLOW</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/shop">
              <Button variant="primary" size="sm" icon={<ShoppingBag className="h-3.5 w-3.5" />}>
                Shop Store
              </Button>
            </Link>
            <Link href="/merchant/login">
              <Button variant="secondary" size="sm" icon={<Store className="h-3.5 w-3.5 text-stone-600" />}>
                Merchant Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              <Sparkles className="h-3.5 w-3.5 text-brand-700" />
              <span>Modern Commerce Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
              One place to shop.{' '}
              <span className="text-brand-700">
                A smarter way to grow.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
              RAYFLOW connects customer intent with merchant growth: tailored gear discovery and instant bundle savings for buyers, paired with margin rules and Razorpay checkout for store owners.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={<ShoppingBag className="h-4 w-4" />} className="w-full sm:w-auto">
                  Explore Buyer Store
                </Button>
              </Link>

              <Link href="/merchant/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" icon={<Store className="h-4 w-4 text-stone-600" />} className="w-full sm:w-auto">
                  Open Merchant Portal
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full">
            <ProductScene />
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Two Purpose-Built Experiences
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Designed for buyers and store owners on a unified commerce platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-stone-200 bg-white p-6 flex flex-col justify-between shadow-2xs hover:border-brand-500/50 transition-all">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 border border-brand-200 mb-4">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Customer Storefront</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                Discover performance gear, receive tailored product recommendations, enjoy automatic multi-item savings, and complete payments via Razorpay.
              </p>
              <ul className="space-y-2 text-xs text-stone-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-700 flex-shrink-0" />
                  <span>Interactive product discovery & gear bundles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-700 flex-shrink-0" />
                  <span>Automatic bundle savings calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-700 flex-shrink-0" />
                  <span>Razorpay test mode payments</span>
                </li>
              </ul>
            </div>
            <Link href="/shop">
              <Button variant="primary" size="md" className="w-full" icon={<ArrowRight className="h-4 w-4" />}>
                Launch Buyer Store
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6 flex flex-col justify-between shadow-2xs hover:border-stone-300 transition-all">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-700 border border-stone-200 mb-4">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Merchant Revenue Center</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                Review store opportunities, run promotion simulations, set discount policy rules, and track Razorpay transactions.
              </p>
              <ul className="space-y-2 text-xs text-stone-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-stone-500 flex-shrink-0" />
                  <span>Revenue opportunities & growth insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-stone-500 flex-shrink-0" />
                  <span>Configurable discount caps and approval rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-stone-500 flex-shrink-0" />
                  <span>Complete activity log & settlement ledger</span>
                </li>
              </ul>
            </div>
            <Link href="/merchant/login">
              <Button variant="secondary" size="md" className="w-full" icon={<ArrowRight className="h-4 w-4 text-stone-600" />}>
                Open Merchant Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white px-4 sm:px-6 py-8 text-center text-xs text-stone-500">
        <p>RAYFLOW — Commerce Platform with Razorpay Payments</p>
      </footer>
    </div>
  );
}
