'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product, RevenueOpportunity, Campaign, Order } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { StatusBadge } from './Badge';
import { ActionButton, SecondaryButton } from './Button';

// 1. 3D Modern Product Card for Marketplace
export function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  className,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  className?: string;
}) {
  const savingsPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={twMerge(
        clsx(
          'group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-blue-400/60 hover:shadow-xl transition-all',
          className
        )
      )}
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {savingsPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              {savingsPercent}% OFF
            </span>
          )}
          <span className="absolute top-2.5 right-2.5 rounded-lg bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[9px] font-semibold text-white uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Product Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-500 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-900">4.9</span>
            <span className="text-slate-400 text-[11px]">(128 reviews)</span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3.5 border-t border-slate-100 mt-3.5 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-slate-900 font-mono">
            {formatINR(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-slate-400 line-through font-mono">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SecondaryButton
            size="sm"
            onClick={() => onAddToCart(product)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add
          </SecondaryButton>
          <ActionButton size="sm" onClick={() => onBuyNow(product)}>
            Buy Now
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
}

// 2. Business Opportunity Card
export function OpportunityCard({
  opportunity,
  onReview,
  onDismiss,
  className,
}: {
  opportunity: RevenueOpportunity;
  onReview: (opp: RevenueOpportunity) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={twMerge(
        clsx(
          'p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:border-blue-300 hover:shadow-lg transition-all space-y-4',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 font-bold flex-shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{opportunity.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{opportunity.subtitle}</p>
          </div>
        </div>

        <StatusBadge status={opportunity.status} size="sm" />
      </div>

      <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        <strong className="text-slate-800">Why it matters: </strong>
        <span>{opportunity.description}</span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Estimated Revenue</div>
          <div className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono mt-0.5">
            {formatINR(opportunity.expectedRevenue)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Audience</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>{opportunity.affectedCustomersCount} customers</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Confidence</div>
          <div className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">
            {opportunity.confidence}% probability
          </div>
        </div>
      </div>

      {/* Recommended Action & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Recommended: </span>
          <span>{opportunity.recommendedAction}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          {onDismiss && (
            <SecondaryButton size="sm" onClick={() => onDismiss(opportunity.id)}>
              Dismiss
            </SecondaryButton>
          )}
          <ActionButton size="sm" onClick={() => onReview(opportunity)} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Review
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
}

// 3. Campaign Card
export function CampaignCard({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={twMerge(
        clsx(
          'p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 space-y-4',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">{campaign.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort: <strong>{campaign.targetCohort}</strong> • Offer: <strong>{campaign.discountPercent}% off</strong>
          </p>
        </div>
        <StatusBadge status={campaign.status} size="sm" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400">Target Audience</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
            {campaign.estimatedAudience.toLocaleString()} shoppers
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400">Expected Revenue</div>
          <div className="text-xs sm:text-sm font-bold text-emerald-600 font-mono mt-0.5">
            {formatINR(campaign.expectedRevenue)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400">Budget Cap</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-0.5">
            {formatINR(campaign.maxBudget)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400">Orders Converted</div>
          <div className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">
            {campaign.convertedOrders} orders
          </div>
        </div>
      </div>

      {campaign.aiReasoning && (
        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-blue-900 font-semibold">Audience Insight: </strong>
            <span>&quot;{campaign.aiReasoning}&quot;</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// 4. Order Card
export function OrderCard({
  order,
  className,
}: {
  order: Order;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        clsx(
          'p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-all space-y-4',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-900 font-mono">{order.orderNumber}</span>
            <StatusBadge status={order.status} size="sm" />
            {order.isBundle && (
              <span className="rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold">
                Bundle Discount
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </span>
            <span>•</span>
            <span>Razorpay: {order.razorpayOrderId}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-extrabold text-slate-900 font-mono">
            {formatINR(order.totalAmount)}
          </div>
          {order.discountAmount > 0 && (
            <div className="text-xs font-semibold text-emerald-600 font-mono">
              Saved {formatINR(order.discountAmount)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-slate-700">
            <span>{item.productName} (×{item.quantity})</span>
            <span className="font-semibold text-slate-900 font-mono">
              {formatINR(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
