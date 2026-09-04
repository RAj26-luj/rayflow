'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Zap,
  Save,
  Check,
  RotateCcw,
  Play,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AgentPolicy } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
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

  // Policy Sandbox Interactive State
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

  const handleTestSandbox = async () => {
    if (!policy) return;

    const discountAllowed = sandboxDiscount <= policy.maxDiscountPercent;
    const discountReqApproval = sandboxDiscount > policy.approvalThresholdDiscount && discountAllowed;

    const budgetAllowed = sandboxBudget <= policy.maxCampaignBudget;
    const budgetReqApproval = sandboxBudget > policy.approvalThresholdCampaign && budgetAllowed;

    setSandboxResult({
      discountEvaluation: {
        allowed: discountAllowed,
        requiresApproval: discountReqApproval,
        reason: !discountAllowed
          ? `Blocked by merchant policy. Proposed discount (${sandboxDiscount}%) exceeds maximum permitted discount cap of ${policy.maxDiscountPercent}%.`
          : discountReqApproval
          ? `Permitted, but requires merchant sign-off (exceeds ${policy.approvalThresholdDiscount}% auto threshold).`
          : `Compliant and auto-approved within threshold.`,
      },
      budgetEvaluation: {
        allowed: budgetAllowed,
        requiresApproval: budgetReqApproval,
        reason: !budgetAllowed
          ? `Blocked by merchant policy. Proposed budget (${formatINR(sandboxBudget)}) exceeds maximum permitted budget cap of ${formatINR(policy.maxCampaignBudget)}.`
          : budgetReqApproval
          ? `Requires merchant approval as it exceeds auto threshold of ${formatINR(policy.approvalThresholdCampaign)}.`
          : `Compliant and auto-approved within threshold.`,
      },
    });
  };

  return (
    <DashboardLayout>
      <PageShell>
        {/* Header */}
        <SectionHeader
          title="Business Rules"
          description="Set discount ceilings, margin floors, campaign budget caps, and approval requirements."
          badge={{ text: 'Rules Enforced', variant: 'emerald' }}
          action={
            savedSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Business Rules Saved & Enforced</span>
              </motion.div>
            )
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Policy Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSavePolicy} className="space-y-6">
              {/* Quantitative Limits */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 font-bold">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base">Quantitative Limits</h2>
                    <p className="text-xs text-slate-500">Hard ceilings that cannot be breached under any circumstance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Maximum Discount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={policy.maxDiscountPercent}
                        onChange={(e) =>
                          setPolicy({ ...policy, maxDiscountPercent: Number(e.target.value) })
                        }
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-400 font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Upper limit for bundle and product discounts.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Campaign Budget Cap</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={policy.maxCampaignBudget}
                        onChange={(e) =>
                          setPolicy({ ...policy, maxCampaignBudget: Number(e.target.value) })
                        }
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-400 font-bold">₹</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Maximum budget for marketing campaigns.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Transaction Limit</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={policy.maxSingleTransaction}
                        onChange={(e) =>
                          setPolicy({ ...policy, maxSingleTransaction: Number(e.target.value) })
                        }
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-400 font-bold">₹</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Maximum value for single transactions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Thresholds */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base">Approval Thresholds</h2>
                    <p className="text-xs text-slate-500">Actions requiring explicit merchant confirmation before running</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Discount Approval Threshold</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={policy.approvalThresholdDiscount}
                        onChange={(e) =>
                          setPolicy({ ...policy, approvalThresholdDiscount: Number(e.target.value) })
                        }
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-400 font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Discounts above this threshold require approval.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Campaign Approval Threshold</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={policy.approvalThresholdCampaign}
                        onChange={(e) =>
                          setPolicy({ ...policy, approvalThresholdCampaign: Number(e.target.value) })
                        }
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-400 font-bold">₹</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Campaigns above this amount require approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Permissions Matrix */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">Action Permissions Matrix</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Allowed Actions */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Permitted Actions
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-xs">
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Recommend complementary products</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Calculate bundle discount incentives</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Create campaigns post-simulation</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Initiate Razorpay Test Mode checkout</span>
                      </li>
                    </ul>
                  </div>

                  {/* Restricted Actions */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2.5">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Restricted / Blocked Actions
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-xs">
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-600 font-bold">⚠</span>
                        <span>Customer refunds (Admin Only)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-600 font-bold">⚠</span>
                        <span>Product base-price changes</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-600 font-bold">⚠</span>
                        <span>Orders above ₹25,000 threshold</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-600 font-bold">⚠</span>
                        <span>Discounts exceeding 20% cap</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <ActionButton
                type="submit"
                size="md"
                isLoading={saving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Business Rules
              </ActionButton>
            </form>
          </div>

          {/* Right Col: Live Policy Sandbox Testing */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 font-bold">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Business Rules Sandbox</h3>
                  <p className="text-[11px] text-slate-400">Evaluate hypothetical offers against active business rules</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Candidate Discount (%):</label>
                  <input
                    type="number"
                    value={sandboxDiscount}
                    onChange={(e) => setSandboxDiscount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Candidate Budget (INR):</label>
                  <input
                    type="number"
                    value={sandboxBudget}
                    onChange={(e) => setSandboxBudget(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <SecondaryButton
                  type="button"
                  onClick={handleTestSandbox}
                  size="sm"
                  className="w-full"
                  leftIcon={<Play className="h-3.5 w-3.5 text-blue-600" />}
                >
                  Evaluate Rules
                </SecondaryButton>

                {sandboxResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5 text-xs"
                  >
                    <div className="font-bold text-slate-900">Sandbox Verdict:</div>
                    <div className="space-y-2">
                      <div
                        className={`p-3 rounded-xl border ${
                          sandboxResult.discountEvaluation.allowed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-red-50 border-red-200 text-red-950'
                        }`}
                      >
                        <strong>Discount Evaluation:</strong> {sandboxResult.discountEvaluation.reason}
                      </div>

                      <div
                        className={`p-3 rounded-xl border ${
                          sandboxResult.budgetEvaluation.allowed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-red-50 border-red-200 text-red-950'
                        }`}
                      >
                        <strong>Budget Evaluation:</strong> {sandboxResult.budgetEvaluation.reason}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </DashboardLayout>
  );
}

