'use client';

import { memo, useMemo } from 'react';
import { PerformanceEstimate, PerformanceTier } from '@/lib/types';
import { motion } from 'framer-motion';
import { Zap, Gauge, Timer, Cpu, MemoryStick } from 'lucide-react';

interface SpeedGaugeProps {
  performance: PerformanceEstimate;
}

const tierConfig: Record<
  PerformanceTier,
  { label: string; color: string; gradient: string; description: string }
> = {
  excellent: {
    label: 'Excellent',
    color: '#10b981',
    gradient: 'linear-gradient(90deg, #059669, #10b981, #34d399)',
    description: 'Buttery smooth, real-time conversation',
  },
  good: {
    label: 'Good',
    color: '#3b82f6',
    gradient: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
    description: 'Fast and responsive for most tasks',
  },
  usable: {
    label: 'Usable',
    color: '#f59e0b',
    gradient: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)',
    description: 'Adequate for generation, slight wait',
  },
  slow: {
    label: 'Slow',
    color: '#ef4444',
    gradient: 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)',
    description: 'Noticeable delays, patience required',
  },
  unusable: {
    label: 'Too Slow',
    color: '#991b1b',
    gradient: 'linear-gradient(90deg, #7f1d1d, #991b1b, #b91c1c)',
    description: 'Impractical for interactive use',
  },
};

// ============================================================================
// Dynamic scale calculation
// ============================================================================

interface GaugeScale {
  max: number;
  marks: { value: number; label: string }[];
}

function computeGaugeScale(tps: number): GaugeScale {
  // Choose a ceiling that comfortably contains the value
  let max: number;
  let step: number;

  if (tps <= 40) {
    max = 40;
    step = 10;
  } else if (tps <= 80) {
    max = 80;
    step = 20;
  } else if (tps <= 150) {
    max = 150;
    step = 30;
  } else if (tps <= 300) {
    max = 300;
    step = 50;
  } else if (tps <= 600) {
    max = 600;
    step = 100;
  } else {
    // Ultra-high throughput (multi-GPU / data-center)
    max = Math.ceil(tps / 200) * 200 + 200;
    step = Math.round(max / 6);
  }

  const marks: { value: number; label: string }[] = [];
  for (let v = step; v <= max; v += step) {
    marks.push({ value: v, label: v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v) });
  }

  return { max, marks };
}

// ============================================================================
// Bottleneck detection
// ============================================================================

type BottleneckType = 'memory' | 'compute' | 'balanced';

function detectBottleneck(performance: PerformanceEstimate): BottleneckType {
  const { estimatedTPS, theoreticalTPS } = performance;
  // If the actual TPS is far below theoretical, it's likely memory-bound
  // Theoretical TPS is bandwidth / model-size, so if we're close to it, we're memory-bound (bandwidth-limited)
  // If we're far below, it could be compute overhead or offload
  const ratio = estimatedTPS / Math.max(theoreticalTPS, 0.1);

  if (ratio > 0.85) {
    // Running near theoretical max — memory bandwidth is the bottleneck
    return 'memory';
  } else if (ratio < 0.5) {
    // Significant compute overhead (offload, quantization decode, etc.)
    return 'compute';
  }
  return 'balanced';
}

const bottleneckConfig: Record<BottleneckType, { label: string; icon: typeof Cpu; color: string; bg: string }> = {
  memory: {
    label: 'Bandwidth Bound',
    icon: MemoryStick,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },
  compute: {
    label: 'Compute Bound',
    icon: Cpu,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
  },
  balanced: {
    label: 'Balanced',
    icon: Gauge,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
  },
};

// ============================================================================
// Component
// ============================================================================

export default memo(function SpeedGauge({ performance }: SpeedGaugeProps) {
  const { estimatedTPS, tier, cpuOffloadActive, ttftSeconds } = performance;
  const config = tierConfig[tier];

  const scale = useMemo(() => computeGaugeScale(estimatedTPS), [estimatedTPS]);
  const bottleneck = useMemo(() => detectBottleneck(performance), [performance]);
  const bnConfig = bottleneckConfig[bottleneck];
  const BnIcon = bnConfig.icon;

  // Gauge fill: clamp strictly between 0% and 100%
  const fillPercent = Math.max(0, Math.min((estimatedTPS / scale.max) * 100, 100));

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${config.color}20` }}>
            <Gauge className="w-4 h-4" style={{ color: config.color }} />
          </div>
          Speed Estimate
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          {cpuOffloadActive && (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-semibold">
              ⚠ CPU Offload Active
            </span>
          )}
          <span
            className="text-[10px] px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1"
            style={{ background: bnConfig.bg, color: bnConfig.color, borderColor: `${bnConfig.color}30` }}
          >
            <BnIcon className="w-3 h-3" />
            {bnConfig.label}
          </span>
        </div>
      </div>

      {/* TPS Display with Glow */}
      <div className="flex items-end gap-3">
        <motion.span
          key={estimatedTPS}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black font-mono tabular-nums"
          style={{
            color: config.color,
            textShadow: `0 0 20px ${config.color}50, 0 0 40px ${config.color}20`,
          }}
        >
          {estimatedTPS.toFixed(1)}
        </motion.span>
        <span className="text-sm text-slate-500 mb-2 font-semibold">tok/s</span>

        {/* TTFT inline */}
        <div className="ml-auto flex items-center gap-1.5 mb-2 text-xs text-slate-500">
          <Timer className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-400">TTFT</span>
          <span className="text-slate-900 dark:text-slate-200 font-mono font-bold">
            ~{ttftSeconds < 1 ? `${(ttftSeconds * 1000).toFixed(0)}ms` : `${ttftSeconds.toFixed(1)}s`}
          </span>
        </div>
      </div>

      {/* Enhanced gauge bar with dynamic marks */}
      <div className="relative">
        {/* Tick marks */}
        <div className="relative h-4 mb-1.5">
          {scale.marks.map(mark => (
            <span
              key={mark.value}
              className="absolute text-[9px] font-mono text-slate-500 -translate-x-1/2"
              style={{ left: `${(mark.value / scale.max) * 100}%` }}
            >
              {mark.label}
            </span>
          ))}
        </div>

        <div className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/5 overflow-hidden shadow-inner">
          {/* Segment dividers */}
          {scale.marks.map(mark => (
            <div
              key={mark.value}
              className="absolute top-0 h-full w-px bg-white/5"
              style={{ left: `${(mark.value / scale.max) * 100}%` }}
            />
          ))}

          {/* Fill bar with shimmer */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: config.gradient,
              boxShadow: `0 0 16px ${config.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            {/* Inner shimmer */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* Glow orb at the tip — clamped inside */}
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${Math.max(1, Math.min(fillPercent, 98))}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
            style={{
              background: config.color,
              boxShadow: `0 0 8px ${config.color}, 0 0 20px ${config.color}80, 0 0 40px ${config.color}40`,
              marginLeft: '-8px',
            }}
          />
        </div>
      </div>

      {/* Tier label & stats row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: config.color }} />
          <span
            className="text-sm font-bold"
            style={{
              color: config.color,
              textShadow: `0 0 10px ${config.color}30`,
            }}
          >
            {config.label}
          </span>
          <span className="text-xs text-slate-500">— {config.description}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Zap className="w-3 h-3" />
          Theoretical:{' '}
          <span className="text-slate-900 dark:text-slate-300 font-mono font-semibold">
            {performance.theoreticalTPS.toFixed(1)} tok/s
          </span>
        </div>
      </div>
    </div>
  );
});
