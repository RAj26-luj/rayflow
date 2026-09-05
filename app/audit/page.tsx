'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageShell, SectionHeader, Badge, Button } from '@/components/ui';
import { AuditLog } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.actionType.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase()) ||
      (l.customerName && l.customerName.toLowerCase().includes(search.toLowerCase())) ||
      l.agentName.toLowerCase().includes(search.toLowerCase());

    const matchesAgent = agentFilter === 'ALL' || l.agentName === agentFilter;
    const matchesResult = resultFilter === 'ALL' || l.result === resultFilter;

    return matchesSearch && matchesAgent && matchesResult;
  });

  const agentFilters = [
    { id: 'ALL', label: 'All Sources' },
    { id: 'Revenue Agent', label: 'Revenue Assistant' },
    { id: 'AI Buyer Agent', label: 'Buyer Assistant' },
    { id: 'Policy Guard', label: 'Policy Guard' },
  ];

  const resultFilters = [
    { id: 'ALL', label: 'All Results' },
    { id: 'SUCCESS', label: 'Success' },
    { id: 'BLOCKED', label: 'Blocked' },
    { id: 'FAILED', label: 'Failed' },
  ];

  return (
    <DashboardLayout>
      <PageShell
        header={
          <SectionHeader
            badge={
              <Badge variant="brand" dot>
                Activity & Audit Trail
              </Badge>
            }
            title="Activity & Audit"
            description="Chronological log of store events, rule evaluations, merchant approvals, and payment captures."
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="emerald" icon={<ShieldCheck className="h-3 w-3" />}>
                  Verified & Logged
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAuditLogs}
                  icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
                >
                  Refresh
                </Button>
              </div>
            }
          />
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded border border-stone-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action, reason, or customer..."
                className="w-full rounded border border-stone-300 pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <div className="flex items-center gap-1">
                {agentFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAgentFilter(f.id)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                      agentFilter === f.id
                        ? 'bg-brand-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-stone-500">Loading audit log...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 text-xs text-stone-600">
              No audit log entries match your filter.
            </div>
          ) : (
            <div className="rounded border border-stone-200 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Actor / Source</th>
                      <th className="p-3.5">Action & Rationale</th>
                      <th className="p-3.5">Value</th>
                      <th className="p-3.5">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="p-3.5">
                          <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                            {log.agentName}
                          </span>
                        </td>
                        <td className="p-3.5 max-w-md">
                          <div className="font-bold text-stone-900">{log.actionType}</div>
                          <div className="text-stone-500 text-[11px] leading-relaxed">{log.reason}</div>
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          {log.amount ? formatINR(log.amount) : '—'}
                        </td>
                        <td className="p-3.5">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            log.result === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : log.result === 'BLOCKED'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            {log.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </PageShell>
    </DashboardLayout>
  );
}
