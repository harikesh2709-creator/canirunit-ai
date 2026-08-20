'use client';
import React from 'react';

import { HardwareSpec } from '@/lib/types';
import { HARDWARE_GROUPS, getHardwareById } from '@/lib/data/hardware';
import { Monitor, Apple, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableDropdown from './SearchableDropdown';

interface HardwarePickerProps {
  selectedId: string;
  customVramGB: number;
  customBandwidthGBs: number;
  gpuCount: number;
  onSelect: (id: string) => void;
  onCustomVramChange: (vram: number) => void;
  onCustomBandwidthChange: (bw: number) => void;
  onGpuCountChange: (count: number) => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'apple':
      return <Apple className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
    case 'custom':
      return <Settings className="w-4 h-4 text-brand-400 animate-[spin_4s_linear_infinite] flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(45,212,191,0.6))' }} />;
    default:
      return <Monitor className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
  }
};

const groupColors: Record<string, string> = {
  'NVIDIA GeForce': 'text-green-500',
  'NVIDIA Workstation / Data Center': 'text-green-400',
  'AMD Radeon': 'text-red-400',
  'Intel Arc': 'text-blue-400',
  'Apple Silicon': 'text-slate-300',
  Custom: 'text-teal-400',
};

const chipAccentColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  'rtx-3060-12gb': { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30', glow: '0 0 10px rgba(34,197,94,0.15)' },
  'rtx-4060-ti-16gb': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', glow: '0 0 10px rgba(16,185,129,0.15)' },
  'rtx-4070': { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30', glow: '0 0 10px rgba(20,184,166,0.15)' },
  'rtx-4090': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30', glow: '0 0 10px rgba(34,211,238,0.15)' },
  'm3-max-64gb': { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-400/30', glow: '0 0 10px rgba(148,163,184,0.15)' },
};

export default React.memo(function HardwarePicker({
  selectedId,
  customVramGB,
  customBandwidthGBs,
  gpuCount,
  onSelect,
  onCustomVramChange,
  onCustomBandwidthChange,
  onGpuCountChange,
}: HardwarePickerProps) {
  const selectedHw = getHardwareById(selectedId);
  const showGpuCount = selectedHw && selectedHw.platform !== 'apple' && selectedId !== 'custom';

  return (
    <div className="space-y-3">
      <SearchableDropdown<HardwareSpec>
        label="Hardware"
        groups={HARDWARE_GROUPS}
        selectedId={selectedId}
        onSelect={onSelect}
        placeholder="Search for your GPU..."
        getId={(hw) => hw.id}
        getSearchText={(hw) => `${hw.name} ${hw.vramGB}GB ${hw.bandwidthGBs}GB/s`}
        getGroupColor={(label) => groupColors[label] ?? 'text-slate-500'}
        maxHeight="18rem"
        renderSelected={(hw) => (
          <div className="flex items-center gap-2.5">
            <PlatformIcon platform={hw.platform} />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{hw.name}</div>
              {hw.id !== 'custom' && (
                <div className="text-[11px] text-slate-500 font-mono">
                  {hw.vramGB} GB VRAM · {hw.bandwidthGBs} GB/s
                </div>
              )}
            </div>
          </div>
        )}
        renderItem={(hw, isSelected) => (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <PlatformIcon platform={hw.platform} />
              <span className={`truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                {hw.name}
              </span>
            </div>
            {hw.id !== 'custom' && (
              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex-shrink-0">
                {hw.vramGB}GB · {hw.bandwidthGBs}GB/s
              </span>
            )}
          </div>
        )}
      />

      {/* Quick-select chips — vibrant colors */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { label: 'RTX 3060 (12GB)', id: 'rtx-3060-12gb' },
          { label: 'RTX 4060 Ti (16GB)', id: 'rtx-4060-ti-16gb' },
          { label: 'RTX 4070 (12GB)', id: 'rtx-4070' },
          { label: 'RTX 4090 (24GB)', id: 'rtx-4090' },
          { label: 'Apple M-Series', id: 'm3-max-64gb' },
        ].map(chip => {
          const isSelected = selectedId === chip.id;
          const accent = chipAccentColors[chip.id] || { bg: 'bg-white/5', text: 'text-slate-400', border: 'border-white/10', glow: 'none' };
          return (
            <button
              key={chip.id}
              onClick={() => onSelect(chip.id)}
              className={`text-[10px] px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer border duration-300 ${
                isSelected
                  ? `${accent.bg} ${accent.text} ${accent.border}`
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              style={isSelected ? { boxShadow: accent.glow } : {}}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Custom VRAM / Bandwidth sliders */}
      <AnimatePresence>
        {selectedId === 'custom' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden pb-2"
            >
              <div className="space-y-5 pt-2 px-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>VRAM / Unified Memory</span>
                  <span className="text-teal-400 font-mono font-bold" style={{ textShadow: '0 0 8px rgba(20,184,166,0.3)' }}>{customVramGB} GB</span>
                </div>
                <input
                  type="range" min={2} max={256} step={1}
                  value={customVramGB}
                  onChange={(e) => onCustomVramChange(Number(e.target.value))}
                  className="range-slider w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Memory Bandwidth</span>
                  <span className="text-indigo-400 font-mono font-bold" style={{ textShadow: '0 0 8px rgba(99,102,241,0.3)' }}>{customBandwidthGBs} GB/s</span>
                </div>
                <input
                  type="range" min={50} max={6000} step={10}
                  value={customBandwidthGBs}
                  onChange={(e) => onCustomBandwidthChange(Number(e.target.value))}
                  className="range-slider w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GPU Count selector */}
      <AnimatePresence>
        {showGpuCount && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden pb-2"
          >
            <div className="pt-2 px-1">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Number of GPUs</span>
                <span className="font-mono font-bold text-white">{gpuCount}x</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onGpuCountChange(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                      gpuCount === num
                        ? 'bg-teal-600/20 border-teal-500/40 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.15)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-teal-500/10 hover:text-teal-300 hover:border-teal-500/20'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
})
