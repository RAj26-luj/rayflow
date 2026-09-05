'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  variant?: 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'purple' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  brand: 'bg-brand-50 text-brand-800 border-brand-200',
  blue: 'bg-amber-50 text-amber-900 border-amber-200',
  indigo: 'bg-stone-100 text-stone-800 border-stone-300',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200',
  amber: 'bg-amber-50 text-amber-900 border-amber-200',
  slate: 'bg-stone-100 text-stone-700 border-stone-200',
  purple: 'bg-stone-100 text-stone-800 border-stone-200',
};

const dotColors: Record<NonNullable<BadgeProps['variant']>, string> = {
  brand: 'bg-brand-600',
  blue: 'bg-amber-600',
  indigo: 'bg-stone-600',
  emerald: 'bg-emerald-600',
  rose: 'bg-rose-600',
  amber: 'bg-amber-600',
  slate: 'bg-stone-400',
  purple: 'bg-stone-600',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-xs sm:text-sm',
};

export function Badge({
  variant = 'brand',
  size = 'sm',
  dot = false,
  pulse = false,
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-md border font-semibold transition-colors select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {(dot || pulse) && (
        <span
          className={clsx(
            'rounded-full flex-shrink-0',
            pulse && 'animate-pulse',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            dotColors[variant]
          )}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </span>
  );
}

export interface StatusBadgeProps {
  status:
    | 'PAID'
    | 'CAPTURED'
    | 'SUCCESS'
    | 'ACTIVE'
    | 'PENDING'
    | 'ATTEMPTED'
    | 'FAILED'
    | 'DECLINED'
    | 'BLOCKED'
    | 'RECOMMENDED'
    | 'NEEDS_APPROVAL'
    | 'VERIFIED'
    | 'DEMO'
    | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
  label?: string;
  icon?: React.ReactNode;
}

export function StatusBadge({
  status,
  size = 'md',
  pulse,
  className,
  label,
  icon,
}: StatusBadgeProps) {
  const norm = status?.toUpperCase() || '';

  let style = 'bg-stone-100 text-stone-700 border-stone-200';
  let defaultPulse = false;

  if (['PAID', 'CAPTURED', 'SUCCESS', 'ACTIVE', 'VERIFIED'].includes(norm)) {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
    defaultPulse = norm === 'ACTIVE';
  } else if (['PENDING', 'NEEDS_APPROVAL', 'ATTEMPTED', 'RECOMMENDED'].includes(norm)) {
    style = 'bg-amber-50 text-amber-900 border-amber-200 font-semibold';
    defaultPulse = norm === 'PENDING';
  } else if (['FAILED', 'DECLINED', 'BLOCKED'].includes(norm)) {
    style = 'bg-red-50 text-red-800 border-red-200 font-semibold';
  } else if (['DEMO', 'TEST_MODE', 'TEST'].includes(norm)) {
    style = 'bg-brand-50 text-brand-800 border-brand-200 font-semibold';
  }

  const shouldPulse = pulse !== undefined ? pulse : defaultPulse;
  const displayText = label || status?.replace(/_/g, ' ');

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-md border transition-colors select-none font-medium',
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
          style,
          className
        )
      )}
    >
      {shouldPulse && (
        <span
          className={clsx(
            'rounded-full animate-pulse flex-shrink-0',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            norm.includes('SUCCESS') || norm.includes('ACTIVE') || norm.includes('PAID')
              ? 'bg-emerald-600'
              : norm.includes('PENDING') || norm.includes('NEEDS')
              ? 'bg-amber-600'
              : 'bg-brand-600'
          )}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="capitalize">{displayText}</span>
    </span>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-sm bg-stone-900 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider',
          className
        )
      )}
    >
      {category}
    </span>
  );
}
