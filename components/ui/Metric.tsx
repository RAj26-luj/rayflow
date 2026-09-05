'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface MetricProps {
  label: string;
  value: string | number;
  change?: string | number;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'glass';
  className?: string;
  trendText?: string;
}

export function Metric({
  label,
  value,
  change,
  changeType = 'positive',
  subtitle,
  subtext,
  icon,
  variant = 'elevated',
  className,
  trendText,
}: MetricProps) {
  const displaySubtitle = subtext || subtitle;

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={twMerge(
        clsx(
          'p-4 sm:p-5 rounded-2xl transition-all backdrop-blur-xl',
          variant === 'elevated' &&
            'bg-zinc-900/80 border border-zinc-800/80 shadow-md shadow-black/40 hover:border-violet-500/40 hover:shadow-violet-950/20',
          variant === 'flat' && 'bg-zinc-900/60 border border-zinc-800/60',
          variant === 'glass' &&
            'bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 shadow-lg shadow-black/40',
          className
        )
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-zinc-800/70 text-violet-400 border border-zinc-700/60 flex-shrink-0 shadow-inner">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {value}
        </div>

        {change && (
          <span
            className={clsx(
              'inline-flex items-center text-xs font-bold rounded-full px-2.5 py-0.5 border backdrop-blur-md',
              changeType === 'positive' && 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
              changeType === 'negative' && 'bg-rose-950/80 text-rose-400 border-rose-800/60',
              changeType === 'neutral' && 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60'
            )}
          >
            {changeType === 'positive' && <ArrowUpRight className="h-3 w-3 mr-0.5 text-emerald-400" />}
            {changeType === 'negative' && <ArrowDownRight className="h-3 w-3 mr-0.5 text-rose-400" />}
            {changeType === 'neutral' && <Minus className="h-3 w-3 mr-0.5 text-zinc-400" />}
            {change}
          </span>
        )}
      </div>

      {(displaySubtitle || trendText) && (
        <div className="mt-2.5 text-xs text-zinc-400 leading-relaxed flex items-center justify-between">
          <span>{displaySubtitle}</span>
          {trendText && <span className="font-semibold text-violet-300">{trendText}</span>}
        </div>
      )}
    </motion.div>
  );
}

export function MetricGroup({
  children,
  cols = 4,
  className,
}: {
  children: React.ReactNode;
  cols?: number;
  className?: string;
}) {
  const colClass =
    cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : cols === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div
      className={twMerge(
        clsx('grid gap-3 sm:gap-4', colClass, className)
      )}
    >
      {children}
    </div>
  );
}
