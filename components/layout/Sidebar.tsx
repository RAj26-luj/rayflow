'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sparkles,
  Bot,
  Users,
  Package,
  Megaphone,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Sliders,
  Settings,
  TrendingUp,
  X,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSession } from 'next-auth/react';

export const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Opportunities',
    href: '/opportunities',
    icon: Sparkles,
    badge: '14 New',
    badgeColor: 'bg-brand-50 text-brand-800 border-brand-200',
  },
  {
    label: 'Assistant',
    href: '/agent',
    icon: Bot,
    badge: null,
  },
  {
    label: 'Catalogue',
    href: '/catalogue',
    icon: Package,
    badge: null,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    badge: null,
  },
  {
    label: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    badge: null,
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
    badge: null,
  },
  {
    label: 'Business Rules',
    href: '/policies',
    icon: Sliders,
    badge: null,
  },
  {
    label: 'Activity & Audit',
    href: '/audit',
    icon: ShieldCheck,
    badge: null,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const merchantName = (session?.user as any)?.merchantName || 'Aura Athletics';

  const sidebarContent = (
    <div className="w-64 flex flex-col justify-between h-full bg-white border-r border-stone-200 shadow-2xs">
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-stone-100">
          <Link href="/overview" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white font-bold shadow-xs flex-shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="font-extrabold text-stone-900 tracking-tight text-sm flex items-center gap-1.5">
                <span>RAYFLOW</span>
              </div>
              <div className="text-[11px] text-stone-500 font-medium truncate max-w-[130px]">
                {merchantName}
              </div>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-14rem)]">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Store Management
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href === '/overview' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'group relative flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold transition-all select-none',
                  isActive
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={clsx(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={clsx(
                      'rounded-full border px-2 py-0.5 text-[10px] font-bold leading-tight',
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-stone-100 bg-stone-50 m-2.5 rounded-lg border space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-900">
          <span>Buyer Storefront</span>
          <span className="text-emerald-800 text-[10px] font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
            Live
          </span>
        </div>
        <p className="text-[11px] text-stone-500 leading-relaxed">
          Test customer assistant & Razorpay checkout.
        </p>
        <Link
          href="/shop"
          className="w-full rounded-md bg-white border border-stone-200 py-1.5 px-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-brand-700" />
          <span>Open Shop</span>
          <ExternalLink className="h-3 w-3 text-stone-400 ml-0.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 w-64 max-w-[85vw] h-full shadow-xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
