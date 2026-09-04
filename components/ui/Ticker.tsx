'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ActivityTickerItem {
  id?: string;
  text: string;
  badge?: string;
  tag?: string;
  variant?: string;
  time?: string;
  highlight?: boolean;
}

export function ActivityTicker({
  items,
  className,
}: {
  items: ActivityTickerItem[];
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative overflow-hidden w-full bg-slate-900 text-white rounded-2xl py-2.5 px-4 shadow-sm border border-slate-800 select-none',
          className
        )
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
          <span>Live Store Stream</span>
        </div>

        <div className="overflow-hidden flex-1">
          <div className="animate-marquee flex items-center gap-8 text-xs font-medium text-slate-300">
            {/* Render items duplicated twice for seamless loop */}
            {[...items, ...items].map((item, idx) => {
              const badgeLabel = item.badge || item.tag;
              const itemId = item.id || `ticker-${idx}`;
              return (
                <div key={`${itemId}-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                  {badgeLabel && (
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      {badgeLabel}
                    </span>
                  )}
                  <span>{item.text}</span>
                  {item.time && <span className="text-[10px] text-slate-500 font-mono">({item.time})</span>}
                  <span className="text-slate-600 ml-4">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

