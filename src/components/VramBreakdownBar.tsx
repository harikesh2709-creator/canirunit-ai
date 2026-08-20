'use client';

import { memo, useMemo } from 'react';
import { VRAMBreakdown as VRAMBreakdownType } from '@/lib/types';
import { motion } from 'framer-motion';
import { HardDrive } from 'lucide-react';

interface VramBreakdownBarProps {
  breakdown: VRAMBreakdownType;
}

export default memo(function VramBreakdownBar({ breakdown }: VramBreakdownBarProps) {
  const { modelWeightsGB, cudaContextGB = 0, kvCacheGB, totalRequiredGB, availableVramGB } = breakdown;

  const isOverflow = totalRequiredGB > availableVramGB;
  const safeVramGB = availableVramGB || 1;
  const usagePercent = Math.min((totalRequiredGB / safeVramGB) * 100, 100);

  // Calculate blocks for Memory Tetris
  // Exact percentage recalculation dynamically distributed across 100 blocks
  const TOTAL_AVAILABLE_BLOCKS = 100;
  
  const weightBlocksCount = Math.round((modelWeightsGB / safeVramGB) * TOTAL_AVAILABLE_BLOCKS);
  const contextBlocksCount = Math.round((cudaContextGB / safeVramGB) * TOTAL_AVAILABLE_BLOCKS);
  const kvBlocksCount = Math.round((kvCacheGB / safeVramGB) * TOTAL_AVAILABLE_BLOCKS);
  
  const blocks = useMemo(() => {
    const arr = [];
    let currentWeight = weightBlocksCount;
    let currentContext = contextBlocksCount;
    let currentKV = kvBlocksCount;
    
    // Fill the grid based on fraction of total VRAM
    for (let i = 0; i < TOTAL_AVAILABLE_BLOCKS; i++) {
      if (currentWeight > 0) {
        arr.push('weight');
        currentWeight--;
      } else if (currentContext > 0) {
        arr.push('context');
        currentContext--;
      } else if (currentKV > 0) {
        arr.push('kv');
        currentKV--;
      } else {
        arr.push('empty');
      }
    }
    
    // Dynamically append overflow blocks if total exceeds VRAM
    if (isOverflow) {
      const overflowCount = Math.round(((totalRequiredGB - availableVramGB) / (availableVramGB || 1)) * TOTAL_AVAILABLE_BLOCKS);
      for (let i = 0; i < Math.min(overflowCount, 20); i++) { // cap overflow blocks visually
        arr.push('overflow');
      }
    }
    return arr;
  }, [weightBlocksCount, contextBlocksCount, kvBlocksCount, isOverflow, totalRequiredGB, availableVramGB]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/15">
            <HardDrive className="w-4 h-4 text-teal-400" />
          </div>
          Visual Memory Tetris
        </h4>
        <div className="text-sm font-mono flex items-center gap-2">
          <span className={isOverflow ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {totalRequiredGB.toFixed(1)} GB
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{availableVramGB} GB</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isOverflow
                ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                : usagePercent > 80
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
            }`}
          >
            {isOverflow ? 'OOM' : `${usagePercent.toFixed(0)}%`}
          </span>
        </div>
      </div>

      {/* Adaptive Mobile-Responsive Tetris Grid */}
      <div className="relative p-3 rounded-xl bg-black/40 border border-white/5 w-full">
        <div 
          className="grid gap-[3px] w-full" 
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18px, 1fr))' }}
        >
          {blocks.map((type, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005, duration: 0.3 }}
              className={`aspect-square rounded-[2px] transition-all duration-300 ${
                type === 'weight'
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)] border border-indigo-400/50'
                  : type === 'context'
                  ? 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] border border-cyan-300/50'
                  : type === 'kv'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] border border-amber-300/50'
                  : type === 'overflow'
                  ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_12px_rgba(225,29,72,0.8)] border border-rose-400/50 animate-pulse'
                  : 'bg-emerald-500/10 dark:bg-emerald-900/20 border border-emerald-500/30 shadow-[inset_0_0_5px_rgba(16,185,129,0.1)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Accessible Color Coding Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
          <span className="text-slate-300 font-medium">
            Model Weights:{' '}
            <span className="text-indigo-400 font-mono font-bold">{modelWeightsGB.toFixed(1)} GB</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
          <span className="text-slate-300 font-medium">
            CUDA Context:{' '}
            <span className="text-cyan-400 font-mono font-bold">{cudaContextGB.toFixed(1)} GB</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
          <span className="text-slate-300 font-medium">
            KV Cache:{' '}
            <span className="text-amber-400 font-mono font-bold">{kvCacheGB.toFixed(2)} GB</span>
          </span>
        </div>
        {!isOverflow && (
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500/40 border border-emerald-500/50" />
            <span className="text-slate-400 font-medium">
              Headroom:{' '}
              <span className="text-emerald-400 font-mono font-bold">{(availableVramGB - totalRequiredGB).toFixed(1)} GB</span>
            </span>
          </div>
        )}
        {isOverflow && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-3.5 h-3.5 rounded-sm bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)] animate-pulse" />
            <span className="text-rose-400 font-mono font-semibold">
              Overflow: +{(totalRequiredGB - availableVramGB).toFixed(1)} GB
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
});
