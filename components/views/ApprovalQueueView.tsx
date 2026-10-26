'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import { Clock, CheckCircle2, XCircle, Shield, AlertTriangle } from 'lucide-react';

export function ApprovalQueueView() {
  const { approvals, approveApprovalItem, denyApprovalItem } = useHeliumStore();

  const pendingItems = approvals.filter((a) => a.status === 'pending');
  const pastItems = approvals.filter((a) => a.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Human-in-the-Loop Approval Queue
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Medium-risk actions paused at the Gateway (Risk 30–60). Operators review context before permitting execution.
        </p>
      </div>

      {/* Pending Items Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>Pending Authorization</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px]">
              {pendingItems.length}
            </span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Gateway Policy SLA: 5 mins</span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Approval Queue Clear
            </h4>
            <p className="text-xs max-w-sm mx-auto">
              No autonomous agent requests are currently paused for human operator sign-off.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.agentName}
                    </span>
                    <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">
                      Risk: {item.riskScore}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-amber-700 dark:text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SLA: 04:38 remaining</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                    Requested Operation
                  </span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-medium">
                    {item.action}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Gateway Reason:</strong> {item.explanation}
                </div>

                {/* Approve / Deny Real Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200 dark:border-amber-900/40">
                  <button
                    onClick={() => denyApprovalItem(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 text-xs font-medium transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Deny & Drop Action</span>
                  </button>

                  <button
                    onClick={() => approveApprovalItem(item.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Resume Operation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Resolved Queue */}
      {pastItems.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Resolved In-Flight Interventions
          </h3>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Agent</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Risk Score</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {pastItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-slate-100">
                      {item.agentName}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300">
                      {item.action}
                    </td>
                    <td className="px-4 py-2.5 font-mono">{item.riskScore}/100</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
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
  );
}
