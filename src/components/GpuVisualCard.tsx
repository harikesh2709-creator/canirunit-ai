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
      <div className="p-6 flex flex-col md:flex-row gap-6 items-center relative z-10">
        {/* Visual Fallback / Render */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-36 h-36 flex-shrink-0 rounded-2xl flex items-center justify-center relative border transition-colors duration-500 overflow-hidden"
          style={{
            borderColor: `${color}40`,
            background: 'rgba(0,0,0,0.5)',
            boxShadow: `inset 0 0 30px rgba(0,0,0,0.5), 0 0 20px ${color}15`,
          }}
        >
           {imgUrl ? (
             <Image src={imgUrl} alt={`${hardware.platform} GPU`} fill sizes="144px" className="object-contain p-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]" />
           ) : (
             <Cpu className="w-16 h-16 transition-colors duration-500" style={{ color }} />
           )}
           <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
           <div className="absolute -inset-2 blur-xl transition-colors duration-500 -z-10" style={{ background: `${color}25` }} />
        </motion.div>
        
        {/* Specs */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">{hardware.name}</h3>
              <p
                className="text-xs uppercase tracking-widest font-bold transition-colors duration-500"
                style={{ color }}
              >
                {hardware.platform.toUpperCase()} ARCHITECTURE
              </p>
            </div>
            {/* LLM Score Ring */}
            <div className="flex-shrink-0 relative w-16 h-16 cursor-help group/ring">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="32" cy="32" r={radius}
                  fill="none"
                  stroke={tierConfig.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 0 6px ${tierConfig.glow})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white leading-none">{llmScore.score}</span>
                <span className="text-[8px] font-bold mt-0.5" style={{ color: tierConfig.color }}>{llmScore.tier}-Tier</span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 w-44 p-2.5 rounded-lg bg-black/90 border border-white/10 backdrop-blur-xl opacity-0 group-hover/ring:opacity-100 pointer-events-none transition-opacity z-50 text-left">
                <div className="text-[10px] font-bold text-white mb-1">{llmScore.tierLabel}</div>
                <div className="text-[9px] text-slate-400 mb-2">{llmScore.tierDescription}</div>
                <div className="space-y-1.5">
                  <ScoreBar label="VRAM" value={llmScore.vramScore} color="#a855f7" />
                  <ScoreBar label="Bandwidth" value={llmScore.bandwidthScore} color="#3b82f6" />
                  <ScoreBar label="Compute" value={llmScore.computeScore} color="#10b981" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <SpecChip icon={HardDrive} label="VRAM Capacity" value={`${hardware.vramGB} GB ${hardware.platform !== 'apple' ? 'GDDR6X' : 'Unified'}`} color={color} />
            <SpecChip icon={Zap} label="Bandwidth" value={`${hardware.bandwidthGBs} GB/s`} color={color} />
            <SpecChip icon={Activity} label="Compute" value={`${(hardware.fp32TFLOPS ?? 0).toFixed(1)} TFLOPS`} color={color} />
            <SpecChip icon={Cpu} label="Bus Width" value={hardware.busWidth ? `${hardware.busWidth}-bit` : (hardware.platform === 'apple' ? 'Unified' : 'Unknown')} color={color} />
          </div>
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
