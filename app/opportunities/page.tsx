'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalDrawer } from '@/components/opportunities/ApprovalDrawer';
import { RevenueOpportunity } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Feedback';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedOpp, setSelectedOpp] = useState<RevenueOpportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchOpps = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/opportunities');
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.data.opportunities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const handleOpenApproval = (opp: RevenueOpportunity) => {
    setSelectedOpp(opp);
    setIsDrawerOpen(true);
  };

  const handleReject = async (oppId: string) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: oppId, action: 'REJECT' }),
      });
      if (res.ok) {
        setNotification('Opportunity dismissed.');
        fetchOpps();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveSuccess = (updated: RevenueOpportunity) => {
    setNotification(`Successfully approved & deployed "${updated.title}".`);
    fetchOpps();
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredOpps = opportunities.filter((o) => {
    if (activeFilter === 'ALL') return true;
    return o.type === activeFilter;
  });

  const totalPotential = opportunities
    .filter((o) => o.status === 'PENDING')
    .reduce((sum, o) => sum + o.expectedRevenue, 0);

  return (
    <DashboardLayout>
      <PageShell>
        <SectionHeader
          title="Growth Opportunities"
          description="Suggested actions to grow your store sales."
          badge="Opportunities"
          badgeIcon={<TrendingUp className="h-3.5 w-3.5" />}
          actions={
            <div className="flex items-center gap-2.5">
              <div className="rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs text-zinc-300 backdrop-blur-md">
                Total Potential: <strong className="text-emerald-400 font-mono">{formatINR(totalPotential)}</strong>
              </div>
              <SecondaryButton size="sm" onClick={fetchOpps} leftIcon={<RefreshCw className="h-3.5 w-3.5 text-zinc-400" />} className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white">
                Refresh
              </SecondaryButton>
            </div>
          }
        />

        <div className="rounded-2xl border border-violet-800/60 bg-violet-950/40 p-4 text-xs text-white space-y-1 backdrop-blur-md">
          <div className="font-bold flex items-center gap-1.5 text-violet-300">
            <ShieldCheck className="h-4 w-4 text-violet-400" />
            <span>Active Business Rules</span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            All opportunities adhere to store policy limits (max discount 20%, budget cap ₹50,000, margin floor ≥60%).
          </p>
        </div>

        {notification && (
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/80 p-3.5 text-xs text-emerald-200 font-semibold flex items-center gap-2 shadow-xl backdrop-blur-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'HIGH_INTENT_UPSELL', 'ABANDONED_CHECKOUT', 'AFFINITY_BUNDLE', 'CROSS_SELL'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f
                  ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-950/50'
                  : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {f === 'ALL' ? 'All Opportunities' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Loading opportunities..." />
        ) : filteredOpps.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/80 rounded-3xl border border-zinc-800 p-8 space-y-3 shadow-xl backdrop-blur-xl">
            <p className="text-zinc-300 text-sm font-semibold">No opportunities match this filter.</p>
            <SecondaryButton size="sm" onClick={() => setActiveFilter('ALL')} className="bg-zinc-800 border-zinc-700 text-zinc-300">
              Reset Filter
            </SecondaryButton>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOpps.map((opp) => (
              <motion.div
                key={opp.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl hover:border-violet-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-950/80 border border-violet-800/60 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase">
                      {opp.type.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={opp.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">{opp.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{opp.subtitle}</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3.5 text-xs space-y-1.5 text-zinc-300">
                    <div className="text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-violet-400" />
                      WHY THIS MATTERS
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      &quot;{opp.reasoning}&quot;
                    </p>
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Target: <strong className="text-white">{opp.affectedCustomersCount} shoppers</strong></span>
                      <span>Confidence: <strong className="text-violet-300 font-bold">{opp.confidence}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-6 min-w-[210px]">
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Est. Additional Revenue</div>
                    <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{formatINR(opp.expectedRevenue)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {opp.status === 'PENDING' || opp.status === 'SIMULATED' ? (
                      <>
                        <button
                          onClick={() => handleReject(opp.id)}
                          className="px-2 py-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Dismiss
                        </button>
                        <SecondaryButton size="sm" onClick={() => handleOpenApproval(opp)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                          Review
                        </SecondaryButton>
                        <ActionButton size="sm" onClick={() => handleOpenApproval(opp)} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                          Approve
                        </ActionButton>
                      </>
                    ) : (
                      <SecondaryButton size="sm" onClick={() => handleOpenApproval(opp)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                        View Details
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
