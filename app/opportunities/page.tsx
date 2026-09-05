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
          title="Revenue Opportunities"
          description="Discovered growth opportunities based on customer purchase affinity and store performance."
          badge="Growth Pipeline"
          badgeIcon={<TrendingUp className="h-3.5 w-3.5" />}
          actions={
            <div className="flex items-center gap-2">
              <div className="rounded border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">
                Total Potential: <strong className="text-emerald-800">{formatINR(totalPotential)}</strong>
              </div>
              <SecondaryButton size="sm" onClick={fetchOpps} leftIcon={<RefreshCw className="h-3.5 w-3.5 text-stone-500" />}>
                Refresh
              </SecondaryButton>
            </div>
          }
        />

        <div className="rounded border border-brand-200 bg-brand-50 p-4 text-xs text-stone-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-brand-900">
            <ShieldCheck className="h-4 w-4 text-brand-700" />
            <span>Active Business Rules</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            All opportunities adhere to store policy limits (max discount 20%, budget cap ₹50,000, margin floor ≥60%).
          </p>
        </div>

        {notification && (
          <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>{notification}</span>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'HIGH_INTENT_UPSELL', 'ABANDONED_CHECKOUT', 'AFFINITY_BUNDLE', 'CROSS_SELL'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? 'bg-brand-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {f === 'ALL' ? 'All Opportunities' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Loading opportunities..." />
        ) : filteredOpps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 space-y-2">
            <p className="text-stone-600 text-sm font-semibold">No opportunities match this filter.</p>
            <SecondaryButton size="sm" onClick={() => setActiveFilter('ALL')}>
              Reset Filter
            </SecondaryButton>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOpps.map((opp) => (
              <motion.div
                key={opp.id}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                className="rounded border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-800 uppercase">
                      {opp.type.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={opp.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{opp.title}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{opp.subtitle}</p>
                  </div>

                  <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs space-y-1.5">
                    <div className="text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-brand-700" />
                      WHY THIS MATTERS
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      &quot;{opp.reasoning}&quot;
                    </p>
                    <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500">
                      <span>Target: <strong className="text-stone-900">{opp.affectedCustomersCount} shoppers</strong></span>
                      <span>Confidence: <strong className="text-brand-700 font-bold">{opp.confidence}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-3 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-4 min-w-[200px]">
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-stone-400 font-semibold">Est. Additional Revenue</div>
                    <div className="text-lg font-extrabold text-emerald-800">{formatINR(opp.expectedRevenue)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {opp.status === 'PENDING' || opp.status === 'SIMULATED' ? (
                      <>
                        <button
                          onClick={() => handleReject(opp.id)}
                          className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
                        >
                          Dismiss
                        </button>
                        <SecondaryButton size="sm" onClick={() => handleOpenApproval(opp)}>
                          Review
                        </SecondaryButton>
                        <ActionButton size="sm" onClick={() => handleOpenApproval(opp)} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                          Approve
                        </ActionButton>
                      </>
                    ) : (
                      <SecondaryButton size="sm" onClick={() => handleOpenApproval(opp)}>
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
