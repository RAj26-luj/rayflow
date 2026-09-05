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
    'bg-brand-700 text-white hover:bg-brand-800 shadow-sm active:bg-brand-900 border border-brand-800/40 font-semibold',
  secondary:
    'bg-white text-stone-800 hover:bg-stone-100 border border-stone-300 active:bg-stone-200 shadow-2xs font-semibold',
  outline:
    'bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-300 active:bg-stone-200 shadow-2xs font-semibold',
  cancel:
    'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 active:bg-stone-300 font-medium',
  ghost:
    'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-transparent active:bg-stone-200 font-medium',
  danger:
    'bg-red-700 text-white hover:bg-red-800 shadow-sm active:bg-red-900 border border-red-800/40 font-semibold',
  success:
    'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm active:bg-emerald-900 border border-emerald-800/40 font-semibold',
  emerald:
    'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm active:bg-emerald-900 border border-emerald-800/40 font-semibold',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md min-h-[34px] gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-md min-h-[40px] gap-2',
  lg: 'px-5 py-2.5 text-sm sm:text-base rounded-md min-h-[44px] gap-2.5',
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
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      whileHover={isDisabled ? undefined : { y: -0.5 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      disabled={isDisabled}
      onClick={onClick}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center select-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
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
          {children && <span>{children}</span>}
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
