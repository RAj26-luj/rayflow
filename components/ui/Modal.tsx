'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ActionButton, CancelButton } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWMap: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const resolvedMaxW = maxWMap[maxWidth] || maxWidth;
  const displaySubtitle = description || subtitle;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={twMerge(
              clsx(
                'relative w-full rounded-3xl border border-zinc-800/90 bg-zinc-900/95 p-5 sm:p-7 shadow-2xl z-10 space-y-4 my-auto max-h-[90vh] overflow-y-auto backdrop-blur-2xl text-white',
                resolvedMaxW,
                className
              )
            )}
          >
            {(title || displaySubtitle) && (
              <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
                <div>
                  {title && (
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {title}
                    </h3>
                  )}
                  {displaySubtitle && (
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{displaySubtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors focus:outline-none"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div>{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const widthMap = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={twMerge(
              clsx(
                'relative z-10 w-full bg-zinc-900/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-zinc-800 text-white',
                widthMap[width],
                className
              )
            )}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-zinc-800/80 flex items-start justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-xl z-10">
              <div>
                {title && (
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors focus:outline-none"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0',
              isDestructive
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                : 'bg-violet-950/80 text-violet-300 border border-violet-800/60'
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
          <CancelButton size="sm" onClick={onClose} disabled={isLoading} className="bg-zinc-800 border-zinc-700 text-zinc-300">
            {cancelLabel}
          </CancelButton>
          <ActionButton
            size="sm"
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
