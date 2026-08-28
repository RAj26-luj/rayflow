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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Order, Payment } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';

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
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <CreditCard className="h-3.5 w-3.5" />
              Razorpay Settlement Ledger
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Payments & Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cryptographically verified test-mode transactions, signature validation traces, and failure diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-2xs font-medium">
              Gross Captured: <strong className="text-emerald-700 font-bold ml-1">{formatINR(totalCaptured)}</strong>
            </div>
            <button
              onClick={fetchOrders}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Customer, or RZP Order ID..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Transactions</option>
              <option value="PAID">Captured (Paid)</option>
              <option value="ATTEMPTED">Attempted / Failed</option>
              <option value="CREATED">Created (Open)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Order / Date</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Items & Bundle</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Razorpay Identifiers</th>
                  <th className="px-4 py-3.5">Status & Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <CreditCard className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <div className="font-semibold text-slate-700 text-xs">No Orders or Payment Records Found</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Test-mode orders created in the buyer shop will appear here with cryptographic HMAC verification traces.
                      </div>
                      <div className="mt-3">
                        <Link
                          href="/shop"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <span>Open Storefront to Test Checkout</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order Number & Timestamp */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 font-mono text-xs">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(ord.createdAt)}</div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-4 max-w-xs">
                      <div className="space-y-0.5">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="text-[11px] text-slate-800 flex items-center justify-between">
                            <span className="truncate">{item.productName} (x{item.quantity})</span>
                          </div>
                        ))}
                        {ord.isBundle && (
                          <span className="inline-block rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.2 text-[9px] font-bold border border-indigo-200">
                            AI Bundle (-{formatINR(ord.discountAmount)})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {formatINR(ord.totalAmount)}
                      </div>
                      {ord.discountAmount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Saved {formatINR(ord.discountAmount)}
                        </div>
                      )}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-4">
                      <span className="uppercase font-mono text-[11px] font-semibold text-slate-600">
                        {ord.paymentMethod || 'UPI / Card'}
                      </span>
                    </td>

                    {/* RZP IDs */}
                    <td className="px-4 py-4 font-mono text-[10px] text-slate-500 space-y-0.5">
                      <div><strong className="text-slate-700">Order:</strong> {ord.razorpayOrderId}</div>
                      {ord.razorpayPaymentId && (
                        <div><strong className="text-slate-700">Pay:</strong> {ord.razorpayPaymentId}</div>
                      )}
                    </td>

                    {/* Status & Verification */}
                    <td className="px-4 py-4">
                      {ord.status === 'PAID' && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Captured (Paid)
                          </span>
                          <div className="text-[10px] text-slate-400">HMAC Verified ✓</div>
                        </div>
                      )}

                      {ord.status === 'ATTEMPTED' && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            <AlertTriangle className="h-3 w-3" />
                            Attempted / Failed
                          </span>
                          {ord.failureReason && (
                            <div className="text-[10px] text-slate-500 line-clamp-1" title={ord.failureReason}>
                              {ord.failureReason}
                            </div>
                          )}
                        </div>
                      )}

                      {ord.status === 'CREATED' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                          <Clock className="h-3 w-3" />
                          Created (Pending)
                        </span>
                      )}
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
