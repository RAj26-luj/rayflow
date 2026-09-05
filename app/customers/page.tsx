'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Customer } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/Feedback';

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
    ? Math.round(customers.reduce((sum, c) => sum + (c.intentScore || 0), 0) / customers.length)
    : 0;

  return (
    <DashboardLayout>
      <PageShell>
        <SectionHeader
          title="Customers"
          description="View customer segments, purchasing metrics, and high-value cohorts."
          badge="Customer Directory"
          badgeIcon={<Users className="h-3.5 w-3.5" />}
          actions={
            <div className="flex items-center gap-2.5">
              <div className="rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs text-zinc-300 backdrop-blur-md">
                Average Score: <strong className="text-violet-300 font-mono">{avgIntent}/100</strong>
              </div>
              <ActionButton size="sm" onClick={() => setIsAddModalOpen(true)} icon={<Plus className="h-3.5 w-3.5" />}>
                Add Customer
              </ActionButton>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or cohort..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'Marathoners', 'Fitness', 'Weekend', 'VIP'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCohort(c)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCohort === c
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-950/50'
                    : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {c === 'ALL' ? 'All Cohorts' : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading customer directory..." />
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/80 rounded-3xl border border-zinc-800 p-8 space-y-3 shadow-xl backdrop-blur-xl">
            <p className="text-zinc-300 text-sm font-semibold">No customers match your search.</p>
            <SecondaryButton size="sm" onClick={() => { setSearchQuery(''); setSelectedCohort('ALL'); }} className="bg-zinc-800 border-zinc-700 text-zinc-300">
              Reset Filters
            </SecondaryButton>
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 shadow-xl backdrop-blur-xl overflow-hidden text-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800/80 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Cohort</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4">Engagement Score</th>
                    <th className="p-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        <div>{c.name}</div>
                        <div className="text-[11px] text-zinc-400 font-normal">{c.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-violet-950/80 border border-violet-800/60 px-2.5 py-0.5 text-[10px] font-bold text-violet-300">
                          {c.cohort}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white font-mono">{formatINR(c.lifetimeValue || 0)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-600 to-pink-600 rounded-full"
                              style={{ width: `${c.intentScore || 50}%` }}
                            />
                          </div>
                          <span className="font-bold text-white font-mono">{c.intentScore || 50}/100</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-400 font-mono">{formatDate(c.lastPurchaseDate || new Date().toISOString())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageShell>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Customer Record">
        <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Sharma"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@example.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <SecondaryButton size="sm" onClick={() => setIsAddModalOpen(false)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
              Cancel
            </SecondaryButton>
            <ActionButton type="submit" size="sm">
              Save Customer
            </ActionButton>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
