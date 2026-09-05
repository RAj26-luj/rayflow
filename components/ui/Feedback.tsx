'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ActionButton, SecondaryButton } from './Button';

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode | { label: string; onClick: () => void };
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-8 sm:p-12 text-center shadow-xl backdrop-blur-xl flex flex-col items-center justify-center max-w-lg mx-auto text-white',
          className
        )
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/90 text-violet-300 mb-4 shadow-inner border border-zinc-700/60">
          {icon}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {React.isValidElement(action) ? (
            action
          ) : typeof action === 'object' && 'label' in action && 'onClick' in action ? (
            <ActionButton size="sm" onClick={(action as any).onClick}>
              {(action as any).label}
            </ActionButton>
          ) : null}
        </div>
      )}

      {!action && (actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && onAction && (
            <ActionButton size="sm" onClick={onAction}>
              {actionLabel}
            </ActionButton>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <SecondaryButton size="sm" onClick={onSecondaryAction} className="bg-zinc-800 border-zinc-700 text-zinc-300">
              {secondaryActionLabel}
            </SecondaryButton>
          )}
        </div>
      )}
    </div>
  );
}

export function LoadingState({
  message = 'Loading data...',
  rows = 3,
  className,
}: {
  message?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={twMerge(clsx('space-y-4 w-full', className))}>
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 pb-1">
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-400" />
        <span>{message}</span>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800/80 w-full"
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  onCancel,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl border border-rose-900/60 bg-rose-950/40 p-5 sm:p-6 text-left shadow-lg backdrop-blur-xl space-y-3',
          className
        )
      )}
    >
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-bold text-rose-200">{title}</h4>
          <p className="text-xs text-rose-300 leading-relaxed">{message}</p>
        </div>
      </div>

      {(onRetry || onCancel) && (
        <div className="flex items-center gap-2 pt-2 border-t border-rose-900/40">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-500 transition-colors"
            >
              Try Again
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-xl border border-rose-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-zinc-800 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-5 right-5 z-50 rounded-2xl bg-zinc-900/95 text-white px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-2xl flex items-center gap-2.5 border border-zinc-700/80"
      >
        {type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
        {type === 'error' && <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />}
        {type === 'info' && <Info className="h-4 w-4 text-violet-400 flex-shrink-0" />}
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
