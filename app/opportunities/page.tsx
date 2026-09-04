'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Play,
  Check,
  X,
  Layers,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalDrawer } from '@/components/opportunities/ApprovalDrawer';
import { RevenueOpportunity } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton, GhostButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';

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
        {/* Header */}
        <SectionHeader
          title="Revenue Opportunities"
          description="Discovered revenue opportunities based on customer cohort and catalogue affinity."
          badge={{ text: 'Growth Pipeline', variant: 'blue' }}
          action={
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs">
                Total Potential: <strong className="text-emerald-600 font-extrabold font-mono ml-1">{formatINR(totalPotential)}</strong>
              </div>
              <SecondaryButton size="sm" onClick={() => fetchOpps()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Refresh
              </SecondaryButton>
            </div>
          }
        />

        {/* Contextual Guide Card */}
        <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5 text-xs text-blue-950 flex items-start gap-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white flex-shrink-0 mt-0.5">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-sm">Opportunity Discovery & Execution</div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Every identified opportunity is bounded by strict margin floors (≥60%) and merchant budget caps. Simulate before execution to preview projected order volume and cohort response.
            </p>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-blue-200 bg-blue-50/90 p-4 text-xs text-blue-950 flex items-center gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="font-bold">{notification}</span>
          </motion.div>
        )}

        {/* Filter Chips with mobile horizontal scroll */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Opportunities' },
            { id: 'UPSELL', label: 'High-Intent Upsell' },
            { id: 'ABANDONED_CHECKOUT', label: 'Abandoned Checkout' },
            { id: 'CROSS_SELL', label: 'Cross-Sell' },
            { id: 'LOW_CONVERSION_RECOVERY', label: 'Low Conversion' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Opportunities Feed List */}
        {loading && opportunities.length === 0 ? (
          <LoadingState message="Loading opportunities..." />
        ) : filteredOpps.length === 0 ? (
          <EmptyState
            title="No Opportunities Found"
            description="Opportunities will appear here when product affinity correlations or abandoned checkouts are detected."
            action={{
              label: 'Refresh Feed',
              onClick: () => fetchOpps(),
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredOpps.map((opp) => (
              <motion.div
                key={opp.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl border bg-white p-5 sm:p-6 shadow-xs transition-all ${
                  opp.status === 'EXECUTED'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : opp.status === 'APPROVED'
                    ? 'border-indigo-200 bg-indigo-50/20'
                    : opp.status === 'SIMULATED'
                    ? 'border-purple-200 bg-purple-50/20'
                    : opp.status === 'REJECTED'
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200/80 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6">
                  {/* Left Side: Metadata & Reasoning */}
                  <div className="space-y-3.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                        {opp.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {opp.affectedCustomerCohort}
                      </span>
                      <StatusBadge status={opp.status} size="sm" />
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">{opp.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{opp.description}</p>
                    </div>

                    {/* Recommended Action Box */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-1.5 text-xs">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-blue-600" />
                        Recommended Action
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed text-xs">
                        &quot;{opp.recommendedAction}&quot;
                      </p>
                    </div>

                    {/* Evidence & Policy Status */}
                    <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-900">Why this matters: </span>
                      <span>{opp.reasoning}</span>
                    </div>
                  </div>

                  {/* Right Side: Key Metrics & Action Panel */}
                  <div className="lg:w-72 flex-shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Est. Additional Revenue</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
                          {formatINR(opp.expectedRevenue)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Confidence</div>
                          <div className="font-bold text-blue-600 font-mono text-sm mt-0.5">{opp.confidence}%</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Audience</div>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{opp.affectedCustomersCount}</div>
                        </div>
                      </div>

                      <div className="rounded-xl p-2.5 bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{opp.policyNotes || 'Within policy limits ✓'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-1">
                      {opp.status === 'PENDING' ? (
                        <>
                          <ActionButton
                            onClick={() => handleOpenApproval(opp)}
                            size="sm"
                            className="w-full"
                            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          >
                            Review Opportunity
                          </ActionButton>

                          <div className="flex items-center gap-2">
                            <SecondaryButton
                              onClick={() => handleOpenApproval(opp)}
                              size="sm"
                              className="flex-1"
                            >
                              Simulate
                            </SecondaryButton>
                            <GhostButton
                              onClick={() => handleReject(opp.id)}
                              size="sm"
                              className="text-slate-400"
                            >
                              Dismiss
                            </GhostButton>
                          </div>
                        </>
                      ) : opp.status === 'SIMULATED' ? (
                        <>
                          <ActionButton
                            onClick={() => handleOpenApproval(opp)}
                            size="sm"
                            className="w-full"
                            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          >
                            Approve Opportunity
                          </ActionButton>
                          <SecondaryButton
                            onClick={() => handleReject(opp.id)}
                            size="sm"
                            className="w-full"
                          >
                            Dismiss
                          </SecondaryButton>
                        </>
                      ) : opp.status === 'APPROVED' ? (
                        <ActionButton
                          variant="emerald"
                          onClick={() => handleOpenApproval(opp)}
                          size="sm"
                          className="w-full"
                          leftIcon={<Zap className="h-3.5 w-3.5" />}
                        >
                          Execute Opportunity
                        </ActionButton>
                      ) : (
                        <SecondaryButton
                          onClick={() => handleOpenApproval(opp)}
                          size="sm"
                          className="w-full"
                        >
                          View Details
                        </SecondaryButton>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </PageShell>

      {/* Interactive Approval Drawer */}
      <ApprovalDrawer
        opportunity={selectedOpp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApproveSuccess={handleApproveSuccess}
      />
    </DashboardLayout>
  );
}

