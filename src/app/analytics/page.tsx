'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useCalculator } from '@/lib/CalculatorContext';

const PerformanceCharts = dynamic(() => import('@/components/PerformanceCharts'), { ssr: false });
const ContextScalingChart = dynamic(() => import('@/components/ContextScalingChart'), { ssr: false });

export default function AnalyticsPage() {
  const { hardware, model, quant, kvCachePrecision, state } = useCalculator();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Performance Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Max Context Tokens</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{state.contextLength.toLocaleString()}</div>
          <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">VRAM impact: high</div>
        </div>
        <div className="theme-panel p-5">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Bandwidth Utilization</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{hardware.bandwidthGBs} GB/s</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Currently limiting tokens/sec</div>
        </div>
        <div className="theme-panel p-5">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Memory Bottleneck</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{hardware.vramGB} GB</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Available VRAM</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="theme-panel p-6">
          <PerformanceCharts
            hardware={hardware}
            gpuCount={state.gpuCount}
            kvCachePrecisionId={state.kvCachePrecisionId}
            contextLength={state.contextLength}
          />
        </div>
        
        <div className="theme-panel p-6 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Context Scaling Impact</h2>
          <p className="text-sm text-slate-400 text-center mb-6">As context length increases, KV cache VRAM usage grows exponentially.</p>
          <ContextScalingChart
            model={model}
            hardware={hardware}
            quant={quant}
            kvCachePrecision={kvCachePrecision}
            gpuCount={state.gpuCount}
          />
        </div>
      </div>
    </div>
  );
}
