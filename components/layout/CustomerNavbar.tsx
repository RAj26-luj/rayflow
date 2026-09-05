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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700 text-white font-bold shadow-xs">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-stone-900">RAYFLOW</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-800 px-1.5 py-0.5 rounded border border-brand-200">
                  Shop
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-brand-700 rounded-md hover:bg-stone-100 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-700" />
              <span>Explore Store</span>
            </Link>
            {isCustomer && (
              <Link
                href="/customer/orders"
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-brand-700 rounded-md hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              >
                <Package className="h-3.5 w-3.5 text-stone-400" />
                <span>My Orders</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-all shadow-2xs"
              aria-label="View Cart"
            >
              <ShoppingBag className="h-4 w-4 text-brand-700" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white shadow-2xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {isMerchant && (
            <Link
              href="/overview"
              className="hidden sm:flex items-center gap-1.5 rounded-md border border-stone-300 bg-stone-100 px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-200 transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-stone-600" />
              <span>Merchant Dashboard</span>
            </Link>
          )}

          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50 transition-all shadow-2xs"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-bold text-[10px]">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline">{userName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-md border border-stone-200 bg-white p-1.5 shadow-lg z-50 text-xs text-stone-700 animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-stone-100 px-3 py-2">
                    <p className="font-semibold text-stone-900 truncate">{userName}</p>
                    <p className="text-[11px] text-stone-500 truncate">{session.user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                      {isCustomer ? 'Shopper Account' : 'Merchant'}
                    </span>
                  </div>

                  <div className="py-1">
                    {isCustomer && (
                      <Link
                        href="/customer/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-stone-100 transition-colors"
                      >
                        <Package className="h-4 w-4 text-stone-400" />
                        <span>My Purchase History</span>
                      </Link>
                    )}
                    {isMerchant && (
                      <Link
                        href="/overview"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-stone-100 transition-colors"
                      >
                        <Store className="h-4 w-4 text-stone-400" />
                        <span>Merchant Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded text-red-700 hover:bg-red-50 transition-colors font-medium"
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
                className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-800 transition-all flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/merchant/login"
                className="hidden lg:flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
              >
                <Store className="h-3.5 w-3.5 text-stone-400" />
                <span>Merchant?</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
