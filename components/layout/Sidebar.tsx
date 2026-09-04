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
  ChevronRight,
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
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
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
    <div className="w-72 flex flex-col justify-between h-full bg-white border-r border-slate-200/90 shadow-2xs">
      <div>
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-slate-100">
          <Link href="/overview" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                <span>RAYFLOW</span>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Merchant
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                {merchantName}
              </div>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                  'group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all select-none',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={clsx(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
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

      {/* Footer Area: Switch to Customer Marketplace Preview */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80 m-3 rounded-2xl border space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <span>Buyer Storefront</span>
          <span className="text-emerald-700 text-[10px] font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Test the customer shopping assistant and Razorpay test checkout.
        </p>
        <Link
          href="/shop"
          className="w-full rounded-xl bg-white border border-slate-200 py-2 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
          <span>Open Customer Shop</span>
          <ExternalLink className="h-3 w-3 text-slate-400 ml-0.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
