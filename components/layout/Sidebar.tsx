'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Revenue Opportunities',
    href: '/opportunities',
    icon: Sparkles,
    badge: null,
  },
  {
    label: 'Revenue Assistant',
    href: '/agent',
    icon: Bot,
    badge: 'Active',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    badge: null,
  },
  {
    label: 'Catalogue',
    href: '/catalogue',
    icon: Package,
    badge: null,
  },
  {
    label: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    badge: null,
  },
  {
    label: 'Payments & Orders',
    href: '/payments',
    icon: CreditCard,
    badge: null,
  },
  {
    label: 'Audit Log',
    href: '/audit',
    icon: ShieldCheck,
    badge: 'Verified',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    label: 'Policy Controls',
    href: '/policies',
    icon: Sliders,
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

  const sidebarContent = (
    <div className="w-64 flex flex-col justify-between h-full bg-white border-r border-slate-200">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                <span>RAYFLOW</span>
                <span className="text-[10px] uppercase font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Merchant Dashboard</div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Merchant Operations
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/overview' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full border px-1.5 py-0.2 text-[10px] leading-tight ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Safety Badge */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 m-3 rounded-lg border">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Policy Controls</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Discounts and campaigns bounded by 20% max discount and policy caps.
        </p>
        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono">RZP Test API</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative z-10 w-64 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
