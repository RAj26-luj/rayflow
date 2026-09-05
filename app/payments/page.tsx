'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Search,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Order } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { SecondaryButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Feedback';

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.razorpayOrderId.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  const totalCaptured = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <DashboardLayout>
      <PageShell>
        <SectionHeader
          title="Payments"
          description="Real-time transaction ledger, payment captures, and order statuses."
          badge="Payment Ledger"
          badgeIcon={<CreditCard className="h-3.5 w-3.5" />}
          actions={
            <div className="flex items-center gap-2.5">
              <div className="rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs text-zinc-300 backdrop-blur-md">
                Gross Captured: <strong className="text-emerald-400 font-mono">{formatINR(totalCaptured)}</strong>
              </div>
              <SecondaryButton
                size="sm"
                onClick={fetchOrders}
                isLoading={loading}
                leftIcon={<RefreshCw className="h-3.5 w-3.5 text-zinc-400" />}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
              >
                Refresh
              </SecondaryButton>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order #, Customer, or RZP ID..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Captured (Paid)</option>
              <option value="FAILED">Attempted / Failed</option>
              <option value="CREATED">Created (Open)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading payment transactions..." />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/80 rounded-3xl border border-zinc-800 p-8 space-y-3 shadow-xl backdrop-blur-xl text-white">
            <p className="text-zinc-300 text-sm font-semibold">No payments match your search.</p>
            <SecondaryButton size="sm" onClick={() => { setSearch(''); setStatusFilter('ALL'); }} className="bg-zinc-800 border-zinc-700 text-zinc-300">
              Reset Filters
            </SecondaryButton>
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 shadow-xl backdrop-blur-xl overflow-hidden text-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800/80 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Order & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Razorpay Order ID</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{ord.orderNumber}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{formatDate(ord.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{ord.customerName}</div>
                        <div className="text-[11px] text-zinc-400">{ord.customerEmail}</div>
                      </td>
                      <td className="p-4 text-zinc-300">
                        {ord.items.map((i) => i.productName).join(', ')}
                        {ord.isBundle && (
                          <span className="ml-1.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/60 text-[10px] font-bold px-2 py-0.5">
                            Bundle
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-white font-mono">{formatINR(ord.totalAmount)}</td>
                      <td className="p-4 text-zinc-400 font-mono">{ord.razorpayOrderId}</td>
                      <td className="p-4">
                        <StatusBadge status={ord.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageShell>
    </DashboardLayout>
  );
}
