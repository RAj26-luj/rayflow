'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Users,
  AlertCircle,
  CheckCircle2,
  Check,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalDrawer } from '@/components/opportunities/ApprovalDrawer';
import { RevenueOpportunity } from '@/lib/types';
import { formatINR } from '@/lib/utils';

export default function OverviewPage() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<RevenueOpportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [oppRes, chartRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/analytics/revenue'),
      ]);
      const oppData = await oppRes.json();
      if (oppData.success) {
        setOpportunities(oppData.data.opportunities);
        setMetrics(oppData.data.metrics);
      }
      const cData = await chartRes.json();
      if (cData.success) {
        setChartData(cData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleReviewOpp = (opp: RevenueOpportunity) => {
    setSelectedOpp(opp);
    setIsDrawerOpen(true);
  };

  const handleDismissOpp = async (oppId: string) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: oppId, action: 'REJECT' }),
      });
      if (res.ok) {
        fetchOverviewData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveSuccess = (updatedOpp: RevenueOpportunity) => {
    setActionSuccessMessage(`Successfully approved & executed: "${updatedOpp.title}"`);
    fetchOverviewData();
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Success Banner */}
        {actionSuccessMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4 text-xs text-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{actionSuccessMessage}</span>
            </div>
            <Link
              href="/audit"
              className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900 self-end sm:self-auto"
            >
              View in Audit Trail →
            </Link>
          </div>
        )}

        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Autonomous Revenue Copilot
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Good evening, {session?.user?.name ? session.user.name.split(' ')[0] : 'Merchant'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your revenue agent found <strong className="text-slate-800 font-semibold">{opportunities.filter(o => o.status === 'PENDING').length} opportunities</strong> today across catalogue and checkout sessions.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <Link
              href="/agent"
              className="flex-1 sm:flex-none justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              <span>Ask Growth Agent</span>
            </Link>
            <Link
              href="/opportunities"
              className="flex-1 sm:flex-none justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Opportunities</span>
            </Link>
          </div>
        </div>

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Revenue Influenced */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="text-xs font-medium text-slate-500">Revenue Influenced</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {formatINR(metrics?.revenueInfluenced ?? 0)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Real-time settled gross</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">From AI bundles & upsells</div>
          </div>

          {/* Card 2: Revenue Recovered */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="text-xs font-medium text-slate-500">Revenue Recovered</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {formatINR(metrics?.revenueRecovered ?? 0)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Saved checkouts</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Bounded instant incentives</div>
          </div>

          {/* Card 3: AI Conversion Uplift */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="text-xs font-medium text-slate-500">AI Conversion Uplift</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
              +{metrics?.aiConversionUplift ?? 0}%
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span>Bundle order ratio</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Calculated from settled transactions</div>
          </div>

          {/* Card 4: Active Opportunities */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="text-xs font-medium text-slate-500">Active Opportunities</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
              {metrics?.activeOpportunities ?? 0}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Bounded policy guardrails</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Pending approval & deployment</div>
          </div>
        </div>

        {/* Section: AI Revenue Opportunities Spotlight */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">AI Revenue Opportunities</h2>
              <p className="text-xs text-slate-500">
                Actionable interventions computed from catalogue affinity graphs and checkout intent.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.length === 0 && (
              <div className="col-span-full rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-6 sm:p-8 shadow-xs text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Welcome to RAYFLOW</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-6">
                  Your store is ready to set up. Follow these 5 steps to activate autonomous revenue growth:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-left max-w-4xl mx-auto mb-6">
                  <Link href="/catalogue" className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-400 hover:shadow-xs transition-all group">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Step 1</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">Add Products</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Upload products and stock margins.</p>
                  </Link>

                  <Link href="/policies" className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-400 hover:shadow-xs transition-all group">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Step 2</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-amber-600 transition-colors">Set Policies</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Define hard caps and approval limits.</p>
                  </Link>

                  <Link href="/opportunities" className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-400 hover:shadow-xs transition-all group">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 3</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">Review Opps</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Inspect AI discovered revenue bounds.</p>
                  </Link>

                  <Link href="/opportunities" className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-400 hover:shadow-xs transition-all group">
                    <span className="text-[10px] font-bold text-cyan-600 uppercase">Step 4</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-cyan-600 transition-colors">Run Simulation</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Test Monte Carlo probability distribution.</p>
                  </Link>

                  <Link href="/opportunities" className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-400 hover:shadow-xs transition-all group">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Step 5</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">Approve & Run</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Execute with verifiable audit log.</p>
                  </Link>
                </div>
              </div>
            )}
            {opportunities.slice(0, 4).map((opp) => (
              <div
                key={opp.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                      {opp.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {formatINR(opp.expectedRevenue)} potential
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{opp.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{opp.subtitle}</p>

                  {/* Why this rationale block */}
                  <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1.5">
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      WHY THIS?
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      &quot;{opp.reasoning}&quot;
                    </p>
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500">
                      <span>Affected: <strong>{opp.affectedCustomersCount} shoppers</strong></span>
                      <span>Confidence: <strong className="text-blue-600">{opp.confidence}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Policy Passed ✓
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleDismissOpp(opp.id)}
                      className="rounded-md px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleReviewOpp(opp)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleReviewOpp(opp)}
                      className="rounded-md bg-blue-600 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Revenue Uplift Chart & AOV Before/After */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Revenue Influence Over Time</h3>
                <p className="text-xs text-slate-500">Daily gross merchant revenue vs AI-influenced uplift</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> AI Influenced
                </span>
              </div>
            </div>

            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    chartData.length > 0
                      ? chartData
                      : [
                          { day: 'Mon', baseline: 0, aiBoost: 0 },
                          { day: 'Tue', baseline: 0, aiBoost: 0 },
                          { day: 'Wed', baseline: 0, aiBoost: 0 },
                          { day: 'Thu', baseline: 0, aiBoost: 0 },
                          { day: 'Fri', baseline: 0, aiBoost: 0 },
                          { day: 'Sat', baseline: 0, aiBoost: 0 },
                          { day: 'Sun (Today)', baseline: 0, aiBoost: 0 },
                        ]
                  }
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c83fe" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0c83fe" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="aiBoost" stroke="#0c83fe" strokeWidth={2} fillOpacity={1} fill="url(#colorAi)" name="AI Influenced" />
                  <Area type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Baseline" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Before / After AOV & Margin Analysis */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4 sm:space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">AOV & Margin Impact</h3>
              <p className="text-xs text-slate-500">Comparison before and after RAYFLOW deployment</p>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs">
                  {metrics?.paidOrdersCount && metrics.paidOrdersCount > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Settled Orders:</span>
                        <span className="font-semibold text-slate-800">{metrics.paidOrdersCount} orders</span>
                      </div>
                      <div className="flex items-center justify-between text-blue-700 font-bold text-sm">
                        <span>Average Order Value:</span>
                        <span>{formatINR(Math.round(metrics.revenueInfluenced / metrics.paidOrdersCount))}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-emerald-700 font-semibold text-[11px]">
                        <span>Conversion Uplift:</span>
                        <span>+{metrics.aiConversionUplift || 0}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Settled Orders:</span>
                        <span className="font-semibold text-slate-800">0 orders</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700 font-semibold text-xs">
                        <span>Average Order Value:</span>
                        <span>₹0.00</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200/80 text-slate-400 text-[11px]">
                        Awaiting first customer checkout transaction
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs">
                  <div className="text-slate-500">Gross Margin Preservation</div>
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Target Margin Floor</span>
                    <span className="text-emerald-700">≥ 60.0%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Automated discounts preserve ≥60% gross product margin under active policy rules.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Ready to test checkout?</div>
                <div className="text-[10px] text-blue-700">Experience agentic commerce as buyer</div>
              </div>
              <Link
                href="/shop"
                className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Drawer Modal */}
      <ApprovalDrawer
        opportunity={selectedOpp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApproveSuccess={handleApproveSuccess}
      />
    </DashboardLayout>
  );
}
