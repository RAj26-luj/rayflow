'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Package,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  Tag,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CustomerNavbar } from '@/components/layout/CustomerNavbar';
import { Badge, Button, EmptyState } from '@/components/ui';
import { formatINR } from '@/lib/utils';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  totalAmount: number;
  discountAmount: number;
  isBundle: boolean;
  bundleSavings: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (authStatus === 'loading') return;
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/customer/orders');
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [session, authStatus]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <CustomerNavbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <Package className="h-4 w-4" />
              <span>Shopper Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              My Purchase History
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Track your orders, review bundle savings, and view Razorpay payment receipts.
            </p>
          </div>

          <Link href="/shop">
            <Button variant="primary" size="sm" icon={<ShoppingBag className="h-4 w-4" />}>
              Explore Store
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-xs text-slate-500">Loading your purchase history...</p>
            </div>
          </div>
        ) : !session ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs space-y-4">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Sign in to view your orders</h2>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Please sign in with your customer account to view your past orders, receipts, and bundle discounts.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/customer/login">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" size="sm">
                  Browse Catalogue
                </Button>
              </Link>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* New Customer / Empty State Onboarding Experience */
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-8 sm:p-12 text-center shadow-2xs space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome to RAYFLOW
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 max-w-md mx-auto">
                Get started with conversational product discovery and verified bundle discounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                  1
                </div>
                <h3 className="text-xs font-bold text-slate-900">Explore Gear</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Browse high-performance sports and fitness equipment.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                  2
                </div>
                <h3 className="text-xs font-bold text-slate-900">Ask Shopping Assistant</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Get personalized gear recommendations and custom bundle savings.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
                  3
                </div>
                <h3 className="text-xs font-bold text-slate-900">Instant Razorpay Checkout</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Pay securely with Razorpay Test Mode and receive instant verified receipts.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/shop">
                <Button variant="primary" size="lg" icon={<ShoppingBag className="h-4 w-4" />}>
                  Explore Products Now
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        #{order.orderNumber}
                      </span>
                      <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="h-3 w-3" />}>
                        {order.status}
                      </Badge>
                      {order.isBundle && (
                        <Badge variant="indigo" size="sm" icon={<Tag className="h-3 w-3" />}>
                          Curated Bundle
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>Razorpay: {order.razorpayOrderId}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-base font-extrabold text-slate-900">
                      {formatINR(order.totalAmount)}
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="text-[11px] font-semibold text-emerald-600">
                        Saved {formatINR(order.discountAmount)} (Bundle Deal)
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Ordered Items:
                  </div>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {item.productName}
                        </span>
                        <span className="text-slate-400">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-700">
                        {formatINR(item.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

