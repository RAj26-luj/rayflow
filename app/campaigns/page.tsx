'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Campaign } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { CampaignCard } from '@/components/ui/Cards';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/Feedback';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);

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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setSimResult(null);
        setNotification(`Campaign "${campaignName}" launched successfully!`);
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
        <SectionHeader
          title="Promotions & Campaigns"
          description="Create and launch promotional offers bounded by store policy limits."
          badge="Promotions Hub"
          badgeIcon={<Megaphone className="h-3.5 w-3.5" />}
          actions={
            <ActionButton size="sm" onClick={() => setIsCreateModalOpen(true)} icon={<Plus className="h-3.5 w-3.5" />}>
              Create Campaign
            </ActionButton>
          }
        />

        {notification && (
          <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>{notification}</span>
          </div>
        )}

        {loading ? (
          <LoadingState message="Loading campaigns..." />
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 space-y-2">
            <p className="text-stone-600 text-sm font-semibold">No active campaigns.</p>
            <ActionButton size="sm" onClick={() => setIsCreateModalOpen(true)}>
              Launch First Campaign
            </ActionButton>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </PageShell>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Bounded Campaign">
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Campaign Name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Target Cohort Description</label>
            <input
              type="text"
              value={targetCohort}
              onChange={(e) => setTargetCohort(e.target.value)}
              className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Offer Discount (%)</label>
              <input
                type="number"
                max={20}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-stone-400">Max allowed: 20%</span>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Max Budget (INR)</label>
              <input
                type="number"
                max={50000}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-stone-400">Policy cap: ₹50,000</span>
            </div>
          </div>

          {simResult && (
            <div className="rounded bg-brand-50 border border-brand-200 p-3 space-y-1">
              <div className="font-bold text-brand-900">Simulation Summary</div>
              <p className="text-stone-600 text-[11px]">
                Projected Orders: <strong>{simResult.projectedOrders}</strong> | Expected Revenue: <strong>{formatINR(simResult.projectedRevenue)}</strong>
              </p>
              <div className="text-emerald-800 text-[11px] font-semibold">
                Policy Check: All rules compliant ✓
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-between gap-2">
            <SecondaryButton size="sm" onClick={handleSimulate} isLoading={simulating}>
              Simulate Impact
            </SecondaryButton>
            <div className="flex items-center gap-2">
              <SecondaryButton size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <ActionButton size="sm" onClick={handleLaunchCampaign}>
                Approve & Launch
              </ActionButton>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
