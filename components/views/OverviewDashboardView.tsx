'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  Shield,
  ShieldAlert,
  Users,
  AlertTriangle,
  Clock,
  PlayCircle,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export function OverviewDashboardView() {
  const {
    agents,
    events,
    alerts,
    setSelectedEventId,
    startGuidedDemo,
    setActiveTab,
    protectionEnabled,
  } = useHeliumStore();

  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Compute live KPIs
  const totalAgents = agents.length;
  const activeAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'blocked').length;
  const blockedActions = events.filter(
    (e) => e.decision === 'restricted' || e.decision === 'isolated'
  ).length;
  const avgTrustScore = Math.round(
    agents.reduce((acc, a) => acc + a.trustScore, 0) / (agents.length || 1)
  );

  const nonObservedEvents = events.filter((e) => e.decision !== 'observed');
  const meanTimeToContain =
    nonObservedEvents.length > 0
      ? Math.round(
          nonObservedEvents.reduce((acc, e) => acc + e.durationMs, 0) / nonObservedEvents.length
        )
      : 14;

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (agentFilter !== 'all' && e.agentId !== agentFilter) return false;
    if (decisionFilter !== 'all' && e.decision !== decisionFilter) return false;
    if (levelFilter === 'critical' && e.riskScore < 85) return false;
    if (levelFilter === 'high' && (e.riskScore < 60 || e.riskScore >= 85)) return false;
    if (levelFilter === 'medium' && (e.riskScore < 30 || e.riskScore >= 60)) return false;
    if (levelFilter === 'low' && e.riskScore >= 30) return false;
    return true;
  });

  // Risk Score Timeline Data (Last 12 events reversed for chronological left-to-right)
  const timelineEvents = [...events].slice(0, 14).reverse();

  // Detector fire counts
  const detectorCounts: Record<string, number> = {};
  alerts.forEach((alt) => {
    alt.factors.forEach((f) => {
      if (f.signal > 0.4) {
        detectorCounts[f.name] = (detectorCounts[f.name] || 0) + 1;
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner: The Core Security Thesis */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 p-6 text-white shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>CONTINUOUS INTENT & ROLE BOUNDARY ENFORCEMENT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            &ldquo;Allowed is not the same as appropriate.&rdquo;
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Conventional security tools only check if an autonomous AI agent possesses a valid credential badge.
            H3lium inspects whether each individual tool invocation fits the agent&apos;s declared role and assigned task
            across multi-agent lineages, responding with the minimal required containment.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={startGuidedDemo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Guided Incident Walkthrough</span>
            </button>

            <button
              onClick={() => setActiveTab('attack_lab')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors border border-white/10"
            >
              <span>Explore Attack Lab (6 Scenarios)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Agents Monitored</span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {totalAgents}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">8 declared profiles active</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            {activeAlerts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Requires human review</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Actions Blocked</span>
            <ShieldAlert className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400 tabular-nums">
            {blockedActions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Contained at Gateway</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Fleet Trust Score</span>
            <Shield className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
            {avgTrustScore}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Fleet rolling average</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Mean Time-To-Contain</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {meanTimeToContain}ms
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Deterministic gateway latency</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Risk Score Telemetry (Sequential Events)
              </h3>
              <p className="text-[11px] text-slate-400">
                Continuous risk scores computed at Gateway ingress
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-rose-500" /> High (60+)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-teal-500" /> Normal (&lt;30)
              </span>
            </div>
          </div>

          <div className="h-44 w-full flex items-end gap-1.5 pt-6 pb-2">
            {timelineEvents.map((evt, idx) => {
              const heightPercent = Math.max(8, evt.riskScore);
              const isHigh = evt.riskScore >= 60;
              const isMed = evt.riskScore >= 30 && evt.riskScore < 60;
              return (
                <div
                  key={evt.id || idx}
                  onClick={() => setSelectedEventId(evt.id)}
                  className="flex-1 flex flex-col items-center group cursor-pointer relative"
                  title={`${evt.agentName}: Risk ${evt.riskScore} (${evt.decision})`}
                >
                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-xs h-32 flex items-end overflow-hidden">
                    <div
                      className={`w-full transition-all group-hover:opacity-80 ${
                        isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1 group-hover:text-teal-500">
                    {evt.riskScore}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detector Signal Frequency */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
            Top Triggering Detectors
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">Signals driving containment interventions</p>

          <div className="space-y-2.5 flex-1">
            {[
              { name: 'Role Compliance', count: 4, color: 'bg-teal-500' },
              { name: 'Taint & Intent Check', count: 5, color: 'bg-rose-500' },
              { name: 'Honeytoken Tripwire', count: 2, color: 'bg-purple-500' },
              { name: 'Chain & Lineage', count: 3, color: 'bg-amber-500' },
              { name: 'Statistical Baseline', count: 2, color: 'bg-indigo-500' },
            ].map((d) => (
              <div key={d.name} className="text-xs">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{d.name}</span>
                  <span className="font-mono text-slate-400">{d.count} hits</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color}`} style={{ width: `${d.count * 18}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Response Ladders Active</span>
            <span className="font-mono text-teal-500 font-semibold">4 Tiers</span>
          </div>
        </div>
      </div>

      {/* Live Event Stream Table with Filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Live Agent Telemetry Stream
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic events ingested and evaluated by H3lium Gateway in real time
            </p>
          </div>

          {/* Filter Bars */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Agent Select */}
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Decision Select */}
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Decisions</option>
              <option value="observed">Observed</option>
              <option value="stepped_up">Stepped-up</option>
              <option value="restricted">Restricted</option>
              <option value="isolated">Isolated</option>
            </select>

            <span className="text-[11px] font-mono text-slate-400 px-1">
              ({filteredEvents.length} events)
            </span>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Agent</th>
                <th className="px-4 py-2.5">Tool & Resource</th>
                <th className="px-4 py-2.5">Destination</th>
                <th className="px-4 py-2.5">Taint</th>
                <th className="px-4 py-2.5">Risk Score</th>
                <th className="px-4 py-2.5">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {evt.agentName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                      {evt.originTask}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-teal-600 dark:text-teal-400 font-semibold">
                      {evt.tool}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {evt.resource}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {evt.destination}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {evt.taintedContext ? (
                      <span className="text-[10px] font-mono font-bold text-rose-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        TAINTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">clean</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        evt.riskScore >= 85
                          ? 'text-rose-500'
                          : evt.riskScore >= 60
                          ? 'text-orange-500'
                          : evt.riskScore >= 30
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {evt.riskScore}
                    </span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        evt.decision === 'isolated'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : evt.decision === 'restricted'
                          ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                          : evt.decision === 'stepped_up'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {evt.decision}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
