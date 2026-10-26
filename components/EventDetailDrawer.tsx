'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import { X, ShieldAlert, CheckCircle, Clock, Link2, Database, Globe, ArrowRight } from 'lucide-react';

export function EventDetailDrawer() {
  const { selectedEventId, setSelectedEventId, events } = useHeliumStore();

  if (!selectedEventId) return null;

  const event = events.find((e) => e.id === selectedEventId);
  if (!event) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{event.id}</span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                event.decision === 'isolated'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : event.decision === 'restricted'
                  ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                  : event.decision === 'stepped_up'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {event.decision}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {event.agentName}
          </h3>
        </div>

        <button
          onClick={() => setSelectedEventId(null)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Risk Score & Gateway Verdict */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Calculated Risk Score
            </span>
            <span
              className={`text-lg font-bold font-mono ${
                event.riskScore >= 85
                  ? 'text-rose-500'
                  : event.riskScore >= 60
                  ? 'text-orange-500'
                  : event.riskScore >= 30
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              {event.riskScore}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
            {event.explanation}
          </p>

          {event.protectionBypassed && (
            <div className="mt-3 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              <strong>ATTACK BYPASSED GATEWAY:</strong> Protection was disabled.
              {event.damageCaused?.impactSummary}
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Timestamp</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Origin Task</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
              {event.originTask}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Tool Executed</span>
            <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">
              {event.tool}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Target Resource</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {event.resource} ({event.resourceDomain})
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Destination</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{event.destination}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Volume / Latency</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {event.volume} records · {event.durationMs}ms
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Tainted Context Tag</span>
            <span
              className={`font-semibold ${
                event.taintedContext ? 'text-rose-500' : 'text-emerald-500'
              }`}
            >
              {event.taintedContext ? 'TAINTED (Untrusted Ingest)' : 'CLEAN'}
            </span>
          </div>
        </div>

        {/* Provenance Chain */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Provenance Lineage Chain
          </h4>
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
            {event.chain.map((agentId, idx) => (
              <React.Fragment key={agentId}>
                <span className="px-2 py-1 rounded bg-white dark:bg-slate-700 font-mono text-slate-700 dark:text-slate-200 shrink-0">
                  {agentId}
                </span>
                {idx < event.chain.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Detector Factor Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Detector Signals & Contributions
          </h4>
          <div className="space-y-2">
            {event.factors.map((f) => (
              <div
                key={f.detectorId}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {f.name}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      f.signal > 0.5 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    Signal: {(f.signal * 100).toFixed(0)}% (wt: {f.weight})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${
                      f.signal > 0.5 ? 'bg-rose-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, f.signal * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {f.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
