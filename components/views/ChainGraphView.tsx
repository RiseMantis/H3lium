'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  GitBranch,
  ShieldAlert,
  Flame,
  Radio,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  FileText,
  Database,
  Globe,
  Bot,
  Ban,
  CheckCircle,
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'agent' | 'document' | 'database' | 'destination';
  x: number;
  y: number;
  status?: string;
  isTainted?: boolean;
  isQuarantined?: boolean;
  isHoneytoken?: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  isTainted?: boolean;
}

export function ChainGraphView() {
  const { agents, resources, quarantineResource, setSelectedAgentId } = useHeliumStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-pdf');
  const [highlightMode, setHighlightMode] = useState<'normal' | 'root_cause' | 'blast_radius'>(
    'normal'
  );
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const procureAgent = agents.find((a) => a.id === 'agent-procure');
  const researchAgent = agents.find((a) => a.id === 'agent-research');
  const browserAgent = agents.find((a) => a.id === 'agent-browser');

  const quotePdfResource = resources.find((r) => r.id === 'res-supplier-quote');

  // Graph Nodes
  const nodes: GraphNode[] = [
    {
      id: 'node-pdf',
      label: 'supplier_quote.pdf',
      sublabel: 'Untrusted Vendor PDF',
      type: 'document',
      x: 120,
      y: 180,
      isTainted: true,
      isQuarantined: quotePdfResource?.isQuarantined,
    },
    {
      id: 'node-browser',
      label: 'Web Browsing Agent',
      sublabel: 'Autonomous Crawler',
      type: 'agent',
      x: 120,
      y: 340,
      status: browserAgent?.status || 'normal',
    },
    {
      id: 'node-research',
      label: 'Research Agent',
      sublabel: 'Market Intelligence',
      type: 'agent',
      x: 360,
      y: 340,
      status: researchAgent?.status || 'normal',
      isTainted: true,
    },
    {
      id: 'node-procure',
      label: 'Procurement Agent',
      sublabel: 'Purchasing Specialist',
      type: 'agent',
      x: 360,
      y: 180,
      status: procureAgent?.status || 'normal',
      isTainted: true,
    },
    {
      id: 'node-salary',
      label: 'hr_salary.xlsx',
      sublabel: 'Confidential Payroll',
      type: 'database',
      x: 620,
      y: 100,
    },
    {
      id: 'node-honey',
      label: 'salary_review_2026.xlsx',
      sublabel: 'Canary Decoy Honeytoken',
      type: 'database',
      x: 620,
      y: 220,
      isHoneytoken: true,
    },
    {
      id: 'node-dest-approved',
      label: 'partner-suppliers.com',
      sublabel: 'Approved Supplier Portal',
      type: 'destination',
      x: 620,
      y: 320,
    },
    {
      id: 'node-dest-dropzone',
      label: 'files-transfer-x.io',
      sublabel: 'Adversary Dropzone',
      type: 'destination',
      x: 620,
      y: 420,
    },
  ];

  // Edges connecting nodes
  const edges: GraphEdge[] = [
    {
      from: 'node-pdf',
      to: 'node-procure',
      label: 'Ingest Quote (Tainted)',
      risk: 'critical',
      isTainted: true,
    },
    {
      from: 'node-browser',
      to: 'node-research',
      label: 'Crawl Summary',
      risk: 'medium',
    },
    {
      from: 'node-research',
      to: 'node-procure',
      label: 'Delegated Task Task_PO',
      risk: 'high',
      isTainted: true,
    },
    {
      from: 'node-procure',
      to: 'node-salary',
      label: 'Unauthorized hr_db_read',
      risk: 'critical',
      isTainted: true,
    },
    {
      from: 'node-procure',
      to: 'node-honey',
      label: 'Touch Decoy Canary',
      risk: 'critical',
    },
    {
      from: 'node-procure',
      to: 'node-dest-approved',
      label: 'PO Confirmation Sync',
      risk: 'low',
    },
    {
      from: 'node-procure',
      to: 'node-dest-dropzone',
      label: 'HTTP POST Egress',
      risk: 'critical',
      isTainted: true,
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Filter or highlight logic
  const isNodeHighlighted = (nodeId: string) => {
    if (highlightMode === 'normal') return true;
    if (highlightMode === 'root_cause') {
      return (
        nodeId === 'node-pdf' ||
        nodeId === 'node-procure' ||
        nodeId === 'node-salary' ||
        nodeId === 'node-dest-dropzone'
      );
    }
    if (highlightMode === 'blast_radius') {
      return (
        nodeId === 'node-pdf' ||
        nodeId === 'node-procure' ||
        nodeId === 'node-research' ||
        nodeId === 'node-salary'
      );
    }
    return true;
  };

  const isEdgeHighlighted = (edge: GraphEdge) => {
    if (highlightMode === 'normal') return true;
    if (highlightMode === 'root_cause') {
      return (
        (edge.from === 'node-pdf' && edge.to === 'node-procure') ||
        (edge.from === 'node-procure' && edge.to === 'node-salary') ||
        (edge.from === 'node-procure' && edge.to === 'node-dest-dropzone')
      );
    }
    if (highlightMode === 'blast_radius') {
      return edge.isTainted === true;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Graph Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-teal-500" />
            <span>Agent Chain & Provenance Graph</span>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive multi-agent lineage tracing, suspicion propagation, and payload blast-radius mapping
          </p>
        </div>

        {/* Action Highlights */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setHighlightMode(highlightMode === 'root_cause' ? 'normal' : 'root_cause')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              highlightMode === 'root_cause'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Trace Root Cause (PDF)</span>
          </button>

          <button
            onClick={() => setHighlightMode(highlightMode === 'blast_radius' ? 'normal' : 'blast_radius')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              highlightMode === 'blast_radius'
                ? 'bg-rose-500 text-white border-rose-500 font-bold'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Highlight Blast Radius</span>
          </button>

          <button
            onClick={() => quarantineResource('res-supplier-quote')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>
              {quotePdfResource?.isQuarantined ? 'Lift PDF Quarantine' : 'Quarantine Source (PDF)'}
            </span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setZoom(Math.min(1.6, zoom + 0.15))}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(Math.max(0.6, zoom - 0.15))}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas and Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 relative overflow-hidden h-[540px] flex items-center justify-center select-none shadow-inner">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#14b8a6 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            viewBox="0 0 800 520"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <defs>
              <marker
                id="arrowhead-teal"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#0d9488" />
              </marker>
              <marker
                id="arrowhead-rose"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
              </marker>
              <marker
                id="arrowhead-amber"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Render Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = isEdgeHighlighted(edge);
              const isCrit = edge.risk === 'critical';
              const isHigh = edge.risk === 'high';

              const strokeColor = isCrit ? '#f43f5e' : isHigh ? '#f59e0b' : '#0d9488';
              const markerId = isCrit
                ? 'arrowhead-rose'
                : isHigh
                ? 'arrowhead-amber'
                : 'arrowhead-teal';

              // Curve computation
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2 - 15;
              const pathD = `M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`;

              return (
                <g
                  key={idx}
                  className={`transition-opacity duration-200 ${
                    isHighlighted ? 'opacity-100' : 'opacity-15'
                  }`}
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHighlighted && isCrit ? 2.5 : 1.5}
                    strokeDasharray={quotePdfResource?.isQuarantined && edge.from === 'node-pdf' ? '4,4' : 'none'}
                    markerEnd={`url(#${markerId})`}
                  />
                  <text
                    x={midX}
                    y={midY - 4}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400 select-none bg-slate-900"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHighlighted = isNodeHighlighted(node.id);

              const isIsolated = node.status === 'isolated';
              const isSafe = node.status === 'safe_mode';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`cursor-pointer transition-all duration-200 ${
                    isHighlighted ? 'opacity-100' : 'opacity-20'
                  }`}
                >
                  {/* Glowing selection aura */}
                  {isSelected && (
                    <circle
                      r="32"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2"
                      strokeDasharray="4,3"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Node Capsule */}
                  <rect
                    x="-65"
                    y="-22"
                    width="130"
                    height="44"
                    rx="8"
                    fill="#0f172a"
                    stroke={
                      node.isHoneytoken
                        ? '#a855f7'
                        : node.isQuarantined
                        ? '#f43f5e'
                        : isIsolated
                        ? '#f43f5e'
                        : isSafe
                        ? '#f97316'
                        : node.isTainted
                        ? '#f59e0b'
                        : '#334155'
                    }
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-colors"
                  />

                  {/* Icon / Marker */}
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-100 font-mono select-none"
                  >
                    {node.label}
                  </text>

                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    className="text-[8px] fill-slate-400 font-mono select-none"
                  >
                    {node.sublabel}
                  </text>

                  {/* Quarantined or Isolated Marker Badge */}
                  {node.isQuarantined && (
                    <text
                      x="48"
                      y="-18"
                      className="text-[8px] font-mono font-bold fill-rose-500 uppercase"
                    >
                      QUARANTINE
                    </text>
                  )}
                  {isIsolated && (
                    <text
                      x="48"
                      y="-18"
                      className="text-[8px] font-mono font-bold fill-rose-500 uppercase"
                    >
                      ISOLATED
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Graph Legend */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono text-slate-300 space-y-1 shadow-md">
            <div className="font-semibold text-slate-400 mb-1 uppercase tracking-wider text-[9px]">
              Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Critical Breach / Taint Egress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Tainted Ingest Lineage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Honeytoken Canary Decoy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Nominal Policy Route</span>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Sidebar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Node Inspector
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedNode?.label || 'Select a Node'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedNode?.sublabel}
            </p>
          </div>

          {selectedNode && (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="font-mono uppercase font-semibold text-teal-600 dark:text-teal-400">
                    {selectedNode.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taint Tag</span>
                  <span
                    className={`font-semibold ${
                      selectedNode.isTainted ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {selectedNode.isTainted ? 'TAINTED' : 'CLEAN'}
                  </span>
                </div>
                {selectedNode.isHoneytoken && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Canary Tripwire</span>
                    <span className="font-mono text-purple-500 font-bold">ACTIVE DECOY</span>
                  </div>
                )}
                {selectedNode.isQuarantined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Isolation</span>
                    <span className="font-mono text-rose-500 font-bold">QUARANTINED</span>
                  </div>
                )}
              </div>

              {selectedNode.id === 'node-pdf' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Root ingestion vector: Untrusted PDF quotation received from external supplier.
                    Embedded adversarial instruction detected during downstream execution.
                  </p>
                  <button
                    onClick={() => quarantineResource('res-supplier-quote')}
                    className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
                  >
                    {quotePdfResource?.isQuarantined ? 'Lift Quarantine' : 'Quarantine This Document'}
                  </button>
                </div>
              )}

              {selectedNode.id === 'node-procure' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Procurement Agent ingested tainted PDF context. Attempted unauthorized salary database access.
                  </p>
                  <button
                    onClick={() => setSelectedAgentId('agent-procure')}
                    className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors"
                  >
                    Open Procurement Agent Controls
                  </button>
                </div>
              )}

              {selectedNode.id === 'node-honey' && (
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-700 dark:text-purple-300">
                  Zero false-positive decoy file. Any unauthorized agent touch triggers immediate token isolation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
