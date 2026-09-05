'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR } from '@/lib/utils';
import { Order } from '@/lib/types';
import { ActionButton, SecondaryButton, CancelButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

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
  const [step, setStep] = useState<'method' | 'otp' | 'success' | 'declined' | 'failed'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<any>(null);

  // Reset modal state whenever a new order is opened
  useEffect(() => {
    if (isOpen) {
      setStep('method');
      setOtp('');
      setErrorMessage(null);
      setIsProcessing(false);
      setConfirmedPayment(null);
    }
  }, [isOpen, order?.id]);

  // Escape key listener to close modal safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen || !order) return null;

  // Handle OTP Submission
  const handleVerifyOtp = async (inputOtp?: string) => {
    const code = (inputOtp || otp).trim();
    if (!code) {
      setErrorMessage('Please enter the 6-digit demo OTP.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Scenario: Simulated Bank Decline (OTP 000000)
    if (code === '000000') {
      try {
        const res = await fetch('/api/payments/fail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            razorpayOrderId: order.razorpayOrderId,
            failureReason: 'Transaction declined: Demo payment authorization declined by issuing test bank.',
            errorCode: 'BAD_REQUEST_PAYMENT_DECLINED',
            method: selectedMethod,
          }),
        });
        const data = await res.json();
        setStep('declined');
        if (onPaymentFailure) onPaymentFailure(data);
      } catch {
        setStep('declined');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 2. Scenario: Simulated Gateway Timeout / Network Failure (OTP 999999)
    if (code === '999999') {
      try {
        const res = await fetch('/api/payments/fail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            razorpayOrderId: order.razorpayOrderId,
            failureReason: 'Gateway timeout: UPI confirmation timed out in test environment.',
            errorCode: 'GATEWAY_TIMEOUT',
            method: selectedMethod,
          }),
        });
        const data = await res.json();
        setStep('failed');
        if (onPaymentFailure) onPaymentFailure(data);
      } catch {
        setStep('failed');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 3. Scenario: Successful Payment (Default OTP 123456 or any other standard entry)
    try {
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
        setConfirmedPayment(data.data);
        setStep('success');

        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#8B5CF6', '#EC4899', '#10B981', '#6366F1'],
          });
        } catch {
          // ignore if canvas unavailable
        }

        onPaymentSuccess(data.data);
      } else {
        setErrorMessage(data.message || 'Payment verification failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network connection failed during payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-indigo-950 text-white p-5 sm:p-6 relative overflow-hidden border-b border-zinc-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  {storeName || 'RAYFLOW Store'}
                </span>
                <span className="rounded-full bg-violet-950/90 text-violet-300 text-[10px] font-bold px-2.5 py-0.5 border border-violet-700/60 shadow-xs">
                  Razorpay Test Mode
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-0.5 font-mono">
                Order #{order.orderNumber}
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-xl p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none"
              aria-label="Close payment modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">Total Amount:</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300 font-mono tracking-tight">
              {formatINR(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* STEP 1: Select Payment Method */}
        {step === 'method' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Select Payment Method
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all focus:outline-none ${
                  selectedMethod === 'upi'
                    ? 'border-violet-500 bg-violet-950/60 text-violet-300 shadow-md shadow-violet-950/40 ring-1 ring-violet-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                <Smartphone
                  className={`h-5 w-5 mb-1.5 ${
                    selectedMethod === 'upi' ? 'text-violet-400' : 'text-zinc-500'
                  }`}
                />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all focus:outline-none ${
                  selectedMethod === 'card'
                    ? 'border-violet-500 bg-violet-950/60 text-violet-300 shadow-md shadow-violet-950/40 ring-1 ring-violet-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                <CreditCard
                  className={`h-5 w-5 mb-1.5 ${
                    selectedMethod === 'card' ? 'text-violet-400' : 'text-zinc-500'
                  }`}
                />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all focus:outline-none ${
                  selectedMethod === 'netbanking'
                    ? 'border-violet-500 bg-violet-950/60 text-violet-300 shadow-md shadow-violet-950/40 ring-1 ring-violet-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                <Building2
                  className={`h-5 w-5 mb-1.5 ${
                    selectedMethod === 'netbanking' ? 'text-violet-400' : 'text-zinc-500'
                  }`}
                />
                <span>Netbanking</span>
              </button>
            </div>

            {/* Method Details */}
            {selectedMethod === 'upi' && (
              <div className="rounded-2xl border border-zinc-800 p-3.5 bg-zinc-950/60 space-y-2 text-xs">
                <label className="text-[11px] font-semibold text-zinc-400">Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono focus:border-violet-500 focus:outline-none"
                  placeholder="success@razorpay"
                />
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="rounded-2xl border border-zinc-800 p-3.5 bg-zinc-950/60 space-y-2 text-xs font-mono">
                <label className="text-[11px] font-semibold text-zinc-400 font-sans">Razorpay Test Card</label>
                <input
                  type="text"
                  readOnly
                  value="4111 1111 1111 1111"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    readOnly
                    value="12 / 28"
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 text-center"
                  />
                  <input
                    type="text"
                    readOnly
                    value="123 (CVV)"
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 text-center"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="rounded-2xl border border-zinc-800 p-3.5 bg-zinc-950/60 space-y-1 text-xs">
                <div className="text-[11px] font-semibold text-zinc-500">Selected Test Bank</div>
                <div className="font-bold text-white">HDFC Bank (Sandbox Gateway)</div>
              </div>
            )}

            {/* Proceed Action */}
            <ActionButton
              fullWidth
              size="md"
              onClick={() => setStep('otp')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue to Payment Verification
            </ActionButton>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>256-Bit Encrypted</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Same-Page Demo OTP Verification */}
        {step === 'otp' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-violet-950/80 text-violet-300 border border-violet-800/60 mb-1">
                <span>Demo Payment</span>
              </div>
              <h3 className="text-lg font-bold text-white">Complete your payment</h3>
              <p className="text-xs text-zinc-400">
                Enter verification code to confirm transaction
              </p>
            </div>

            {/* Large Amount Display */}
            <div className="text-center py-2.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 block">Total Due</span>
              <span className="text-2xl font-extrabold text-white font-mono">{formatINR(order.totalAmount)}</span>
            </div>

            {/* Prominent Demo OTP Helper */}
            <div className="rounded-2xl border border-violet-800/60 bg-violet-950/40 p-3.5 text-center space-y-2.5 backdrop-blur-md">
              <div className="text-xs text-zinc-300">
                Demo OTP: <strong className="font-mono text-sm text-violet-300 bg-zinc-900 px-2.5 py-0.5 rounded border border-violet-700/60 font-bold">123456</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtp('123456');
                  handleVerifyOtp('123456');
                }}
                disabled={isProcessing}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-2 px-3 text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Autofill & Verify (123456)</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Manual OTP Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 text-center">
                Enter verification code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <ActionButton
                fullWidth
                size="md"
                onClick={() => handleVerifyOtp()}
                isLoading={isProcessing}
              >
                Verify Payment
              </ActionButton>

              <CancelButton fullWidth size="sm" onClick={() => setStep('method')} disabled={isProcessing} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                Change Payment Method
              </CancelButton>
            </div>

            {/* Evaluator Playground: Decline & Failure Scenarios */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="text-[10px] uppercase font-bold text-zinc-500 text-center tracking-wider">
                Demo Test Scenarios
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleVerifyOtp('000000')}
                  disabled={isProcessing}
                  className="rounded-xl border border-amber-800/60 bg-amber-950/40 p-2 text-[11px] font-semibold text-amber-300 hover:bg-amber-900/60 transition-colors"
                >
                  Test Bank Decline (000000)
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyOtp('999999')}
                  disabled={isProcessing}
                  className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-2 text-[11px] font-semibold text-rose-300 hover:bg-rose-900/60 transition-colors"
                >
                  Test Gateway Failure (999999)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Success State */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 mb-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Order Placed</span>
              </div>
              <h3 className="text-xl font-bold text-white">Payment Successful</h3>
              <p className="text-xs text-zinc-400">
                Your order has been confirmed and placed.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-4 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Order ID:</span>
                <strong className="text-white font-bold">{order.orderNumber}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment ID:</span>
                <strong className="text-zinc-300">{confirmedPayment?.payment?.razorpayPaymentId || 'pay_confirmed_test'}</strong>
              </div>
              <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800">
                <span className="font-sans">Amount:</span>
                <strong className="text-emerald-400 text-sm font-bold">{formatINR(order.totalAmount)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href="/customer/orders"
                className="rounded-xl bg-zinc-800 border border-zinc-700 py-2.5 px-3 text-xs font-bold text-white hover:bg-zinc-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                View Order
              </a>
              <ActionButton fullWidth size="md" onClick={onClose}>
                Continue Shopping
              </ActionButton>
            </div>
          </div>
        )}

        {/* STEP 4: Payment Declined State */}
        {step === 'declined' && (
          <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-950/80 text-amber-400 border border-amber-800/60 mx-auto shadow-sm">
              <AlertTriangle className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Payment Declined</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Your demo payment was declined.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <ActionButton fullWidth size="md" onClick={() => setStep('otp')}>
                Try Again
              </ActionButton>
              <SecondaryButton fullWidth size="sm" onClick={() => setStep('method')} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                Change Payment Method
              </SecondaryButton>
              <CancelButton fullWidth size="sm" onClick={onClose} className="bg-zinc-800 border-zinc-700 text-zinc-400">
                Cancel
              </CancelButton>
            </div>
          </div>
        )}

        {/* STEP 5: Payment Failed State */}
        {step === 'failed' && (
          <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-950/80 text-rose-400 border border-rose-800/60 mx-auto shadow-sm">
              <AlertCircle className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Payment Failed</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                The demo payment could not be completed.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <ActionButton fullWidth size="md" onClick={() => setStep('otp')}>
                Try Again
              </ActionButton>
              <CancelButton fullWidth size="sm" onClick={onClose} className="bg-zinc-800 border-zinc-700 text-zinc-400">
                Return to Cart
              </CancelButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
