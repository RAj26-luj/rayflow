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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-2xl transition-all text-white">
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-950/80 border border-violet-800/60 text-violet-300 font-extrabold text-xs sm:text-sm flex-shrink-0 shadow-inner">
            {merchantName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-white text-xs sm:text-sm tracking-tight flex items-center gap-2">
              <span>{merchantName}</span>
              <span className="hidden sm:inline-block">
                <StatusBadge status="TEST MODE" size="sm" />
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">Merchant Portal</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <SecondaryButton
          size="sm"
          onClick={handleReset}
          isLoading={resetting}
          leftIcon={!resetting ? <RotateCcw className="h-3.5 w-3.5 text-zinc-400" /> : undefined}
          className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
          title="Reset database to initial demo state"
        >
          <span className="hidden sm:inline">Reset Demo Data</span>
          <span className="sm:hidden">Reset</span>
        </SecondaryButton>

        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 sm:border-l sm:border-zinc-800 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-pink-600 text-xs font-black text-white shadow-md shadow-violet-950/50">
              {userInitials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-white">{userName}</div>
              <div className="text-[10px] text-zinc-400 capitalize">
                {userRole === 'MERCHANT_ADMIN' ? 'Store Admin' : 'Team Member'}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 hidden sm:inline" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-top-1 backdrop-blur-2xl text-white">
              <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                <div className="font-bold text-white">{userName}</div>
                <div className="text-[11px] text-zinc-400 truncate">{userEmail}</div>
              </div>
              <Link
                href="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors font-semibold"
              >
                <Settings className="h-4 w-4 text-zinc-400" />
                <span>Store Settings</span>
              </Link>
              <Link
                href="/shop"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors font-semibold"
              >
                <ShoppingBag className="h-4 w-4 text-zinc-400" />
                <span>Customer Storefront</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition-colors font-semibold"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
