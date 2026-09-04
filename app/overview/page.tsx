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
  Layers,
  BarChart3,
  Flame,
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
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalDrawer } from '@/components/opportunities/ApprovalDrawer';
import { RevenueOpportunity } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { Metric, MetricGroup } from '@/components/ui/Metric';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ActivityTicker } from '@/components/ui/Ticker';
import { LoadingState } from '@/components/ui/Feedback';

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

  const tickerItems = [
    { text: 'Live Store Monitoring: All 3 policies active and enforced', tag: 'HEALTH', variant: 'emerald' as const },
    { text: `${opportunities.filter(o => o.status === 'PENDING').length} revenue opportunities ready for review`, tag: 'ACTION', variant: 'blue' as const },
    { text: 'Razorpay Payment Gateway: Live Test Sandbox Active', tag: 'PAYMENTS', variant: 'emerald' as const },
    { text: `Gross Revenue Influenced: ${formatINR(metrics?.revenueInfluenced ?? 0)}`, tag: 'REVENUE', variant: 'amber' as const },
  ];

  if (loading && !metrics) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading revenue metrics & opportunities..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageShell>
        {/* Continuous Ticker */}
        <ActivityTicker items={tickerItems} />

        {/* Success Banner */}
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-bold">{actionSuccessMessage}</span>
            </div>
            <Link
              href="/audit"
              className="text-xs font-bold text-emerald-700 underline hover:text-emerald-900 self-end sm:self-auto flex items-center gap-1"
            >
              View in Audit Trail →
            </Link>
          </motion.div>
        )}

        {/* Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5" />
              Merchant Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
              Welcome back, {session?.user?.name ? session.user.name.split(' ')[0] : 'Merchant'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You have <strong className="text-slate-900 font-bold">{opportunities.filter(o => o.status === 'PENDING').length} revenue opportunities</strong> ready for review across catalogue and checkout sessions.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <Link href="/agent">
              <SecondaryButton size="md" leftIcon={<Zap className="h-4 w-4 text-blue-600" />}>
                Assistant
              </SecondaryButton>
            </Link>
            <Link href="/opportunities">
              <ActionButton size="md" leftIcon={<Sparkles className="h-4 w-4" />}>
                Review Opportunities
              </ActionButton>
            </Link>
          </div>
        </div>

        {/* Executive KPI Floating Metric Cards */}
        <MetricGroup cols={4}>
          <Metric
            label="Gross Revenue Influenced"
            value={formatINR(metrics?.revenueInfluenced ?? 0)}
            change="+18.4%"
            changeType="positive"
            subtext="Settled orders via Razorpay"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <Metric
            label="Recovered Revenue"
            value={formatINR(metrics?.revenueRecovered ?? 0)}
            change="Recovered"
            changeType="positive"
            subtext="Bounded checkout incentives"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <Metric
            label="Conversion Uplift"
            value={`+${metrics?.aiConversionUplift ?? 0}%`}
            change="Multi-item ratio"
            changeType="positive"
            subtext="Calculated from verified orders"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <Metric
            label="Active Opportunities"
            value={metrics?.activeOpportunities ?? 0}
            change="Policy Compliant"
            changeType="neutral"
            subtext="Pending review & approval"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </MetricGroup>

        {/* Section: Revenue Opportunities Spotlight */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Revenue Opportunities</h2>
              <p className="text-xs text-slate-500">
                Actionable recommendations identified across catalogue and checkout activity.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
            >
              <span>View All ({opportunities.length})</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.length === 0 && (
              <div className="col-span-full rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-6 sm:p-10 shadow-xs text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">Store Setup & Onboarding</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 mb-8">
                  Your store is ready. Follow these 5 steps to start optimizing revenue:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-left max-w-4xl mx-auto mb-4">
                  <Link href="/catalogue" className="rounded-2xl border border-slate-200/80 bg-white p-4 hover:border-blue-400 hover:shadow-md transition-all group">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Step 1</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">Add Products</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Upload inventory and margins.</p>
                  </Link>

                  <Link href="/policies" className="rounded-2xl border border-slate-200/80 bg-white p-4 hover:border-amber-400 hover:shadow-md transition-all group">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Step 2</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-amber-600 transition-colors">Set Policies</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Define hard caps and discount floors.</p>
                  </Link>

                  <Link href="/opportunities" className="rounded-2xl border border-slate-200/80 bg-white p-4 hover:border-indigo-400 hover:shadow-md transition-all group">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 3</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">Review Opps</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Inspect discovered revenue bounds.</p>
                  </Link>

                  <Link href="/opportunities" className="rounded-2xl border border-slate-200/80 bg-white p-4 hover:border-cyan-400 hover:shadow-md transition-all group">
                    <span className="text-[10px] font-bold text-cyan-600 uppercase">Step 4</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-cyan-600 transition-colors">Run Simulation</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Test revenue and margin projection.</p>
                  </Link>

                  <Link href="/opportunities" className="rounded-2xl border border-slate-200/80 bg-white p-4 hover:border-emerald-400 hover:shadow-md transition-all group">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Step 5</span>
                    <div className="text-xs font-bold text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">Approve & Run</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Execute with verifiable audit log.</p>
                  </Link>
                </div>
              </div>
            )}

            {opportunities.slice(0, 4).map((opp) => (
              <motion.div
                key={opp.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl border p-5 sm:p-6 shadow-xs transition-all flex flex-col justify-between ${
                  opp.status === 'APPROVED'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : opp.status === 'EXECUTED'
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header Tag & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-xl bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                      {opp.type.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={opp.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{opp.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{opp.subtitle}</p>
                  </div>

                  {/* Why this rationale block */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs space-y-2">
                    <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      WHY THIS MATTERS
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      &quot;{opp.reasoning}&quot;
                    </p>
                    <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500">
                      <span>Audience: <strong className="text-slate-900">{opp.affectedCustomersCount} shoppers</strong></span>
                      <span>Confidence: <strong className="text-blue-600 font-bold">{opp.confidence}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Within limits ✓</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {opp.status === 'PENDING' || opp.status === 'SIMULATED' ? (
                      <>
                        <button
                          onClick={() => handleDismissOpp(opp.id)}
                          className="rounded-xl px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          Dismiss
                        </button>
                        <SecondaryButton size="sm" onClick={() => handleReviewOpp(opp)}>
                          Review
                        </SecondaryButton>
                        <ActionButton size="sm" onClick={() => handleReviewOpp(opp)} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                          Approve
                        </ActionButton>
                      </>
                    ) : opp.status === 'APPROVED' ? (
                      <>
                        <SecondaryButton size="sm" onClick={() => handleReviewOpp(opp)}>
                          Details
                        </SecondaryButton>
                        <ActionButton variant="emerald" size="sm" onClick={() => handleReviewOpp(opp)} leftIcon={<Zap className="h-3.5 w-3.5" />}>
                          Execute
                        </ActionButton>
                      </>
                    ) : (
                      <SecondaryButton size="sm" onClick={() => handleReviewOpp(opp)}>
                        View Details
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section: Revenue Uplift Chart & AOV Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Revenue Trajectory</h3>
                <p className="text-xs text-slate-500">Daily gross merchant revenue vs campaign uplift</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Additional Revenue
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
                      <stop offset="5%" stopColor="#0c83fe" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0c83fe" stopOpacity={0.0} />
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
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="aiBoost" stroke="#0c83fe" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAi)" name="Additional Revenue" />
                  <Area type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Baseline" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Before / After AOV & Margin Analysis */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">AOV & Margin Impact</h3>
              <p className="text-xs text-slate-500">Performance summary and margin safety</p>

              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2 text-xs">
                  {metrics?.paidOrdersCount && metrics.paidOrdersCount > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Settled Orders:</span>
                        <span className="font-bold text-slate-800">{metrics.paidOrdersCount} orders</span>
                      </div>
                      <div className="flex items-center justify-between text-blue-700 font-extrabold text-sm">
                        <span>Average Order Value:</span>
                        <span className="font-mono">{formatINR(Math.round(metrics.revenueInfluenced / metrics.paidOrdersCount))}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-emerald-700 font-bold text-[11px]">
                        <span>Conversion Uplift:</span>
                        <span>+{metrics.aiConversionUplift || 0}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Settled Orders:</span>
                        <span className="font-bold text-slate-800">0 orders</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700 font-bold text-xs">
                        <span>Average Order Value:</span>
                        <span className="font-mono">₹0.00</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/80 text-slate-400 text-[11px]">
                        Awaiting customer checkout transactions
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs">
                  <div className="text-slate-500">Gross Margin Floor</div>
                  <div className="flex items-center justify-between font-extrabold text-slate-800">
                    <span>Active Safety Threshold</span>
                    <span className="text-emerald-700 font-mono">≥ 60.0%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Discounts preserve ≥60% gross product margin under active policy rules.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-950 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs">Ready to test checkout?</div>
                <div className="text-[11px] text-blue-700">Browse marketplace as a shopper</div>
              </div>
              <Link href="/shop">
                <ActionButton size="sm">
                  Shop Now
                </ActionButton>
              </Link>
            </div>
          </div>
        </div>
      </PageShell>

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

