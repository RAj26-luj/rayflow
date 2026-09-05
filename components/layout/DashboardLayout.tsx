'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Bot,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const MOBILE_BOTTOM_NAV = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Opportunities', href: '/opportunities', icon: Sparkles },
  { label: 'Assistant', href: '/agent', icon: Bot },
  { label: 'Catalogue', href: '/catalogue', icon: ShoppingBag },
  { label: 'Activity', href: '/audit', icon: ShieldCheck },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-stone-50 overflow-x-hidden w-full">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-200 pb-20 lg:pb-8">
          {children}
        </main>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-md">
          {MOBILE_BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href === '/overview' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded text-[10px] font-medium transition-colors relative ${
                  isActive
                    ? 'text-brand-700 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-brand-700' : 'text-stone-400'}`} />
                </div>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
