'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDate } from '@/lib/utils';

export interface ActivityItemProps {
  title: string;
  subtitle?: string;
  time: string | Date;
  status?: string;
  badge?: string;
  icon?: React.ReactNode;
  metadata?: string;
  onClick?: () => void;
  className?: string;
}

export function ActivityItem({
  title,
  subtitle,
  time,
  status,
  badge,
  icon,
  metadata,
  onClick,
  className,
}: ActivityItemProps) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'flex items-start gap-3.5 p-3.5 rounded-2xl transition-all',
          onClick ? 'hover:bg-zinc-800/60 cursor-pointer border border-transparent hover:border-zinc-700/60' : '',
          className
        )
      )}
    >
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800/90 text-violet-300 flex-shrink-0 mt-0.5 border border-zinc-700/60 shadow-inner">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-white text-xs truncate">{title}</h4>
          <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0">
            {typeof time === 'string' ? time : formatDate(time)}
          </span>
        </div>
        {subtitle && <p className="text-xs text-zinc-400 leading-relaxed">{subtitle}</p>}
        {metadata && (
          <div className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 p-1.5 rounded-lg border border-zinc-800 inline-block">
            {metadata}
          </div>
        )}
      </div>
    </div>
  );
}

export function Timeline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge(clsx('divide-y divide-zinc-800/60 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 p-2 shadow-xl backdrop-blur-xl text-white', className))}>
      {children}
    </div>
  );
}
