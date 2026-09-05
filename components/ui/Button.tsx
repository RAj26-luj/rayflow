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
    'bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 text-white hover:opacity-95 shadow-lg shadow-purple-600/25 border border-purple-500/30 font-bold',
  secondary:
    'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800 active:bg-zinc-800/80 shadow-2xs font-semibold',
  outline:
    'bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-white border border-zinc-700 active:bg-zinc-800 font-semibold',
  cancel:
    'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800 font-medium',
  ghost:
    'bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent font-medium',
  danger:
    'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:opacity-95 shadow-md border border-rose-500/30 font-bold',
  success:
    'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-md border border-emerald-500/30 font-bold',
  emerald:
    'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-md border border-emerald-500/30 font-bold',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[34px] gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-xl min-h-[40px] gap-2',
  lg: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl min-h-[44px] gap-2.5',
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
      whileHover={isDisabled ? undefined : { y: -0.5 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      disabled={isDisabled}
      onClick={onClick}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center select-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
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
          {children && <span>{children}</span>}
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
