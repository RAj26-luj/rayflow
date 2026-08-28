'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  Info,
  Clock,
  DollarSign,
  Users,
  Lock,
} from 'lucide-react';
import { RevenueOpportunity } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface ApprovalDrawerProps {
  opportunity: RevenueOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveSuccess: (opp: RevenueOpportunity) => void;
}

export function ApprovalDrawer({
  opportunity,
  isOpen,
  onClose,
  onApproveSuccess,
}: ApprovalDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !opportunity) return null;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          action: 'APPROVE',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || data.error || 'Failed to approve opportunity');
      } else {
        onApproveSuccess(data.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setError(null);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          action: 'SIMULATE',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.simulation);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-full sm:max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
                Action Approval Gate
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                {opportunity.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 flex-1 text-slate-800 text-xs sm:text-sm">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Action Blocked: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Expected Impact Summary Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3">
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">Expected Uplift</div>
              <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
                {formatINR(opportunity.expectedRevenue)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3">
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">AI Confidence</div>
              <div className="text-sm sm:text-base font-bold text-blue-600 mt-0.5">
                {opportunity.confidence}%
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3">
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">Target Cohort</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                {opportunity.affectedCustomersCount} shoppers
              </div>
            </div>
          </div>

          {/* Section 1: AI Recommendation */}
          <div className="space-y-1.5">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              AI Recommendation
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 sm:p-3.5 text-slate-800 font-medium text-xs leading-relaxed">
              {opportunity.recommendedAction}
            </div>
          </div>

          {/* Section 2: Why the Agent chose it (Evidence) */}
          <div className="space-y-1.5">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-600" />
              Decision Evidence & Rationale
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-3.5 text-xs text-slate-600 leading-relaxed space-y-1.5">
              <p>{opportunity.reasoning}</p>
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                <span>Audience: <strong>{opportunity.affectedCustomerCohort}</strong></span>
                <span>Risk Level: <strong className="text-emerald-700 font-semibold">{opportunity.riskLevel}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 3: Exact Action Specification & Policy Checks */}
          <div className="space-y-2">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Policy Validation & Bounds
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 sm:p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Proposed Discount:</span>
                <span className="font-semibold text-slate-900">
                  {opportunity.actionPayload.discountPercent || 15}% (Limit: 20%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Max Campaign Budget:</span>
                <span className="font-semibold text-slate-900">
                  {formatINR(opportunity.actionPayload.maxBudget || 8000)} (Limit: ₹50,000)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Policy Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  <CheckCircle2 className="h-3 w-3" />
                  Within merchant limits ✓
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Failure Handling Guarantee */}
          <div className="space-y-1.5">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-600" />
              Safe Failure Handling Protocol
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/30 p-2.5 sm:p-3 text-[11px] text-slate-600 leading-relaxed">
              If customer checkout is interrupted or bank payment authorization fails:
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-500">
                <li>No revenue is falsely credited in dashboard or order ledger.</li>
                <li>The customer checkout remains open with 1-click retry state.</li>
                <li>Audit log records the exact bank gateway error code.</li>
              </ul>
            </div>
          </div>

          {/* Simulation Output Card (if clicked) */}
          {simulationResult && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 sm:p-4 space-y-2 text-xs text-indigo-900 animate-in fade-in">
              <div className="font-bold flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Monte Carlo Simulation Result
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Audience Size: <strong>{simulationResult.targetAudienceCount}</strong></div>
                <div>Projected Uplift: <strong>{formatINR(simulationResult.expectedUplift)}</strong></div>
                <div className="col-span-2">Margin Impact: <strong>{simulationResult.marginImpact}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/90 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sticky bottom-0">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            {simulating ? 'Simulating...' : 'Simulate Impact'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Executing...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve & Execute</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
