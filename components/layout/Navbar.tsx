'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  CheckCircle2,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
  User,
} from 'lucide-react';

interface NavbarProps {
  onResetData?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function Navbar({ onResetData, onToggleMobileSidebar }: NavbarProps) {
  const { data: session } = useSession();
  const [resetting, setResetting] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const merchantName = (session?.user as any)?.merchantName || 'Merchant Store';
  const merchantId = (session?.user as any)?.merchantId || '';
  const userName = session?.user?.name || 'Merchant User';
  const userEmail = session?.user?.email || '';
  const userRole = (session?.user as any)?.role || 'MERCHANT_ADMIN';

  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MU';

  const merchantInitials = merchantName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MS';

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur transition-all">
      {/* Left side: Mobile Toggle & Merchant Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Menu Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600 font-semibold text-xs sm:text-sm flex-shrink-0">
            {merchantInitials}
          </div>
          <div>
            <div className="flex items-center gap-1 font-semibold text-slate-900 text-xs sm:text-sm">
              <span className="truncate max-w-[120px] sm:max-w-none">{merchantName}</span>
              {merchantId && (
                <span className="hidden md:inline text-[11px] font-normal text-slate-500 font-mono">
                  ID: {merchantId.length > 14 ? `${merchantId.slice(0, 10)}...` : merchantId}
                </span>
              )}
            </div>
            <div className="hidden xs:block text-[10px] sm:text-[11px] text-slate-500">Autonomous Commerce</div>
          </div>
        </div>

        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-amber-800 flex-shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          TEST MODE
        </div>

        {/* Agent Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 flex-shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Agent Active
        </div>
      </div>

      {/* Right side: Actions & User */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          disabled={resetting}
          title="Reset database to initial pristine state"
          className="flex items-center gap-1 sm:gap-1.5 rounded-md border border-slate-200 bg-white px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs disabled:opacity-50 flex-shrink-0"
        >
          <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${resetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{resetting ? 'Resetting...' : 'Reset Demo'}</span>
        </button>

        {/* User Profile & Auth Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-1 sm:pl-2 sm:border-l sm:border-slate-200 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white shadow-2xs">
              {userInitials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-800">{userName}</div>
              <div className="text-[10px] text-slate-500">{userRole === 'MERCHANT_ADMIN' ? 'Merchant Admin' : 'Member'}</div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:inline" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="font-semibold text-slate-800">{userName}</div>
                <div className="text-[10px] text-slate-500 truncate">{userEmail}</div>
              </div>
              <Link
                href="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Store Settings</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
