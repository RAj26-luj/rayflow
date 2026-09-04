'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Key,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  Server,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  const [merchantName, setMerchantName] = useState('');
  const [merchantEmail, setMerchantEmail] = useState('');
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [secretConfigured, setSecretConfigured] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/merchant/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setMerchantName(json.data.merchant.name);
          setMerchantEmail(json.data.merchant.email);
          setKeyId(json.data.razorpay.keyId || '');
          setSecretConfigured(!!json.data.razorpay.secretConfigured);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleResetData = async () => {
    setResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/merchant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Settings className="h-3.5 w-3.5" />
              Settings & Integrations
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Settings & Integrations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage payment and application integrations.
            </p>
          </div>

          {savedSuccess && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5 animate-in fade-in self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Settings Saved</span>
            </div>
          )}
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
          {/* Store Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Server className="h-4 w-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">Store Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Store / Brand Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-300 p-2 font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Apex Sports"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Primary Email</label>
                <input
                  type="email"
                  disabled
                  value={merchantEmail}
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Razorpay Integration Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <h2 className="font-bold text-slate-900 text-sm">Razorpay Integration</h2>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                TEST MODE • Connected
              </span>
            </div>

            <div className="space-y-3 sm:space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium text-[11px]">Razorpay Client Key</div>
                  <div className="font-mono text-slate-800 font-semibold text-xs truncate">
                    {keyId || 'rzp_test_TVFAWq8IVlo6pz'}
                  </div>
                  <div className="text-[10px] text-slate-400">Public client key used for checkout initialization</div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium text-[11px]">Server Credentials</div>
                  <div className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Configured securely</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Secure payment verification</div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium text-[11px]">Payment Webhooks</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">Connected</span>
                </div>
                <div className="text-xs font-mono text-blue-600 bg-white border border-slate-200 px-2.5 py-1 rounded inline-block">
                  /api/webhooks/razorpay
                </div>
                <div className="text-[10px] text-slate-400">Payment events are verified and processed automatically.</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                <span>Credentials are stored securely on the server.</span>
              </span>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>

          {/* Demo & Test Mode Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="h-4 w-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Demo & Test Mode</h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Use Demo Mode to test the complete shopping and payment flow without external payment credentials.
            </p>

            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-lg bg-slate-50 border border-slate-200 gap-3">
              <div>
                <div className="font-semibold text-slate-800 text-xs">Demo Payment Mode</div>
                <div className="text-[10px] sm:text-[11px] text-slate-500">Test the complete checkout flow without external credentials.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  isDemoMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDemoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
              <div>
                <div className="font-semibold text-slate-800 text-xs">Reset Demo Data</div>
                <div className="text-[10px] text-slate-500">Restore the demo store, orders, and activity to their starting state.</div>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                disabled={resetting}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 self-start sm:self-auto"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
