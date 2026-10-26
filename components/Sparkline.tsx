'use client';

import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  data,
  width = 64,
  height = 20,
  color = '#0d9488', // teal-600
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <span className="text-[10px] text-slate-400 font-mono">--</span>;
  }

  const min = 0;
  const max = 100;
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const lastPoint = points[points.length - 1].split(',');

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible shrink-0 inline-block align-middle"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="2"
        fill={color}
      />
    </svg>
  );
}
