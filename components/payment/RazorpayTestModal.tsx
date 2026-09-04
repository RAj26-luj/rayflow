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
            colors: ['#2563EB', '#10B981', '#38BDF8', '#6366F1'],
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  {storeName || 'RAYFLOW Store'}
                </span>
                <span className="rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 border border-blue-400/30">
                  Razorpay Test Mode
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5 font-mono">
                Order #{order.orderNumber}
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-xl p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Close payment modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Total Amount:</span>
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {formatINR(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* STEP 1: Select Payment Method */}
        {step === 'method' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Payment Method
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all focus:outline-none ${
                  selectedMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone
                  className={`h-5 w-5 mb-1.5 ${
                    selectedMethod === 'upi' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all focus:outline-none ${
                  selectedMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard
                  className={`h-5 w-5 mb-1.5 ${
                    selectedMethod === 'card' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-semibold transition-all focus:outline-none ${
                  selectedMethod === 'netbanking'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2
                  className={`h-5 w-5 mb-1.5 ${
                    selectedMethod === 'netbanking' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span>Netbanking</span>
              </button>
            </div>

            {/* Method Details */}
            {selectedMethod === 'upi' && (
              <div className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/70 space-y-2 text-xs">
                <label className="text-[11px] font-semibold text-slate-600">Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="success@razorpay"
                />
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/70 space-y-2 text-xs font-mono">
                <label className="text-[11px] font-semibold text-slate-600 font-sans">Razorpay Test Card</label>
                <input
                  type="text"
                  readOnly
                  value="4111 1111 1111 1111"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    readOnly
                    value="12 / 28"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-center"
                  />
                  <input
                    type="text"
                    readOnly
                    value="123 (CVV)"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-center"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/70 space-y-1 text-xs">
                <div className="text-[11px] font-semibold text-slate-500">Selected Test Bank</div>
                <div className="font-bold text-slate-800">HDFC Bank (Sandbox Gateway)</div>
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

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-600" />
                <span>256-Bit Encrypted</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 font-medium"
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                <span>Demo Payment</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Complete your payment</h3>
              <p className="text-xs text-slate-500">
                Enter verification code to confirm transaction
              </p>
            </div>

            {/* Large Amount Display */}
            <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block">Total Due</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono">{formatINR(order.totalAmount)}</span>
            </div>

            {/* Prominent Demo OTP Helper */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-center space-y-2">
              <div className="text-xs text-slate-600">
                Demo OTP: <strong className="font-mono text-sm text-blue-700 bg-white px-2.5 py-0.5 rounded border border-blue-200 font-bold">123456</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtp('123456');
                  handleVerifyOtp('123456');
                }}
                disabled={isProcessing}
                className="w-full rounded-xl bg-blue-600 py-2 px-3 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Autofill & Verify (123456)</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Manual OTP Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 text-center">
                Enter verification code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
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

              <CancelButton fullWidth size="sm" onClick={() => setStep('method')} disabled={isProcessing}>
                Change Payment Method
              </CancelButton>
            </div>

            {/* Evaluator Playground: Decline & Failure Scenarios */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider">
                Demo Test Scenarios
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleVerifyOtp('000000')}
                  disabled={isProcessing}
                  className="rounded-xl border border-amber-200 bg-amber-50/70 p-2 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  Test Bank Decline (000000)
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyOtp('999999')}
                  disabled={isProcessing}
                  className="rounded-xl border border-red-200 bg-red-50/70 p-2 text-[11px] font-semibold text-red-900 hover:bg-red-100 transition-colors"
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
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>Order Placed</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Payment Successful</h3>
              <p className="text-xs text-slate-500">
                Your order has been confirmed and placed.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Order ID:</span>
                <strong className="text-slate-900 font-bold">{order.orderNumber}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment ID:</span>
                <strong className="text-slate-900">{confirmedPayment?.payment?.razorpayPaymentId || 'pay_confirmed_test'}</strong>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span className="font-sans">Amount:</span>
                <strong className="text-emerald-700 text-sm font-bold">{formatINR(order.totalAmount)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href="/customer/orders"
                className="rounded-xl bg-slate-900 py-2.5 px-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-1.5"
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
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto shadow-sm">
              <AlertTriangle className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Payment Declined</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your demo payment was declined.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <ActionButton fullWidth size="md" onClick={() => setStep('otp')}>
                Try Again
              </ActionButton>
              <SecondaryButton fullWidth size="sm" onClick={() => setStep('method')}>
                Change Payment Method
              </SecondaryButton>
              <CancelButton fullWidth size="sm" onClick={onClose}>
                Cancel
              </CancelButton>
            </div>
          </div>
        )}

        {/* STEP 5: Payment Failed State */}
        {step === 'failed' && (
          <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600 border border-red-200 mx-auto shadow-sm">
              <AlertCircle className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Payment Failed</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                The demo payment could not be completed.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <ActionButton fullWidth size="md" onClick={() => setStep('otp')}>
                Try Again
              </ActionButton>
              <CancelButton fullWidth size="sm" onClick={onClose}>
                Return to Cart
              </CancelButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
