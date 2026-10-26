'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import { RadarChart } from '@/components/RadarChart';
import { Sparkline } from '@/components/Sparkline';
import {
  X,
  Shield,
  ShieldAlert,
  RotateCcw,
  KeyRound,
  Trash2,
  Share2,
  CheckCircle,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export function AgentDetailDrawer() {
  const {
    selectedAgentId,
    setSelectedAgentId,
    agents,
    setAgentStatus,
    rotateAgentCredentials,
    resetAgentContext,
    reassignAgentWork,
    setActiveTab,
  } = useHeliumStore();

  if (!selectedAgentId) return null;

  const agent = agents.find((a) => a.id === selectedAgentId);
  if (!agent) return null;

  // Multi-detector signals for radar chart
  const radarSignals = [
    { label: 'Role Scope', value: agent.status === 'normal' ? 0.08 : 0.88 },
    { label: 'Stat Vol', value: agent.status === 'normal' ? 0.15 : 0.75 },
    { label: 'Markov Seq', value: agent.status === 'normal' ? 0.1 : 0.65 },
    { label: 'Taint Tag', value: agent.status === 'isolated' || agent.status === 'safe_mode' ? 0.95 : 0.05 },
    { label: 'Peer Cohort', value: agent.status === 'normal' ? 0.12 : 0.7 },
    { label: 'Chain Lineage', value: agent.status === 'normal' ? 0.05 : 0.8 },
    { label: 'Long Drift', value: agent.status === 'normal' ? 0.1 : 0.55 },
    { label: 'Honeytoken', value: agent.safeModeDetails?.quarantineReason?.includes('decoy') ? 1.0 : 0.0 },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
            {agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {agent.name}
              </h3>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                  agent.status === 'isolated'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    : agent.status === 'safe_mode'
                    ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                    : agent.status === 'watch'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {agent.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs text-slate-400">{agent.owner}</div>
          </div>
        </div>

        <button
          onClick={() => setSelectedAgentId(null)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Trust Score & Sparkline Banner */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Trust Score (0-100)</div>
            <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
              {agent.trustScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {agent.trustScore >= 90
                ? 'High trust: nominal role adherence'
                : agent.trustScore >= 70
                ? 'Moderate: tighter threshold gating'
                : 'Degraded: strict perimeter watch'}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block mb-1">12-Event Trend</span>
            <Sparkline data={agent.trustHistory} width={100} height={32} />
          </div>
        </div>

        {/* Assigned Task & Last Action */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Assigned Semantic Task
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {agent.assignedTask}
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Last Executed Action
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {agent.lastAction}
            </span>
          </div>
        </div>

        {/* Radar Chart: Baseline vs Observed */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Detector Profile vs Golden Baseline
          </h4>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex justify-center">
            <RadarChart currentSignals={radarSignals} size={220} />
          </div>
        </div>

        {/* Declared Role Profile */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Declared Policy Capabilities
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Allowed Tools</span>
              <div className="flex flex-wrap gap-1">
                {agent.allowedTools.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Allowed Domains</span>
              <div className="flex flex-wrap gap-1">
                {agent.allowedDomains.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Outbound Destinations</span>
              <div className="flex flex-wrap gap-1">
                {agent.allowedDestinations.map((dst) => (
                  <span
                    key={dst}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    {dst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Working Containment & Remediation Actions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Containment & Recovery Actions
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setAgentStatus(agent.id, 'safe_mode', 'Manual Safe Mode initiated')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/60 font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Put in Safe Mode</span>
            </button>

            <button
              onClick={() => setAgentStatus(agent.id, 'isolated', 'Manual isolation containment')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-medium transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Isolate Agent</span>
            </button>

            <button
              onClick={() => setAgentStatus(agent.id, 'normal', 'Restored to normal')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Restore Status</span>
            </button>

            <button
              onClick={() => rotateAgentCredentials(agent.id)}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Rotate Credentials</span>
            </button>

            <button
              onClick={() => resetAgentContext(agent.id)}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors col-span-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Context (Purge Prompt Injections)</span>
            </button>

            <button
              onClick={() => {
                const target = agents.find((a) => a.id !== agent.id && a.status === 'normal');
                if (target) reassignAgentWork(agent.id, target.id);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 font-medium transition-colors col-span-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reassign In-Flight Work to Clean Agent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
