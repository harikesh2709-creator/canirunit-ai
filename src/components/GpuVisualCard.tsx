'use client';
import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import { HardwareSpec } from '@/lib/types';
import { Cpu, Zap, Activity, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateLLMScore, getTierConfig } from '@/lib/gpuBenchmark';

const PLATFORM_COLORS = {
  nvidia: '#76b900',
  amd: '#ed1c24',
  apple: '#a2aaad',
  intel: '#0071c5',
  custom: '#14b8a6', // teal
};

const IMAGE_URLS: Record<string, string> = {
  amd: '/gpus/amd.png',
};

export default memo(function GpuVisualCard({ hardware, gpuCount = 1 }: { hardware: HardwareSpec; gpuCount?: number }) {
  const color = PLATFORM_COLORS[hardware.platform as keyof typeof PLATFORM_COLORS] || '#14b8a6';
  const imgUrl = IMAGE_URLS[hardware.platform];
  const llmScore = useMemo(() => calculateLLMScore(hardware, gpuCount), [hardware, gpuCount]);
  const tierConfig = getTierConfig(llmScore.tier);

  // SVG circular progress values
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (llmScore.score / 100) * circumference;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="theme-panel animated-border overflow-hidden relative"
      style={{
        boxShadow: `0 0 40px ${color}15`,
        borderColor: `${color}30`,
      }}
    >
      <div className="p-5 flex flex-col gap-4 relative z-10">
        {/* Tier Headline Banner */}
        <div 
          className="flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-500"
          style={{
            background: tierConfig.bg,
            borderColor: tierConfig.glow,
            boxShadow: `0 0 20px ${tierConfig.glow}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-black px-2 py-0.5 rounded-md text-white shadow-sm"
              style={{ background: tierConfig.color }}
            >
              {llmScore.tier}-TIER
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              {tierConfig.label.split('—')[1]?.trim() || tierConfig.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-400 font-semibold">LLM Score</span>
            <span className="text-sm font-black text-white font-mono" style={{ color: tierConfig.color }}>
              {llmScore.score}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">/100</span>
          </div>
        </div>

        {/* GPU Identity Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide leading-tight line-clamp-2">
              {hardware.name}
            </h3>
            <p
              className="text-[11px] uppercase tracking-widest font-bold transition-colors duration-500 mt-1"
              style={{ color }}
            >
              {hardware.platform.toUpperCase()} ARCHITECTURE
            </p>
          </div>

          {/* Visual Render / Icon */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center relative border transition-colors duration-500 overflow-hidden"
            style={{
              borderColor: `${color}40`,
              background: 'rgba(0,0,0,0.5)',
              boxShadow: `inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px ${color}15`,
            }}
          >
            {imgUrl ? (
              <Image src={imgUrl} alt={`${hardware.platform} GPU`} fill sizes="56px" className="object-contain p-1.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]" />
            ) : (
              <Cpu className="w-8 h-8 transition-colors duration-500" style={{ color }} />
            )}
            <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] pointer-events-none" />
          </motion.div>
        </div>

        {/* 3 Pillars Score Breakdown */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>LLM Readiness Benchmark</span>
            <span className="text-slate-500 font-normal">{tierConfig.description}</span>
          </div>
          <div className="space-y-1.5 pt-0.5">
            <ScoreBar label="VRAM Fit (40%)" value={llmScore.vramScore} color="#a855f7" />
            <ScoreBar label="Bandwidth / Speed (40%)" value={llmScore.bandwidthScore} color="#3b82f6" />
            <ScoreBar label="Compute / TTFT (20%)" value={llmScore.computeScore} color="#10b981" />
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2">
          <SpecChip icon={HardDrive} label="VRAM Capacity" value={`${hardware.vramGB} GB ${hardware.platform !== 'apple' ? 'GDDR6X' : 'Unified'}`} color={color} />
          <SpecChip icon={Zap} label="Bandwidth" value={`${hardware.bandwidthGBs} GB/s`} color={color} />
          <SpecChip icon={Activity} label="Compute" value={`${(hardware.fp32TFLOPS ?? 0).toFixed(1)} TFLOPS`} color={color} />
          <SpecChip icon={Cpu} label="Bus Width" value={hardware.busWidth ? `${hardware.busWidth}-bit` : (hardware.platform === 'apple' ? 'Unified' : 'Unknown')} color={color} />
        </div>
      </div>
    </motion.div>
  );
});

// Score breakdown bar for tooltip
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[9px]">
        <span className="text-slate-500">{label}</span>
        <span className="text-white font-mono">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

// Spec chip with colored hover
function SpecChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="bg-slate-100/50 dark:bg-black/30 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3 transition-all duration-300 hover:border-opacity-40 group cursor-default"
      style={{
        '--spec-color': color,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.boxShadow = `0 0 12px ${color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
       <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-current transition-colors duration-300" style={{ '--tw-text-opacity': 1 } as React.CSSProperties} />
       <div className="min-w-0">
         <p className="text-[10px] text-slate-500 uppercase font-semibold truncate">{label}</p>
         <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">{value}</p>
       </div>
    </div>
  );
}
