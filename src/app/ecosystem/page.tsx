'use client';

import React from 'react';
import { useCalculator } from '@/lib/CalculatorContext';
import ModelMatrix from '@/components/ModelMatrix';

export default function EcosystemPage() {
  const { hardware, state } = useCalculator();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Ecosystem Compatibility</h1>
      </div>

      <div className="glass-card p-6 border-white/5">
        <ModelMatrix
          hardware={hardware}
          gpuCount={state.gpuCount}
          kvCachePrecisionId={state.kvCachePrecisionId}
        />
      </div>
    </div>
  );
}
