'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  X,
  AlertTriangle,
  Shield,
  ShieldAlert,
  CheckCircle,
  RotateCcw,
  Sliders,
  History,
  FileSearch,
} from 'lucide-react';

export function AlertDetailDrawer() {
  const {
    selectedAlertId,
    setSelectedAlertId,
    alerts,
    resolveAlert,
    markFalsePositive,
    setAgentStatus,
    detectorWeights,
  } = useHeliumStore();

  const [scrubberStep, setScrubberStep] = useState<number>(2);

  if (!selectedAlertId) return null;

  const alert = alerts.find((a) => a.id === selectedAlertId);
  if (!alert) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{alert.id}</span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                alert.level === 'critical'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : alert.level === 'high'
                  ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {alert.level}
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              {alert.status}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {alert.agentName}
          </h3>
        </div>

        <button
          onClick={() => setSelectedAlertId(null)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Animated Risk Gauge & Summary */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-200 dark:text-slate-700"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke={
                  alert.riskScore >= 85
                    ? '#f43f5e'
                    : alert.riskScore >= 60
                    ? '#f97316'
                    : '#f59e0b'
                }
                strokeWidth="6"
                strokeDasharray={`${(alert.riskScore / 100) * 201} 201`}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {alert.riskScore}
              </span>
              <span className="text-[9px] block text-slate-400 -mt-1 font-mono">RISK</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {alert.summary}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {alert.recommendedResponse}
            </div>
          </div>
        </div>

        {/* Triggering Action & Baseline Deviation */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Triggering Action
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              {alert.triggeringAction}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Baseline Deviation
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {alert.baselineComparison}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Probable Root Ingestion Source
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {alert.probableSource}
            </span>
          </div>
        </div>

        {/* Blast Radius */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Blast Radius & Affected Nodes
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {alert.blastRadius.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] font-mono text-rose-700 dark:text-rose-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Weighted Factor Contribution Bar Chart */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Detector Weighted Contribution
          </h4>
          <div className="space-y-2">
            {alert.factors.map((f) => (
              <div key={f.detectorId} className="text-xs">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{f.name}</span>
                  <span className="font-mono text-slate-400">
                    Signal {(f.signal * 100).toFixed(0)}% × Wt {f.weight} = +{f.contribution} pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      f.signal > 0.5 ? 'bg-purple-600' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(100, f.signal * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Timeline Scrubber */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Attack Timeline Replay
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Scrubber: Step {scrubberStep}/3
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <input
              type="range"
              min="1"
              max="3"
              value={scrubberStep}
              onChange={(e) => setScrubberStep(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="mt-2 text-xs text-slate-700 dark:text-slate-300">
              {scrubberStep === 1 && (
                <div>
                  <strong>Phase 1:</strong> Ingestion of untrusted source artifact. Context tagged as tainted.
                </div>
              )}
              {scrubberStep === 2 && (
                <div>
                  <strong>Phase 2:</strong> Injected payload overrides role mandate; attempts unauthorized DB read.
                </div>
              )}
              {scrubberStep === 3 && (
                <div>
                  <strong>Phase 3:</strong> Outbound egress caught at Gateway; session token suspended.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tuned Weights Delta Preview (if already marked false positive) */}
        {alert.tunedWeightsDelta && (
          <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs">
            <div className="font-semibold text-teal-800 dark:text-teal-200 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-teal-500" />
              <span>Weights Automatically Re-tuned:</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-teal-700 dark:text-teal-300">
              {Object.entries(alert.tunedWeightsDelta).map(([det, val]) => (
                <div key={det}>
                  {det}: {val.before} → {val.after} (-{val.before - val.after} pts)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Analyst Decision Controls
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => resolveAlert(alert.id, 'approved')}
              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-medium transition-colors"
            >
              Approve & Clear
            </button>

            <button
              onClick={() => resolveAlert(alert.id, 'blocked')}
              className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-medium transition-colors"
            >
              Confirm Block
            </button>

            <button
              onClick={() => markFalsePositive(alert.id)}
              className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 font-medium transition-colors col-span-2 flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Mark False Positive (Re-tune Detector Weights)</span>
            </button>

            <button
              onClick={() => setAgentStatus(alert.agentId, 'safe_mode', 'Containment from Alert')}
              className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 font-medium transition-colors"
            >
              Put in Safe Mode
            </button>

            <button
              onClick={() => setAgentStatus(alert.agentId, 'isolated', 'Containment from Alert')}
              className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 hover:bg-rose-200 font-medium transition-colors"
            >
              Isolate Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
