'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Lock,
  Bot,
  User,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageShell, SectionHeader, Badge, Button, EmptyState } from '@/components/ui';
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
      console.error('Failed to fetch audit logs:', err);
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
              <Badge variant="blue" dot>
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
        {/* Filter and Search Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by action, reason, target customer, or actor..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results Counter */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 self-end sm:self-auto">
              <span>Showing <strong className="text-slate-800 font-semibold">{filteredLogs.length}</strong> of {logs.length} events</span>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {/* Agent / Actor Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Source:
              </span>
              {agentFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAgentFilter(f.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                    agentFilter === f.id
                      ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Result Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Outcome:
              </span>
              {resultFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setResultFilter(f.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                    resultFilter === f.id
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content View: Desktop Table + Mobile Stacked Cards */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading audit history...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="h-6 w-6 text-slate-400" />}
            title="No audit events found"
            description="No log records matched your search query or filter selection."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setAgentFilter('ALL');
                  setResultFilter('ALL');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Source / Actor</th>
                      <th className="px-4 py-3">Action & Reason</th>
                      <th className="px-4 py-3">Impact / Value</th>
                      <th className="px-4 py-3">Policy Check</th>
                      <th className="px-4 py-3">Authorization</th>
                      <th className="px-4 py-3">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Timestamp */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {formatDate(log.timestamp)}
                        </td>

                        {/* Actor */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                            <Bot className="h-3 w-3 text-blue-600" />
                            {log.agentName}
                          </span>
                        </td>

                        {/* Action & Reason */}
                        <td className="px-4 py-3.5 max-w-sm">
                          <div className="font-bold text-slate-900">{log.actionType}</div>
                          <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {log.reason}
                          </div>
                          {log.customerName && (
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <User className="h-2.5 w-2.5 text-slate-400" />
                              Target: <strong className="text-slate-700">{log.customerName}</strong>
                            </div>
                          )}
                        </td>

                        {/* Value */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {log.amount ? (
                            <span className="font-bold text-slate-900 text-xs">
                              {formatINR(log.amount)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Policy Check */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {log.policyCheck === 'PASSED' && (
                            <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="h-3 w-3" />}>
                              Passed
                            </Badge>
                          )}
                          {log.policyCheck === 'FAILED' && (
                            <Badge variant="rose" size="sm" icon={<XCircle className="h-3 w-3" />}>
                              Failed Guard
                            </Badge>
                          )}
                          {!log.policyCheck && (
                            <Badge variant="slate" size="sm">
                              N/A
                            </Badge>
                          )}
                        </td>

                        {/* Approval */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[11px] text-slate-600 font-medium">
                            {log.approval ? log.approval.replace(/_/g, ' ') : 'System Auto'}
                          </span>
                        </td>

                        {/* Outcome */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="space-y-1">
                            {log.result === 'SUCCESS' && (
                              <Badge variant="emerald" size="sm">
                                Success
                              </Badge>
                            )}
                            {log.result === 'BLOCKED' && (
                              <Badge variant="rose" size="sm">
                                Blocked by Policy
                              </Badge>
                            )}
                            {log.result === 'FAILED' && (
                              <Badge variant="amber" size="sm">
                                Graceful Failure
                              </Badge>
                            )}
                            {log.recoveryNote && (
                              <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 mt-1 leading-snug">
                                {log.recoveryNote}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/70 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        <Bot className="h-2.5 w-2.5 text-blue-600" />
                        {log.agentName}
                      </span>
                      <div className="font-bold text-slate-900 text-xs mt-1">{log.actionType}</div>
                    </div>
                    {log.result === 'SUCCESS' && <Badge variant="emerald" size="sm">Success</Badge>}
                    {log.result === 'BLOCKED' && <Badge variant="rose" size="sm">Blocked</Badge>}
                    {log.result === 'FAILED' && <Badge variant="amber" size="sm">Failed</Badge>}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">{log.reason}</p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-slate-500">
                    <div>
                      <span className="text-slate-400 block">Timestamp:</span>
                      <span className="font-mono text-slate-700">{formatDate(log.timestamp)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Amount / Value:</span>
                      <span className="font-semibold text-slate-800">
                        {log.amount ? formatINR(log.amount) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Policy Status:</span>
                      <span className="font-medium text-slate-700">
                        {log.policyCheck || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Authorization:</span>
                      <span className="font-medium text-slate-700">
                        {log.approval ? log.approval.replace(/_/g, ' ') : 'Auto'}
                      </span>
                    </div>
                  </div>

                  {log.recoveryNote && (
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>Trace Note:</strong> {log.recoveryNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </PageShell>
    </DashboardLayout>
  );
}

