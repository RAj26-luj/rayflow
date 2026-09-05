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
import { CategoryRail } from '@/components/ui/CategoryRail';
import { PromoBanner } from '@/components/ui/PromoBanner';

const ProductScene = dynamic(() => import('@/components/three/ProductScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[340px] sm:h-[450px] rounded-3xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400 text-xs backdrop-blur-xl animate-pulse">
      Loading 3D Product Canvas...
    </div>
  ),
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-violet-900 selection:text-white relative overflow-hidden">
      {/* Background Glow Atmospheric Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-900/25 via-violet-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[400px] right-0 w-[500px] h-[400px] bg-pink-900/15 blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-2xl sticky top-0 z-40 px-4 sm:px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-violet-950/60">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">RAYFLOW</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/shop">
              <Button variant="primary" size="sm" icon={<ShoppingBag className="h-4 w-4" />}>
                Explore Store
              </Button>
            </Link>
            <Link href="/merchant/login">
              <Button variant="secondary" size="sm" icon={<Store className="h-4 w-4 text-zinc-300" />} className="bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white">
                Merchant Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-800/60 bg-violet-950/80 px-3.5 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md shadow-xs">
              <span>Storefront & Management</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Shop better.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400">
                Grow faster.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              Browse products with 3D views and easy checkout. Manage your store, set discount rules, and track orders with Razorpay integration.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={<ShoppingBag className="h-4.5 w-4.5" />} className="w-full sm:w-auto text-sm">
                  Shop Products
                </Button>
              </Link>

              <Link href="/merchant/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" icon={<Store className="h-4.5 w-4.5 text-zinc-300" />} className="w-full sm:w-auto text-sm bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white">
                  Merchant Portal
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full">
            <ProductScene />
          </div>
        </div>
      </section>

      {/* Category Rail Preview */}
      <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto border-t border-zinc-900">
        <CategoryRail selectedCategory="all" onSelectCategory={() => {}} />
      </section>

      {/* Promo Banner Preview */}
      <section className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <PromoBanner />
      </section>

      {/* Two Purpose-Built Experiences Section */}
      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Built for shoppers and store owners
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Everything you need to buy or manage products in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl hover:border-violet-500/50 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-950/80 text-violet-300 border border-violet-800/60 mb-5 shadow-inner">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Storefront</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                Browse products in 3D, get bundle discounts, and complete quick checkouts with Razorpay.
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span>Interactive 3D product preview</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span>Automatic bundle savings and wishlist</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span>Razorpay test checkout</span>
                </li>
              </ul>
            </div>
            <Link href="/shop">
              <Button variant="primary" size="md" className="w-full" icon={<ArrowRight className="h-4 w-4" />}>
                Start Shopping
              </Button>
            </Link>
          </div>

          {/* Merchant Card */}
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl hover:border-violet-500/50 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 mb-5 shadow-inner">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Merchant Portal</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                See sales opportunities, manage campaigns, set discount rules, and track payments.
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Growth opportunities and sales reports</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Store discount caps and rule controls</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Activity logs and payment records</span>
                </li>
              </ul>
            </div>
            <Link href="/merchant/login">
              <Button variant="secondary" size="md" className="w-full bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white" icon={<ArrowRight className="h-4 w-4 text-zinc-300" />}>
                Go to Merchant Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-4 sm:px-6 py-8 text-center text-xs text-zinc-500">
        <p>RAYFLOW — Premium 3D Dark Commerce Platform with Razorpay Payments</p>
      </footer>
    </div>
  );
}
