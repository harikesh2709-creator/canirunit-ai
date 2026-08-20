'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Gauge, TrendingUp, Zap, Cpu } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  LineChart, Line, Cell
} from 'recharts';
import { HardwareSpec, ModelSpec, QuantizationConfig, KVCachePrecision, CalculationResult } from '@/lib/types';
import { QUANTIZATION_CONFIGS } from '@/lib/data/quantization';
import { calculate } from '@/lib/vramCalculator';

interface DynamicAnalyticsProps {
  hardware: HardwareSpec;
  model: ModelSpec;
  quant: QuantizationConfig;
  contextLength: number;
  kvCachePrecision: KVCachePrecision;
  currentResult: CalculationResult;
  gpuCount?: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-elevated px-4 py-3 shadow-xl border-white/10">
        <p className="text-white font-bold text-xs mb-2">{label}</p>
        {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: entry.color,
                boxShadow: `0 0 6px ${entry.color}60`,
              }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-mono font-semibold">{entry.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DynamicAnalytics({
  hardware,
  model,
  quant,
  contextLength,
  kvCachePrecision,
  currentResult,
  gpuCount = 1
}: DynamicAnalyticsProps) {

  const totalVram = hardware.vramGB * gpuCount;

  // Chart A: VRAM Allocation Breakdown
  const vramData = useMemo(() => {
    const { modelWeightsGB, kvCacheGB } = currentResult.vramBreakdown;
    const used = modelWeightsGB + kvCacheGB;
    const free = Math.max(0, totalVram - used);
    
    return [
      {
        name: 'VRAM Usage',
        'Model Weights (GB)': modelWeightsGB,
        'KV Cache (GB)': kvCacheGB,
        'Free VRAM (GB)': free
      }
    ];
  }, [currentResult, totalVram]);

  // Chart B: TPS Across Quants
  const tpsData = useMemo(() => {
    return QUANTIZATION_CONFIGS.map(q => {
      const res = calculate({
        model, hardware, quant: q, kvCachePrecision, contextLength, gpuCount
      });
      return {
        name: q.label,
        TPS: res.performance.estimatedTPS,
      };
    });
  }, [model, hardware, kvCachePrecision, contextLength, gpuCount]);

  const getTpsColor = (tps: number) => {
    if (tps >= 30) return '#10b981'; // Green
    if (tps >= 15) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  // Chart C: Context Length vs Memory Curve
  const contextData = useMemo(() => {
    const points = [4096, 8192, 16384, 32768, 65536, 131072];
    return points.map(ctx => {
      const res = calculate({
        model, hardware, quant, kvCachePrecision, contextLength: ctx, gpuCount
      });
      return {
        context: `${ctx / 1024}k`,
        'Total VRAM (GB)': res.vramBreakdown.totalRequiredGB
      };
    });
  }, [model, hardware, quant, kvCachePrecision, gpuCount]);

  const isOOM = currentResult.vramBreakdown.totalRequiredGB > totalVram;

  // Chart D: Bottleneck Analysis
  const computeLimitTPS = useMemo(() => {
    if (!hardware.fp32TFLOPS) return null;
    // rough heuristic: 2 FLOPs per parameter per token
    const flopsPerToken = (model.activeParametersBillion || model.parametersBillion) * 1e9 * 2;
    const totalFlopsPerSec = hardware.fp32TFLOPS * 1e12 * gpuCount;
    return totalFlopsPerSec / flopsPerToken;
  }, [hardware, model, gpuCount]);

  const memoryLimitTPS = useMemo(() => {
    const effectiveWeightsGB = (model.activeParametersBillion || model.parametersBillion) * (quant.bitsPerWeight / 8);
    // Add 10% penalty for multi-GPU scaling if applicable
    const scaledBandwidth = gpuCount > 1 ? hardware.bandwidthGBs * gpuCount * 0.9 : hardware.bandwidthGBs;
    return scaledBandwidth / effectiveWeightsGB;
  }, [hardware, model, quant, gpuCount]);

  const bottleneck = useMemo(() => {
    if (!computeLimitTPS) return 'Memory Bandwidth';
    return memoryLimitTPS < computeLimitTPS ? 'Memory Bandwidth' : 'Compute (TFLOPS)';
  }, [computeLimitTPS, memoryLimitTPS]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Dynamic Analytics</h3>
          <p className="text-[11px] text-slate-500">Real-time VRAM, speed, and context analysis</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/20 ml-auto">
          <span className="relative flex h-1.5 w-1.5 inline-flex mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
          </span>
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart A: VRAM Stack */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card glass-card-violet p-4 h-72 flex flex-col"
        >
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            VRAM Allocation
          </h4>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vramData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                <XAxis type="number" stroke="#ffffff30" fontSize={10} domain={[0, totalVram > currentResult.vramBreakdown.totalRequiredGB ? totalVram : 'dataMax']} />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Model Weights (GB)" stackId="a" fill="#8b5cf6" isAnimationActive={true} radius={[0, 0, 0, 0]} />
                <Bar dataKey="KV Cache (GB)" stackId="a" fill="#ec4899" isAnimationActive={true} />
                <Bar dataKey="Free VRAM (GB)" stackId="a" fill="#10b98120" stroke="#10b981" isAnimationActive={true} />
                <ReferenceLine x={totalVram} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'VRAM Limit', fill: '#ef4444', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {isOOM && (
             <p className="text-[10px] text-red-400 mt-2 text-center bg-red-500/10 py-1.5 rounded-lg border border-red-500/15 oom-pulse">⚠ Exceeds hardware capacity!</p>
          )}
        </motion.div>

        {/* Chart B: TPS Quants */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card glass-card-blue p-4 h-72 flex flex-col"
        >
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            Speed vs Quantization
          </h4>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tpsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickMargin={5} />
                <YAxis stroke="#ffffff30" fontSize={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="TPS" isAnimationActive={true} radius={[6, 6, 0, 0]}>
                  {tpsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getTpsColor(entry.TPS)}
                      style={{ filter: `drop-shadow(0 0 6px ${getTpsColor(entry.TPS)}40)` }}
                    />
                  ))}
                </Bar>
                <ReferenceLine y={30} stroke="#10b98140" strokeDasharray="3 3" label={{ position: 'right', value: 'Realtime', fill: '#10b981', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart C: Context Curve */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card glass-card-teal p-4 h-72 flex flex-col"
        >
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            Context vs Memory
          </h4>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={contextData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="context" stroke="#ffffff30" fontSize={10} tickMargin={5} />
                <YAxis stroke="#ffffff30" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Total VRAM (GB)"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0e1a' }}
                  activeDot={{ r: 7, fill: '#22d3ee', stroke: '#3b82f6', strokeWidth: 2 }}
                  isAnimationActive={true}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }}
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <ReferenceLine y={totalVram} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'VRAM Limit', fill: '#ef4444', fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart D: Bottleneck Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card glass-card-emerald p-4 h-72 flex flex-col"
        >
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Hardware Bottleneck
          </h4>
          <div className="flex-1 w-full flex flex-col justify-center gap-6 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-slate-300"><Layers className="w-3.5 h-3.5 text-indigo-400"/> Memory Bandwidth Limit</span>
                <span className="text-indigo-300">{memoryLimitTPS.toFixed(1)} tok/s</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (memoryLimitTPS / Math.max(memoryLimitTPS, computeLimitTPS || memoryLimitTPS)) * 100)}%` }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-slate-300"><Cpu className="w-3.5 h-3.5 text-rose-400"/> Compute (TFLOPS) Limit</span>
                <span className="text-rose-300">{computeLimitTPS ? `${computeLimitTPS.toFixed(1)} tok/s` : 'Unknown'}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                {computeLimitTPS ? (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (computeLimitTPS / Math.max(memoryLimitTPS, computeLimitTPS)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-800" />
                )}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Currently bottlenecked by <span className="font-bold text-white">{bottleneck}</span>. 
                {bottleneck === 'Memory Bandwidth' 
                  ? ' Quantization will significantly improve speed.' 
                  : ' A more powerful GPU is needed for higher speeds.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
