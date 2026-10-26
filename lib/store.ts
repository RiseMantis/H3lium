import { create } from 'zustand';
import {
  Agent,
  Resource,
  SimulatedEvent,
  Alert,
  ApprovalItem,
  AuditLogEntry,
  DetectorId,
  ScenarioId,
  ScenarioRunResult,
  ToastMessage,
  AgentStatus,
} from '@/types/helium';
import {
  SEED_AGENTS,
  SEED_RESOURCES,
  INITIAL_DETECTOR_WEIGHTS,
  INITIAL_THRESHOLDS,
  SCENARIOS,
} from '@/lib/seed-data';
import { evaluateAgentAction, runScenarioEvaluation } from '@/lib/simulation-engine';
import { computeSha256 } from '@/lib/crypto-chain';

export type TabType =
  | 'dashboard'
  | 'agents'
  | 'attack_lab'
  | 'alerts'
  | 'approvals'
  | 'graph'
  | 'policy'
  | 'audit'
  | 'architecture'
  | 'test_results';

export type PipelineStage =
  | 'idle'
  | 'agent'
  | 'gateway'
  | 'telemetry'
  | 'detectors'
  | 'scorer'
  | 'response';

interface HeliumState {
  theme: 'dark' | 'light';
  activeTab: TabType;
  protectionEnabled: boolean;
  simulationSpeed: number; // 0.5, 1, 2, 4
  pipelineStage: PipelineStage;
  activeScenarioId: ScenarioId;
  scenarioCurrentStepIndex: number;
  scenarioPlaying: boolean;
  guidedDemoStep: number | null; // null or 0..5
  selectedAgentId: string | null;
  selectedAlertId: string | null;
  selectedEventId: string | null;
  isSearchOpen: boolean;

  agents: Agent[];
  resources: Resource[];
  events: SimulatedEvent[];
  alerts: Alert[];
  approvals: ApprovalItem[];
  auditLog: AuditLogEntry[];
  detectorWeights: Record<DetectorId, number>;
  thresholds: { observeMax: number; stepUpMax: number; restrictMax: number };
  testResults: ScenarioRunResult[] | null;
  isTestingAll: boolean;
  toasts: ToastMessage[];

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveTab: (tab: TabType) => void;
  setProtectionEnabled: (enabled: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  setSelectedAgentId: (id: string | null) => void;
  setSelectedAlertId: (id: string | null) => void;
  setSelectedEventId: (id: string | null) => void;
  setIsSearchOpen: (open: boolean) => void;

  setDetectorWeight: (id: DetectorId, weight: number) => void;
  setThresholds: (thresholds: { observeMax: number; stepUpMax: number; restrictMax: number }) => void;
  updateRoleProfile: (
    agentId: string,
    updates: {
      allowedTools: string[];
      allowedDomains: string[];
      allowedDestinations: string[];
      maxRateLimitPerMin: number;
    }
  ) => Promise<void>;
  registerAuthorizedChange: (agentId: string, tool: string, reason: string) => Promise<void>;

  setActiveScenario: (id: ScenarioId) => void;
  stepScenario: () => Promise<boolean>;
  playScenario: () => void;
  pauseScenario: () => void;
  resetScenario: (id?: ScenarioId) => void;

  runAllScenarios: () => Promise<void>;

  approveApprovalItem: (approvalId: string) => Promise<void>;
  denyApprovalItem: (approvalId: string) => Promise<void>;

  setAgentStatus: (agentId: string, status: AgentStatus, reason?: string) => Promise<void>;
  rotateAgentCredentials: (agentId: string) => Promise<void>;
  resetAgentContext: (agentId: string) => Promise<void>;
  reassignAgentWork: (fromAgentId: string, toAgentId: string) => Promise<void>;

  quarantineResource: (resourceId: string) => Promise<void>;
  toggleHoneytoken: (resourceId: string) => Promise<void>;
  toggleSessionKeyGating: (resourceId: string) => Promise<void>;

  markFalsePositive: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string, status: 'approved' | 'blocked' | 'resolved') => Promise<void>;

  verifyAuditIntegrity: () => Promise<{ isValid: boolean; brokenIndex?: number }>;
  simulateTamperAudit: () => Promise<void>;
  repairAuditDemo: () => Promise<void>;

  startGuidedDemo: () => void;
  nextGuidedDemoStep: () => void;
  prevGuidedDemoStep: () => void;
  exitGuidedDemo: () => void;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetSimulation: () => void;
}

// Initial seed events & audit log for vibrant first turn appearance
const INITIAL_EVENTS: SimulatedEvent[] = [
  {
    id: 'evt-init-1',
    timestamp: new Date(Date.now() - 360000).toISOString(),
    relativeTime: '6 mins ago',
    agentId: 'agent-codereview',
    agentName: 'Code Review Agent',
    chain: ['agent-codereview'],
    originTask: 'PR #1104 Dependency Vulnerability Verification',
    tool: 'repo_read',
    resource: 'repos',
    resourceDomain: 'repos',
    destination: 'internal',
    volume: 12,
    inputTrust: 'trusted',
    taintedContext: false,
    decision: 'observed',
    riskScore: 6,
    factors: [
      {
        detectorId: 'role_compliance',
        name: 'Role Compliance',
        signal: 0,
        weight: 28,
        contribution: 0,
        reason: 'Within declared static analysis role boundaries.',
      },
    ],
    durationMs: 14,
    explanation: 'Code Review Agent verified repo files. Action observed normally.',
  },
  {
    id: 'evt-init-2',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    relativeTime: '4 mins ago',
    agentId: 'agent-procure',
    agentName: 'Procurement Agent',
    chain: ['agent-procure'],
    originTask: 'Office Hardware Bulk Pricing Inquiry',
    tool: 'supplier_api',
    resource: 'supplier_catalog.csv',
    resourceDomain: 'suppliers',
    destination: 'partner-suppliers.com',
    volume: 8,
    inputTrust: 'trusted',
    taintedContext: false,
    decision: 'observed',
    riskScore: 12,
    factors: [
      {
        detectorId: 'role_compliance',
        name: 'Role Compliance',
        signal: 0,
        weight: 28,
        contribution: 0,
        reason: 'Matches supplier pricing whitelist.',
      },
    ],
    durationMs: 18,
    explanation: 'Procurement Agent requested catalog pricing from partner-suppliers.com.',
  },
  {
    id: 'evt-init-3',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    relativeTime: '2 mins ago',
    agentId: 'agent-finance',
    agentName: 'Finance Agent',
    chain: ['agent-finance'],
    originTask: 'Q3 AP Invoices Reconciliation',
    tool: 'ledger_read',
    resource: 'invoices db',
    resourceDomain: 'invoices',
    destination: 'internal',
    volume: 34,
    inputTrust: 'trusted',
    taintedContext: false,
    decision: 'observed',
    riskScore: 14,
    factors: [
      {
        detectorId: 'role_compliance',
        name: 'Role Compliance',
        signal: 0,
        weight: 28,
        contribution: 0,
        reason: 'Authorized invoice ledger read.',
      },
    ],
    durationMs: 16,
    explanation: 'Finance Agent balanced open payment orders against ledger.',
  },
];

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    index: 1,
    id: 'aud-1',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actionType: 'SYSTEM_BOOT',
    target: 'H3lium Gateway',
    actor: 'Security Controller',
    details: 'H3lium Autonomous Agent Gateway initialized with 8 agents and 11 monitored resources.',
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: 'a94f82c31e7845b198302de854728d8412854910248fca8b99148d849204bf12',
  },
  {
    index: 2,
    id: 'aud-2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actionType: 'POLICY_SYNC',
    target: 'Procurement Agent',
    actor: 'Alex Chen',
    details: 'Role manifest synched with active PO limits ($50,000 threshold).',
    prevHash: 'a94f82c31e7845b198302de854728d8412854910248fca8b99148d849204bf12',
    hash: 'b1498ec5103984af99581cba9045812958472901458dcba91849104859012356',
  },
  {
    index: 3,
    id: 'aud-3',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actionType: 'CANARY_DEPLOYED',
    target: 'salary_review_2026_DRAFT.xlsx',
    actor: 'H3lium Honeypot Engine',
    details: 'Decoy honeytoken file placed in HR records directory with zero legitimate access paths.',
    prevHash: 'b1498ec5103984af99581cba9045812958472901458dcba91849104859012356',
    hash: 'c89148b591823791845182903481940182491048194819041859104819581902',
  },
];

export const useHeliumStore = create<HeliumState>((set, get) => ({
  theme: 'dark',
  activeTab: 'dashboard',
  protectionEnabled: true,
  simulationSpeed: 1,
  pipelineStage: 'idle',
  activeScenarioId: 'indirect_prompt_injection',
  scenarioCurrentStepIndex: 0,
  scenarioPlaying: false,
  guidedDemoStep: null,
  selectedAgentId: null,
  selectedAlertId: null,
  selectedEventId: null,
  isSearchOpen: false,

  agents: JSON.parse(JSON.stringify(SEED_AGENTS)),
  resources: JSON.parse(JSON.stringify(SEED_RESOURCES)),
  events: INITIAL_EVENTS,
  alerts: [],
  approvals: [],
  auditLog: INITIAL_AUDIT_LOG,
  detectorWeights: { ...INITIAL_DETECTOR_WEIGHTS },
  thresholds: { ...INITIAL_THRESHOLDS },
  testResults: null,
  isTestingAll: false,
  toasts: [],

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setProtectionEnabled: (enabled) => {
    const { addToast } = get();
    set({ protectionEnabled: enabled });
    addToast({
      title: enabled ? 'H3lium Protection ACTIVATED' : 'H3lium Protection DISABLED',
      description: enabled
        ? 'All actions gated by policy gateway, taint tracking, and response ladder.'
        : 'ATTACK SIMULATION: Gateway bypass active. Attacks will succeed to demonstrate damage.',
      type: enabled ? 'success' : 'warning',
    });
  },

  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  setSelectedAlertId: (id) => set({ selectedAlertId: id }),
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),

  setDetectorWeight: (id, weight) => {
    set((state) => ({
      detectorWeights: { ...state.detectorWeights, [id]: weight },
    }));
  },

  setThresholds: (thresholds) => set({ thresholds }),

  updateRoleProfile: async (agentId, updates) => {
    const { agents, auditLog, addToast } = get();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedAgents = agents.map((a) =>
      a.id === agentId
        ? {
            ...a,
            allowedTools: updates.allowedTools,
            allowedDomains: updates.allowedDomains,
            allowedDestinations: updates.allowedDestinations,
            maxRateLimitPerMin: updates.maxRateLimitPerMin,
          }
        : a
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const auditPayload = `ROLE_UPDATE:${agent.name}:${JSON.stringify(updates)}:${prevHash}`;
    const newHash = await computeSha256(auditPayload);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'ROLE_PROFILE_UPDATE',
      target: agent.name,
      actor: 'Security Administrator',
      details: `Updated declared profile: ${updates.allowedTools.length} tools, ${updates.allowedDomains.length} domains.`,
      prevHash,
      hash: newHash,
    };

    set({ agents: updatedAgents, auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: 'Role Profile Updated',
      description: `${agent.name}'s policy manifest saved & audit entry chained.`,
      type: 'success',
    });
  },

  registerAuthorizedChange: async (agentId, tool, reason) => {
    const { agents, auditLog, addToast } = get();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const expires = new Date(Date.now() + 86400000).toISOString();
    const updatedAgents = agents.map((a) =>
      a.id === agentId
        ? {
            ...a,
            authorizedChange: {
              tool,
              graceWindowExpires: expires,
              approvedBy: 'Change Advisory Board (CAB-2026)',
            },
          }
        : a
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`AUTH_CHANGE:${agent.name}:${tool}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'CHANGE_REGISTERED',
      target: agent.name,
      actor: 'Change Advisory Board',
      details: `Grace window granted for tool '${tool}' (${reason}). Valid for 24h.`,
      prevHash,
      hash: newHash,
    };

    set({ agents: updatedAgents, auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: 'Authorized Change Registered',
      description: `Baseline relaxed for ${agent.name} on tool '${tool}'. False alarms suppressed.`,
      type: 'info',
    });
  },

  setActiveScenario: (id) => {
    set({
      activeScenarioId: id,
      scenarioCurrentStepIndex: 0,
      scenarioPlaying: false,
      pipelineStage: 'idle',
    });
  },

  stepScenario: async () => {
    const {
      activeScenarioId,
      scenarioCurrentStepIndex,
      agents,
      resources,
      detectorWeights,
      thresholds,
      protectionEnabled,
      events,
      alerts,
      approvals,
      auditLog,
      addToast,
    } = get();

    const scenario = SCENARIOS.find((s) => s.id === activeScenarioId);
    if (!scenario || scenarioCurrentStepIndex >= scenario.steps.length) {
      set({ scenarioPlaying: false, pipelineStage: 'idle' });
      return false;
    }

    const step = scenario.steps[scenarioCurrentStepIndex];
    const agent = agents.find((a) => a.id === step.agentId) || agents[0];

    // Pipeline Stage simulation animation
    set({ pipelineStage: 'agent' });
    await new Promise((r) => setTimeout(r, 60));
    set({ pipelineStage: 'gateway' });
    await new Promise((r) => setTimeout(r, 60));
    set({ pipelineStage: 'detectors' });
    await new Promise((r) => setTimeout(r, 60));
    set({ pipelineStage: 'scorer' });
    await new Promise((r) => setTimeout(r, 60));
    set({ pipelineStage: 'response' });

    const evaluation = evaluateAgentAction({
      agent,
      allAgents: agents,
      resources,
      weights: detectorWeights,
      thresholds,
      protectionEnabled,
      chain: step.chain,
      originTask: step.originTask,
      tool: step.tool,
      resourceName: step.resource,
      resourceDomain: step.resourceDomain,
      destination: step.destination,
      volume: step.volume,
      inputTrust: step.inputTrust,
      taintedContext: step.taintedContext,
      stepDescription: step.stepDescription,
      isAttackPayload: step.isAttackPayload,
    });

    const updatedAgents = agents.map((a) =>
      a.id === evaluation.updatedAgent.id ? evaluation.updatedAgent : a
    );

    // If stepped_up, create Approval Item
    let updatedApprovals = [...approvals];
    if (evaluation.event.decision === 'stepped_up' && protectionEnabled) {
      const approvalItem: ApprovalItem = {
        id: `appr-${Date.now()}`,
        eventId: evaluation.event.id,
        alertId: evaluation.alert?.id,
        agentId: agent.id,
        agentName: agent.name,
        action: `${step.tool} on ${step.resource}`,
        explanation: evaluation.event.explanation,
        riskScore: evaluation.event.riskScore,
        timestamp: new Date().toISOString(),
        slaSecondsLeft: 300,
        status: 'pending',
      };
      updatedApprovals = [approvalItem, ...updatedApprovals];
    }

    // Append Audit Hash
    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const auditData = `EVENT:${evaluation.event.id}:${evaluation.event.decision}:${evaluation.event.riskScore}:${prevHash}`;
    const newHash = await computeSha256(auditData);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType:
        evaluation.event.decision === 'isolated'
          ? 'AGENT_ISOLATED'
          : evaluation.event.decision === 'restricted'
          ? 'ACTION_BLOCKED'
          : evaluation.event.decision === 'stepped_up'
          ? 'ACTION_PAUSED_APPROVAL'
          : 'EVENT_OBSERVED',
      target: `${agent.name} (${step.tool})`,
      actor: 'H3lium Engine',
      details: evaluation.event.explanation,
      prevHash,
      hash: newHash,
    };

    set({
      agents: updatedAgents,
      events: [evaluation.event, ...events],
      alerts: evaluation.alert ? [evaluation.alert, ...alerts] : alerts,
      approvals: updatedApprovals,
      auditLog: [...auditLog, newAuditEntry],
      scenarioCurrentStepIndex: scenarioCurrentStepIndex + 1,
      selectedEventId: evaluation.event.id,
    });

    // Notify user with toast if critical or blocked
    if (evaluation.event.decision === 'isolated') {
      addToast({
        title: 'AGENT ISOLATED: High-Risk Threat Contained',
        description: `${agent.name} credentials suspended. Origin: ${step.resource}.`,
        type: 'error',
      });
    } else if (evaluation.event.decision === 'restricted') {
      addToast({
        title: 'Action Blocked & Agent Restricted',
        description: `${agent.name} put in Safe Mode (read-only, internal-only).`,
        type: 'warning',
      });
    } else if (evaluation.event.protectionBypassed) {
      addToast({
        title: 'UNPROTECTED ATTACK EXECUTED',
        description: evaluation.event.damageCaused?.impactSummary || 'Attack succeeded without H3lium.',
        type: 'error',
      });
    }

    if (scenarioCurrentStepIndex + 1 >= scenario.steps.length) {
      set({ scenarioPlaying: false });
    }

    return true;
  },

  playScenario: () => {
    set({ scenarioPlaying: true });
    const runNext = async () => {
      const state = get();
      if (!state.scenarioPlaying) return;
      const scenario = SCENARIOS.find((s) => s.id === state.activeScenarioId);
      if (!scenario || state.scenarioCurrentStepIndex >= scenario.steps.length) {
        set({ scenarioPlaying: false, pipelineStage: 'idle' });
        return;
      }

      await state.stepScenario();
      const delay = Math.max(350, Math.floor(1400 / state.simulationSpeed));
      setTimeout(runNext, delay);
    };
    runNext();
  },

  pauseScenario: () => {
    set({ scenarioPlaying: false, pipelineStage: 'idle' });
  },

  resetScenario: (id) => {
    const targetId = id || get().activeScenarioId;
    set({
      activeScenarioId: targetId,
      scenarioCurrentStepIndex: 0,
      scenarioPlaying: false,
      pipelineStage: 'idle',
      agents: JSON.parse(JSON.stringify(SEED_AGENTS)),
      resources: JSON.parse(JSON.stringify(SEED_RESOURCES)),
    });
  },

  runAllScenarios: async () => {
    set({ isTestingAll: true });
    const { detectorWeights, thresholds, protectionEnabled, resources } = get();

    const results: ScenarioRunResult[] = [];
    for (const scenario of SCENARIOS) {
      // Clean agents instance for deterministic benchmark run
      const freshAgents = JSON.parse(JSON.stringify(SEED_AGENTS));
      const result = runScenarioEvaluation(
        scenario,
        freshAgents,
        resources,
        detectorWeights,
        thresholds,
        protectionEnabled
      );
      results.push(result);
      await new Promise((r) => setTimeout(r, 80));
    }

    set({ testResults: results, isTestingAll: false });
    get().addToast({
      title: 'Full Benchmark Suite Complete',
      description: `Evaluated ${results.length} scenarios. Live metrics computed.`,
      type: 'success',
    });
  },

  approveApprovalItem: async (approvalId) => {
    const { approvals, alerts, agents, auditLog, addToast } = get();
    const item = approvals.find((a) => a.id === approvalId);
    if (!item) return;

    const updatedApprovals = approvals.map((a) =>
      a.id === approvalId ? { ...a, status: 'approved' as const } : a
    );

    const updatedAlerts = alerts.map((alt) =>
      alt.id === item.alertId
        ? {
            ...alt,
            status: 'approved' as const,
            resolvedBy: 'Security Reviewer',
            resolvedAt: new Date().toISOString(),
          }
        : alt
    );

    const updatedAgents = agents.map((a) =>
      a.id === item.agentId
        ? {
            ...a,
            status: 'normal' as const,
            trustScore: Math.min(100, a.trustScore + 4),
          }
        : a
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`APPROVE:${item.id}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'ACTION_APPROVED',
      target: item.action,
      actor: 'Security Operations Analyst',
      details: `Action approved following human review: ${item.explanation}`,
      prevHash,
      hash: newHash,
    };

    set({
      approvals: updatedApprovals,
      alerts: updatedAlerts,
      agents: updatedAgents,
      auditLog: [...auditLog, newAuditEntry],
    });

    addToast({
      title: 'Action Approved & Resumed',
      description: `${item.agentName}'s action executed with trust bump.`,
      type: 'success',
    });
  },

  denyApprovalItem: async (approvalId) => {
    const { approvals, alerts, auditLog, addToast } = get();
    const item = approvals.find((a) => a.id === approvalId);
    if (!item) return;

    const updatedApprovals = approvals.map((a) =>
      a.id === approvalId ? { ...a, status: 'denied' as const } : a
    );

    const updatedAlerts = alerts.map((alt) =>
      alt.id === item.alertId
        ? {
            ...alt,
            status: 'blocked' as const,
            resolvedBy: 'Security Reviewer',
            resolvedAt: new Date().toISOString(),
          }
        : alt
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`DENY:${item.id}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'ACTION_DENIED',
      target: item.action,
      actor: 'Security Operations Analyst',
      details: `Action explicitly denied by human operator: ${item.explanation}`,
      prevHash,
      hash: newHash,
    };

    set({
      approvals: updatedApprovals,
      alerts: updatedAlerts,
      auditLog: [...auditLog, newAuditEntry],
    });

    addToast({
      title: 'Action Denied and Dropped',
      description: `${item.agentName}'s request terminated by analyst.`,
      type: 'warning',
    });
  },

  setAgentStatus: async (agentId, status, reason) => {
    const { agents, auditLog, addToast } = get();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedAgents = agents.map((a) =>
      a.id === agentId
        ? {
            ...a,
            status,
            safeModeDetails:
              status === 'safe_mode' || status === 'isolated'
                ? {
                    revokedPermissions: ['all_external_network', 'all_write_operations'],
                    isolatedAt: new Date().toISOString(),
                    quarantineReason: reason || 'Manual operator containment action',
                  }
                : undefined,
          }
        : a
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`STATUS:${agent.name}:${status}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: `AGENT_${status.toUpperCase()}`,
      target: agent.name,
      actor: 'Security Administrator',
      details: reason || `Agent status modified to ${status.toUpperCase()}`,
      prevHash,
      hash: newHash,
    };

    set({ agents: updatedAgents, auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: `Agent Status: ${status.replace('_', ' ').toUpperCase()}`,
      description: `${agent.name} transition complete. Hash recorded.`,
      type: status === 'isolated' ? 'error' : status === 'safe_mode' ? 'warning' : 'success',
      undoAction:
        status !== 'normal'
          ? () => get().setAgentStatus(agentId, 'normal', 'Operator undo restoration')
          : undefined,
      undoLabel: 'Undo',
    });
  },

  rotateAgentCredentials: async (agentId) => {
    const { agents, auditLog, addToast } = get();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`ROTATE_CRED:${agent.name}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'CREDENTIAL_ROTATION',
      target: agent.name,
      actor: 'Security Key Vault',
      details: 'Active OAuth session revoked. Zero-standing temporary token re-issued.',
      prevHash,
      hash: newHash,
    };

    set({ auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: 'Credentials Rotated',
      description: `New mTLS session key minted for ${agent.name}.`,
      type: 'success',
    });
  },

  resetAgentContext: async (agentId) => {
    const { agents, auditLog, addToast } = get();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`RESET_CONTEXT:${agent.name}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'CONTEXT_PURGED',
      target: agent.name,
      actor: 'H3lium Gateway',
      details: 'In-memory KV cache and conversation context purged to eliminate prompt injection taint.',
      prevHash,
      hash: newHash,
    };

    set({ auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: 'Context Flushed',
      description: `Prompt injection context wiped cleanly from ${agent.name}.`,
      type: 'info',
    });
  },

  reassignAgentWork: async (fromAgentId, toAgentId) => {
    const { agents, auditLog, addToast } = get();
    const fromAgent = agents.find((a) => a.id === fromAgentId);
    const toAgent = agents.find((a) => a.id === toAgentId);
    if (!fromAgent || !toAgent) return;

    const updatedAgents = agents.map((a) =>
      a.id === toAgentId
        ? {
            ...a,
            assignedTask: `Reassigned from ${fromAgent.name}: ${fromAgent.assignedTask}`,
            lastAction: `Resumed in-flight queue from quarantined ${fromAgent.name}`,
          }
        : a
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`REASSIGN:${fromAgent.name}→${toAgent.name}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'WORKFLOW_REASSIGNED',
      target: `${fromAgent.name} → ${toAgent.name}`,
      actor: 'Orchestration Manager',
      details: `In-flight task queue safely reassigned from isolated agent to healthy agent.`,
      prevHash,
      hash: newHash,
    };

    set({ agents: updatedAgents, auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: 'Work Reassigned',
      description: `Pending queue redirected from ${fromAgent.name} to ${toAgent.name}.`,
      type: 'success',
    });
  },

  quarantineResource: async (resourceId) => {
    const { resources, auditLog, addToast } = get();
    const resource = resources.find((r) => r.id === resourceId || r.name === resourceId);
    if (!resource) return;

    const updatedResources = resources.map((r) =>
      r.id === resource.id ? { ...r, isQuarantined: !r.isQuarantined } : r
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const action = !resource.isQuarantined ? 'RESOURCE_QUARANTINED' : 'RESOURCE_UNQUARANTINED';
    const newHash = await computeSha256(`${action}:${resource.name}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: action,
      target: resource.name,
      actor: 'Security Operations',
      details: !resource.isQuarantined
        ? `Document severed from agent pipeline: flagged as poisoned payload carrier.`
        : `Quarantine lifted from resource.`,
      prevHash,
      hash: newHash,
    };

    set({ resources: updatedResources, auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: !resource.isQuarantined ? 'Resource Quarantined' : 'Quarantine Lifted',
      description: `${resource.name} trust link has been updated.`,
      type: 'warning',
    });
  },

  toggleHoneytoken: async (resourceId) => {
    const { resources, addToast } = get();
    const updated = resources.map((r) =>
      r.id === resourceId ? { ...r, isHoneytoken: !r.isHoneytoken } : r
    );
    set({ resources: updated });
    addToast({
      title: 'Honeytoken Configuration Updated',
      description: 'Canary tripwire status toggled.',
      type: 'info',
    });
  },

  toggleSessionKeyGating: async (resourceId) => {
    const { resources, addToast } = get();
    const updated = resources.map((r) =>
      r.id === resourceId ? { ...r, isSessionKeyGated: !r.isSessionKeyGated } : r
    );
    set({ resources: updated });
    addToast({
      title: 'Gateway Gating Toggled',
      description: 'Session-key access requirement updated.',
      type: 'info',
    });
  },

  markFalsePositive: async (alertId) => {
    const { alerts, detectorWeights, auditLog, addToast } = get();
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    // Identify which detectors contributed high signals to this alert
    const contributing = alert.factors.filter((f) => f.signal > 0.4);
    const tunedDeltas: Record<string, { before: number; after: number }> = {};
    const updatedWeights = { ...detectorWeights };

    contributing.forEach((f) => {
      const before = detectorWeights[f.detectorId];
      const after = Math.max(4, before - 6);
      updatedWeights[f.detectorId] = after;
      tunedDeltas[f.detectorId] = { before, after };
    });

    const updatedAlerts = alerts.map((alt) =>
      alt.id === alertId
        ? {
            ...alt,
            status: 'false_positive' as const,
            resolvedBy: 'Security Engineer',
            resolvedAt: new Date().toISOString(),
            tunedWeightsDelta: tunedDeltas,
          }
        : alt
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`FALSE_POSITIVE:${alert.id}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'FALSE_POSITIVE_CALIBRATION',
      target: alert.triggeringAction,
      actor: 'Security Operations',
      details: `Alert marked as false positive. Automatic weight reduction applied to: ${Object.keys(
        tunedDeltas
      ).join(', ')}.`,
      prevHash,
      hash: newHash,
    };

    set({
      alerts: updatedAlerts,
      detectorWeights: updatedWeights,
      auditLog: [...auditLog, newAuditEntry],
    });

    addToast({
      title: 'Marked False Positive & Weights Calibrated',
      description: `Detector weights adjusted downwards to prevent recurrence.`,
      type: 'success',
    });
  },

  resolveAlert: async (alertId, status) => {
    const { alerts, auditLog, addToast } = get();
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    const updatedAlerts = alerts.map((a) =>
      a.id === alertId
        ? {
            ...a,
            status,
            resolvedBy: 'Security Analyst',
            resolvedAt: new Date().toISOString(),
          }
        : a
    );

    const prevHash = auditLog[auditLog.length - 1]?.hash || '00000000';
    const newHash = await computeSha256(`RESOLVE:${alert.id}:${status}:${prevHash}`);

    const newAuditEntry: AuditLogEntry = {
      index: auditLog.length + 1,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: `ALERT_${status.toUpperCase()}`,
      target: alert.agentName,
      actor: 'Security Analyst',
      details: `Alert ${alert.id} resolved as ${status}`,
      prevHash,
      hash: newHash,
    };

    set({ alerts: updatedAlerts, auditLog: [...auditLog, newAuditEntry] });
    addToast({
      title: `Alert Marked ${status.toUpperCase()}`,
      description: `Incident case closed.`,
      type: 'info',
    });
  },

  verifyAuditIntegrity: async () => {
    const { auditLog, addToast } = get();
    for (let i = 0; i < auditLog.length; i++) {
      const entry = auditLog[i];
      if (entry.tampered) {
        addToast({
          title: 'CHAIN INTEGRITY COMPROMISED!',
          description: `Tampering detected at row #${entry.index} (${entry.actionType}). Hashes do not match.`,
          type: 'error',
        });
        return { isValid: false, brokenIndex: entry.index };
      }
      if (i > 0 && entry.prevHash !== auditLog[i - 1].hash) {
        addToast({
          title: 'HASH CHAIN BROKEN!',
          description: `Row #${entry.index} prevHash mismatches row #${auditLog[i - 1].index} hash.`,
          type: 'error',
        });
        return { isValid: false, brokenIndex: entry.index };
      }
    }

    addToast({
      title: 'Cryptographic Integrity Verified',
      description: `All ${auditLog.length} SHA-256 links verified across chain. Zero tampering detected.`,
      type: 'success',
    });
    return { isValid: true };
  },

  simulateTamperAudit: async () => {
    const { auditLog, addToast } = get();
    if (auditLog.length <= 1) return;

    // Pick a past row to tamper with
    const tamperIndex = Math.max(1, Math.floor(auditLog.length / 2));
    const updated = auditLog.map((entry, idx) =>
      idx === tamperIndex
        ? {
            ...entry,
            details: 'TAMPERED: Attacker forged this event log to hide data extraction.',
            tampered: true,
          }
        : entry
    );

    set({ auditLog: updated });
    addToast({
      title: 'Tampering Simulated on Row #' + (tamperIndex + 1),
      description: 'Historical row modified. Run "Verify Integrity" to see chain break detection.',
      type: 'warning',
    });
  },

  repairAuditDemo: async () => {
    const { auditLog, addToast } = get();
    // Recompute clean hashes for entire chain
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const cleanLog: AuditLogEntry[] = [];

    for (let i = 0; i < auditLog.length; i++) {
      const entry = auditLog[i];
      const cleanDetails = entry.tampered
        ? 'Restored: Valid audited action record re-synced from append-only cold ledger.'
        : entry.details;
      const data = `${entry.index}:${entry.actionType}:${entry.target}:${cleanDetails}:${prevHash}`;
      const hash = await computeSha256(data);
      cleanLog.push({
        ...entry,
        details: cleanDetails,
        tampered: false,
        prevHash,
        hash,
      });
      prevHash = hash;
    }

    set({ auditLog: cleanLog });
    addToast({
      title: 'Audit Chain Repaired',
      description: 'All cryptographic hash pointers restored to pristine consensus state.',
      type: 'success',
    });
  },

  startGuidedDemo: () => {
    set({
      guidedDemoStep: 0,
      activeTab: 'attack_lab',
      activeScenarioId: 'indirect_prompt_injection',
      scenarioCurrentStepIndex: 0,
      protectionEnabled: true,
    });
  },

  nextGuidedDemoStep: () => {
    const current = get().guidedDemoStep;
    if (current === null) return;
    const next = current + 1;

    if (next === 1) {
      // Step 1: Procurement reads PDF (tainted)
      get().stepScenario();
      set({ guidedDemoStep: next, activeTab: 'attack_lab' });
    } else if (next === 2) {
      // Step 2: Requests HR salary files (blocked, safe mode)
      get().stepScenario();
      set({ guidedDemoStep: next, activeTab: 'alerts' });
    } else if (next === 3) {
      // Step 3: Tries POST to unknown domain (blocked, isolated)
      get().stepScenario();
      set({ guidedDemoStep: next, activeTab: 'attack_lab' });
    } else if (next === 4) {
      // Step 4: Root cause traced to PDF in provenance graph
      set({ guidedDemoStep: next, activeTab: 'graph' });
    } else if (next === 5) {
      // Step 5: Human review & reassign to clean agent
      set({ guidedDemoStep: next, activeTab: 'agents' });
    } else {
      // Done
      get().exitGuidedDemo();
    }
  },

  prevGuidedDemoStep: () => {
    const current = get().guidedDemoStep;
    if (current !== null && current > 0) {
      set({ guidedDemoStep: current - 1 });
    }
  },

  exitGuidedDemo: () => {
    set({ guidedDemoStep: null });
    get().addToast({
      title: 'Guided Demo Concluded',
      description: 'You now have full manual control of all H3lium security consoles.',
      type: 'info',
    });
  },

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  resetSimulation: () => {
    set({
      agents: JSON.parse(JSON.stringify(SEED_AGENTS)),
      resources: JSON.parse(JSON.stringify(SEED_RESOURCES)),
      events: INITIAL_EVENTS,
      alerts: [],
      approvals: [],
      auditLog: INITIAL_AUDIT_LOG,
      detectorWeights: { ...INITIAL_DETECTOR_WEIGHTS },
      thresholds: { ...INITIAL_THRESHOLDS },
      protectionEnabled: true,
      activeScenarioId: 'indirect_prompt_injection',
      scenarioCurrentStepIndex: 0,
      scenarioPlaying: false,
      guidedDemoStep: null,
      selectedAgentId: null,
      selectedAlertId: null,
      selectedEventId: null,
      pipelineStage: 'idle',
      testResults: null,
    });
    get().addToast({
      title: 'Simulation State Reset',
      description: 'Restored initial clean baseline across all 8 agents and audit logs.',
      type: 'info',
    });
  },
}));
