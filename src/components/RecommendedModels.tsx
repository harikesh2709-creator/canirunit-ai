'use client';

import React, { useMemo } from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { HardwareSpec } from '@/lib/types';
import { MODEL_PRESETS } from '@/lib/data/models';
import { getQuantById } from '@/lib/data/quantization';
import { calculate } from '@/lib/vramCalculator';
import RecommendedModelCard from './RecommendedModelCard';

interface RecommendedModelsProps {
  hardware: HardwareSpec;
  gpuCount: number;
}

export default function RecommendedModels({ hardware, gpuCount }: RecommendedModelsProps) {
  // We use Q4_K_M as a standard baseline for recommendations
  const defaultQuant = getQuantById('q4_k_m')!;
  const defaultContext = 8192;
  const defaultKvPrecision = useMemo(() => ({ id: 'fp16', label: 'FP16', bytesPerValue: 2, description: '' }), []);

  const recommendations = useMemo(() => {
    const results = MODEL_PRESETS.map((model) => {
      const calcResult = calculate({
        model,
        hardware,
        quant: defaultQuant,
        kvCachePrecision: defaultKvPrecision,
        contextLength: Math.min(model.defaultContext, defaultContext), // don't exceed max context
        gpuCount,
      });

      return {
        model,
        calcResult,
      };
    });

    // Filter out models that OOM (unless it's cpuOffloadActive but extremely slow)
    // Let's only recommend models that are 'smooth' or 'tight' fit
    const viable = results.filter((r) => r.calcResult.verdict !== 'oom');

    // Sort by largest parameters first, then TPS
    viable.sort((a, b) => {
      if (b.model.parametersBillion !== a.model.parametersBillion) {
        return b.model.parametersBillion - a.model.parametersBillion;
      }
      return b.calcResult.performance.estimatedTPS - a.calcResult.performance.estimatedTPS;
    });

    // Return Top 6
    return viable.slice(0, 6);
  }, [hardware, gpuCount, defaultQuant, defaultKvPrecision]);

  if (recommendations.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Recommended Models</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Your current hardware configuration ({hardware.name} x{gpuCount}) does not meet the minimum VRAM requirements for our standard model catalog at Q4 precision.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold text-white tracking-tight">AI Agent Recommendations</h2>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Based on your <strong className="text-slate-200">{hardware.name}</strong>, here are the most powerful models you can comfortably run locally using a standard Q4 quantization and 8K context.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(({ model, calcResult }) => (
          <RecommendedModelCard
            key={model.id}
            model={model}
            performance={calcResult.performance}
            cliCommands={calcResult.cliCommands}
          />
        ))}
      </div>
    </div>
  );
}
