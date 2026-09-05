'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  RotateCcw,
  Menu,
  LogOut,
  Settings,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { SecondaryButton } from '@/components/ui/Button';

interface NavbarProps {
  onResetData?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function Navbar({ onResetData, onToggleMobileSidebar }: NavbarProps) {
  const { data: session } = useSession();
  const [resetting, setResetting] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const merchantName = (session?.user as any)?.merchantName || 'Aura Athletics';
  const userName = session?.user?.name || 'Arjun Sharma';
  const userEmail = session?.user?.email || 'arjun@auraathletics.com';
  const userRole = (session?.user as any)?.role || 'MERCHANT_ADMIN';

  const userInitials =
    userName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AS';

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      if (onResetData) {
        onResetData();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setResetting(false), 600);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6 backdrop-blur transition-all">
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-md p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 border border-brand-200 text-brand-800 font-bold text-xs sm:text-sm flex-shrink-0 shadow-2xs">
            {merchantName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-stone-900 text-xs sm:text-sm tracking-tight flex items-center gap-2">
              <span>{merchantName}</span>
              <span className="hidden sm:inline-block">
                <StatusBadge status="TEST MODE" size="sm" />
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-medium">Merchant Portal</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <SecondaryButton
          size="sm"
          onClick={handleReset}
          isLoading={resetting}
          leftIcon={!resetting ? <RotateCcw className="h-3.5 w-3.5 text-stone-500" /> : undefined}
          title="Reset database to initial demo state"
        >
          <span className="hidden sm:inline">Reset Demo Data</span>
          <span className="sm:hidden">Reset</span>
        </SecondaryButton>

        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 sm:border-l sm:border-stone-200 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white shadow-2xs">
              {userInitials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-stone-900">{userName}</div>
              <div className="text-[10px] text-stone-500 capitalize">
                {userRole === 'MERCHANT_ADMIN' ? 'Store Admin' : 'Team Member'}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-stone-400 hidden sm:inline" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-md border border-stone-200 bg-white p-1.5 shadow-lg z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <div className="font-bold text-stone-900">{userName}</div>
                <div className="text-[11px] text-stone-500 truncate">{userEmail}</div>
              </div>
              <Link
                href="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-stone-700 hover:bg-stone-100 transition-colors font-medium"
              >
                <Settings className="h-4 w-4 text-stone-400" />
                <span>Store Settings</span>
              </Link>
              <Link
                href="/shop"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-stone-700 hover:bg-stone-100 transition-colors font-medium"
              >
                <ShoppingBag className="h-4 w-4 text-stone-400" />
                <span>Customer Storefront</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded text-red-700 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
