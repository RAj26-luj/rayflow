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

  return (
    <DashboardLayout>
      <PageShell
        header={
          <SectionHeader
            badge={
              <Badge variant="brand" dot>
                Activity Log
              </Badge>
            }
            title="Activity"
            description="Log of store actions, approvals, and payment records."
            actions={
              <div className="flex items-center gap-2.5">
                <Badge variant="emerald" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                  Logged
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchAuditLogs}
                  icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
                  className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                >
                  Refresh
                </Button>
              </div>
            }
          />
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800/80 shadow-xl backdrop-blur-xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action, reason, or customer..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <div className="flex items-center gap-1.5">
                {agentFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAgentFilter(f.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                      agentFilter === f.id
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-950/50'
                        : 'bg-zinc-950/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-400 animate-pulse">Loading audit log...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/80 rounded-3xl border border-zinc-800 p-8 text-xs text-zinc-300 shadow-xl backdrop-blur-xl">
              No audit log entries match your filter.
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/80 shadow-xl backdrop-blur-xl overflow-hidden text-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800/80 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Actor / Source</th>
                      <th className="p-4">Action & Rationale</th>
                      <th className="p-4">Value</th>
                      <th className="p-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4 text-zinc-400 font-mono text-[11px]">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="p-4">
                          <span className="rounded-full bg-violet-950/80 border border-violet-800/60 px-2.5 py-0.5 text-[10px] font-bold text-violet-300">
                            {log.agentName}
                          </span>
                        </td>
                        <td className="p-4 max-w-md">
                          <div className="font-bold text-white">{log.actionType}</div>
                          <div className="text-zinc-400 text-[11px] leading-relaxed mt-0.5">{log.reason}</div>
                        </td>
                        <td className="p-4 font-bold text-white font-mono">
                          {log.amount ? formatINR(log.amount) : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur-md ${
                            log.result === 'SUCCESS'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                              : log.result === 'BLOCKED'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
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
