'use client';

import React from 'react';

interface RadarChartProps {
  currentSignals: { label: string; value: number }[]; // values 0.0 to 1.0
  baselineSignals?: { label: string; value: number }[];
  size?: number;
}

export function RadarChart({
  currentSignals,
  baselineSignals,
  size = 200,
}: RadarChartProps) {
  const center = size / 2;
  const radius = center - 28;
  const numPoints = currentSignals.length;

  if (numPoints < 3) return null;

  // Compute coordinates
  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = radius * Math.min(1, Math.max(0, value));
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Background grid circles
  const levels = [0.25, 0.5, 0.75, 1.0];

  const currentPoints = currentSignals.map((s, i) => getCoordinates(s.value, i));
  const currentPath = `M ${currentPoints.map((p) => `${p.x},${p.y}`).join(' L ')} Z`;

  const baselinePoints = (baselineSignals || currentSignals.map((s) => ({ ...s, value: 0.2 }))).map(
    (s, i) => getCoordinates(s.value, i)
  );
  const baselinePath = `M ${baselinePoints.map((p) => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric grid circles */}
        {levels.map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray={level === 1 ? 'none' : '2,2'}
            strokeWidth="1"
          />
        ))}

        {/* Spokes and Labels */}
        {currentSignals.map((signal, index) => {
          const outer = getCoordinates(1.0, index);
          const labelCoord = getCoordinates(1.22, index);
          return (
            <g key={signal.label}>
              <line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1"
              />
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[9px] fill-slate-500 dark:fill-slate-400 font-mono"
              >
                {signal.label}
              </text>
            </g>
          );
        })}

        {/* Baseline (Golden) Polygon */}
        <path
          d={baselinePath}
          fill="rgba(148, 163, 184, 0.15)"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="3,3"
        />

        {/* Current Behavior Polygon */}
        <path
          d={currentPath}
          fill="rgba(13, 148, 136, 0.25)"
          stroke="#0d9488"
          strokeWidth="2"
        />

        {/* Current Data Points */}
        {currentPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#0d9488"
            className="transition-all"
          />
        ))}
      </svg>

      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-slate-400 border-b border-dashed" />
          <span>Golden Baseline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 bg-teal-500/40 border border-teal-500 rounded-xs" />
          <span>Observed Behavior</span>
        </div>
      </div>
    </div>
  );
}
