'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Bot,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
      (l.customerName && l.customerName.toLowerCase().includes(search.toLowerCase()));

    const matchesAgent = agentFilter === 'ALL' || l.agentName === agentFilter;
    const matchesResult = resultFilter === 'ALL' || l.result === resultFilter;

    return matchesSearch && matchesAgent && matchesResult;
  });

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Compliance & Safety Verification
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Autonomous Agent Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Immutable ledger of every AI decision, policy verification outcome, approval gate, and payment event.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3 py-1.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5 shadow-2xs">
              <Lock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Verifiable Ledger</span>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
              title="Refresh audit log"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit records by action, reason, or actor..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Agent:</span>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Agents</option>
                <option value="Revenue Agent">Revenue Agent</option>
                <option value="AI Buyer Agent">AI Buyer Agent</option>
                <option value="Policy Guard">Policy Guard</option>
              </select>
            </div>

            <div className="flex-1 sm:flex-none flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Result:</span>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Results</option>
                <option value="SUCCESS">Success</option>
                <option value="BLOCKED">Blocked</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Agent / Actor</th>
                  <th className="px-4 py-3.5">Action & Target</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Policy Check</th>
                  <th className="px-4 py-3.5">Approval</th>
                  <th className="px-4 py-3.5">Result & Recovery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Timestamp */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatDate(log.timestamp)}
                    </td>

                    {/* Agent Name */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                        {log.agentName}
                      </span>
                    </td>

                    {/* Action & Reason */}
                    <td className="px-4 py-4 max-w-sm">
                      <div className="font-bold text-slate-900">{log.actionType}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                        {log.reason}
                      </div>
                      {log.customerName && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Target: <strong className="text-slate-700">{log.customerName}</strong>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {log.amount ? (
                        <span className="font-bold text-slate-900 text-sm">
                          {formatINR(log.amount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Policy Check */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {log.policyCheck === 'PASSED' && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[11px] font-semibold border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Passed ✓
                        </span>
                      )}
                      {log.policyCheck === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-50 text-red-800 px-2 py-0.5 text-[11px] font-semibold border border-red-200">
                          <XCircle className="h-3 w-3" />
                          Failed ✗
                        </span>
                      )}
                    </td>

                    {/* Approval */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-[11px] text-slate-600 font-medium">
                        {log.approval.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Result & Recovery */}
                    <td className="px-4 py-4 max-w-xs">
                      <div className="space-y-1">
                        {log.result === 'SUCCESS' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold border border-emerald-200">
                            Success
                          </span>
                        )}
                        {log.result === 'BLOCKED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-800 px-2.5 py-0.5 text-[11px] font-bold border border-red-200">
                            Blocked
                          </span>
                        )}
                        {log.result === 'FAILED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 px-2.5 py-0.5 text-[11px] font-bold border border-amber-200">
                            Failed Gracefully
                          </span>
                        )}

                        {log.recoveryNote && (
                          <div className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100 mt-1 leading-snug">
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
      </div>
    </DashboardLayout>
  );
}
