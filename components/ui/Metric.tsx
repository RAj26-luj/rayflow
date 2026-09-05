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
          'p-4 sm:p-5 rounded-xl transition-all',
          variant === 'elevated' &&
            'bg-white border border-stone-200 shadow-2xs hover:border-stone-300 hover:shadow-xs',
          variant === 'flat' && 'bg-stone-50 border border-stone-200',
          variant === 'glass' &&
            'bg-white/90 backdrop-blur-sm border border-stone-200 shadow-sm',
          className
        )
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-1.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2.5 flex-wrap">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
          {value}
        </div>

        {change && (
          <span
            className={clsx(
              'inline-flex items-center text-xs font-bold rounded-md px-2 py-0.5',
              changeType === 'positive' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
              changeType === 'negative' && 'bg-red-50 text-red-800 border border-red-200',
              changeType === 'neutral' && 'bg-stone-100 text-stone-700 border border-stone-200'
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
        <div className="mt-2 text-xs text-stone-500 leading-relaxed flex items-center justify-between">
          <span>{displaySubtitle}</span>
          {trendText && <span className="font-medium text-stone-600">{trendText}</span>}
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
