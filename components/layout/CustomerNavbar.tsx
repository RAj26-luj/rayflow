'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  ShoppingBag,
  Sparkles,
  User,
  LogOut,
  Package,
  Store,
  ChevronDown,
} from 'lucide-react';

interface CustomerNavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export function CustomerNavbar({ cartCount = 0, onOpenCart }: CustomerNavbarProps) {
  const { data: session } = useSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isCustomer = (session?.user as any)?.role === 'CUSTOMER' || (session?.user as any)?.userType === 'CUSTOMER';
  const isMerchant = (session?.user as any)?.role?.startsWith('MERCHANT') || (session?.user as any)?.userType === 'MERCHANT';
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-violet-950/50 group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-violet-300 transition-colors">
                  RAYFLOW
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest bg-violet-950/90 text-violet-300 px-2 py-0.5 rounded-full border border-violet-800/60 shadow-xs">
                  Store
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white rounded-full hover:bg-zinc-800/60 transition-all"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="px-3.5 py-1.5 text-xs font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-full transition-all flex items-center gap-1.5 hover:bg-violet-900/60 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Explore Collection</span>
            </Link>
            {isCustomer && (
              <Link
                href="/customer/orders"
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white rounded-full hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
              >
                <Package className="h-3.5 w-3.5 text-zinc-400" />
                <span>My Orders</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 hover:border-violet-500/50 transition-all shadow-md backdrop-blur-md"
              aria-label="View Cart"
            >
              <ShoppingBag className="h-4 w-4 text-violet-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-[10px] font-black text-white shadow-md shadow-violet-950/60">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {isMerchant && (
            <Link
              href="/overview"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-all"
            >
              <Store className="h-3.5 w-3.5 text-violet-400" />
              <span>Merchant Dashboard</span>
            </Link>
          )}

          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-all shadow-md"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-950 text-violet-300 font-bold text-[10px] border border-violet-700/60">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline">{userName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl z-50 text-xs text-zinc-200 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-zinc-800/80 px-3 py-2.5">
                    <p className="font-bold text-white truncate">{userName}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{session.user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-violet-950/80 text-violet-300 border border-violet-800/60 px-2 py-0.5 rounded-full">
                      {isCustomer ? 'Shopper Account' : 'Merchant'}
                    </span>
                  </div>

                  <div className="py-1">
                    {isCustomer && (
                      <Link
                        href="/customer/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
                      >
                        <Package className="h-4 w-4 text-zinc-400" />
                        <span>My Purchase History</span>
                      </Link>
                    )}
                    {isMerchant && (
                      <Link
                        href="/overview"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
                      >
                        <Store className="h-4 w-4 text-zinc-400" />
                        <span>Merchant Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-zinc-800/80 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition-colors font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/customer/login"
                className="rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-950/50 hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/merchant/login"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <Store className="h-3.5 w-3.5 text-zinc-500" />
                <span>Merchant Portal</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
