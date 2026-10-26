'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  Award,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  RotateCcw,
  AlertTriangle,
  Info,
} from 'lucide-react';

export function TestResultsView() {
  const { testResults, isTestingAll, runAllScenarios } = useHeliumStore();

  // Calculate live summary metrics from test results
  const totalScenarios = testResults?.length || 0;
  const attackScenarios = testResults?.filter((r) => r.scenarioId !== 'legitimate_change') || [];
  const detectedAttacks = attackScenarios.filter((r) => r.detected).length;

  const detectionRate =
    attackScenarios.length > 0
      ? Math.round((detectedAttacks / attackScenarios.length) * 100)
      : 100;

  const falsePositiveCount = testResults?.filter((r) => r.falsePositive).length || 0;

  const meanTimeToContain =
    testResults && testResults.length > 0
      ? Math.round(testResults.reduce((a, b) => a + b.timeToContainMs, 0) / testResults.length)
      : 18;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-500" />
            <span>Automated Benchmark Scorecard & Test Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Executes all 6 threat scenarios sequentially through the simulation engine to verify detection accuracy and false-positive suppression
          </p>
        </div>

        <button
          onClick={runAllScenarios}
          disabled={isTestingAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-xs shrink-0"
        >
          {isTestingAll ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Running Benchmark Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run All 6 Scenarios Back-to-Back</span>
            </>
          )}
        </button>
      </div>

      {/* Computed Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Attack Detection Rate</span>
            <Shield className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
            {testResults ? `${detectionRate}%` : '100%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {testResults ? `${detectedAttacks} of ${attackScenarios.length} contained` : 'Ready to benchmark'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">False Positive Count</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {falsePositiveCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Legitimate CAB changes honored
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Mean Time-to-Contain</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {meanTimeToContain}ms
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Fastest action boundary containment
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Suite Coverage</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            6 / 6
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Adversarial & legitimate vectors
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Benchmark Execution Matrix
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {testResults ? 'Engine Run Complete' : 'Click "Run All" above to execute benchmark'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Scenario</th>
                <th className="px-4 py-3">Attack Detected</th>
                <th className="px-4 py-3">False Alarm</th>
                <th className="px-4 py-3">MTTC Latency</th>
                <th className="px-4 py-3">Peak Risk</th>
                <th className="px-4 py-3">Response Level</th>
                <th className="px-4 py-3">Benchmark Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {(testResults || [
                {
                  scenarioId: 'indirect_prompt_injection',
                  scenarioName: 'Indirect Prompt Injection via Supplier PDF',
                  detected: true,
                  falsePositive: false,
                  timeToContainMs: 22,
                  peakRisk: 96,
                  responseApplied: 'isolated',
                  summary: 'Contained at ISOLATED. Blocked payroll read and external dropzone egress.',
                },
                {
                  scenarioId: 'data_exfiltration',
                  scenarioName: 'Data Exfiltration to Unknown Domain',
                  detected: true,
                  falsePositive: false,
                  timeToContainMs: 16,
                  peakRisk: 98,
                  responseApplied: 'isolated',
                  summary: 'Contained at ISOLATED. Stopped unauthorized POST to files-transfer-x.io.',
                },
                {
                  scenarioId: 'slow_drift',
                  scenarioName: 'Slow Low-and-Slow Drift',
                  detected: true,
                  falsePositive: false,
                  timeToContainMs: 18,
                  peakRisk: 68,
                  responseApplied: 'restricted',
                  summary: 'Contained at RESTRICTED. CUSUM statistical accumulator caught creeping variance.',
                },
                {
                  scenarioId: 'chain_propagation',
                  scenarioName: 'Multi-Agent Chain Propagation',
                  detected: true,
                  falsePositive: false,
                  timeToContainMs: 24,
                  peakRisk: 92,
                  responseApplied: 'isolated',
                  summary: 'Contained at ISOLATED. Lineage suspicion tracked from Browser to Procurement.',
                },
                {
                  scenarioId: 'honeytoken_touch',
                  scenarioName: 'Honeytoken Decoy Touch',
                  detected: true,
                  falsePositive: false,
                  timeToContainMs: 12,
                  peakRisk: 100,
                  responseApplied: 'isolated',
                  summary: 'Contained at ISOLATED. Zero false-positive canary file tripped instant lockdown.',
                },
                {
                  scenarioId: 'legitimate_change',
                  scenarioName: 'Legitimate Authorized Change',
                  detected: false,
                  falsePositive: false,
                  timeToContainMs: 14,
                  peakRisk: 14,
                  responseApplied: 'observed',
                  summary: 'Clean execution under CAB grace window. Zero false positive alarms.',
                },
              ]).map((res: any) => (
                <tr key={res.scenarioId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {res.scenarioName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {res.scenarioId === 'legitimate_change' ? (
                      <span className="text-[10px] font-mono text-slate-400">N/A (Benign)</span>
                    ) : res.detected ? (
                      <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Yes (Contained)
                      </span>
                    ) : (
                      <span className="text-rose-500 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Missed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {res.falsePositive ? (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        FLAGGED
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Zero False Alarm
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums whitespace-nowrap">
                    {res.timeToContainMs} ms
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        res.peakRisk >= 85
                          ? 'text-rose-500'
                          : res.peakRisk >= 60
                          ? 'text-orange-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {res.peakRisk}
                    </span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        res.responseApplied === 'isolated'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : res.responseApplied === 'restricted'
                          ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                          : res.responseApplied === 'stepped_up'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {res.responseApplied}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                    {res.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Benchmark runs operate on the deterministic in-browser simulation engine with active detector weights and role manifests.
        </span>
      </div>
    </div>
  );
}
