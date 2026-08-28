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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AgentPolicy } from '@/lib/types';
import { formatINR } from '@/lib/utils';

export default function PoliciesPage() {
  const [policy, setPolicy] = useState<AgentPolicy | null>(null);
  const [loading, setLoading] = useState(true);
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
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestSandbox = async () => {
    if (!policy) return;

    // Evaluate in real-time
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
          : `Compliant and auto-approved.`,
      },
      budgetEvaluation: {
        allowed: budgetAllowed,
        requiresApproval: budgetReqApproval,
        reason: !budgetAllowed
          ? `Blocked by merchant policy. Proposed budget (${formatINR(sandboxBudget)}) exceeds maximum permitted budget cap of ${formatINR(policy.maxCampaignBudget)}.`
          : budgetReqApproval
          ? `Requires merchant approval as it exceeds auto threshold of ${formatINR(policy.approvalThresholdCampaign)}.`
          : `Compliant and auto-approved.`,
      },
    });
  };

  if (!policy) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-xs text-slate-500">
          Loading policy rules...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Sliders className="h-3.5 w-3.5" />
              Safety & Governance Controls
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Agent Policy Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure hard bounds, budget ceilings, and mandatory human-in-the-loop approval thresholds.
            </p>
          </div>

          {savedSuccess && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5 animate-in fade-in self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Policies Updated & Audited</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Left 2 Cols: Main Policy Configuration Form */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <form onSubmit={handleSavePolicy} className="space-y-5 sm:space-y-6">
              {/* Hard Quantitative Limits */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <h2 className="font-bold text-slate-900 text-sm">Hard Economic Caps</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700">Maximum Discount (%)</label>
                    <input
                      type="number"
                      value={policy.maxDiscountPercent}
                      onChange={(e) =>
                        setPolicy({ ...policy, maxDiscountPercent: Number(e.target.value) })
                      }
                      className="w-full mt-1.5 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Upper ceiling for any autonomous bundle discount.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Max Campaign Budget (INR)</label>
                    <input
                      type="number"
                      value={policy.maxCampaignBudget}
                      onChange={(e) =>
                        setPolicy({ ...policy, maxCampaignBudget: Number(e.target.value) })
                      }
                      className="w-full mt-1.5 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Max total promotional budget an agent can allocate.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Max Single Txn (INR)</label>
                    <input
                      type="number"
                      value={policy.maxSingleTransaction}
                      onChange={(e) =>
                        setPolicy({ ...policy, maxSingleTransaction: Number(e.target.value) })
                      }
                      className="w-full mt-1.5 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Single order velocity threshold.
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Gates */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h2 className="font-bold text-slate-900 text-sm">Merchant Approval Thresholds</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700">Require Approval for Discounts &gt; (%)</label>
                    <input
                      type="number"
                      value={policy.approvalThresholdDiscount}
                      onChange={(e) =>
                        setPolicy({ ...policy, approvalThresholdDiscount: Number(e.target.value) })
                      }
                      className="w-full mt-1.5 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Discounts above this threshold trigger the Approval Drawer.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Require Approval for Campaigns &gt; (INR)</label>
                    <input
                      type="number"
                      value={policy.approvalThresholdCampaign}
                      onChange={(e) =>
                        setPolicy({ ...policy, approvalThresholdCampaign: Number(e.target.value) })
                      }
                      className="w-full mt-1.5 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Campaigns above this amount require merchant sign-off.
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions & Restrictions Matrix */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
                <h2 className="font-bold text-slate-900 text-sm">Action Permissions Matrix</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  {/* Allowed Actions */}
                  <div className="p-3.5 sm:p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Allowed Autonomous Actions
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li>✓ Recommend complementary products</li>
                      <li>✓ Calculate bounded bundle discounts</li>
                      <li>✓ Create AI campaigns (with simulation)</li>
                      <li>✓ Initiate Razorpay test-mode checkout</li>
                    </ul>
                  </div>

                  {/* Restricted Actions */}
                  <div className="p-3.5 sm:p-4 rounded-lg bg-amber-50/50 border border-amber-200 space-y-2">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Restricted Actions (Guarded)
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li>⚠ Direct unverified customer refunds</li>
                      <li>⚠ Arbitrary catalogue base-price tampering</li>
                      <li>⚠ Automated orders exceeding ₹25,000</li>
                      <li>⚠ Discounts exceeding 20%</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Save & Audit Policy Configuration</span>
              </button>
            </form>
          </div>

          {/* Right Col: Live Policy Sandbox Testing */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Zap className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Policy Testing Sandbox</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Test how the Policy Engine reacts to candidate actions before agents execute them.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Test Candidate Discount (%):</label>
                  <input
                    type="number"
                    value={sandboxDiscount}
                    onChange={(e) => setSandboxDiscount(Number(e.target.value))}
                    className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Test Campaign Budget (INR):</label>
                  <input
                    type="number"
                    value={sandboxBudget}
                    onChange={(e) => setSandboxBudget(Number(e.target.value))}
                    className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestSandbox}
                  className="w-full rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Evaluate Policy Bounds</span>
                </button>

                {sandboxResult && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-[11px] animate-in fade-in">
                    <div className="font-bold text-slate-900">Evaluation Verdict:</div>
                    <div className="space-y-1.5">
                      <div
                        className={`p-2 rounded border ${
                          sandboxResult.discountEvaluation.allowed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-red-50 border-red-200 text-red-900'
                        }`}
                      >
                        <strong>Discount Rule:</strong> {sandboxResult.discountEvaluation.reason}
                      </div>

                      <div
                        className={`p-2 rounded border ${
                          sandboxResult.budgetEvaluation.allowed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-red-50 border-red-200 text-red-900'
                        }`}
                      >
                        <strong>Budget Rule:</strong> {sandboxResult.budgetEvaluation.reason}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
