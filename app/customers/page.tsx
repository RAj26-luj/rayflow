'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  TrendingUp,
  Search,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Eye,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Customer } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton, GhostButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cohort, setCohort] = useState('High-Value Activewear Enthusiasts');
  const [intentScore, setIntentScore] = useState(85);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          cohort,
          intentScore: Number(intentScore),
          lifecycleStage: 'HIGH_INTENT',
          ordersCount: 0,
          totalSpent: 0,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        loadCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cohort.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCohort === 'ALL') return matchesSearch;
    return matchesSearch && c.cohort.includes(selectedCohort);
  });

  const avgIntent = customers.length > 0
    ? (customers.reduce((sum, c) => sum + c.intentScore, 0) / customers.length).toFixed(1)
    : '0';

  return (
    <DashboardLayout>
      <PageShell>
        {/* Header */}
        <SectionHeader
          title="Customers"
          description="View customer segments, purchase intent scores, order frequency, and lifetime spend."
          badge={{ text: 'Customer Directory', variant: 'blue' }}
          action={
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-xs text-slate-700 shadow-2xs font-medium">
                Average Intent: <strong className="text-blue-600 font-extrabold font-mono ml-1">{avgIntent} / 100</strong>
              </div>
              <ActionButton
                onClick={() => setIsAddModalOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Customer
              </ActionButton>
            </div>
          }
        />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or cohort tag..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cohort:</span>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Cohorts</option>
              <option value="Marathoners">High-Intent Marathoners</option>
              <option value="Fitness">Tech Fitness</option>
              <option value="Weekend">Weekend Runners</option>
              <option value="VIP">VIP Runners Club</option>
            </select>
          </div>
        </div>

        {/* Customer Table Container */}
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {loading && customers.length === 0 ? (
            <LoadingState message="Loading customer intelligence..." />
          ) : filteredCustomers.length === 0 ? (
            <EmptyState
              title="No Customer Records Found"
              description="Click 'Add Customer' above or customers will be recorded automatically when checkouts occur."
              action={{
                label: 'Add Customer',
                onClick: () => setIsAddModalOpen(true),
              }}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-5 py-4">Cohort</th>
                      <th className="px-5 py-4">Lifetime Value</th>
                      <th className="px-5 py-4">Intent Score</th>
                      <th className="px-5 py-4">Cart Status</th>
                      <th className="px-6 py-4">Recommended Next Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Customer Identity */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.email}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.phone}</div>
                        </td>

                        {/* Cohort */}
                        <td className="px-5 py-4">
                          <span className="rounded-xl bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {c.cohort}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {c.orderCount ?? 0} lifetime orders
                          </div>
                        </td>

                        {/* LTV */}
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-slate-900 text-sm font-mono">
                            {formatINR(c.lifetimeValue ?? 0)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Last active: {formatDate(c.lastPurchaseDate ?? new Date())}
                          </div>
                        </td>

                        {/* Intent Meter */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  c.intentScore >= 85
                                    ? 'bg-emerald-500'
                                    : c.intentScore >= 70
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${c.intentScore}%` }}
                              />
                            </div>
                            <span className="font-extrabold font-mono text-slate-900">{c.intentScore}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {c.intentScore >= 85 ? 'High propensity' : 'Moderate propensity'}
                          </div>
                        </td>

                        {/* Cart Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={c.cartStatus || 'HIGH_INTENT'} size="sm" />
                        </td>

                        {/* Next Action Recommendation */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-950 font-medium flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>Recommended for bundle cross-sell offer</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                        <div className="text-xs text-slate-400">{c.email}</div>
                      </div>
                      <StatusBadge status={c.cartStatus || 'HIGH_INTENT'} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">LTV</div>
                        <div className="font-extrabold text-slate-900 font-mono mt-0.5">{formatINR(c.lifetimeValue ?? 0)}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Intent</div>
                        <div className="font-extrabold text-blue-600 font-mono mt-0.5">{c.intentScore} / 100</div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-2.5 text-xs text-blue-950 font-medium flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      <span>Recommended for bundle cross-sell offer</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add Customer Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Customer Record"
        >
          <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Seth"
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@example.com"
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cohort Tag</label>
              <input
                type="text"
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Intent Score (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={intentScore}
                onChange={(e) => setIntentScore(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <GhostButton type="button" onClick={() => setIsAddModalOpen(false)} size="sm">
                Cancel
              </GhostButton>
              <ActionButton type="submit" size="sm">
                Save Customer
              </ActionButton>
            </div>
          </form>
        </Modal>
      </PageShell>
    </DashboardLayout>
  );
}

