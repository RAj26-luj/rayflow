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
            <div className="flex items-center gap-2">
              <div className="rounded border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">
                Gross Captured: <strong className="text-emerald-800">{formatINR(totalCaptured)}</strong>
              </div>
              <SecondaryButton
                size="sm"
                onClick={fetchOrders}
                isLoading={loading}
                leftIcon={<RefreshCw className="h-3.5 w-3.5 text-stone-500" />}
              >
                Refresh
              </SecondaryButton>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order #, Customer, or RZP ID..."
              className="w-full rounded border border-stone-300 bg-white pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-500"
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
          <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 space-y-2">
            <p className="text-stone-600 text-sm font-semibold">No payments match your search.</p>
            <SecondaryButton size="sm" onClick={() => { setSearch(''); setStatusFilter('ALL'); }}>
              Reset Filters
            </SecondaryButton>
          </div>
        ) : (
          <div className="rounded border border-stone-200 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Order & Date</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Razorpay Order ID</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{ord.orderNumber}</div>
                        <div className="text-[10px] text-stone-400">{formatDate(ord.createdAt)}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-stone-900">{ord.customerName}</div>
                        <div className="text-[11px] text-stone-400">{ord.customerEmail}</div>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {ord.items.map((i) => i.productName).join(', ')}
                        {ord.isBundle && (
                          <span className="ml-1 rounded bg-brand-50 text-brand-800 text-[10px] font-bold px-1.5 py-0.5">
                            Bundle
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">{formatINR(ord.totalAmount)}</td>
                      <td className="p-3.5 text-stone-500">{ord.razorpayOrderId}</td>
                      <td className="p-3.5">
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
