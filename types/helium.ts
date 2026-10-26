export type AgentStatus = 'normal' | 'watch' | 'safe_mode' | 'isolated';

export type InputTrust = 'trusted' | 'untrusted';

export type ResponseLevel = 'low' | 'medium' | 'high' | 'critical';

export type EventDecision = 'observed' | 'stepped_up' | 'restricted' | 'isolated';

export type DetectorId =
  | 'role_compliance'
  | 'statistical_baseline'
  | 'sequence_model'
  | 'taint_intent'
  | 'peer_comparison'
  | 'chain_graph'
  | 'long_drift'
  | 'honeytoken';

export interface DetectorFactor {
  detectorId: DetectorId;
  name: string;
  signal: number; // 0.0 to 1.0
  weight: number; // current weight
  contribution: number; // signal * weight
  reason: string;
  violatedRule?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  owner: string;
  trustScore: number; // 0 to 100
  trustHistory: number[]; // last 12 points for sparklines
  status: AgentStatus;
  lastAction: string;
  lastActionTime: string;
  allowedTools: string[];
  allowedDomains: string[];
  allowedDestinations: string[];
  maxRateLimitPerMin: number;
  baselineHourlyVolume: number;
  assignedTask: string;
  safeModeDetails?: {
    revokedPermissions: string[];
    isolatedAt?: string;
    quarantineReason?: string;
  };
  authorizedChange?: {
    tool: string;
    graceWindowExpires: string;
    approvedBy: string;
  };
}

export interface Resource {
  id: string;
  name: string;
  type: 'document' | 'database' | 'api_key' | 'external_domain';
  sensitivity: 'public' | 'internal' | 'sensitive' | 'honeytoken';
  domain: string;
  isHoneytoken?: boolean;
  isSessionKeyGated: boolean;
  isQuarantined?: boolean;
  recordsCount?: number;
}

export interface SimulatedEvent {
  id: string;
  timestamp: string;
  relativeTime: string;
  agentId: string;
  agentName: string;
  chain: string[]; // Agent IDs in provenance order
  originTask: string;
  tool: string;
  resource: string;
  resourceDomain: string;
  destination: string;
  volume: number; // records or bytes
  inputTrust: InputTrust;
  taintedContext: boolean;
  decision: EventDecision;
  riskScore: number;
  factors: DetectorFactor[];
  durationMs: number;
  explanation: string;
  protectionBypassed?: boolean; // when protection was turned OFF
  damageCaused?: {
    unauthorizedRecords: number;
    bytesExfiltrated: number;
    impactSummary: string;
  };
}

export interface Alert {
  id: string;
  eventId: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  level: ResponseLevel;
  status: 'open' | 'approved' | 'blocked' | 'false_positive' | 'resolved';
  riskScore: number;
  summary: string;
  triggeringAction: string;
  baselineComparison: string;
  probableSource: string;
  recommendedResponse: string;
  blastRadius: string[];
  factors: DetectorFactor[];
  resolvedBy?: string;
  resolvedAt?: string;
  tunedWeightsDelta?: Record<string, { before: number; after: number }>;
}

export interface ApprovalItem {
  id: string;
  eventId: string;
  alertId?: string;
  agentId: string;
  agentName: string;
  action: string;
  explanation: string;
  riskScore: number;
  timestamp: string;
  slaSecondsLeft: number;
  status: 'pending' | 'approved' | 'denied';
}

export interface AuditLogEntry {
  index: number;
  id: string;
  timestamp: string;
  actionType: string;
  target: string;
  actor: string;
  details: string;
  prevHash: string;
  hash: string;
  tampered?: boolean;
}

export type ScenarioId =
  | 'indirect_prompt_injection'
  | 'data_exfiltration'
  | 'slow_drift'
  | 'chain_propagation'
  | 'honeytoken_touch'
  | 'legitimate_change';

export interface ScenarioStep {
  agentId: string;
  chain: string[];
  originTask: string;
  tool: string;
  resource: string;
  resourceDomain: string;
  destination: string;
  volume: number;
  inputTrust: InputTrust;
  taintedContext: boolean;
  stepDescription: string;
  isAttackPayload?: boolean;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  tagline: string;
  description: string;
  threatVector: string;
  expectedOutcomeWithProtection: string;
  outcomeWithoutProtection: string;
  steps: ScenarioStep[];
}

export interface ScenarioRunResult {
  scenarioId: ScenarioId;
  scenarioName: string;
  detected: boolean;
  falsePositive: boolean;
  timeToContainMs: number;
  peakRisk: number;
  responseApplied: EventDecision;
  summary: string;
  eventsProcessed: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  undoAction?: () => void;
  undoLabel?: string;
}
