'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  Boxes,
  Cpu,
  Layers,
  Zap,
  Server,
  Database,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ArchComponent {
  id: string;
  name: string;
  layer: string;
  productionTech: string;
  role: string;
  simulationMetric: string;
  metricValue: string | number;
}

export function ArchitectureView() {
  const { pipelineStage, events, alerts, agents, auditLog } = useHeliumStore();

  const [selectedCompId, setSelectedCompId] = useState<string>('gateway');

  const components: ArchComponent[] = [
    {
      id: 'agents',
      name: 'Autonomous AI Agents',
      layer: 'Agent Fleet Layer',
      productionTech: 'LangGraph, AutoGen, CrewAI, OpenAI Assistants API',
      role: 'Autonomous LLM-driven agents executing business logic and tool calls.',
      simulationMetric: 'Active Agent Profiles',
      metricValue: `${agents.length} Monitored`,
    },
    {
      id: 'gateway',
      name: 'Policy Gateway Interceptor',
      layer: 'Perimeter Gatekeeper',
      productionTech: 'FastAPI, Envoy Proxy, mTLS, JWT Session Keys, YAML Manifests',
      role: 'Intercepts 100% of outbound tool calls. Validates against declared role profiles.',
      simulationMetric: 'Total Interceptions',
      metricValue: `${events.length} Evaluated`,
    },
    {
      id: 'telemetry',
      name: 'Telemetry Stream Broker',
      layer: 'Data Pipeline',
      productionTech: 'Redis Streams, Apache Kafka, Protocol Buffers',
      role: 'High-throughput append-only event buffer for asynchronous parallel detector analysis.',
      simulationMetric: 'Stream Latency',
      metricValue: '< 2.4 ms',
    },
    {
      id: 'detectors',
      name: '8-Detector Anomaly Engine',
      layer: 'Detection Core',
      productionTech: 'NumPy, Scikit-learn, Ray Worker Cluster, CUSUM/EWMA Drift Models',
      role: 'Parallel evaluation of role compliance, Markov transitions, statistical baseline, taint propagation.',
      simulationMetric: 'Signals Computed',
      metricValue: `${events.length * 8} Signals`,
    },
    {
      id: 'scorer',
      name: 'Weighted Risk Scorer',
      layer: 'Decision Engine',
      productionTech: 'Go microservice / Rust Scoring Daemon',
      role: 'Calculates continuous 0-100 score, applies taint co-occurrence multipliers and agent trust coefficients.',
      simulationMetric: 'Average Risk Evaluated',
      metricValue: `${
        events.length > 0
          ? Math.round(events.reduce((a, b) => a + b.riskScore, 0) / events.length)
          : 12
      }/100`,
    },
    {
      id: 'response',
      name: 'Response Orchestrator',
      layer: 'Containment Enforcement',
      productionTech: 'Temporal.io workflow orchestrator, OAuth Token Revocation, K8s Pod Network Policies',
      role: 'Dispatches minimal containment: Step-Up, Safe Mode, or immediate Token Isolation.',
      simulationMetric: 'Active Containments',
      metricValue: `${alerts.filter((a) => a.status === 'blocked').length} Active`,
    },
    {
      id: 'evidence',
      name: 'Hash-Chained Evidence Ledger',
      layer: 'Compliance & Audit',
      productionTech: 'PostgreSQL, ImmuDB, SHA-256 Merkle Trees, WORM Storage',
      role: 'Cryptographically seals each event and decision with SHA-256 previous-block chaining.',
      simulationMetric: 'Sealed Blocks',
      metricValue: `${auditLog.length} Hashes`,
    },
  ];

  const selectedComp = components.find((c) => c.id === selectedCompId) || components[1];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-teal-500" />
          <span>Production Architecture & System Topology</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          How H3lium decouples execution from monitoring and enforces the response ladder in enterprise environments
        </p>

        <div className="mt-2.5 p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-700 dark:text-teal-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-500 shrink-0" />
          <span>
            <strong>Architectural Note:</strong> This prototype runs all deterministic scoring and containment logic in the browser. The enterprise production deployment uses the distributed stack detailed below.
          </span>
        </div>
      </div>

      {/* Main Diagram & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Architecture Flow Diagram */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white shadow-xs space-y-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Enterprise Interception & Telemetry Flow
          </div>

          {/* Architecture Blocks Flow */}
          <div className="space-y-3">
            {/* Tier 1: Agents */}
            <div
              onClick={() => setSelectedCompId('agents')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedCompId === 'agents'
                  ? 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              } ${pipelineStage === 'agent' ? 'ring-2 ring-teal-400 animate-pulse' : ''}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-100">01. Autonomous AI Agents Fleet</span>
                <span className="text-[10px] font-mono text-slate-400">CrewAI / LangGraph</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Generates tool call intents with assigned tasks.
              </p>
            </div>

            <div className="flex justify-center">
              <span className="text-[10px] font-mono text-teal-400 flex items-center gap-1">
                ↓ Outbound tool calls intercepted
              </span>
            </div>

            {/* Tier 2: Policy Gateway */}
            <div
              onClick={() => setSelectedCompId('gateway')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedCompId === 'gateway'
                  ? 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              } ${pipelineStage === 'gateway' ? 'ring-2 ring-teal-400 animate-pulse' : ''}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400">02. H3lium Policy Gateway</span>
                <span className="text-[10px] font-mono text-slate-400">FastAPI / Envoy / mTLS</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gating proxy held between agents and tools. Emits telemetry stream & gates token issuance.
              </p>
            </div>

            {/* Split Stream: Telemetry & Tools */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div
                onClick={() => setSelectedCompId('telemetry')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedCompId === 'telemetry'
                    ? 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                } ${pipelineStage === 'telemetry' ? 'ring-2 ring-teal-400 animate-pulse' : ''}`}
              >
                <div className="text-xs font-bold text-indigo-400">03. Telemetry Stream</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Redis Streams</div>
              </div>

              <div
                onClick={() => setSelectedCompId('detectors')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedCompId === 'detectors'
                    ? 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                } ${pipelineStage === 'detectors' ? 'ring-2 ring-teal-400 animate-pulse' : ''}`}
              >
                <div className="text-xs font-bold text-purple-400">04. 8-Detector Engine</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Ray Parallel Workers</div>
              </div>
            </div>

            {/* Risk Scorer & Orchestrator */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedCompId('scorer')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedCompId === 'scorer'
                    ? 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                } ${pipelineStage === 'scorer' ? 'ring-2 ring-teal-400 animate-pulse' : ''}`}
              >
                <div className="text-xs font-bold text-amber-400">05. Risk Scorer</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Go Daemon / Trust Adjusted</div>
              </div>

              <div
                onClick={() => setSelectedCompId('response')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedCompId === 'response'
                    ? 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                } ${pipelineStage === 'response' ? 'ring-2 ring-teal-400 animate-pulse' : ''}`}
              >
                <div className="text-xs font-bold text-rose-400">06. Response Orchestrator</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Temporal.io Workflows</div>
              </div>
            </div>

            {/* Enforcement Return Loop */}
            <div className="p-3 rounded-lg border border-dashed border-teal-500/40 bg-teal-950/20 text-center text-xs text-teal-300 font-mono">
              ↺ Minimal Enforcement Returns to Gateway (Pause, Safe Mode, Token Revoke)
            </div>
          </div>
        </div>

        {/* Selected Component Inspector Panel */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Architecture Inspector
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedComp.name}
            </h3>
            <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              {selectedComp.layer}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Production Tech Stack
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold block mt-0.5">
                {selectedComp.productionTech}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Core Responsibility
              </span>
              <span className="text-slate-700 dark:text-slate-300 block mt-0.5 leading-relaxed">
                {selectedComp.role}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <span className="text-teal-600 dark:text-teal-400 block text-[10px] uppercase font-semibold">
                Live Prototype Metric ({selectedComp.simulationMetric})
              </span>
              <span className="text-xl font-bold font-mono text-teal-700 dark:text-teal-300 block mt-0.5">
                {selectedComp.metricValue}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
