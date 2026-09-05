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
import { Button, OrderCard } from '@/components/ui';
import { formatINR, formatDate } from '@/lib/utils';
import { Order } from '@/lib/types';

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
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-violet-900 selection:text-white">
      <CustomerNavbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300 mb-1">
              <Package className="h-4 w-4 text-violet-400" />
              <span>Shopper Account</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              My Purchase History
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
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
          <div className="py-16 text-center text-xs text-zinc-400 animate-pulse">Loading purchase history...</div>
        ) : !session ? (
          <div className="text-center py-16 bg-zinc-900/80 rounded-3xl border border-zinc-800 p-8 space-y-3 shadow-xl backdrop-blur-xl">
            <p className="text-zinc-200 text-sm font-bold">Please sign in to view your orders.</p>
            <Link href="/customer/login">
              <Button variant="primary" size="sm">Sign In</Button>
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/80 rounded-3xl border border-zinc-800 p-8 space-y-3 shadow-xl backdrop-blur-xl">
            <p className="text-zinc-200 text-sm font-bold">No previous orders found.</p>
            <Link href="/shop">
              <Button variant="primary" size="sm">Shop Performance Gear</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <OrderCard key={ord.id} order={ord as unknown as Order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
