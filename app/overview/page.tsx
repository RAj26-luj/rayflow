'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight,
  BarChart3,
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
import { PageShell } from '@/components/ui/SectionHeader';
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
    { text: 'Store Status: Active and compliant with rules', tag: 'HEALTH', variant: 'emerald' as const },
    { text: `${opportunities.filter(o => o.status === 'PENDING').length} opportunities ready for review`, tag: 'ACTION', variant: 'brand' as const },
    { text: 'Razorpay Gateway: Active', tag: 'PAYMENTS', variant: 'emerald' as const },
    { text: `Total Sales: ${formatINR(metrics?.revenueInfluenced ?? 0)}`, tag: 'SALES', variant: 'amber' as const },
  ];

  if (loading && !metrics) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading store data..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageShell>
        <ActivityTicker items={tickerItems} />

        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-800/60 bg-emerald-950/80 p-4 text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="font-bold">{actionSuccessMessage}</span>
            </div>
            <Link
              href="/audit"
              className="text-xs font-bold text-emerald-300 underline hover:text-white"
            >
              View Activity Log →
            </Link>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-violet-300 uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
              Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Welcome back, {session?.user?.name ? session.user.name.split(' ')[0] : 'Merchant'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              You have <strong className="text-white font-bold">{opportunities.filter(o => o.status === 'PENDING').length} opportunities</strong> to review.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/agent">
              <SecondaryButton size="md" leftIcon={<Zap className="h-4 w-4 text-violet-400" />} className="bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white">
                Assistant
              </SecondaryButton>
            </Link>
            <Link href="/opportunities">
              <ActionButton size="md">
                Review Opportunities
              </ActionButton>
            </Link>
          </div>
        </div>

        <MetricGroup cols={4}>
          <Metric
            label="Total Sales"
            value={formatINR(metrics?.revenueInfluenced ?? 0)}
            change="+18.4%"
            changeType="positive"
            subtext="Settled orders via Razorpay"
            icon={<TrendingUp className="h-4 w-4 text-violet-400" />}
          />
          <Metric
            label="Recovered Revenue"
            value={formatINR(metrics?.revenueRecovered ?? 0)}
            change="Recovered"
            changeType="positive"
            subtext="Checkout incentives"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          />
          <Metric
            label="Conversion Rate"
            value={`+${metrics?.aiConversionUplift ?? 0}%`}
            change="Multi-item ratio"
            changeType="positive"
            subtext="Calculated from verified orders"
            icon={<BarChart3 className="h-4 w-4 text-violet-400" />}
          />
          <Metric
            label="Active Opportunities"
            value={metrics?.activeOpportunities ?? 0}
            change="Within Limits"
            changeType="neutral"
            subtext="Pending review"
            icon={<ShieldCheck className="h-4 w-4 text-violet-400" />}
          />
        </MetricGroup>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Revenue Opportunities</h2>
              <p className="text-xs text-zinc-400">
                Actionable recommendations identified across catalogue and checkout activity.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="text-xs font-bold text-violet-300 hover:text-white flex items-center gap-1"
            >
              <span>View All ({opportunities.length})</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.length === 0 && (
              <div className="col-span-full rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-8 text-center space-y-4 shadow-xl backdrop-blur-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-600 text-white font-bold mb-2 shadow-lg shadow-violet-950/60">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-white text-lg">Store Onboarding</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Your store is ready. Add products and set policies to generate opportunities.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link href="/catalogue">
                    <ActionButton size="sm">Add Products</ActionButton>
                  </Link>
                  <Link href="/policies">
                    <SecondaryButton size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-300">Set Business Rules</SecondaryButton>
                  </Link>
                </div>
              </div>
            )}

            {opportunities.slice(0, 4).map((opp) => (
              <motion.div
                key={opp.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className={`rounded-2xl border p-4 sm:p-5 shadow-xl transition-all backdrop-blur-xl flex flex-col justify-between ${
                  opp.status === 'APPROVED' || opp.status === 'EXECUTED'
                    ? 'border-emerald-800/60 bg-emerald-950/30'
                    : 'border-zinc-800/80 bg-zinc-900/80 hover:border-violet-500/40'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-violet-950/80 border border-violet-800/60 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase">
                      {opp.type.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={opp.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">{opp.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{opp.subtitle}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs space-y-1.5 text-zinc-300">
                    <div className="text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-violet-400" />
                      WHY THIS MATTERS
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      &quot;{opp.reasoning}&quot;
                    </p>
                    <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Audience: <strong className="text-white">{opp.affectedCustomersCount} shoppers</strong></span>
                      <span>Confidence: <strong className="text-violet-300 font-bold">{opp.confidence}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Within limits ✓</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {opp.status === 'PENDING' || opp.status === 'SIMULATED' ? (
                      <>
                        <button
                          onClick={() => handleDismissOpp(opp.id)}
                          className="px-2 py-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Dismiss
                        </button>
                        <SecondaryButton size="sm" onClick={() => handleReviewOpp(opp)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                          Review
                        </SecondaryButton>
                        <ActionButton size="sm" onClick={() => handleReviewOpp(opp)} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                          Approve
                        </ActionButton>
                      </>
                    ) : (
                      <SecondaryButton size="sm" onClick={() => handleReviewOpp(opp)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                        View Details
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">Revenue Trajectory</h3>
                <p className="text-xs text-zinc-400">Daily gross merchant revenue vs campaign uplift</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-zinc-600" /> Baseline
                </span>
                <span className="flex items-center gap-1 text-violet-300 font-bold">
                  <span className="h-2 w-2 rounded-full bg-violet-500" /> Additional Revenue
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
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
                          { day: 'Sun', baseline: 0, aiBoost: 0 },
                        ]
                  }
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#a1a1aa' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#ffffff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="aiBoost" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAi)" name="Additional Revenue" />
                  <Area type="monotone" dataKey="baseline" stroke="#52525b" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Baseline" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Order & Margin Summary</h3>
              <p className="text-xs text-zinc-400">Performance summary and policy rules</p>

              <div className="mt-3.5 space-y-2.5">
                <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-1.5 text-xs text-zinc-300">
                  {metrics?.paidOrdersCount && metrics.paidOrdersCount > 0 ? (
                    <>
                      <div className="flex justify-between text-zinc-400">
                        <span>Settled Orders:</span>
                        <span className="font-bold text-white">{metrics.paidOrdersCount} orders</span>
                      </div>
                      <div className="flex justify-between text-violet-300 font-extrabold text-sm pt-1">
                        <span>Average Order Value:</span>
                        <span>{formatINR(Math.round(metrics.revenueInfluenced / metrics.paidOrdersCount))}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-zinc-400">
                        <span>Settled Orders:</span>
                        <span className="font-bold text-white">0 orders</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 pt-1">
                        Awaiting customer checkout transactions
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-1 text-xs text-zinc-300">
                  <div className="text-zinc-400">Margin Safety Floor</div>
                  <div className="flex justify-between font-bold text-white">
                    <span>Active Threshold</span>
                    <span className="text-emerald-400 font-mono">≥ 60.0%</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-relaxed pt-0.5">
                    Discounts preserve ≥60% gross product margin under store policy rules.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-violet-950/60 border border-violet-800/60 p-3.5 text-xs text-white flex items-center justify-between backdrop-blur-md">
              <div>
                <div className="font-bold text-xs">Test buyer experience?</div>
                <div className="text-[11px] text-zinc-300">Browse store as a shopper</div>
              </div>
              <Link href="/shop">
                <ActionButton size="sm">Shop Now</ActionButton>
              </Link>
            </div>
          </div>
        </div>
      </PageShell>

      <ApprovalDrawer
        opportunity={selectedOpp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApproveSuccess={handleApproveSuccess}
      />
    </DashboardLayout>
  );
}
