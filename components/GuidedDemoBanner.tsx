'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldAlert,
  FileSearch,
  UserCheck,
  Network,
} from 'lucide-react';

export function GuidedDemoBanner() {
  const {
    guidedDemoStep,
    nextGuidedDemoStep,
    prevGuidedDemoStep,
    exitGuidedDemo,
    agents,
  } = useHeliumStore();

  if (guidedDemoStep === null) return null;

  const procureAgent = agents.find((a) => a.id === 'agent-procure');

  const steps = [
    {
      title: 'Step 1 of 5: The Innocent Task & Untrusted Input',
      narration:
        'Procurement Agent begins routine hardware purchasing. An untrusted quotation PDF ("supplier_quote.pdf") is ingested with hidden adversarial prompt directives.',
      icon: FileSearch,
      screenName: 'Attack Lab',
    },
    {
      title: 'Step 2 of 5: Taint Detected & Role Breach Attempt',
      narration:
        'The injected instruction commands Procurement Agent to query confidential executive salaries ("hr_salary.xlsx"). H3lium flags the context taint and blocks the unauthorized database read.',
      icon: ShieldAlert,
      screenName: 'Alerts & Explainability',
    },
    {
      title: 'Step 3 of 5: Egress Interception & Agent Isolation',
      narration:
        'The poisoned agent attempts an HTTP POST exfiltration to untrusted dropzone "files-transfer-x.io". H3lium revokes its OAuth token and puts Procurement Agent into full Isolation.',
      icon: ShieldAlert,
      screenName: 'Attack Lab',
    },
    {
      title: 'Step 4 of 5: Graph Provenance & Source Quarantine',
      narration:
        'Traced to root cause in the provenance graph: "supplier_quote.pdf". The source document is quarantined, and all peer agents that touched it have elevated watch levels.',
      icon: Network,
      screenName: 'Provenance Graph',
    },
    {
      title: 'Step 5 of 5: Remediation & In-Flight Work Reassignment',
      narration:
        'Security analyst flushes the tainted context, rotates session credentials, and reassigns clean purchase orders to a healthy fallback agent.',
      icon: UserCheck,
      screenName: 'Agents Console',
    },
  ];

  const currentStep = steps[guidedDemoStep] || steps[0];
  const StepIcon = currentStep.icon;

  return (
    <div className="sticky top-[53px] z-30 w-full bg-gradient-to-r from-purple-950 via-slate-900 to-teal-950 border-b border-purple-800/40 text-white px-4 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 shrink-0">
            <StepIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-purple-200 uppercase">
                {currentStep.title}
              </span>
              <span className="text-[11px] text-purple-400 font-mono">
                [View: {currentStep.screenName}]
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug mt-0.5">
              {currentStep.narration}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {guidedDemoStep > 0 && (
            <button
              onClick={prevGuidedDemoStep}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={nextGuidedDemoStep}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-xs font-semibold"
          >
            <span>{guidedDemoStep === steps.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exitGuidedDemo}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Guided Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
