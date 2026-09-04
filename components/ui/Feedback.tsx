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
          'rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-lg mx-auto',
          className
        )
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
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
            <SecondaryButton size="sm" onClick={onSecondaryAction}>
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
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pb-1">
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
        <span>{message}</span>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-100 animate-pulse border border-slate-200/60 w-full"
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
          'rounded-2xl border border-red-200 bg-red-50/70 p-5 sm:p-6 text-left shadow-xs space-y-3',
          className
        )
      )}
    >
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-bold text-red-950">{title}</h4>
          <p className="text-xs text-red-800 leading-relaxed">{message}</p>
        </div>
      </div>

      {(onRetry || onCancel) && (
        <div className="flex items-center gap-2 pt-2 border-t border-red-200/60">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50 transition-colors"
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
        className="fixed bottom-5 right-5 z-50 rounded-2xl bg-slate-900/95 text-white px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur flex items-center gap-2.5 border border-slate-700"
      >
        {type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
        {type === 'error' && <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />}
        {type === 'info' && <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />}
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
