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
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white">RAYFLOW</span>
            <span className="hidden sm:inline ml-2 text-xs font-semibold text-blue-400 uppercase tracking-wider bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              Razorpay Buildathon
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/shop"
            className="text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden md:inline">Shop with AI (Buyer Demo)</span>
            <span className="md:hidden">Shop</span>
          </Link>
          <Link
            href="/overview"
            className="rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-6xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-blue-600/15 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-medium text-blue-300 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          Track 01: AI Growth & Agentic Commerce
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Your AI Revenue Team.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
            Built into every checkout.
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          RAYFLOW continuously inspects catalogue inventory, customer intent, and payment signals to find bounded revenue opportunities, enforce safety policies, and turn buyer intent into completed Razorpay transactions.
        </p>

        {/* CTA Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/overview"
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Merchant Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4 text-indigo-400" />
            <span>Launch &quot;Shop with AI&quot; Hero Demo</span>
          </Link>
        </div>

        {/* Interactive Decision Pipeline Visualization */}
        <div className="mt-12 sm:mt-16 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-8 backdrop-blur shadow-2xl text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 sm:pb-4 mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
                Agentic Commerce Execution Loop
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Razorpay Test Mode Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-blue-400 font-bold">01 • BUYER INTENT</div>
              <div className="text-xs font-semibold text-white">Natural Conversation</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                &quot;Running shoes for daily 5K runs under ₹6,000&quot;
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-indigo-400 font-bold">02 • AI REASONING</div>
              <div className="text-xs font-semibold text-white">Smart Bundle Matching</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                Velocity Runner (₹4,999) + Performance Socks (₹499)
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-amber-400 font-bold">03 • POLICY GATE</div>
              <div className="text-xs font-semibold text-white">Bounded Verification</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                15% bundle discount (Save ₹200) verified under 20% cap
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-cyan-400 font-bold">04 • RAZORPAY CHECKOUT</div>
              <div className="text-xs font-semibold text-white">Test Mode Payment</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                HMAC-SHA256 signature verification on ₹5,298 order
              </div>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 font-bold">05 • REVENUE & AUDIT</div>
              <div className="text-xs font-semibold text-emerald-300">Explainable Trace</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                +₹5,298 captured with full audit trail & failure safety
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars: Discover, Decide, Transact */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI that acts, not just answers.
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-400">
              Built on three immutable pillars designed for fintech trust and bounded autonomy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Discover */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-slate-700 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">DISCOVER</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuously analyzes catalogue margins, product affinity graphs, and abandoned cart drop-offs to generate high-confidence revenue opportunities.
              </p>
              <div className="pt-1 text-xs text-blue-400 font-medium flex items-center gap-1">
                <span>14 Active Opportunities Found</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 2: Decide */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-slate-700 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">DECIDE</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enforces strict policy boundaries. Blocks unauthorized discounts (&gt;20%), gates high-budget campaigns with approval drawers, and records every decision rationale.
              </p>
              <div className="pt-1 text-xs text-amber-400 font-medium flex items-center gap-1">
                <span>Zero-Hallucination Policy Engine</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 3: Transact */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-slate-700 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">TRANSACT</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects directly to Razorpay test-mode APIs. Never silently charges users. Verifies cryptographic signatures, prevents duplicate payments, and recovers gracefully on decline.
              </p>
              <div className="pt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span>Razorpay HMAC Verification</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Agentic Commerce Section */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
                Built for Agentic Commerce
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
                Everything you need to grow merchant revenue safely.
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                RAYFLOW bridges autonomous AI reasoning with the gold standard of fintech payments. Every money action is explainable, gated, and auditable.
              </p>

              <div className="mt-5 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Decision cards with statistical co-purchase evidence</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Approval Drawers for high-impact merchant decisions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Conversational Buyer checkout with real-time Razorpay test mode</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Full audit trail with failure diagnostics and retry states</span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/overview"
                  className="rounded-xl bg-blue-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-white shadow-lg hover:bg-blue-500 transition-colors"
                >
                  Launch Dashboard
                </Link>
                <Link
                  href="/shop"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Test Buyer Flow
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 shadow-2xl text-xs space-y-2.5 sm:space-y-3 font-mono">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                <span>{`// Live Audit Stream`}</span>
                <span className="text-emerald-400 text-[11px]">● REAL-TIME</span>
              </div>
              <div className="space-y-2 text-[10px] sm:text-[11px]">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                  <span className="text-blue-400">[09:41 AM]</span> Revenue Agent calculated 15% bundle: Velocity Runner + Socks (₹5,298) → <span className="text-emerald-400">Policy Passed</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                  <span className="text-blue-400">[09:42 AM]</span> Razorpay Test Order <code className="text-yellow-300">order_RAYFlow_9901</code> verified via HMAC-SHA256 → <span className="text-emerald-400">Captured ₹5,298</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                  <span className="text-blue-400">[11:45 AM]</span> Agent evaluated 25% discount proposal → <span className="text-red-400">BLOCKED by Policy Rule RULE_MAX_DISCOUNT_EXCEEDED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 sm:px-6 py-6 sm:py-8 text-center text-xs text-slate-500">
        <p>RAYFLOW — Built for Razorpay AI Buildathon 2026 • Track 01: AI Growth & Agentic Commerce</p>
      </footer>
    </div>
  );
}
