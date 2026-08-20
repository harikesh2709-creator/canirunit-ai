'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import { ModelSpec, HardwareSpec, QuantizationConfig, KVCachePrecision } from '@/lib/types';
import { calculate } from '@/lib/vramCalculator';

interface ContextScalingChartProps {
  model: ModelSpec;
  hardware: HardwareSpec;
  quant: QuantizationConfig;
  kvCachePrecision: KVCachePrecision;
  gpuCount: number;
}

export default function ContextScalingChart({
  model,
  hardware,
  quant,
  kvCachePrecision,
  gpuCount
}: ContextScalingChartProps) {
  
  const chartData = useMemo(() => {
    const data = [];
    const steps = [2048, 4096, 8192, 16384, 32768, 65536, 98304, 131072];
    
    for (const ctx of steps) {
      if (ctx > model.defaultContext && ctx !== steps[0]) continue; 
      
      const res = calculate({
        model,
        hardware,
        quant,
        kvCachePrecision,
        contextLength: ctx,
        gpuCount
      });
      
      data.push({
        contextSize: (ctx / 1024).toFixed(0) + 'k',
        rawContext: ctx,
        kvCacheVram: res.vramBreakdown.kvCacheGB,
        modelVram: res.vramBreakdown.modelWeightsGB,
        totalVram: res.vramBreakdown.totalRequiredGB,
        verdict: res.verdict
      });
    }
    return data;
  }, [model, hardware, quant, kvCachePrecision, gpuCount]);

  return (
    <div className="flex-1 w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorKv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorModel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="contextSize" 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value.toFixed(1)} GB`}
          />
          <Tooltip content={<CustomTooltip hardwareVram={hardware.vramGB * (hardware.platform === 'apple' ? 1 : gpuCount)} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
          <Area 
            type="monotone" 
            dataKey="modelVram" 
            stackId="1" 
            stroke="#3b82f6" 
            fill="url(#colorModel)" 
            name="Model Weights"
          />
          <Area 
            type="monotone" 
            dataKey="kvCacheVram" 
            stackId="1" 
            stroke="#14b8a6" 
            fill="url(#colorKv)" 
            name="KV Cache"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: { totalVram: number };
  }>;
  label?: string;
  hardwareVram: number;
}

function CustomTooltip({ active, payload, label, hardwareVram }: TooltipProps) {
  if (active && payload && payload.length) {
    const total = payload[0].payload.totalVram;
    const isOom = total > hardwareVram;
    
    return (
      <div className="theme-panel p-3 text-sm shadow-xl rounded-lg z-50">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{label} Tokens</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex justify-between gap-4 mb-1">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{entry.value.toFixed(2)} GB</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between gap-4">
          <span className="font-bold text-slate-900 dark:text-white">Total:</span>
          <span className={`font-mono font-bold ${isOom ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
            {total.toFixed(2)} GB
          </span>
        </div>
      </div>
    );
  }
  return null;
}
