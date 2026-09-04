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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={twMerge(
        clsx(
          'p-5 rounded-2xl transition-all',
          variant === 'elevated' &&
            'bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md',
          variant === 'flat' && 'bg-slate-50/80 border border-slate-100',
          variant === 'glass' &&
            'bg-white/80 backdrop-blur-md border border-white/60 shadow-lg shadow-slate-900/5',
          className
        )
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-3 flex-wrap">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
          {value}
        </div>

        {change && (
          <span
            className={clsx(
              'inline-flex items-center text-xs font-bold rounded-full px-2 py-0.5',
              changeType === 'positive' && 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
              changeType === 'negative' && 'bg-red-50 text-red-700 border border-red-200/60',
              changeType === 'neutral' && 'bg-slate-100 text-slate-700 border border-slate-200/60'
            )}
          >
            {changeType === 'positive' && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
            {changeType === 'negative' && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {changeType === 'neutral' && <Minus className="h-3 w-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {(displaySubtitle || trendText) && (
        <div className="mt-2 text-xs text-slate-500 leading-relaxed flex items-center justify-between">
          <span>{displaySubtitle}</span>
          {trendText && <span className="font-medium text-slate-600">{trendText}</span>}
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

