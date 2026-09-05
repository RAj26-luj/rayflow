'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Heart,
  ShoppingCart,
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
  const [isFavorite, setIsFavorite] = useState(false);
  const savingsPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={twMerge(
        clsx(
          'group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-3.5 sm:p-4 shadow-xl backdrop-blur-xl hover:border-violet-500/50 hover:shadow-violet-950/30 transition-all duration-300',
          className
        )
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-zinc-800/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Savings Badge */}
          {savingsPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-lg shadow-violet-950/60 uppercase tracking-wider">
              {savingsPercent}% OFF
            </span>
          )}

          {/* Heart / Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 backdrop-blur-md text-zinc-300 border border-zinc-700/60 transition-all hover:bg-zinc-800 hover:scale-110 active:scale-95"
            aria-label="Add to wishlist"
          >
            <Heart
              className={clsx(
                'h-4 w-4 transition-colors',
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-300 hover:text-rose-400'
              )}
            />
          </button>

          {/* Category Pill */}
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-zinc-900/90 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-semibold text-zinc-300 uppercase tracking-widest border border-zinc-700/60">
            {product.category}
          </span>
        </div>

        <div className="space-y-1.5 px-0.5">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">4.9</span>
            <span className="text-zinc-400 text-[11px]">(128)</span>
          </div>

          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-violet-300 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-800/80 mt-3 space-y-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300">
            {formatINR(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-zinc-500 line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SecondaryButton
            size="sm"
            onClick={() => onAddToCart(product)}
            leftIcon={<ShoppingCart className="h-3.5 w-3.5 text-zinc-300" />}
            className="w-full text-xs py-2 bg-zinc-800/90 hover:bg-zinc-700/90 text-white border-zinc-700/70"
          >
            Add
          </SecondaryButton>
          <ActionButton
            size="sm"
            onClick={() => onBuyNow(product)}
            className="w-full text-xs py-2"
          >
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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={twMerge(
        clsx(
          'p-4 sm:p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 shadow-xl backdrop-blur-xl hover:border-violet-500/40 transition-all space-y-3.5',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-950/80 text-violet-300 border border-violet-800/60 font-bold flex-shrink-0 shadow-inner">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">{opportunity.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{opportunity.subtitle}</p>
          </div>
        </div>

        <StatusBadge status={opportunity.status} size="sm" />
      </div>

      <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
        <strong className="text-violet-300">Why it matters: </strong>
        <span>{opportunity.description}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Estimated Revenue</div>
          <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
            {formatINR(opportunity.expectedRevenue)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Audience</div>
          <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-zinc-400" />
            <span>{opportunity.affectedCustomersCount} customers</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Confidence</div>
          <div className="text-xs font-bold text-violet-300 mt-0.5">
            {opportunity.confidence}% probability
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-zinc-300">
          <span className="font-semibold text-white">Recommended: </span>
          <span>{opportunity.recommendedAction}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          {onDismiss && (
            <SecondaryButton size="sm" onClick={() => onDismiss(opportunity.id)} className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white">
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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={twMerge(
        clsx(
          'p-4 sm:p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 shadow-xl backdrop-blur-xl hover:border-violet-500/40 space-y-3.5',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base">{campaign.name}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Target: <strong className="text-zinc-200">{campaign.targetCohort}</strong> • Offer: <strong className="text-violet-300">{campaign.discountPercent}% off</strong>
          </p>
        </div>
        <StatusBadge status={campaign.status} size="sm" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-400">Target Audience</div>
          <div className="text-xs font-bold text-white mt-0.5">
            {campaign.estimatedAudience.toLocaleString()} shoppers
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-400">Expected Revenue</div>
          <div className="text-xs font-bold text-emerald-400 mt-0.5">
            {formatINR(campaign.expectedRevenue)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-400">Budget Cap</div>
          <div className="text-xs font-bold text-white mt-0.5">
            {formatINR(campaign.maxBudget)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-400">Orders Converted</div>
          <div className="text-xs font-bold text-violet-300 mt-0.5">
            {campaign.convertedOrders} orders
          </div>
        </div>
      </div>

      {campaign.aiReasoning && (
        <div className="rounded-xl bg-violet-950/50 border border-violet-800/50 p-3 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-violet-300 font-semibold">Audience Insight: </strong>
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
          'p-4 sm:p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 shadow-xl backdrop-blur-xl hover:border-violet-500/40 transition-all space-y-3.5',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/80 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-white">{order.orderNumber}</span>
            <StatusBadge status={order.status} size="sm" />
            {order.isBundle && (
              <span className="rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/60 px-2.5 py-0.5 text-[10px] font-bold">
                Bundle Discount
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </span>
            <span>•</span>
            <span>Razorpay: {order.razorpayOrderId}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-extrabold text-white">
            {formatINR(order.totalAmount)}
          </div>
          {order.discountAmount > 0 && (
            <div className="text-xs font-semibold text-emerald-400">
              Saved {formatINR(order.discountAmount)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-zinc-300">
            <span>{item.productName} (×{item.quantity})</span>
            <span className="font-semibold text-white">
              {formatINR(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
