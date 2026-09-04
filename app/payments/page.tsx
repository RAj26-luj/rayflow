'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Building2,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Order } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';

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
        {/* Header */}
        <SectionHeader
          title="Payments"
          description="Real-time transaction ledger, payment captures, and order payment statuses."
          badge={{ text: 'Payment Ledger', variant: 'emerald' }}
          action={
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-xs text-slate-700 shadow-2xs font-medium">
                Gross Captured: <strong className="text-emerald-600 font-extrabold font-mono ml-1">{formatINR(totalCaptured)}</strong>
              </div>
              <SecondaryButton
                size="sm"
                onClick={fetchOrders}
                isLoading={loading}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Refresh Ledger
              </SecondaryButton>
            </div>
          }
        />

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Customer, or RZP Order ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Transactions</option>
              <option value="PAID">Captured (Paid)</option>
              <option value="ATTEMPTED">Attempted / Failed</option>
              <option value="CREATED">Created (Open)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table Container */}
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {loading && orders.length === 0 ? (
            <LoadingState message="Loading payment transactions..." />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              title="No Payment Records Found"
              description="Orders placed in the storefront will appear here with Razorpay verification status and signature validation."
              action={{
                label: 'Test Checkout in Storefront',
                onClick: () => { window.location.href = '/shop'; },
              }}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Order / Date</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Items & Bundle</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Payment Method</th>
                      <th className="px-5 py-4">Razorpay Identifiers</th>
                      <th className="px-6 py-4">Status & Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Order Number & Timestamp */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 font-mono text-xs">{ord.orderNumber}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(ord.createdAt)}</div>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                        </td>

                        {/* Items */}
                        <td className="px-5 py-4 max-w-xs">
                          <div className="space-y-1">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] text-slate-800 flex items-center justify-between">
                                <span className="truncate">{item.productName} (x{item.quantity})</span>
                              </div>
                            ))}
                            {ord.isBundle && (
                              <span className="inline-block rounded-lg bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                                Bundle Discount (-{formatINR(ord.discountAmount)})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-slate-900 font-mono text-sm">
                            {formatINR(ord.totalAmount)}
                          </div>
                          {ord.discountAmount > 0 && (
                            <div className="text-[10px] text-emerald-600 font-bold font-mono">
                              Saved {formatINR(ord.discountAmount)}
                            </div>
                          )}
                        </td>

                        {/* Method */}
                        <td className="px-5 py-4">
                          <span className="uppercase font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {ord.paymentMethod || 'UPI / Card'}
                          </span>
                        </td>

                        {/* RZP IDs */}
                        <td className="px-5 py-4 font-mono text-[10px] text-slate-500 space-y-1">
                          <div><strong className="text-slate-800">Order:</strong> {ord.razorpayOrderId}</div>
                          {ord.razorpayPaymentId && (
                            <div><strong className="text-slate-800">Pay:</strong> {ord.razorpayPaymentId}</div>
                          )}
                        </td>

                        {/* Status & Verification */}
                        <td className="px-6 py-4">
                          <StatusBadge status={ord.status} size="sm" />
                          {ord.status === 'PAID' && (
                            <div className="text-[10px] text-emerald-700 font-semibold mt-1">Verified ✓</div>
                          )}
                          {ord.status === 'ATTEMPTED' && ord.failureReason && (
                            <div className="text-[10px] text-red-600 mt-1 line-clamp-1" title={ord.failureReason}>
                              {ord.failureReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 font-mono text-xs">{ord.orderNumber}</div>
                        <div className="text-xs text-slate-500">{ord.customerName}</div>
                      </div>
                      <StatusBadge status={ord.status} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Total Paid</div>
                        <div className="font-extrabold text-slate-900 font-mono mt-0.5">{formatINR(ord.totalAmount)}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Method</div>
                        <div className="font-bold text-slate-700 font-mono mt-0.5">{ord.paymentMethod || 'UPI/Card'}</div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 truncate">
                      RZP: {ord.razorpayOrderId}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PageShell>
    </DashboardLayout>
  );
}

