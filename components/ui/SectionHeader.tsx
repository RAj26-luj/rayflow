'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Badge, type BadgeProps } from './Badge';

export interface SectionHeaderProps {
  badge?: React.ReactNode | string | { text: string; variant?: BadgeProps['variant'] };
  badgeIcon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  badge,
  badgeIcon,
  title,
  description,
  actions,
  action,
  className,
}: SectionHeaderProps) {
  const effectiveActions = actions || action;

  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2',
          className
        )
      )}
    >
      <div className="space-y-1.5">
        {badge && (
          typeof badge === 'string' ? (
            <Badge variant="brand" icon={badgeIcon}>
              {badge}
            </Badge>
          ) : typeof badge === 'object' && badge !== null && 'text' in badge ? (
            <Badge variant={(badge as { variant?: BadgeProps['variant'] }).variant || 'brand'} icon={badgeIcon}>
              {(badge as { text: string }).text}
            </Badge>
          ) : (
            <div>{badge as React.ReactNode}</div>
          )
        )}
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {effectiveActions && (
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {effectiveActions}
        </div>
      )}
    </div>
  );
}

export function PageShell({
  header,
  children,
  className,
}: {
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge(clsx('space-y-6 max-w-7xl mx-auto w-full px-0.5', className))}>
      {header && <div>{header}</div>}
      {children}
    </div>
  );
}
