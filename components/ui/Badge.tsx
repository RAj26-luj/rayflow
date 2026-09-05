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
  brand: 'bg-violet-950/80 text-violet-300 border-violet-800/60 shadow-sm shadow-violet-950/50',
  blue: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  indigo: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
  emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  rose: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
  amber: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  slate: 'bg-zinc-900/80 text-zinc-400 border-zinc-800',
  purple: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
};

const dotColors: Record<NonNullable<BadgeProps['variant']>, string> = {
  brand: 'bg-violet-400 shadow-sm shadow-violet-400',
  blue: 'bg-amber-400',
  indigo: 'bg-zinc-400',
  emerald: 'bg-emerald-400 shadow-sm shadow-emerald-400',
  rose: 'bg-rose-400',
  amber: 'bg-amber-400',
  slate: 'bg-zinc-500',
  purple: 'bg-purple-400 shadow-sm shadow-purple-400',
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
          'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all select-none backdrop-blur-md',
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

  let style = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
  let defaultPulse = false;

  if (['PAID', 'CAPTURED', 'SUCCESS', 'ACTIVE', 'VERIFIED'].includes(norm)) {
    style = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60 font-medium shadow-xs shadow-emerald-950/40';
    defaultPulse = norm === 'ACTIVE';
  } else if (['PENDING', 'NEEDS_APPROVAL', 'ATTEMPTED', 'RECOMMENDED'].includes(norm)) {
    style = 'bg-amber-950/80 text-amber-300 border-amber-800/60 font-medium shadow-xs shadow-amber-950/40';
    defaultPulse = norm === 'PENDING';
  } else if (['FAILED', 'DECLINED', 'BLOCKED'].includes(norm)) {
    style = 'bg-rose-950/80 text-rose-300 border-rose-800/60 font-medium shadow-xs shadow-rose-950/40';
  } else if (['DEMO', 'TEST_MODE', 'TEST'].includes(norm)) {
    style = 'bg-violet-950/80 text-violet-300 border-violet-800/60 font-medium shadow-xs shadow-violet-950/40';
  }

  const shouldPulse = pulse !== undefined ? pulse : defaultPulse;
  const humanizedLabels: Record<string, string> = {
    NEEDS_APPROVAL: 'Needs approval',
    AUTO_APPROVED: 'Approved',
    BLOCKED_BY_POLICY: 'Blocked',
    EXECUTED: 'Completed',
    ATTEMPTED: 'Pending',
    RECOMMENDED: 'Suggested',
  };
  const displayText = label || humanizedLabels[norm] || status?.replace(/_/g, ' ');

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border transition-all select-none font-medium backdrop-blur-md',
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
              ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
              : norm.includes('PENDING') || norm.includes('NEEDS')
              ? 'bg-amber-400 shadow-sm shadow-amber-400'
              : 'bg-violet-400 shadow-sm shadow-violet-400'
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
          'inline-flex items-center rounded-full bg-zinc-900/90 border border-zinc-700/80 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider backdrop-blur-md',
          className
        )
      )}
    >
      {category}
    </span>
  );
}
