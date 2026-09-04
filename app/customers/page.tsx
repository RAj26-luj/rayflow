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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Customer } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';

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
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              Customer Intelligence
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Customers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Customer segments, intent scores, purchase history, and recommended next actions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-2xs font-medium">
              Average Intent: <strong className="text-blue-600 font-bold ml-1">{avgIntent} / 100</strong>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Add Customer Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Add Customer Record</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Seth"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Cohort Tag</label>
                  <input
                    type="text"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Intent Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={intentScore}
                    onChange={(e) => setIntentScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, cohort..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Cohort:</span>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="flex-1 sm:flex-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Cohorts</option>
              <option value="Marathoners">High-Intent Marathoners</option>
              <option value="Fitness">Tech Fitness</option>
              <option value="Weekend">Weekend Runners</option>
              <option value="VIP">VIP Runners Club</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Cohort</th>
                  <th className="px-4 py-3.5">Lifetime Value</th>
                  <th className="px-4 py-3.5">Intent Score</th>
                  <th className="px-4 py-3.5">Cart Status</th>
                  <th className="px-4 py-3.5">Recommended Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <div className="font-semibold text-slate-700 text-xs">No Customer Records Found</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Click &quot;Add Customer&quot; above or customers will be recorded automatically upon checkout.</div>
                    </td>
                  </tr>
                )}
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Customer Identity */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.phone}</div>
                    </td>

                    {/* Cohort */}
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                        {c.cohort}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {c.orderCount ?? 0} lifetime orders
                      </div>
                    </td>

                    {/* LTV */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {formatINR(c.lifetimeValue ?? 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Last active: {formatDate(c.lastPurchaseDate ?? new Date())}
                      </div>
                    </td>

                    {/* Intent Meter */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
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
                        <span className="font-bold text-slate-900">{c.intentScore}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {c.intentScore >= 85 ? 'High propensity' : 'Moderate propensity'}
                      </div>
                    </td>

                    {/* Cart Status */}
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-medium border border-blue-200">
                        {c.cartStatus || 'HIGH_INTENT'}
                      </span>
                    </td>

                    {/* Next Action Recommendation */}
                    <td className="px-4 py-4 max-w-xs">
                      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] text-blue-950 leading-relaxed font-medium flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Recommended for bundle cross-sell offer</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
