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
          'relative overflow-hidden w-full bg-zinc-900/90 backdrop-blur-xl text-white rounded-2xl py-2.5 px-4 shadow-xl border border-zinc-800 select-none',
          className
        )
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-950/80 px-2.5 py-0.5 rounded-full border border-violet-800/60 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
          <span>Live Stream</span>
        </div>

        <div className="overflow-hidden flex-1">
          <div className="animate-marquee flex items-center gap-8 text-xs font-medium text-zinc-300">
            {/* Render items duplicated twice for seamless loop */}
            {[...items, ...items].map((item, idx) => {
              const badgeLabel = item.badge || item.tag;
              const itemId = item.id || `ticker-${idx}`;
              return (
                <div key={`${itemId}-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                  {badgeLabel && (
                    <span className="rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-0.5 text-[10px] font-bold">
                      {badgeLabel}
                    </span>
                  )}
                  <span>{item.text}</span>
                  {item.time && <span className="text-[10px] text-zinc-500 font-mono">({item.time})</span>}
                  <span className="text-zinc-700 ml-4">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
