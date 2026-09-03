'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Send,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { RazorpayTestModal } from '@/components/payment/RazorpayTestModal';
import { CustomerNavbar } from '@/components/layout/CustomerNavbar';
import { Product, Order } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface BuyerMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  recommendedBundle?: {
    items: Product[];
    originalPrice: number;
    bundlePrice: number;
    savingsAmount: number;
    discountPercent: number;
    reason: string;
  };
  suggestedReplies?: string[];
  timestamp: string;
}

export default function ShopWithAiPage() {
  const { data: session } = useSession();
  const storeName = (session?.user as any)?.merchantName || 'Store';

  const [messages, setMessages] = useState<BuyerMessage[]>([
    {
      id: 'msg_shop_welcome',
      role: 'assistant',
      content:
        '👋 Welcome to **RAYFLOW Storefront**!\n\nTell me what gear you are looking for, your sport, or budget, and I will find the best match and bundle savings for you.',
      suggestedReplies: [
        'Show me marathon running gear under ₹6,000.',
        'Find products with exclusive bundle savings.',
        'What high-performance running socks are available?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [confirmationOrder, setConfirmationOrder] = useState<{
    items: { productId: string; quantity: number; name?: string; price?: number }[];
    totalAmount: number;
    discountAmount: number;
    isBundle: boolean;
    bundleDetails?: any;
  } | null>(null);
  const [paidSuccessOrder, setPaidSuccessOrder] = useState<Order | null>(null);
  const [paymentFailError, setPaymentFailError] = useState<string | null>(null);

  // Sync buyer details from authenticated session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setBuyerName(session.user.name);
      if (session.user.email) setBuyerEmail(session.user.email);
    }
  }, [session]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || loading) return;

    const userMsg: BuyerMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          type: 'buyer',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const assistantMsg: BuyerMessage = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          products: data.data.products,
          recommendedBundle: data.data.recommendedBundle,
          suggestedReplies: data.data.suggestedReplies,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Open Pre-Payment Explicit Confirmation
  const initiateBundleBuy = (bundle: any) => {
    setPaymentFailError(null);
    setPaidSuccessOrder(null);

    setConfirmationOrder({
      items: bundle.items.map((it: any) => ({
        productId: it.id,
        quantity: 1,
        name: it.name,
        price: it.price,
      })),
      totalAmount: bundle.bundlePrice,
      discountAmount: bundle.savingsAmount,
      isBundle: true,
      bundleDetails: bundle,
    });
  };

  // Step 2: Handle Checkout Click (Amazon-style Auth Check)
  const handleProceedToRazorpay = async () => {
    if (!confirmationOrder) return;

    // If not signed in and no buyer email entered, prompt inline authentication
    if (!session?.user && !buyerEmail.trim()) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: confirmationOrder.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
          })),
          discountAmount: confirmationOrder.discountAmount,
          isBundle: confirmationOrder.isBundle,
          bundleSavings: confirmationOrder.discountAmount,
          customerDetails: {
            name: (buyerName || session?.user?.name || 'Valued Customer').trim(),
            email: (buyerEmail || session?.user?.email || 'customer@example.com').trim(),
            phone: buyerPhone.trim() || '+919811234567',
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.order) {
        setActiveOrder(data.data.order);
        setConfirmationOrder(null);
        setIsAuthModalOpen(false);
        setIsPayModalOpen(true);
      } else {
        setPaymentFailError(data.error?.message || 'Failed to create order.');
      }
    } catch (err: any) {
      console.error(err);
      setPaymentFailError(err.message || 'Network error creating order.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle Inline Customer Login (Preserves Cart!)
  const handleInlineCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const signupRes = await fetch('/api/customer/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
          }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok || !signupData.success) {
          setAuthError(signupData.error || 'Failed to register account');
          setAuthLoading(false);
          return;
        }
      }

      const res = await signIn('credentials', {
        redirect: false,
        email: authEmail,
        password: authPassword,
        userType: 'customer',
      });

      if (res?.error) {
        setAuthError('Invalid email or password.');
        setAuthLoading(false);
      } else {
        setIsAuthModalOpen(false);
        setAuthLoading(false);
        setBuyerEmail(authEmail);
        if (authName) setBuyerName(authName);
      }
    } catch {
      setAuthError('Authentication failed. Please try again.');
      setAuthLoading(false);
    }
  };

  // Step 4: 1-Click Demo Customer Checkout
  const handleInlineDemoCustomer = async () => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'priya@auraathletics.com',
        password: 'demo123',
        userType: 'customer',
      });

      if (res?.error) {
        setAuthError('Demo customer login failed.');
        setAuthLoading(false);
      } else {
        setIsAuthModalOpen(false);
        setAuthLoading(false);
        setBuyerName('Priya Sharma');
        setBuyerEmail('priya@auraathletics.com');
      }
    } catch {
      setAuthError('Failed to sign in as Demo Customer');
      setAuthLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setIsPayModalOpen(false);
    setPaidSuccessOrder(paymentData.order);

    const successMsg: BuyerMessage = {
      id: `ast_success_${Date.now()}`,
      role: 'assistant',
      content: `🎉 **Payment Captured & Verified!**\n\nThank you **${paymentData.order?.customerName || buyerName || 'Priya'}**! Your order **#${paymentData.order.orderNumber}** (${formatINR(paymentData.order.totalAmount)}) has been processed successfully.\n\nRazorpay Payment ID: \`${paymentData.payment.razorpayPaymentId}\`\n\nYour purchase is confirmed and available in your order history.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, successMsg]);
  };

  const handlePaymentFailure = (errorData: any) => {
    setPaymentFailError(errorData.details || errorData.message || 'Payment attempt failed.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Customer Storefront Navbar */}
      <CustomerNavbar cartCount={confirmationOrder ? confirmationOrder.items.length : 0} />

      {/* Main Conversational Storefront Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-between">
        {/* Messages Stream */}
        <div className="space-y-4 sm:space-y-6 pb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs flex-shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 border border-slate-700 text-slate-200 shadow-md'
                }`}
              >
                <div className="whitespace-pre-line space-y-2 text-[11px] sm:text-xs">{msg.content}</div>

                {/* Render Product Cards */}
                {msg.products && !msg.recommendedBundle && (
                  <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-2.5 sm:gap-3">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 flex items-center gap-3 sm:gap-4"
                      >
                        <div className="h-14 w-14 sm:h-16 sm:w-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="object-cover h-full w-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-xs sm:text-sm">{prod.name}</div>
                          <div className="text-slate-400 text-[10px] sm:text-[11px] line-clamp-1">
                            {prod.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-emerald-400 text-xs">
                              {formatINR(prod.price)}
                            </span>
                            {prod.compareAtPrice && (
                              <span className="text-slate-500 line-through text-[10px]">
                                {formatINR(prod.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Recommended Bundle Card */}
                {msg.recommendedBundle && (
                  <div className="mt-3 sm:mt-4 rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
                        <Tag className="h-3.5 w-3.5" />
                        AI Recommended Running Bundle
                      </div>
                      <span className="rounded bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 border border-emerald-500/30">
                        Save {formatINR(msg.recommendedBundle.savingsAmount)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.recommendedBundle.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-slate-500">{idx + 1}.</span>
                            <span className="font-medium text-white truncate">{item.name}</span>
                          </div>
                          <span className="font-mono text-slate-400 ml-2">{formatINR(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-indigo-800/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-slate-400">Regular: <span className="line-through">{formatINR(msg.recommendedBundle.originalPrice)}</span></div>
                        <div className="text-sm sm:text-base font-bold text-white">
                          Bundle: <span className="text-emerald-400">{formatINR(msg.recommendedBundle.bundlePrice)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => initiateBundleBuy(msg.recommendedBundle)}
                        className="w-full sm:w-auto rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Buy Bundle</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Replies */}
                {msg.suggestedReplies && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700 flex flex-wrap gap-1.5">
                    {msg.suggestedReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(reply)}
                        className="rounded-full bg-slate-900 border border-slate-700 px-2.5 py-1 text-[10px] sm:text-[11px] text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-1.5 text-right text-[9px] opacity-40">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-2.5 sm:p-3 text-[11px] sm:text-xs text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                <span>Formulating personalized bundle savings...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="sticky bottom-3 sm:bottom-4 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/95 p-1.5 sm:p-2 shadow-2xl backdrop-blur"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tell AI what you need (e.g. 'Running shoes under ₹6,000')..."
              className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || loading}
              className="rounded-xl bg-blue-600 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
            >
              <span className="hidden xs:inline">Send</span>
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      </main>

      {/* Pre-Payment Explicit Confirmation Modal */}
      {confirmationOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl text-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Payment Confirmation</h3>
              </div>
              <button
                onClick={() => setConfirmationOrder(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-sm font-semibold text-white">
                You&apos;re about to pay <span className="text-emerald-400 font-bold text-base">{formatINR(confirmationOrder.totalAmount)}</span>
              </div>

              {/* Dynamic Items List */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-3.5 space-y-2">
                {confirmationOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span>{item.name || `Product #${item.productId}`}</span>
                    <span className="font-mono">{item.price ? formatINR(item.price) : ''}</span>
                  </div>
                ))}
                {confirmationOrder.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-medium pt-1.5 border-t border-slate-800">
                    <span>AI Bundle Savings</span>
                    <span className="font-mono">-{formatINR(confirmationOrder.discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Customer Checkout Details */}
              <div className="space-y-2 pt-1">
                <div className="text-slate-400 font-semibold text-[11px]">Buyer Information:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-950/60 border border-blue-800 p-2.5 sm:p-3 text-[11px] text-blue-200 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  Razorpay Test-Mode Guarantee
                </div>
                <p className="text-slate-300">
                  Payment will be processed securely using Razorpay test mode. No real bank accounts are debited.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => setConfirmationOrder(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToRazorpay}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5"
              >
                <CreditCard className="h-4 w-4" />
                <span>Confirm & Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Authentication Gate Modal (Amazon-Style Zero-Cart-Loss) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-slate-900 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Sign In to Complete Purchase</h3>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Your cart and AI bundle savings ({confirmationOrder ? formatINR(confirmationOrder.totalAmount) : ''}) are preserved.
            </div>

            {authError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {authError}
              </div>
            )}

            {/* 1-Click Demo Customer Checkout */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-blue-900">1-Click Demo Customer</span>
                <span className="text-[10px] bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Instant</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2.5">
                Continue as <strong>Priya Sharma</strong> (Demo Customer) to test Razorpay checkout immediately.
              </p>
              <button
                type="button"
                onClick={handleInlineDemoCustomer}
                disabled={authLoading}
                className="w-full rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {authLoading ? 'Signing in...' : 'Continue as Demo Customer (Priya)'}
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider">Or your account</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Sign in / Sign up form */}
            <form onSubmit={handleInlineCustomerLogin} className="space-y-3 text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-slate-900 text-white font-semibold py-2.5 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {authLoading ? 'Signing in...' : authMode === 'signin' ? 'Sign In & Pay' : 'Create Account & Pay'}
              </button>

              <div className="text-center pt-1 text-slate-500">
                {authMode === 'signin' ? (
                  <span>
                    New customer?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Create account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Test Payment Modal */}
      <RazorpayTestModal
        order={activeOrder}
        isOpen={isPayModalOpen}
        storeName={storeName}
        onClose={() => setIsPayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
}
