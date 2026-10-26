'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import { Agent, DetectorId } from '@/types/helium';
import {
  Sliders,
  FileCode,
  Save,
  ShieldCheck,
} from 'lucide-react';

interface AgentRoleFormProps {
  agent: Agent;
  onSave: (updates: {
    allowedTools: string[];
    allowedDomains: string[];
    allowedDestinations: string[];
    maxRateLimitPerMin: number;
  }) => void;
}

function AgentRoleForm({ agent, onSave }: AgentRoleFormProps) {
  const [tools, setTools] = useState(agent.allowedTools.join(', '));
  const [domains, setDomains] = useState(agent.allowedDomains.join(', '));
  const [destinations, setDestinations] = useState(agent.allowedDestinations.join(', '));
  const [rateLimit, setRateLimit] = useState(agent.maxRateLimitPerMin);

  const yamlPreview = `# H3lium Autonomous Agent Policy Manifest
version: "2026.1"
agent_id: "${agent.id}"
role_name: "${agent.role}"
owner: "${agent.owner}"
trust_score: ${agent.trustScore}
policy_enforcement:
  max_rate_limit_per_min: ${rateLimit}
  allowed_tools:
${tools
  .split(',')
  .map((t) => `    - "${t.trim()}"`)
  .filter((t) => t.length > 7)
  .join('\n')}
  allowed_domains:
${domains
  .split(',')
  .map((d) => `    - "${d.trim()}"`)
  .filter((d) => d.length > 7)
  .join('\n')}
  allowed_destinations:
${destinations
  .split(',')
  .map((dst) => `    - "${dst.trim()}"`)
  .filter((d) => d.length > 7)
  .join('\n')}
  golden_baseline:
    hourly_volume_envelope: ${agent.baselineHourlyVolume}
`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Interactive Form */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Role Manifest Authoring Form
          </h3>
          <p className="text-[11px] text-slate-400">Configure permissible boundaries for {agent.name}</p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">
              Allowed Tools (comma-separated)
            </label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">
              Allowed Resource Domains
            </label>
            <input
              type="text"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">
              Permitted Outbound Destinations
            </label>
            <input
              type="text"
              value={destinations}
              onChange={(e) => setDestinations(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">
              Rate Limit per Minute ({rateLimit} calls/min)
            </label>
            <input
              type="range"
              min="5"
              max="200"
              value={rateLimit}
              onChange={(e) => setRateLimit(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() =>
              onSave({
                allowedTools: tools.split(',').map((s) => s.trim()).filter(Boolean),
                allowedDomains: domains.split(',').map((s) => s.trim()).filter(Boolean),
                allowedDestinations: destinations.split(',').map((s) => s.trim()).filter(Boolean),
                maxRateLimitPerMin: rateLimit,
              })
            }
            className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Manifest & Append SHA-256 Audit Log</span>
          </button>
        </div>
      </div>

      {/* Live YAML Preview */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-xs flex flex-col">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-teal-400" />
            <span>policy_manifest.yaml (Synchronized)</span>
          </span>
          <span className="text-[10px] font-mono text-teal-400">STATUS: VALID</span>
        </div>

        <pre className="flex-1 text-[11px] font-mono text-teal-300/90 leading-relaxed overflow-x-auto p-2 bg-slate-900/60 rounded-lg border border-slate-800">
          {yamlPreview}
        </pre>
      </div>
    </div>
  );
}

export function PolicyView() {
  const {
    agents,
    detectorWeights,
    setDetectorWeight,
    thresholds,
    setThresholds,
    updateRoleProfile,
    registerAuthorizedChange,
    resources,
    toggleSessionKeyGating,
    toggleHoneytoken,
    events,
  } = useHeliumStore();

  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-procure');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Authorized Change form
  const [authAgentId, setAuthAgentId] = useState<string>('agent-procure');
  const [authTool, setAuthTool] = useState<string>('purchase_requests');
  const [authReason, setAuthReason] = useState<string>(
    'CAB-2026-8802: Inventory audit bulk reconciliation grace period'
  );

  // Live "What would have happened to the last events" calculation
  const totalEvents = events.length || 1;
  const simulatedDecisions = events.map((e) => {
    if (e.riskScore >= thresholds.restrictMax) return 'isolated';
    if (e.riskScore >= thresholds.stepUpMax) return 'restricted';
    if (e.riskScore >= thresholds.observeMax) return 'stepped_up';
    return 'observed';
  });

  const simulatedObserve = simulatedDecisions.filter((d) => d === 'observed').length;
  const simulatedStepUp = simulatedDecisions.filter((d) => d === 'stepped_up').length;
  const simulatedRestrict = simulatedDecisions.filter((d) => d === 'restricted').length;
  const simulatedIsolate = simulatedDecisions.filter((d) => d === 'isolated').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Policy Gateway & Role Manifest Editor
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dynamic policy manifest authoring, real-time threshold calibration, and authorized change window registration
        </p>
      </div>

      {/* Response Thresholds & Detector Weights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Response Ladder Threshold Sliders */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Response Ladder Thresholds
              </h3>
              <p className="text-[11px] text-slate-400">
                Calibrate risk score boundaries for automated containment actions
              </p>
            </div>
            <Sliders className="w-4 h-4 text-teal-500" />
          </div>

          <div className="space-y-3 text-xs">
            {/* Observe Threshold */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Observe Ceiling (0 to {thresholds.observeMax})
                </span>
                <span className="font-mono">{thresholds.observeMax} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={thresholds.observeMax}
                onChange={(e) =>
                  setThresholds({ ...thresholds, observeMax: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Log telemetry, raise watch tier</span>
            </div>

            {/* Step-up Threshold */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Step-Up Human Approval Ceiling ({thresholds.observeMax} to {thresholds.stepUpMax})
                </span>
                <span className="font-mono">{thresholds.stepUpMax} pts</span>
              </div>
              <input
                type="range"
                min="40"
                max="75"
                value={thresholds.stepUpMax}
                onChange={(e) =>
                  setThresholds({ ...thresholds, stepUpMax: Number(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Pause specific action, send to Approval Queue with SLA
              </span>
            </div>

            {/* Restrict Threshold */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  Restrict Safe Mode Ceiling ({thresholds.stepUpMax} to {thresholds.restrictMax})
                </span>
                <span className="font-mono">{thresholds.restrictMax} pts</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={thresholds.restrictMax}
                onChange={(e) =>
                  setThresholds({ ...thresholds, restrictMax: Number(e.target.value) })
                }
                className="w-full accent-orange-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Safe Mode: block action, revoke tool, internal-only
              </span>
            </div>
          </div>

          {/* Live Preview of Last Events Distribution */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">
              Live Impact on Last {totalEvents} Evaluated Events
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                <div className="font-mono font-bold">{simulatedObserve}</div>
                <div className="text-[9px] uppercase">Observe</div>
              </div>
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                <div className="font-mono font-bold">{simulatedStepUp}</div>
                <div className="text-[9px] uppercase">Step-Up</div>
              </div>
              <div className="p-2 rounded bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300">
                <div className="font-mono font-bold">{simulatedRestrict}</div>
                <div className="text-[9px] uppercase">Restrict</div>
              </div>
              <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                <div className="font-mono font-bold">{simulatedIsolate}</div>
                <div className="text-[9px] uppercase">Isolate</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8 Detector Weights Sliders */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Detector Scoring Weights
              </h3>
              <p className="text-[11px] text-slate-400">
                Adjust sensitivity. Changes apply immediately to upcoming events.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1 text-xs">
            {(
              [
                ['role_compliance', 'Role Compliance', 'Out-of-manifest tools and domains'],
                ['taint_intent', 'Taint & Intent Check', 'Sensitive actions after untrusted ingest'],
                ['honeytoken', 'Honeytoken Tripwire', 'Canary decoy touch detection'],
                ['chain_graph', 'Chain & Lineage', 'Cross-agent suspicion propagation'],
                ['statistical_baseline', 'Statistical Baseline', 'Volume burst vs 30-day hourly rolling average'],
                ['sequence_model', 'Markov Sequence Model', 'Atypical tool invocation chains'],
                ['peer_comparison', 'Peer Cohort Distance', 'Variance from sister agents in fleet'],
                ['long_drift', 'Long-Window Drift', 'CUSUM / EWMA creeping boundary drift'],
              ] as [DetectorId, string, string][]
            ).map(([id, name, desc]) => (
              <div key={id} className="p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{name}</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    Weight: {detectorWeights[id]}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={detectorWeights[id]}
                  onChange={(e) => setDetectorWeight(id, Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-1.5"
                />
                <span className="text-[10px] text-slate-400 block">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Selector Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Selected Agent Policy Manifest
          </h3>
          <p className="text-xs text-slate-400">Author and verify role declarations</p>
        </div>

        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
        >
          {agents.map((ag) => (
            <option key={ag.id} value={ag.id}>
              {ag.name} ({ag.role})
            </option>
          ))}
        </select>
      </div>

      {/* Keyed Agent Role Form: automatically resets when selectedAgentId changes */}
      <AgentRoleForm
        key={selectedAgent.id}
        agent={selectedAgent}
        onSave={(updates) => updateRoleProfile(selectedAgent.id, updates)}
      />

      {/* Register Authorized Change & Honeytoken Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Register Authorized Change Form */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Register Authorized Change (CAB Grace Window)
              </h3>
              <p className="text-[11px] text-slate-400">
                Relaxes baseline temporarily for new tools/tasks so legitimate updates do not trigger false alarms
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Agent</label>
              <select
                value={authAgentId}
                onChange={(e) => setAuthAgentId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Newly Approved Tool / Task</label>
              <input
                type="text"
                value={authTool}
                onChange={(e) => setAuthTool(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Change Ticket & Business Rationale</label>
              <input
                type="text"
                value={authReason}
                onChange={(e) => setAuthReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>

            <button
              onClick={() => registerAuthorizedChange(authAgentId, authTool, authReason)}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Grant 24-Hour Grace Window & Suppress False Alarms
            </button>
          </div>
        </div>

        {/* Honeytoken & Session Key Gating Management */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Protected Resources & Honeytoken Decoys
              </h3>
              <p className="text-[11px] text-slate-400">
                Toggle gateway-held session keys and zero false-positive honeypots
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-xs">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{res.name}</span>
                    {res.isHoneytoken && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                        HONEYTOKEN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {res.domain} · {res.type}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleSessionKeyGating(res.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                      res.isSessionKeyGated
                        ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {res.isSessionKeyGated ? 'Gated' : 'Direct'}
                  </button>

                  <button
                    onClick={() => toggleHoneytoken(res.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                      res.isHoneytoken
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {res.isHoneytoken ? 'Decoy ON' : 'Make Decoy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
