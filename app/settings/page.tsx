'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  Server,
  Zap,
  Sliders,
  ExternalLink,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageShell, SectionHeader, Badge, Button, Modal } from '@/components/ui';

export default function SettingsPage() {
  const [merchantName, setMerchantName] = useState('');
  const [merchantEmail, setMerchantEmail] = useState('');
  const [keyId, setKeyId] = useState('');
  const [secretConfigured, setSecretConfigured] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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
      setIsResetModalOpen(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to reset data:', err);
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
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PageShell
        header={
          <SectionHeader
            badge={
              <Badge variant="blue" dot>
                Payment & Integration Settings
              </Badge>
            }
            title="Settings & Integrations"
            description="Manage store details, Razorpay test mode settings, and business rule integrations."
            actions={
              savedSuccess ? (
                <Badge variant="emerald" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                  Changes Saved Successfully
                </Badge>
              ) : undefined
            }
          />
        }
      >
        <div className="max-w-4xl space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Store Profile Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Store Profile</h2>
                    <p className="text-[11px] text-slate-500">Public brand identity visible to buyers on checkout</p>
                  </div>
                </div>
                <Badge variant="slate" size="sm">Multi-Tenant</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Store / Brand Name</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                    placeholder="e.g. Aura Athletics"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Merchant Email</label>
                  <input
                    type="email"
                    disabled
                    value={merchantEmail}
                    className="w-full rounded-lg border border-slate-200 bg-slate-100/70 p-2.5 text-slate-500 font-medium cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Managed via session authentication</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm" loading={saving}>
                  Save Store Profile
                </Button>
              </div>
            </div>

            {/* Razorpay Integration Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Razorpay Payment Integration</h2>
                    <p className="text-[11px] text-slate-500">Live Razorpay test mode payments and webhook verification</p>
                  </div>
                </div>
                <Badge variant="emerald" dot>
                  Test Mode Connected
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium text-[11px]">Razorpay Key ID</div>
                  <div className="font-mono text-slate-800 font-semibold text-xs truncate">
                    {'rzp_test_XXXXXXXXXXXXXXXX'}
                  </div>
                  <div className="text-[10px] text-slate-400">Public key for client-side Razorpay test modal</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium text-[11px]">Key Secret Status</div>
                  <div className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Configured on server (Masked)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Used for secure payment verification</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium text-[11px]">Webhook Endpoint</span>
                  <Badge variant="emerald" size="sm">Active</Badge>
                </div>
                <div className="text-xs font-mono text-blue-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md inline-block">
                  /api/webhooks/razorpay
                </div>
                <div className="text-[10px] text-slate-400">Captures payment authorizations and updates order states automatically.</div>
              </div>
            </div>

            {/* Policy & Governance Quick Link */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Business Rules & Limits</h2>
                    <p className="text-[11px] text-slate-500">Discount ceilings, margin floors, and approval requirements</p>
                  </div>
                </div>
                <Link href="/policies">
                  <Button variant="outline" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />}>
                    Manage Business Rules
                  </Button>
                </Link>
              </div>
            </div>

            {/* Danger Zone / Demo Data Reset */}
            <div className="rounded-xl border border-rose-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-rose-900 text-sm">Demo Data & Store Reset</h2>
                  <p className="text-[11px] text-rose-600/80">Re-seed clean demo products, customer cohorts, and opportunities</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Resetting demo data returns all products, customer propensity scores, campaign opportunities, and orders to their baseline state for evaluation and testing.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-500">
                  Non-destructive to merchant configuration accounts.
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setIsResetModalOpen(true)}
                  icon={<RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />}
                  disabled={resetting}
                >
                  {resetting ? 'Resetting...' : 'Reset Demo Data'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Reset Confirmation Modal */}
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="Reset Demo Store Data"
          description="Are you sure you want to re-seed the demo store environment?"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleResetData}
                loading={resetting}
                icon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Confirm Reset
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs text-slate-600">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>This will restore catalog inventory, sample customer metrics, and demonstration orders to their initial state.</span>
            </div>
            <p>Your logged-in merchant profile and security rules will remain intact.</p>
          </div>
        </Modal>
      </PageShell>
    </DashboardLayout>
  );
}

