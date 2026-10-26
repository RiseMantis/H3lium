'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import { SCENARIOS } from '@/lib/seed-data';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Shield,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';

export function AttackLabView() {
  const {
    activeScenarioId,
    setActiveScenario,
    scenarioCurrentStepIndex,
    scenarioPlaying,
    stepScenario,
    playScenario,
    pauseScenario,
    resetScenario,
    protectionEnabled,
    setProtectionEnabled,
    simulationSpeed,
    setSimulationSpeed,
    pipelineStage,
    events,
    agents,
  } = useHeliumStore();

  const currentScenario =
    SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const currentStep = currentScenario.steps[scenarioCurrentStepIndex];
  const isCompleted = scenarioCurrentStepIndex >= currentScenario.steps.length;

  // Recent scenario events
  const scenarioEvents = events.slice(0, scenarioCurrentStepIndex);
  const peakRisk = scenarioEvents.reduce((max, e) => Math.max(max, e.riskScore), 0);
  const highestDecision = scenarioEvents.some((e) => e.decision === 'isolated')
    ? 'isolated'
    : scenarioEvents.some((e) => e.decision === 'restricted')
    ? 'restricted'
    : scenarioEvents.some((e) => e.decision === 'stepped_up')
    ? 'stepped_up'
    : 'observed';

  const pipelineStages = [
    { id: 'agent', label: 'Agent Runtime', desc: 'Tool invocation' },
    { id: 'gateway', label: 'Policy Gateway', desc: 'FastAPI / JWT boundary' },
    { id: 'telemetry', label: 'Telemetry Stream', desc: 'Redis Streams broker' },
    { id: 'detectors', label: '8 Detectors', desc: 'Parallel signal eval' },
    { id: 'scorer', label: 'Risk Scorer', desc: 'Taint & trust weighted' },
    { id: 'response', label: 'Response Ladder', desc: 'Minimal containment' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Threat Scenario Selector & Protection Master Switch */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div className="w-full lg:w-auto flex-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Active Threat Simulation Scenario
          </label>
          <select
            value={activeScenarioId}
            onChange={(e) => setActiveScenario(e.target.value as any)}
            className="w-full lg:w-96 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            {SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentScenario.tagline}
          </div>
        </div>

        {/* Protection On/Off Big Switch - Key Demo Toggle */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 self-stretch lg:self-auto justify-between lg:justify-start">
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              H3lium Protection Gateway
            </div>
            <div className="text-[11px] text-slate-400">
              {protectionEnabled ? 'Contained at perimeter' : 'Adversary bypasses defense'}
            </div>
          </div>

          <button
            onClick={() => setProtectionEnabled(!protectionEnabled)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              protectionEnabled
                ? 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                : 'bg-rose-600 text-white hover:bg-rose-500 animate-pulse'
            }`}
          >
            {protectionEnabled ? (
              <>
                <Shield className="w-4 h-4" />
                <span>PROTECTION: ON</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>PROTECTION: OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scenario Overview Description Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Threat Scenario Architecture</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentScenario.description}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-400">
            <strong>Threat Vector:</strong> {currentScenario.threatVector}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {protectionEnabled ? (
              <>
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-teal-600 dark:text-teal-400">
                  Expected With Protection ON
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-rose-600 dark:text-rose-400">
                  Damage Outcome (Protection OFF)
                </span>
              </>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {protectionEnabled
              ? currentScenario.expectedOutcomeWithProtection
              : currentScenario.outcomeWithoutProtection}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            {protectionEnabled
              ? 'Minimal containment: safe mode, zero collateral workflow stoppage.'
              : 'Simulation shows live impact: records compromised, data exfiltrated.'}
          </div>
        </div>
      </div>

      {/* Interactive Simulation Controls */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Play / Step / Reset */}
        <div className="flex items-center gap-2">
          {scenarioPlaying ? (
            <button
              onClick={pauseScenario}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-xs"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={playScenario}
              disabled={isCompleted}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-xs ${
                isCompleted
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{scenarioCurrentStepIndex === 0 ? 'Start Attack' : 'Resume'}</span>
            </button>
          )}

          <button
            onClick={() => stepScenario()}
            disabled={isCompleted || scenarioPlaying}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              isCompleted || scenarioPlaying
                ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step Next Action</span>
          </button>

          <button
            onClick={() => resetScenario()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Lab</span>
          </button>
        </div>

        {/* Step Progress & Speed */}
        <div className="flex items-center gap-4 text-xs">
          <div className="font-mono text-slate-400">
            Step <span className="font-bold text-slate-900 dark:text-slate-100">{scenarioCurrentStepIndex}</span> of{' '}
            {currentScenario.steps.length}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-[11px]">
            <span className="text-slate-400 px-1">Speed:</span>
            {([0.5, 1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                  simulationSpeed === spd
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Animated Pipeline Strip */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          H3lium Evaluation Pipeline (Live Execution State)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((stage, idx) => {
            const isActive = pipelineStage === stage.id;
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500 shadow-sm ring-1 ring-teal-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>0{idx + 1}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {stage.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{stage.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario Steps Timeline */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
          Simulated Attack Sequence Steps
        </h3>

        <div className="space-y-3">
          {currentScenario.steps.map((step, idx) => {
            const isPassed = idx < scenarioCurrentStepIndex;
            const isCurrent = idx === scenarioCurrentStepIndex;
            const agent = agents.find((a) => a.id === step.agentId);

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPassed
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : isCurrent
                    ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-500/50 ring-1 ring-teal-500/30'
                    : 'bg-white dark:bg-slate-900/20 border-slate-100 dark:border-slate-850 opacity-50'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isPassed
                        ? 'bg-teal-500 text-slate-950'
                        : isCurrent
                        ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {agent?.name || step.agentId}
                      </span>
                      <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400">
                        {step.tool} → {step.resource}
                      </span>
                      {step.isAttackPayload && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          PAYLOAD
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {step.stepDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs self-end sm:self-auto shrink-0 font-mono">
                  <span className="text-slate-400">{step.destination}</span>
                  {isPassed && (
                    <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Evaluated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result Banner at Completion */}
      {isCompleted && (
        <div
          className={`p-5 rounded-xl border shadow-sm ${
            protectionEnabled
              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500/40 text-teal-900 dark:text-teal-100'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/40 text-rose-900 dark:text-rose-100'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm">
                {protectionEnabled ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span>THREAT CONTAINED: H3lium Protection Succeeded</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span>UNPROTECTED BREACH: Attack Succeeded Without H3lium</span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                {protectionEnabled
                  ? `Agent was intercepted at ${highestDecision.toUpperCase()} level. Peak risk reached ${peakRisk}/100. Credentials rotated and source quarantined before sensitive data egress.`
                  : `Adversary exploited valid agent credentials. Injected payload executed: sensitive records read and exfiltrated to external dropzone.`}
              </p>
            </div>

            <button
              onClick={() => resetScenario()}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs font-semibold shadow-xs shrink-0 hover:opacity-90"
            >
              Replay Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
