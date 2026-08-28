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
import { useSession } from 'next-auth/react';
import { RazorpayTestModal } from '@/components/payment/RazorpayTestModal';
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
        '👋 Welcome to **our AI Storefront**!\n\nTell me what you are looking for, your training goals, or budget, and I will find the best match and bundle savings for you.',
      suggestedReplies: [
        'Show me best-selling gear.',
        'Find products with exclusive bundle savings.',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
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

  // Step 2: Confirm Order & Launch Razorpay Test Checkout
  const handleProceedToRazorpay = async () => {
    if (!confirmationOrder) return;
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
            name: buyerName.trim() || 'Valued Shopper',
            email: buyerEmail.trim() || 'shopper@example.com',
            phone: buyerPhone.trim() || '+919876543210',
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.order) {
        setActiveOrder(data.data.order);
        setConfirmationOrder(null);
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

  const handlePaymentSuccess = (paymentData: any) => {
    setIsPayModalOpen(false);
    setPaidSuccessOrder(paymentData.order);

    const successMsg: BuyerMessage = {
      id: `ast_success_${Date.now()}`,
      role: 'assistant',
      content: `🎉 **Payment Completed & Verified!**\n\nThank you ${paymentData.order?.customerName || buyerName.trim() || 'Shopper'}! Your order **#${paymentData.order.orderNumber}** (₹${paymentData.order.totalAmount.toLocaleString('en-IN')}) has been captured via Razorpay Test Mode.\n\nRazorpay Payment ID: \`${paymentData.payment.razorpayPaymentId}\`\n\nYour merchant dashboard has been updated with +₹${paymentData.order.totalAmount.toLocaleString('en-IN')} revenue in real-time.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, successMsg]);
  };

  const handlePaymentFailure = (errorData: any) => {
    setPaymentFailError(errorData.details || errorData.message || 'Payment attempt failed.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Buyer Nav */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold flex-shrink-0">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white">{storeName}</span>
              <span className="hidden xs:inline ml-1.5 text-[9px] sm:text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800 font-mono">
                AI Storefront
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-amber-300 flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden xs:inline">Razorpay</span> Test Mode
          </div>

          <Link
            href="/overview"
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <span className="hidden sm:inline">Dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

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
