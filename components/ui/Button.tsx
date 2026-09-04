'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cancel' | 'ghost' | 'danger' | 'success' | 'outline' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 active:bg-blue-700 border border-blue-500/30 font-semibold',
  secondary:
    'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 active:bg-slate-100 shadow-2xs font-semibold',
  outline:
    'bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700 active:bg-slate-800/80 shadow-2xs font-semibold',
  cancel:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 active:bg-slate-300 font-medium',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent active:bg-slate-200 font-medium',
  danger:
    'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/20 active:bg-red-700 border border-red-500/30 font-semibold',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:bg-emerald-700 border border-emerald-500/30 font-semibold',
  emerald:
    'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:bg-emerald-700 border border-emerald-500/30 font-semibold',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[36px] gap-1.5',
  md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl min-h-[44px] gap-2',
  lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl min-h-[48px] gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  leftIcon,
  rightIcon,
  icon,
  children,
  className,
  disabled,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  const isButtonLoading = isLoading || loading;
  const isDisabled = disabled || isButtonLoading;
  const effectiveLeftIcon = icon || leftIcon;

  return (
    <motion.button
      type={type}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      whileHover={isDisabled ? undefined : { y: -1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      disabled={isDisabled}
      onClick={onClick}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center select-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )
      )}
      {...(props as any)}
    >
      {isButtonLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {effectiveLeftIcon && <span className="flex-shrink-0">{effectiveLeftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}

export function ActionButton(props: ButtonProps) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button variant="secondary" {...props} />;
}

export function CancelButton(props: ButtonProps) {
  return <Button variant="cancel" {...props} />;
}

export function GhostButton(props: ButtonProps) {
  return <Button variant="ghost" {...props} />;
}

