'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Filter,
  Eye,
  Search,
} from 'lucide-react';

export function AlertsView() {
  const {
    alerts,
    setSelectedAlertId,
    resolveAlert,
    markFalsePositive,
    setAgentStatus,
    agents,
  } = useHeliumStore();

  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (levelFilter !== 'all' && a.level !== levelFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (agentFilter !== 'all' && a.agentId !== agentFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Security Alerts & Explainability
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explainable anomaly scores with multi-detector breakdowns, probable taint sources, and blast-radius tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Severity Levels</option>
            <option value="critical">Critical (85+ / Canary)</option>
            <option value="high">High (60-85)</option>
            <option value="medium">Medium (30-60)</option>
            <option value="low">Low (Observe)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="blocked">Blocked</option>
            <option value="approved">Approved</option>
            <option value="false_positive">False Positive</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Agents</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center text-slate-400 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No Security Alerts Matching Filters
          </h3>
          <p className="text-xs max-w-sm mx-auto">
            Run an attack scenario from the Attack Lab or execute the full test suite to generate simulated intrusions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlertId(alert.id)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      alert.level === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : alert.level === 'high'
                        ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {alert.level}
                  </span>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {alert.agentName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    Risk {alert.riskScore}/100
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    {alert.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {alert.summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                    Action
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                    {alert.triggeringAction}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                    Probable Origin
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium truncate block">
                    {alert.probableSource}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Blast radius:</span>
                  <div className="flex flex-wrap gap-1">
                    {alert.blastRadius.map((b) => (
                      <span
                        key={b}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => resolveAlert(alert.id, 'approved')}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-medium text-[11px]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => markFalsePositive(alert.id)}
                    className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-medium text-[11px] flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>False Positive (Calibrate)</span>
                  </button>
                  <button
                    onClick={() => setSelectedAlertId(alert.id)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-medium text-[11px]"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
