'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Campaign } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton, GhostButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [campaignName, setCampaignName] = useState('Run Ready Bundle');
  const [targetCohort, setTargetCohort] = useState('Customers who purchased running shoes in last 90 days');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [maxBudget, setMaxBudget] = useState(20000);
  const [estimatedAudience, setEstimatedAudience] = useState(2431);
  const [expectedRevenue, setExpectedRevenue] = useState(84200);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          targetCohort,
          discountPercent,
          maxBudget,
          estimatedAudience,
          expectedRevenue,
          simulateOnly: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.simulation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          targetCohort,
          discountPercent,
          maxBudget,
          estimatedAudience,
          expectedRevenue,
          aiReasoning: 'Customers in this cohort have a 42% historical probability of purchasing accessories.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNotification(`Successfully launched campaign "${campaignName}"!`);
        fetchCampaigns();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <PageShell>
        {/* Header */}
        <SectionHeader
          title="Promotions & Campaigns"
          description="Design bounded promotional campaigns, simulate projected conversion, and activate with audit trail."
          badge={{ text: 'Promotions Hub', variant: 'blue' }}
          action={
            <ActionButton
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Campaign
            </ActionButton>
          }
        />

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-800 flex items-center gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{notification}</span>
          </motion.div>
        )}

        {/* Active Campaigns List */}
        {loading && campaigns.length === 0 ? (
          <LoadingState message="Loading merchant campaigns..." />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No Active Campaigns"
            description="Create a targeted campaign to reach customer segments within your policy limits."
            action={{
              label: 'Create Your First Campaign',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <div className="space-y-4">
            {campaigns.map((camp) => (
              <motion.div
                key={camp.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 font-bold flex-shrink-0">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm sm:text-base">{camp.name}</h2>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>Cohort: <strong className="text-slate-800">{camp.targetCohort}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Offer: <strong className="text-blue-600">{camp.discountPercent}% off</strong></span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={camp.status} size="sm" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Target Audience</div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                      {camp.estimatedAudience.toLocaleString()} shoppers
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Expected Revenue</div>
                    <div className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono mt-1">
                      {formatINR(camp.expectedRevenue)}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Budget Cap</div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 font-mono mt-1">
                      {formatINR(camp.maxBudget)}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Converted Orders</div>
                    <div className="text-sm sm:text-base font-bold text-blue-600 font-mono mt-1">
                      {camp.convertedOrders} orders
                    </div>
                  </div>
                </div>

                {/* Audience Insight Block */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900">Audience Insight: </span>
                    <span className="text-slate-600">&quot;{camp.aiReasoning}&quot;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Campaign Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Promotional Campaign"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Cohort</label>
              <input
                type="text"
                value={targetCohort}
                onChange={(e) => setTargetCohort(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Offer Discount (%):</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
                <div className="text-[10px] text-slate-400 mt-1">Max allowed: 20%</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campaign Budget (INR):</label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
                <div className="text-[10px] text-slate-400 mt-1">Policy cap: ₹50,000</div>
              </div>
            </div>

            {/* Audience Insight Preview */}
            <div className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/60 text-xs text-blue-900 leading-relaxed">
              <strong className="font-bold">Audience Insight:</strong> Customers in this 90-day cohort have a 42% historical probability of purchasing accessories when offered a 15% bundle discount.
            </div>

            {/* Simulation Output Card */}
            {simResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70 text-xs text-blue-950 space-y-2"
              >
                <div className="font-bold flex items-center gap-1.5 text-blue-700">
                  <TrendingUp className="h-4 w-4" />
                  Simulation Summary:
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <div>Projected Orders: <strong>{simResult.projectedOrders} orders</strong></div>
                  <div>Expected Revenue: <strong className="font-mono text-emerald-700">{formatINR(simResult.expectedRevenue)}</strong></div>
                  <div className="col-span-2">Policy Check: <strong className="text-emerald-700">All rules compliant ✓</strong></div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
              <SecondaryButton
                type="button"
                onClick={handleSimulate}
                disabled={simulating}
                isLoading={simulating}
                size="sm"
              >
                Simulate Impact
              </SecondaryButton>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <GhostButton
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  size="sm"
                >
                  Cancel
                </GhostButton>
                <ActionButton
                  type="button"
                  onClick={handleLaunchCampaign}
                  size="sm"
                >
                  Approve & Launch
                </ActionButton>
              </div>
            </div>
          </div>
        </Modal>
      </PageShell>
    </DashboardLayout>
  );
}

