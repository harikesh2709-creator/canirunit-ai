'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { HardwareSpec, FitVerdict } from '@/lib/types';
import {
  calculateAllModelCompatibility,
  generateChartData,
  ChartDataPoint,
} from '@/lib/performanceCompare';

// ============================================================================
// Props
// ============================================================================

interface PerformanceChartsProps {
  hardware: HardwareSpec;
  gpuCount: number;
  kvCachePrecisionId: string;
  contextLength: number;
}

// ============================================================================
// Verdict colors — vibrant gradients
// ============================================================================

const verdictColors: Record<FitVerdict, { fill: string; glow: string }> = {
  smooth: { fill: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  tight: { fill: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  oom: { fill: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
};

// ============================================================================
// Component
// ============================================================================

export default function PerformanceCharts({
  hardware,
  gpuCount,
  kvCachePrecisionId,
  contextLength,
}: PerformanceChartsProps) {
  const chartData = useMemo(() => {
    const allModels = calculateAllModelCompatibility(
      hardware,
      contextLength,
      gpuCount,
      kvCachePrecisionId
    );
    return generateChartData(allModels, 12);
  }, [hardware, contextLength, gpuCount, kvCachePrecisionId]);

  if (chartData.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="theme-panel p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20">
            <BarChart3 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Performance Comparison</h2>
            <p className="text-[11px] text-slate-500">
              Estimated tokens/sec on {hardware.name}
              {gpuCount > 1 ? ` × ${gpuCount}` : ''}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: verdictColors.smooth.fill, boxShadow: `0 0 6px ${verdictColors.smooth.glow}` }} />
            <span className="text-slate-500">Fits</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: verdictColors.tight.fill, boxShadow: `0 0 6px ${verdictColors.tight.glow}` }} />
            <span className="text-slate-500">Tight</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: verdictColors.oom.fill, boxShadow: `0 0 6px ${verdictColors.oom.glow}` }} />
            <span className="text-slate-500">OOM</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: Math.max(300, chartData.length * 36) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
            barCategoryGap="20%"
          >
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
              domain={[0, 'auto']}
              label={{
                value: 'tokens/sec',
                position: 'insideBottomRight',
                offset: -5,
                fill: '#475569',
                fontSize: 10,
              }}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar
              dataKey="tps"
              radius={[0, 8, 8, 0]}
              maxBarSize={28}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={verdictColors[entry.verdict].fill}
                  fillOpacity={0.85}
                  style={{
                    filter: `drop-shadow(0 0 8px ${verdictColors[entry.verdict].glow})`,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Custom Tooltip — Enhanced
// ============================================================================

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const colors = verdictColors[data.verdict];

  return (
    <div
      className="glass-panel px-4 py-3 shadow-xl max-w-xs"
      style={{
        borderColor: `${colors.fill}30`,
        boxShadow: `0 0 20px ${colors.glow}, 0 8px 32px rgba(0,0,0,0.5)`,
      }}
    >
      <p className="text-sm font-bold text-white mb-1.5">{data.name}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Speed</span>
          <span
            className="font-mono font-bold"
            style={{ color: colors.fill, textShadow: `0 0 8px ${colors.glow}` }}
          >
            {data.tps.toFixed(1)} tok/s
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Parameters</span>
          <span className="text-white font-mono">{data.paramB}B</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Quantization</span>
          <span className="text-white">{data.quantLabel}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">VRAM Usage</span>
          <span className="text-white font-mono">{data.vramPercent.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
