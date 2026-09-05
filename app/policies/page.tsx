'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AgentPolicy } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/Feedback';

const DEFAULT_POLICY: AgentPolicy = {
  id: 'pol_aura_01',
  maxDiscountPercent: 20,
  maxCampaignBudget: 50000,
  maxSingleTransaction: 25000,
  approvalThresholdDiscount: 15,
  approvalThresholdCampaign: 10000,
  allowDirectDiscounts: true,
  allowAutoBundle: true,
  allowAutoCampaign: true,
  allowRefunds: false,
  allowDirectPriceChange: false,
  restrictedActions: [
    'Direct price overwrite without verification',
    'Customer credit processing (Manual Approval Only)',
    'Campaign budgets exceeding ₹50,000 threshold',
    'Bundles discounting beyond 20% limit',
  ],
  updatedAt: new Date().toISOString(),
};

export default function PoliciesPage() {
  const [policy, setPolicy] = useState<AgentPolicy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [sandboxDiscount, setSandboxDiscount] = useState(25);
  const [sandboxBudget, setSandboxBudget] = useState(60000);
  const [sandboxResult, setSandboxResult] = useState<{
    discountEvaluation: any;
    budgetEvaluation: any;
  } | null>(null);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/policies');
      const data = await res.json();
      if (data.success) {
        setPolicy(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;

    try {
      setSaving(true);
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunSandbox = () => {
    const dAllowed = sandboxDiscount <= policy.maxDiscountPercent;
    const dAuto = sandboxDiscount <= policy.approvalThresholdDiscount;
    const bAllowed = sandboxBudget <= policy.maxCampaignBudget;
    const bAuto = sandboxBudget <= policy.approvalThresholdCampaign;

    setSandboxResult({
      discountEvaluation: {
        status: !dAllowed ? 'BLOCKED' : !dAuto ? 'NEEDS_APPROVAL' : 'AUTO_APPROVED',
        reason: !dAllowed
          ? `Discount of ${sandboxDiscount}% exceeds store cap (${policy.maxDiscountPercent}%)`
          : !dAuto
          ? `Discount of ${sandboxDiscount}% requires manager approval (auto-threshold: ${policy.approvalThresholdDiscount}%)`
          : `Discount of ${sandboxDiscount}% is auto-approved`,
      },
      budgetEvaluation: {
        status: !bAllowed ? 'BLOCKED' : !bAuto ? 'NEEDS_APPROVAL' : 'AUTO_APPROVED',
        reason: !bAllowed
          ? `Budget of ${formatINR(sandboxBudget)} exceeds campaign limit (${formatINR(policy.maxCampaignBudget)})`
          : !bAuto
          ? `Budget of ${formatINR(sandboxBudget)} requires approval`
          : `Budget of ${formatINR(sandboxBudget)} is auto-approved`,
      },
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading business rules..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageShell>
        <SectionHeader
          title="Store Rules"
          description="Set discount caps, budget limits, and approval rules."
          badge="Rules"
          badgeIcon={<Sliders className="h-3.5 w-3.5" />}
        />

        {savedSuccess && (
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/80 p-3.5 text-xs text-emerald-200 font-semibold flex items-center gap-2 shadow-xl backdrop-blur-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Saved.</span>
          </div>
        )}

        <form onSubmit={handleSavePolicy} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 space-y-5 shadow-xl backdrop-blur-xl text-white">
              <h3 className="font-bold text-white text-sm sm:text-base border-b border-zinc-800/80 pb-3">
                Discount & Budget Ceilings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Max Discount (%)</label>
                  <input
                    type="number"
                    value={policy.maxDiscountPercent}
                    onChange={(e) => setPolicy({ ...policy, maxDiscountPercent: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Hard limit on discounts</span>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Max Campaign Budget (INR)</label>
                  <input
                    type="number"
                    value={policy.maxCampaignBudget}
                    onChange={(e) => setPolicy({ ...policy, maxCampaignBudget: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Campaign spend limit</span>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Max Transaction (INR)</label>
                  <input
                    type="number"
                    value={policy.maxSingleTransaction}
                    onChange={(e) => setPolicy({ ...policy, maxSingleTransaction: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Single order cap</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 space-y-5 shadow-xl backdrop-blur-xl text-white">
              <h3 className="font-bold text-white text-sm sm:text-base border-b border-zinc-800/80 pb-3">
                Approval Thresholds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Discount Approval Threshold (%)</label>
                  <input
                    type="number"
                    value={policy.approvalThresholdDiscount}
                    onChange={(e) => setPolicy({ ...policy, approvalThresholdDiscount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Discounts above this require review</span>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Campaign Approval Threshold (INR)</label>
                  <input
                    type="number"
                    value={policy.approvalThresholdCampaign}
                    onChange={(e) => setPolicy({ ...policy, approvalThresholdCampaign: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Budgets above this require review</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <ActionButton type="submit" size="md" isLoading={saving} icon={<Save className="h-4 w-4" />}>
                Save Business Rules
              </ActionButton>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 space-y-4 shadow-xl backdrop-blur-xl text-white">
              <h3 className="font-bold text-white text-sm border-b border-zinc-800/80 pb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-violet-400" />
                <span>Rules Evaluator Sandbox</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Test candidate discount or budget inputs against configured store limits.</p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Test Discount (%)</label>
                  <input
                    type="number"
                    value={sandboxDiscount}
                    onChange={(e) => setSandboxDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Test Campaign Budget (INR)</label>
                  <input
                    type="number"
                    value={sandboxBudget}
                    onChange={(e) => setSandboxBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <SecondaryButton size="sm" fullWidth onClick={handleRunSandbox} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                  Evaluate Rules
                </SecondaryButton>
              </div>

              {sandboxResult && (
                <div className="mt-3 space-y-2 pt-3 border-t border-zinc-800/80 text-xs">
                  <div className={`p-3 rounded-2xl border text-[11px] backdrop-blur-md ${
                    sandboxResult.discountEvaluation.status === 'BLOCKED'
                      ? 'bg-rose-950/60 border-rose-800 text-rose-300 font-semibold'
                      : sandboxResult.discountEvaluation.status === 'NEEDS_APPROVAL'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300 font-semibold'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 font-semibold'
                  }`}>
                    <strong>Discount:</strong> {sandboxResult.discountEvaluation.reason}
                  </div>

                  <div className={`p-3 rounded-2xl border text-[11px] backdrop-blur-md ${
                    sandboxResult.budgetEvaluation.status === 'BLOCKED'
                      ? 'bg-rose-950/60 border-rose-800 text-rose-300 font-semibold'
                      : sandboxResult.budgetEvaluation.status === 'NEEDS_APPROVAL'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300 font-semibold'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 font-semibold'
                  }`}>
                    <strong>Budget:</strong> {sandboxResult.budgetEvaluation.reason}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </PageShell>
    </DashboardLayout>
  );
}
