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
  Layers,
  ArrowRight,
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">RAYFLOW</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Shop
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50/80 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Explore Catalogue</span>
            </Link>
            {isCustomer && (
              <Link
                href="/customer/orders"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Package className="h-3.5 w-3.5 text-slate-400" />
                <span>My Orders</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Cart trigger if on storefront */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* If logged in as Merchant, show quick link to dashboard */}
          {isMerchant && (
            <Link
              href="/overview"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Merchant Dashboard</span>
            </Link>
          )}

          {/* User Profile / Auth State */}
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline">{userName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="font-semibold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {isCustomer ? 'Shopper Account' : 'Merchant'}
                    </span>
                  </div>

                  <div className="py-1">
                    {isCustomer && (
                      <Link
                        href="/customer/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Package className="h-4 w-4 text-slate-400" />
                        <span>My Purchase History</span>
                      </Link>
                    )}
                    {isMerchant && (
                      <Link
                        href="/overview"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Store className="h-4 w-4 text-slate-400" />
                        <span>Merchant Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
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
                className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-all flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/merchant/login"
                className="hidden lg:flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Store className="h-3.5 w-3.5 text-slate-400" />
                <span>Merchant?</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
