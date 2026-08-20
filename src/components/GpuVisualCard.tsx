'use client';
import React, { memo } from 'react';
import Image from 'next/image';
import { HardwareSpec } from '@/lib/types';
import { Cpu, Zap, Activity, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default memo(function GpuVisualCard({ hardware }: { hardware: HardwareSpec }) {
  const color = PLATFORM_COLORS[hardware.platform as keyof typeof PLATFORM_COLORS] || '#14b8a6';
  const imgUrl = IMAGE_URLS[hardware.platform];

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
      {/* Removed ambient glows for crisp look */}
           
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
           {/* Inner shadow overlay */}
           <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
           {/* Colored glow behind image */}
           <div className="absolute -inset-2 blur-xl transition-colors duration-500 -z-10" style={{ background: `${color}25` }} />
        </motion.div>
        
        {/* Specs */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">{hardware.name}</h3>
            <p
              className="text-xs uppercase tracking-widest font-bold transition-colors duration-500"
              style={{
                color,
              }}
            >
              {hardware.platform.toUpperCase()} ARCHITECTURE
            </p>
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
