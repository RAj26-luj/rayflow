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
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-800/60"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Shop with RAYFLOW</span>
          </Link>
          <Link
            href="/merchant/login"
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 sm:px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <Store className="h-3.5 w-3.5 text-slate-400" />
            <span>Merchant Portal</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16 max-w-6xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-blue-600/15 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-medium text-blue-300 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          Track 01: AI Growth & Agentic Commerce
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          AI-Powered Commerce for Customers.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
            Autonomous Growth for Merchants.
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          RAYFLOW powers conversational product discovery and dynamic bundle discounts for shoppers, backed by bounded AI policy governance and Razorpay payment execution for store owners.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Shop with RAYFLOW</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/merchant/login"
            className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Store className="h-4 w-4 text-slate-400" />
            <span>Merchant Login</span>
          </Link>
        </div>
      </section>

      {/* TWO CLEAR ENTRY POINTS: "How do you want to use RAYFLOW?" */}
      <section className="px-4 sm:px-6 py-10 sm:py-14 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How do you want to use RAYFLOW?
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Choose your experience below to explore the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Option 1: Shop as Customer (Primary) */}
          <div className="rounded-2xl border-2 border-blue-500/50 bg-gradient-to-b from-slate-900 via-slate-900/90 to-blue-950/40 p-6 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-blue-950/50 group hover:border-blue-400 transition-all">
            <div className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
              Primary Experience
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Shop as Customer</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Discover products, ask the AI shopping assistant for recommendations, build custom gear bundles with automatic savings, and checkout with Razorpay.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>Browse catalogue without account required</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>Natural language AI product discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>Real-time Razorpay Test Mode checkout</span>
                </li>
              </ul>
            </div>
            <Link
              href="/shop"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>Shop as Customer</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Option 2: Login as Merchant (Secondary) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 mb-4">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Login as Merchant</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Manage your store catalogue, revenue opportunities, Monte Carlo simulations, policy guardrails, and autonomous AI growth agent.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  <span>Bounded revenue opportunities & simulations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  <span>Strict policy engine guardrails & human approvals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  <span>Settlement analytics and compliance audit trails</span>
                </li>
              </ul>
            </div>
            <Link
              href="/merchant/login"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Login as Merchant</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Decision Loop Visualization */}
      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-8 backdrop-blur shadow-2xl text-left">
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
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-blue-400 font-bold">01 • BUYER INTENT</div>
              <div className="text-xs font-semibold text-white">Natural Conversation</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                &quot;Running shoes for daily 5K runs under ₹6,000&quot;
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-indigo-400 font-bold">02 • AI REASONING</div>
              <div className="text-xs font-semibold text-white">Smart Bundle Matching</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                Velocity Runner (₹4,999) + Performance Socks (₹499)
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-amber-400 font-bold">03 • POLICY GATE</div>
              <div className="text-xs font-semibold text-white">Bounded Verification</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                15% bundle discount (Save ₹200) verified under 20% cap
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-1">
              <div className="text-[10px] font-mono text-cyan-400 font-bold">04 • RAZORPAY CHECKOUT</div>
              <div className="text-xs font-semibold text-white">Test Mode Payment</div>
              <div className="text-[11px] text-slate-400 leading-snug">
                HMAC-SHA256 signature verification on ₹5,298 order
              </div>
            </div>

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

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 sm:px-6 py-6 sm:py-8 text-center text-xs text-slate-500">
        <p>RAYFLOW — Built for Razorpay AI Buildathon 2026 • Track 01: AI Growth & Agentic Commerce</p>
      </footer>
    </div>
  );
}
