'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';

export function PromoBanner({
  featuredProduct,
  onShopNow,
}: {
  featuredProduct?: Product;
  onShopNow?: (p?: Product) => void;
}) {
  const title = featuredProduct?.name || 'Velocity Carbon Running Shoes';
  const subtitle = featuredProduct?.description || 'Carbon-plated racing shoes engineered for speed and marathon performance.';
  const price = featuredProduct?.price || 4999;
  const compareAt = featuredProduct?.compareAtPrice || 5999;
  const image = featuredProduct?.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-950 border border-purple-900/40 p-6 sm:p-8 shadow-2xl">
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-pink-400">
            Featured Deal
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white line-clamp-2">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed max-w-md">
            {subtitle}
          </p>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-white">{formatINR(price)}</span>
            {compareAt > price && (
              <span className="text-xs text-zinc-500 line-through">{formatINR(compareAt)}</span>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onShopNow && onShopNow(featuredProduct)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition-opacity"
            >
              <span>Shop Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
        </div>
      </div>
    </div>
  );
}
