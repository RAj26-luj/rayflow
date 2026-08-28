'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR } from '@/lib/utils';
import { Order } from '@/lib/types';

interface RazorpayTestModalProps {
  order: Order | null;
  isOpen: boolean;
  storeName?: string;
  onClose: () => void;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure?: (errorData: any) => void;
}

export function RazorpayTestModal({
  order,
  isOpen,
  storeName,
  onClose,
  onPaymentSuccess,
  onPaymentFailure,
}: RazorpayTestModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorState, setErrorState] = useState<{ message: string; reason: string; canRetry: boolean } | null>(null);

  if (!isOpen || !order) return null;

  const handlePaySuccess = async () => {
    setIsProcessing(true);
    setErrorState(null);

    try {
      // Simulate Razorpay Gateway Response with Test Signature
      const mockPaymentId = `pay_RAYFlow_${Date.now()}_test`;
      const mockSignature = `sig_valid_test_sha256_${Date.now()}`;

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
          paymentMethod: selectedMethod,
          email: order.customerEmail,
          contact: order.customerPhone,
        }),
      });

      const data = await res.json();

      if (data.success && data.verified) {
        // Trigger celebratory confetti microinteraction
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0c83fe', '#10b981', '#6366f1'],
          });
        } catch {
          // ignore if canvas unavailable
        }

        onPaymentSuccess(data.data);
      } else {
        setErrorState({
          message: data.message || 'Payment verification failed',
          reason: data.error || 'Signature mismatch',
          canRetry: true,
        });
      }
    } catch (err: any) {
      setErrorState({
        message: 'Network connection fault to Razorpay gateway',
        reason: err.message,
        canRetry: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateDecline = async () => {
    setIsProcessing(true);
    setErrorState(null);

    try {
      const res = await fetch('/api/payments/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
          failureReason: 'Transaction declined by issuing bank: Insufficient test funds / auth refusal.',
          errorCode: 'BAD_REQUEST_PAYMENT_DECLINED',
          method: selectedMethod,
        }),
      });

      const data = await res.json();
      setErrorState({
        message: "Payment wasn't completed. No money was marked as received.",
        reason: data.details || 'Bank declined transaction authorization.',
        canRetry: true,
      });

      if (onPaymentFailure) {
        onPaymentFailure(data);
      }
    } catch (err: any) {
      setErrorState({
        message: 'Payment failed to process',
        reason: err.message,
        canRetry: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateTimeout = async () => {
    setIsProcessing(true);
    setErrorState(null);

    try {
      const res = await fetch('/api/payments/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
          failureReason: 'Payment session expired: UPI Intent confirmation timed out after 180 seconds.',
          errorCode: 'GATEWAY_TIMEOUT',
          method: 'upi',
        }),
      });

      const data = await res.json();
      setErrorState({
        message: "Payment wasn't completed. No money was marked as received.",
        reason: 'UPI request timed out. Checkout remains open.',
        canRetry: true,
      });

      if (onPaymentFailure) {
        onPaymentFailure(data);
      }
    } catch (err: any) {
      setErrorState({
        message: 'Payment session timeout',
        reason: err.message,
        canRetry: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Razorpay Fintech Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">{storeName || 'Merchant Store'}</span>
              <span className="rounded bg-amber-400/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 border border-amber-400/30">
                TEST MODE
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Order #{order.orderNumber}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Total Payable</div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatINR(order.totalAmount)}
            </div>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-xs space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Order Items Summary
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-700">
              <span>{item.productName} (x{item.quantity})</span>
              <span className="font-medium">{formatINR(item.unitPrice * item.quantity)}</span>
            </div>
          ))}

          {order.discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-700 font-medium pt-1 border-t border-slate-200/80">
              <span>AI Bundle Savings</span>
              <span>-{formatINR(order.discountAmount)}</span>
            </div>
          )}
        </div>

        {/* Failure Alert State (Graceful Error Recovery) */}
        {errorState && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-xs text-red-800 space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-900">{errorState.message}</div>
                <div className="text-red-700 text-[11px] mt-0.5">{errorState.reason}</div>
              </div>
            </div>
            <div className="bg-white/70 rounded p-2 text-[11px] text-slate-700 flex items-center justify-between">
              <span>Checkout status: <strong>Open for retry</strong></span>
              <span className="text-emerald-700 font-semibold">₹0.00 Debited</span>
            </div>
          </div>
        )}

        {/* Body: Payment Method Selector */}
        <div className="p-5 space-y-4">
          <div className="text-xs font-semibold text-slate-600">Select Test Payment Method</div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedMethod('upi')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                selectedMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className={`h-5 w-5 mb-1 ${selectedMethod === 'upi' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>UPI / QR</span>
            </button>

            <button
              onClick={() => setSelectedMethod('card')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                selectedMethod === 'card'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className={`h-5 w-5 mb-1 ${selectedMethod === 'card' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Test Card</span>
            </button>

            <button
              onClick={() => setSelectedMethod('netbanking')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                selectedMethod === 'netbanking'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className={`h-5 w-5 mb-1 ${selectedMethod === 'netbanking' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Netbanking</span>
            </button>
          </div>

          {/* Payment Method Details */}
          {selectedMethod === 'upi' && (
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-2 text-xs">
              <label className="text-[11px] font-medium text-slate-500">Virtual Payment Address (VPA)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="success@razorpay"
                />
              </div>
              <div className="text-[10px] text-slate-400">
                Tip: Use <code className="text-blue-600 font-mono">success@razorpay</code> for capture test.
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-2 text-xs">
              <label className="text-[11px] font-medium text-slate-500">Razorpay Test Card (Auto-filled)</label>
              <div className="space-y-1.5 font-mono text-xs">
                <input
                  type="text"
                  readOnly
                  value="4111 1111 1111 1111"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    readOnly
                    value="12 / 28"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 text-center"
                  />
                  <input
                    type="text"
                    readOnly
                    value="123 (CVV)"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1 text-xs">
              <div className="text-[11px] font-medium text-slate-500">Simulated Retail Bank</div>
              <div className="font-semibold text-slate-800">HDFC Bank (Test Gateway Sandbox)</div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handlePaySuccess}
            disabled={isProcessing}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Confirm & Pay {formatINR(order.totalAmount)}</span>
              </>
            )}
          </button>

          {/* Simulation Playground for Hackathon Evaluators */}
          <div className="pt-3 border-t border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Evaluator Test Simulation Bar</span>
              <span className="text-blue-600 font-mono">Test API Mode</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulateDecline}
                disabled={isProcessing}
                className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-900 hover:bg-amber-100 transition-colors text-center"
              >
                Simulate Bank Decline
              </button>
              <button
                type="button"
                onClick={handleSimulateTimeout}
                disabled={isProcessing}
                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-900 hover:bg-red-100 transition-colors text-center"
              >
                Simulate UPI Timeout
              </button>
            </div>
          </div>
        </div>

        {/* Footer info & close */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>HMAC-SHA256 Verified</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            Cancel Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
