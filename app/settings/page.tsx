'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  CreditCard,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageShell, SectionHeader, Badge, Button, Modal } from '@/components/ui';

export default function SettingsPage() {
  const [merchantName, setMerchantName] = useState('');
  const [merchantEmail, setMerchantEmail] = useState('');
  const [keyId, setKeyId] = useState('');
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
        }
      } catch (err) {
        console.error(err);
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
      <PageShell
        header={
          <SectionHeader
            badge={
              <Badge variant="brand" dot>
                Store Settings
              </Badge>
            }
            title="Settings & Integrations"
            description="Manage store profile details, Razorpay test mode settings, and business rule links."
            actions={
              savedSuccess ? (
                <Badge variant="emerald" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                  Changes Saved
                </Badge>
              ) : undefined
            }
          />
        }
      >
        <div className="max-w-3xl space-y-6">
          <form onSubmit={handleSave} className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 space-y-5 shadow-xl backdrop-blur-xl text-white">
            <h3 className="font-bold text-white text-sm border-b border-zinc-800/80 pb-3">
              Store Profile
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Store / Brand Name</label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Primary Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={merchantEmail}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                  Save Store Profile
                </Button>
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 space-y-4 shadow-xl backdrop-blur-xl text-white">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-violet-400" />
                <span>Razorpay Payment Integration</span>
              </h3>
              <Badge variant="emerald">Test Mode Active</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="font-semibold text-zinc-400">Key ID</div>
                <div className="font-mono text-white">{keyId || 'rzp_test_demo_key_id'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="font-semibold text-zinc-400">Webhook Endpoint</div>
                <div className="font-mono text-white">/api/webhooks/razorpay</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl backdrop-blur-xl text-white">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="h-4 w-4 text-violet-400" />
                <span>Business Rules & Guardrails</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Configure discount limits, approval thresholds, and campaign caps.</p>
            </div>
            <Link href="/policies">
              <Button variant="secondary" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />} className="bg-zinc-800 border-zinc-700 text-zinc-200">
                Configure Rules
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border border-rose-900/60 bg-rose-950/40 p-6 space-y-3 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-rose-200 text-sm">Demo Data Reset</h3>
            <p className="text-xs text-rose-300 leading-relaxed">
              Reset store metrics, opportunities, and orders back to initial seed data.
            </p>
            <Button variant="danger" size="sm" onClick={() => setIsResetModalOpen(true)}>
              Reset Demo Data
            </Button>
          </div>
        </div>
      </PageShell>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Confirm Reset">
        <div className="space-y-4 text-xs text-zinc-300">
          <p>
            This will reset all opportunities, orders, and logs back to initial seeded values.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsResetModalOpen(false)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetData} isLoading={resetting}>
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
