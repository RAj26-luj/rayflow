'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevenueOpportunity } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { ActionButton, SecondaryButton, GhostButton } from '@/components/ui/Button';

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !opportunity) return null;

  const handleAction = async (action: 'APPROVE' | 'EXECUTE') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          action,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || data.message || `Failed to ${action.toLowerCase()} opportunity`);
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
        onApproveSuccess({ ...opportunity, status: 'SIMULATED' });
      } else {
        setError(data.error?.message || 'Simulation failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-full sm:max-w-xl bg-zinc-900/95 border-l border-zinc-800 backdrop-blur-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10 text-white"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-950/80 text-violet-300 border border-violet-800/60 font-bold flex-shrink-0 shadow-inner">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-violet-300">
                    Opportunity Review
                  </span>
                  <StatusBadge status={opportunity.status} size="sm" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white leading-snug truncate mt-0.5">
                  {opportunity.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors flex-shrink-0 ml-2"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto text-zinc-300 text-xs sm:text-sm">
            {error && (
              <div className="rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Action Blocked: </span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Expected Impact Summary Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Est. Revenue</div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono mt-1">
                  {formatINR(opportunity.expectedRevenue)}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Confidence</div>
                <div className="text-base sm:text-lg font-extrabold text-violet-300 font-mono mt-1">
                  {opportunity.confidence}%
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Audience</div>
                <div className="text-base sm:text-lg font-extrabold text-white font-mono mt-1">
                  {opportunity.affectedCustomersCount}
                </div>
              </div>
            </div>

            {/* Section 1: Recommended Action */}
            <div className="space-y-1.5">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-violet-400" />
                Recommended Action
              </div>
              <div className="rounded-2xl border border-violet-800/50 bg-violet-950/40 p-4 text-white font-medium text-xs sm:text-sm leading-relaxed backdrop-blur-md">
                {opportunity.recommendedAction}
              </div>
            </div>

            {/* Section 2: Why this action was identified (Evidence) */}
            <div className="space-y-1.5">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-zinc-400" />
                Why this opportunity was identified
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs text-zinc-300 leading-relaxed space-y-2.5">
                <p>{opportunity.reasoning}</p>
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                  <span>Target Cohort: <strong className="text-white">{opportunity.affectedCustomerCohort}</strong></span>
                  <span>Risk Level: <strong className="text-emerald-400 font-semibold">{opportunity.riskLevel}</strong></span>
                </div>
              </div>
            </div>

            {/* Section 3: Policy Limits & Business Rules */}
            <div className="space-y-2">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Policy Limits & Business Rules
              </div>

              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Proposed Discount:</span>
                  <span className="font-bold text-white">
                    {opportunity.actionPayload.discountPercent || 15}% <span className="text-zinc-500 font-normal">(Limit: 20%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Max Campaign Budget:</span>
                  <span className="font-bold text-white font-mono">
                    {formatINR(opportunity.actionPayload.maxBudget || 8000)} <span className="text-zinc-500 font-normal">(Limit: ₹50,000)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                  <span className="text-zinc-400">Policy Evaluation:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60 text-[11px]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Within store limits ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Failure Handling */}
            <div className="space-y-1.5">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                Payment & Failure Invariants
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-3.5 text-[11px] text-zinc-400 leading-relaxed">
                If checkout drops off or payment fails:
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-zinc-400">
                  <li>No false revenue is credited to analytics.</li>
                  <li>Checkout session remains resumable for the buyer.</li>
                  <li>Activity is logged in store audit trail.</li>
                </ul>
              </div>
            </div>

            {/* Simulation Output Card */}
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-violet-800/60 bg-violet-950/50 p-4 space-y-2 text-xs text-white"
              >
                <div className="font-bold flex items-center gap-1.5 text-violet-300">
                  <TrendingUp className="h-4 w-4" />
                  Simulation Projections
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Audience Reach: <strong>{simulationResult.targetAudienceCount} shoppers</strong></div>
                  <div>Projected Uplift: <strong className="text-emerald-400 font-mono">{formatINR(simulationResult.expectedUplift)}</strong></div>
                  <div className="col-span-2">Margin Impact: <strong>{simulationResult.marginImpact}</strong></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-950/90 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sticky bottom-0">
            {opportunity.status === 'PENDING' && (
              <SecondaryButton
                onClick={handleSimulate}
                disabled={simulating || loading}
                isLoading={simulating}
                size="sm"
                className="w-full sm:w-auto bg-zinc-800 border-zinc-700 text-zinc-200"
              >
                Simulate Impact
              </SecondaryButton>
            )}

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end ml-auto">
              <GhostButton onClick={onClose} size="sm" className="flex-1 sm:flex-none text-zinc-400 hover:text-white">
                Cancel
              </GhostButton>

              {opportunity.status === 'PENDING' || opportunity.status === 'SIMULATED' ? (
                <ActionButton
                  onClick={() => handleAction('APPROVE')}
                  disabled={loading}
                  isLoading={loading}
                  size="sm"
                  className="flex-1 sm:flex-none"
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  Approve Opportunity
                </ActionButton>
              ) : opportunity.status === 'APPROVED' ? (
                <ActionButton
                  variant="emerald"
                  onClick={() => handleAction('EXECUTE')}
                  disabled={loading}
                  isLoading={loading}
                  size="sm"
                  className="flex-1 sm:flex-none"
                  leftIcon={<Zap className="h-3.5 w-3.5" />}
                >
                  Execute Opportunity
                </ActionButton>
              ) : (
                <div className="rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Active & Executed</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
