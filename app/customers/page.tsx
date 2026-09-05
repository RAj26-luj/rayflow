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
            <div className="flex items-center gap-2">
              <div className="rounded border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">
                Average Score: <strong className="text-brand-700">{avgIntent}/100</strong>
              </div>
              <ActionButton size="sm" onClick={() => setIsAddModalOpen(true)} icon={<Plus className="h-3.5 w-3.5" />}>
                Add Customer
              </ActionButton>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or cohort..."
              className="w-full rounded border border-stone-300 bg-white pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'Marathoners', 'Fitness', 'Weekend', 'VIP'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCohort(c)}
                className={`rounded px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCohort === c
                    ? 'bg-brand-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
          <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 space-y-2">
            <p className="text-stone-600 text-sm font-semibold">No customers match your search.</p>
            <SecondaryButton size="sm" onClick={() => { setSearchQuery(''); setSelectedCohort('ALL'); }}>
              Reset Filters
            </SecondaryButton>
          </div>
        ) : (
          <div className="rounded border border-stone-200 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Cohort</th>
                    <th className="p-3.5">Total Spent</th>
                    <th className="p-3.5">Engagement Score</th>
                    <th className="p-3.5">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3.5 font-semibold text-stone-900">
                        <div>{c.name}</div>
                        <div className="text-[11px] text-stone-400 font-normal">{c.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                          {c.cohort}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">{formatINR(c.lifetimeValue || 0)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-700 rounded-full"
                              style={{ width: `${c.intentScore || 50}%` }}
                            />
                          </div>
                          <span className="font-bold text-stone-900">{c.intentScore || 50}/100</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-500">{formatDate(c.lastPurchaseDate || new Date().toISOString())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageShell>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Customer Record">
        <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Sharma"
              className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@example.com"
              className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <SecondaryButton size="sm" onClick={() => setIsAddModalOpen(false)}>
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
