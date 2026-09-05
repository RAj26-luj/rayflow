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
        <div className="max-w-3xl space-y-5">
          <form onSubmit={handleSave} className="rounded border border-stone-200 bg-white p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
              Store Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Store / Brand Name</label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Primary Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={merchantEmail}
                  className="w-full rounded border border-stone-200 bg-stone-50 p-2 text-stone-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                  Save Store Profile
                </Button>
              </div>
            </div>
          </form>

          <div className="rounded border border-stone-200 bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-brand-700" />
                <span>Razorpay Payment Integration</span>
              </h3>
              <Badge variant="emerald">Test Mode Active</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-semibold text-stone-700">Key ID</div>
                <div className="font-mono text-stone-900">{keyId || 'rzp_test_demo_key_id'}</div>
              </div>

              <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-semibold text-stone-700">Webhook Endpoint</div>
                <div className="font-mono text-stone-900">/api/webhooks/razorpay</div>
              </div>
            </div>
          </div>

          <div className="rounded border border-stone-200 bg-white p-5 flex items-center justify-between shadow-2xs">
            <div>
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-brand-700" />
                <span>Business Rules & Guardrails</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Configure discount limits, approval thresholds, and campaign caps.</p>
            </div>
            <Link href="/policies">
              <Button variant="outline" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />}>
                Configure Rules
              </Button>
            </Link>
          </div>

          <div className="rounded border border-red-200 bg-red-50 p-5 space-y-3">
            <h3 className="font-bold text-red-900 text-sm">Demo Data Reset</h3>
            <p className="text-xs text-red-700">
              Reset store metrics, opportunities, and orders back to initial seed data.
            </p>
            <Button variant="danger" size="sm" onClick={() => setIsResetModalOpen(true)}>
              Reset Demo Data
            </Button>
          </div>
        </div>
      </PageShell>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Confirm Reset">
        <div className="space-y-3 text-xs">
          <p className="text-stone-700">
            This will reset all opportunities, orders, and logs back to initial seeded values.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsResetModalOpen(false)}>
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
