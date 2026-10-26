'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import { formatHash } from '@/lib/crypto-chain';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  RotateCcw,
  Download,
  Search,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function AuditLogView() {
  const {
    auditLog,
    verifyAuditIntegrity,
    simulateTamperAudit,
    repairAuditDemo,
  } = useHeliumStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    brokenIndex?: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Filtered rows
  const filteredLog = auditLog.filter((entry) => {
    const matchSearch =
      entry.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.actionType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAction = filterAction === 'all' || entry.actionType.includes(filterAction);
    return matchSearch && matchAction;
  });

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    await new Promise((r) => setTimeout(r, 200));
    const result = await verifyAuditIntegrity();
    setVerificationResult(result);
    setIsVerifying(false);
  };

  // Real Export to JSON file download
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `h3lium_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Real Export to CSV file download
  const handleExportCsv = () => {
    const headers = ['Index', 'Timestamp', 'ActionType', 'Target', 'Actor', 'Details', 'PrevHash', 'Hash'];
    const rows = auditLog.map((e) => [
      e.index,
      `"${e.timestamp}"`,
      `"${e.actionType}"`,
      `"${e.target.replace(/"/g, '""')}"`,
      `"${e.actor.replace(/"/g, '""')}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      `"${e.prevHash}"`,
      `"${e.hash}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `h3lium_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* View Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-500" />
            <span>Cryptographic SHA-256 Hash-Chained Audit Ledger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable proof of every policy evaluation, containment action, and operator intervention
          </p>
        </div>

        {/* Audit Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isVerifying ? 'Computing Hashes...' : 'Verify Chain Integrity'}</span>
          </button>

          <button
            onClick={simulateTamperAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-semibold transition-colors"
            title="Alters a random past row in the ledger to demonstrate cryptographic detection"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Simulate Tampering</span>
          </button>

          <button
            onClick={repairAuditDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repair Ledger Demo</span>
          </button>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={handleExportJson}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              title="Download Ledger as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCsv}
              className="px-2 py-1 rounded-md text-[11px] font-mono hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            verificationResult.isValid
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/50 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            )}
            <span>
              {verificationResult.isValid
                ? `Cryptographic Consensus Verified: All ${auditLog.length} SHA-256 block hashes valid. Zero tampering detected.`
                : `TAMPERING DETECTED AT ROW #${verificationResult.brokenIndex}! Previous hash pointer does not match recomputed SHA-256 digest.`}
            </span>
          </div>

          <button
            onClick={() => setVerificationResult(null)}
            className="text-[11px] font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Action Filters */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hash, target, actor, action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
        >
          <option value="all">All Action Types</option>
          <option value="AGENT">Agent Actions</option>
          <option value="ACTION">Action Approvals/Blocks</option>
          <option value="ROLE">Role Profile Updates</option>
          <option value="CHANGE">CAB Authorized Changes</option>
        </select>
      </div>

      {/* Hash-Chained Log Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-sans">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Prev Hash (SHA-256)</th>
                <th className="px-4 py-3">Block Hash</th>
                <th className="px-4 py-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLog.map((entry) => {
                const isTampered = entry.tampered === true;
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isTampered
                        ? 'bg-rose-500/15 text-rose-800 dark:text-rose-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-slate-400">
                      {entry.index}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isTampered
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400'
                        }`}
                      >
                        {entry.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {entry.target}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {entry.actor}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {formatHash(entry.prevHash)}
                    </td>
                    <td
                      className={`px-4 py-3 text-[11px] font-bold whitespace-nowrap ${
                        isTampered ? 'text-rose-500 underline' : 'text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      {formatHash(entry.hash)}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs max-w-sm truncate text-slate-600 dark:text-slate-300">
                      {entry.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
