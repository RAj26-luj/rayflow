'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Bot,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  ShoppingBag,
  Store,
  Layers,
  ChevronRight,
  Package,
  Sliders,
  Check,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">RAYFLOW</span>
              <span className="hidden sm:inline ml-2.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-950/90 px-2 py-0.5 rounded-full border border-blue-800/80">
                Track 01: AI Growth & Agentic Commerce
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/shop">
              <Button variant="primary" size="sm" icon={<ShoppingBag className="h-3.5 w-3.5" />}>
                Shop Gear
              </Button>
            </Link>
            <Link href="/merchant/login">
              <Button variant="outline" size="sm" icon={<Store className="h-3.5 w-3.5 text-slate-400" />}>
                Merchant Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 max-w-6xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[300px] sm:h-[400px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/70 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-6 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Razorpay AI Buildathon 2026</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Conversational Shopping.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
            Intelligent Revenue Growth.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          RAYFLOW bridges customer intent with merchant profitability: conversational product discovery and bundle savings for buyers, paired with predictive revenue simulations, business rules, and Razorpay settlements for merchants.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={<ShoppingBag className="h-4 w-4" />} className="w-full sm:w-auto">
              Shop as Customer
            </Button>
          </Link>

          <Link href="/merchant/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" icon={<Store className="h-4 w-4 text-slate-400" />} className="w-full sm:w-auto">
              Merchant Login (Aura Athletics)
            </Button>
          </Link>
        </div>
      </section>

      {/* TWO DISTINCT EXPERIENCES */}
      <section className="px-4 sm:px-6 py-10 sm:py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Two Purpose-Built Experiences
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Engineered on the same unified commerce platform with strict multi-tenant isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Shop as Customer */}
          <div className="rounded-2xl border-2 border-blue-500/50 bg-gradient-to-b from-slate-900 via-slate-900/90 to-blue-950/40 p-6 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-blue-950/50 group hover:border-blue-400 transition-all">
            <div className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
              Buyer Experience
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Customer Marketplace</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Explore performance gear, ask the Shopping Assistant for tailored running bundles, enjoy automatic savings, and checkout smoothly via Razorpay.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span>Conversational product discovery & gear recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span>Real-time multi-item bundle savings calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span>Instant checkout with Razorpay test payments</span>
                </li>
              </ul>
            </div>
            <Link href="/shop">
              <Button variant="primary" size="md" className="w-full" icon={<ArrowRight className="h-4 w-4" />}>
                Launch Buyer Storefront
              </Button>
            </Link>
          </div>

          {/* Option 2: Merchant Portal */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 mb-4">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Merchant Revenue Center</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Discover revenue opportunities, run predictive margin simulations, configure business rules, and monitor Razorpay payment captures.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  <span>Revenue opportunity discovery & simulations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  <span>Configurable discount ceilings and approval rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  <span>Activity audit logs and Razorpay settlement ledger</span>
                </li>
              </ul>
            </div>
            <Link href="/merchant/login">
              <Button variant="outline" size="md" className="w-full" icon={<ArrowRight className="h-4 w-4 text-slate-400" />}>
                Open Merchant Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Step Commerce Execution Loop */}
      <section className="px-4 sm:px-6 py-10 sm:py-14 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 sm:p-8 backdrop-blur shadow-2xl text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Closed-Loop Commerce Flow
              </span>
            </div>
            <Badge variant="emerald" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
              Razorpay Test Mode Ready
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1.5">
              <div className="text-[10px] font-mono text-blue-400 font-bold">01 • BUYER INTENT</div>
              <div className="text-xs font-bold text-white">Natural Conversation</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                &quot;Running shoes for daily 5K runs under ₹6,000&quot;
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1.5">
              <div className="text-[10px] font-mono text-indigo-400 font-bold">02 • REVENUE ANALYSIS</div>
              <div className="text-xs font-bold text-white">Synergy Matching</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Velocity Runner (₹4,999) + Performance Socks (₹499)
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1.5">
              <div className="text-[10px] font-mono text-amber-400 font-bold">03 • BUSINESS RULES</div>
              <div className="text-xs font-bold text-white">Bounded Verification</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                15% bundle discount (Save ₹200) verified under 20% cap
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1.5">
              <div className="text-[10px] font-mono text-cyan-400 font-bold">04 • CHECKOUT</div>
              <div className="text-xs font-bold text-white">Razorpay Capture</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Secure payment capture on ₹5,298 order
              </div>
            </div>

            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-4 space-y-1.5">
              <div className="text-[10px] font-mono text-emerald-400 font-bold">05 • SETTLEMENT</div>
              <div className="text-xs font-bold text-emerald-300">Activity Logged</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                +₹5,298 captured with full audit trail & failure safety
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 sm:px-6 py-8 text-center text-xs text-slate-500">
        <p>RAYFLOW — Built for Razorpay AI Buildathon 2026 • Track 01: AI Growth & Agentic Commerce</p>
      </footer>
    </div>
  );
}
