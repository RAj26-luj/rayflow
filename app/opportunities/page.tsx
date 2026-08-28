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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalDrawer } from '@/components/opportunities/ApprovalDrawer';
import { RevenueOpportunity, OpportunityType } from '@/lib/types';
import { formatINR } from '@/lib/utils';

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
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Autonomous Revenue Feed
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              AI Revenue Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              High-confidence revenue interventions generated from merchant data and policy guards.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
              Total Potential: <strong className="text-emerald-700 font-bold ml-1">{formatINR(totalPotential)}</strong>
            </div>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 sm:p-4 text-xs text-blue-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
        )}

        {/* Filter Chips with mobile horizontal scroll */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
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
              className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Opportunities Feed List */}
        <div className="space-y-4">
          {filteredOpps.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <Sparkles className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-800 text-sm">No Revenue Opportunities Pending</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your autonomous agent is monitoring store telemetry. Opportunities will appear here when affinity correlations or abandoned checkouts are detected.
              </p>
            </div>
          )}
          {filteredOpps.map((opp) => (
            <div
              key={opp.id}
              className={`rounded-xl border bg-white p-4 sm:p-6 shadow-xs transition-all ${
                opp.status === 'EXECUTED'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : opp.status === 'REJECTED'
                  ? 'border-slate-200 opacity-60'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                {/* Left Side: Metadata & Reasoning */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                      {opp.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {opp.affectedCustomerCohort}
                    </span>
                    {opp.status === 'EXECUTED' && (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                        ACTIVE ✓
                      </span>
                    )}
                    {opp.status === 'REJECTED' && (
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium">
                        DISMISSED
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">{opp.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{opp.description}</p>
                  </div>

                  {/* AI Recommendation Box */}
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 sm:p-3.5 space-y-1.5 text-xs">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-blue-600" />
                      AI Recommendation:
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed text-[11px] sm:text-xs">
                      &quot;{opp.recommendedAction}&quot;
                    </p>
                  </div>

                  {/* Evidence & Policy Status */}
                  <div className="text-[11px] sm:text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">Reasoning: </span>
                    <span>{opp.reasoning}</span>
                  </div>
                </div>

                {/* Right Side: Key Metrics & Action Panel */}
                <div className="lg:w-72 flex-shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 space-y-3 sm:space-y-4">
                  <div className="space-y-2.5 sm:space-y-3">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">Expected Incremental Revenue</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">
                        {formatINR(opp.expectedRevenue)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400">Confidence</div>
                        <div className="font-bold text-blue-700">{opp.confidence}%</div>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400">Affected</div>
                        <div className="font-bold text-slate-800">{opp.affectedCustomersCount} shoppers</div>
                      </div>
                    </div>

                    <div className="rounded p-2 bg-emerald-50 border border-emerald-100 text-[10px] sm:text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{opp.policyNotes || 'Within merchant discount limit ✓'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    {opp.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleOpenApproval(opp)}
                          className="w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Review & Approve</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenApproval(opp)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Simulate
                          </button>
                          <button
                            onClick={() => handleReject(opp.id)}
                            className="px-3 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenApproval(opp)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Inspect Action Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
