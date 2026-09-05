'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Package,
  ShoppingBag,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { CustomerNavbar } from '@/components/layout/CustomerNavbar';
import { Button } from '@/components/ui';
import { formatINR, formatDate } from '@/lib/utils';

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [session, authStatus]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      <CustomerNavbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 mb-1">
              <Package className="h-4 w-4" />
              <span>Shopper Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              My Purchase History
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Track your orders, review bundle savings, and view Razorpay receipts.
            </p>
          </div>

          <Link href="/shop">
            <Button variant="primary" size="sm" icon={<ShoppingBag className="h-4 w-4" />}>
              Explore Store
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-500">Loading purchase history...</div>
        ) : !session ? (
          <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 space-y-3">
            <p className="text-stone-700 text-sm font-semibold">Please sign in to view your orders.</p>
            <Link href="/customer/login">
              <Button variant="primary" size="sm">Sign In</Button>
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 space-y-3">
            <p className="text-stone-700 text-sm font-semibold">No previous orders found.</p>
            <Link href="/shop">
              <Button variant="primary" size="sm">Shop Performance Gear</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="rounded border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{ord.orderNumber}</span>
                      <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        {ord.status}
                      </span>
                      {ord.isBundle && (
                        <span className="rounded bg-brand-50 text-brand-800 border border-brand-200 px-2 py-0.5 text-[10px] font-bold">
                          Bundle Discount
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(ord.createdAt)}</span>
                      <span className="ml-2">Razorpay: {ord.razorpayOrderId}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-stone-900">{formatINR(ord.totalAmount)}</div>
                    {ord.discountAmount > 0 && (
                      <div className="text-xs text-emerald-800 font-semibold">Saved {formatINR(ord.discountAmount)}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-stone-700">
                      <span>{item.productName} (×{item.quantity})</span>
                      <span className="font-semibold text-stone-900">{formatINR(item.unitPrice * item.quantity)}</span>
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
