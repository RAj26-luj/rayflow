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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Campaign } from '@/lib/types';
import { formatINR } from '@/lib/utils';

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
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Megaphone className="h-3.5 w-3.5" />
              Promotions & Marketing
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Campaigns
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage targeted promotional campaigns, simulate outcomes, and track conversion.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {notification && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
        )}

        {/* Active Campaigns List */}
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
              <Megaphone className="h-10 w-10 mx-auto text-slate-300" />
              <div className="font-semibold text-slate-800 text-sm">No Active Campaigns</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a targeted campaign to reach customer segments within your policy limits.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Your First Campaign</span>
              </button>
            </div>
          ) : (
            campaigns.map((camp) => (
            <div
              key={camp.id}
              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex-shrink-0">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base">{camp.name}</h2>
                    <div className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                      <span>Cohort: <strong>{camp.targetCohort}</strong></span>
                      <span>•</span>
                      <span>Offer: <strong>{camp.discountPercent}% off</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {camp.status}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">Target Audience</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {camp.estimatedAudience.toLocaleString()} runners
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">Expected Revenue</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">
                    {formatINR(camp.expectedRevenue)}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">Campaign Budget Cap</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {formatINR(camp.maxBudget)}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400">Converted Orders</div>
                  <div className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">
                    {camp.convertedOrders} orders
                  </div>
                </div>
              </div>

              {/* Audience Insight Block */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2.5 sm:p-3 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-900 text-[11px] sm:text-xs">Audience Insight: </span>
                  <span className="text-[11px] sm:text-xs">&quot;{camp.aiReasoning}&quot;</span>
                </div>
              </div>
            </div>
          )))}
        </div>

        {/* Create Campaign Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Create Campaign</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Target Cohort</label>
                  <input
                    type="text"
                    value={targetCohort}
                    onChange={(e) => setTargetCohort(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Offer Discount (%):</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono"
                    />
                    <div className="text-[10px] text-slate-400 mt-0.5">Max allowed: 20%</div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Campaign Budget (INR):</label>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono"
                    />
                    <div className="text-[10px] text-slate-400 mt-0.5">Policy cap: ₹50,000</div>
                  </div>
                </div>

                {/* Audience Insight Preview */}
                <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/60 text-[11px] text-blue-900 leading-relaxed">
                  <strong className="font-bold">Audience Insight:</strong> Customers in this 90-day cohort have a 42% historical probability of purchasing accessories when offered a 15% bundle discount.
                </div>

                {/* Simulation Output Card */}
                {simResult && (
                  <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-[11px] text-indigo-950 space-y-1.5 animate-in fade-in">
                    <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                      Simulation Summary:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>Projected Orders: <strong>{simResult.projectedOrders} orders</strong></div>
                      <div>Expected Revenue: <strong>{formatINR(simResult.expectedRevenue)}</strong></div>
                      <div className="col-span-2">Policy Check: <strong className="text-emerald-700">All rules compliant ✓</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 text-center"
                >
                  {simulating ? 'Simulating...' : 'Simulate Campaign'}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 sm:flex-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchCampaign}
                    className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Approve & Launch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
