'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product, RevenueOpportunity, Campaign, Order } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { StatusBadge } from './Badge';
import { ActionButton, SecondaryButton } from './Button';

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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={twMerge(
        clsx(
          'group relative flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-2xs hover:border-brand-500/60 hover:shadow-md transition-all',
          className
        )
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-stone-100 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
          {savingsPercent > 0 && (
            <span className="absolute top-2 left-2 rounded bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
              {savingsPercent}% OFF
            </span>
          )}
          <span className="absolute top-2 right-2 rounded bg-stone-900/80 backdrop-blur px-2 py-0.5 text-[9px] font-semibold text-white uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-amber-600 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-bold text-stone-900">4.9</span>
            <span className="text-stone-400 text-[11px]">(128 reviews)</span>
          </div>

          <h3 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-brand-700 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 mt-3 space-y-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-extrabold text-stone-900">
            {formatINR(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-stone-400 line-through">
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
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={twMerge(
        clsx(
          'p-4 sm:p-5 rounded-xl border border-stone-200 bg-white shadow-2xs hover:border-stone-300 hover:shadow-md transition-all space-y-3',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 border border-brand-200 font-bold flex-shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">{opportunity.title}</h3>
            <p className="text-xs text-stone-500 mt-0.5">{opportunity.subtitle}</p>
          </div>
        </div>

        <StatusBadge status={opportunity.status} size="sm" />
      </div>

      <div className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
        <strong className="text-stone-800">Why it matters: </strong>
        <span>{opportunity.description}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <div className="text-[10px] uppercase font-semibold text-stone-400">Estimated Revenue</div>
          <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
            {formatINR(opportunity.expectedRevenue)}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <div className="text-[10px] uppercase font-semibold text-stone-400">Audience</div>
          <div className="text-xs font-bold text-stone-900 mt-0.5 flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-stone-400" />
            <span>{opportunity.affectedCustomersCount} customers</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-stone-50 border border-stone-100">
          <div className="text-[10px] uppercase font-semibold text-stone-400">Confidence</div>
          <div className="text-xs font-bold text-brand-700 mt-0.5">
            {opportunity.confidence}% probability
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-stone-700">
          <span className="font-semibold text-stone-900">Recommended: </span>
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

export function CampaignCard({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={twMerge(
        clsx(
          'p-4 sm:p-5 rounded-xl border border-stone-200 bg-white shadow-2xs hover:border-stone-300 space-y-3',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <h3 className="font-bold text-stone-900 text-sm sm:text-base">{campaign.name}</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Target: <strong>{campaign.targetCohort}</strong> • Offer: <strong>{campaign.discountPercent}% off</strong>
          </p>
        </div>
        <StatusBadge status={campaign.status} size="sm" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <div className="text-[10px] text-stone-400">Target Audience</div>
          <div className="text-xs font-bold text-stone-900 mt-0.5">
            {campaign.estimatedAudience.toLocaleString()} shoppers
          </div>
        </div>
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <div className="text-[10px] text-stone-400">Expected Revenue</div>
          <div className="text-xs font-bold text-emerald-700 mt-0.5">
            {formatINR(campaign.expectedRevenue)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <div className="text-[10px] text-stone-400">Budget Cap</div>
          <div className="text-xs font-bold text-stone-900 mt-0.5">
            {formatINR(campaign.maxBudget)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <div className="text-[10px] text-stone-400">Orders Converted</div>
          <div className="text-xs font-bold text-brand-700 mt-0.5">
            {campaign.convertedOrders} orders
          </div>
        </div>
      </div>

      {campaign.aiReasoning && (
        <div className="rounded-lg bg-brand-50/60 border border-brand-100 p-2.5 text-xs text-stone-700 leading-relaxed flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-brand-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brand-900 font-semibold">Audience Insight: </strong>
            <span>&quot;{campaign.aiReasoning}&quot;</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

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
          'p-4 sm:p-5 rounded-xl border border-stone-200 bg-white shadow-2xs hover:border-stone-300 transition-all space-y-3',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-stone-900">{order.orderNumber}</span>
            <StatusBadge status={order.status} size="sm" />
            {order.isBundle && (
              <span className="rounded bg-brand-50 text-brand-800 border border-brand-200 px-2 py-0.5 text-[10px] font-bold">
                Bundle Discount
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </span>
            <span>•</span>
            <span>Razorpay: {order.razorpayOrderId}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-extrabold text-stone-900">
            {formatINR(order.totalAmount)}
          </div>
          {order.discountAmount > 0 && (
            <div className="text-xs font-semibold text-emerald-700">
              Saved {formatINR(order.discountAmount)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1 text-xs">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-stone-700">
            <span>{item.productName} (×{item.quantity})</span>
            <span className="font-semibold text-stone-900">
              {formatINR(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
