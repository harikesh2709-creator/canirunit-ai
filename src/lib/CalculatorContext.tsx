'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalculatorState, HardwareSpec, ModelSpec, QuantizationConfig, KVCachePrecision, CalculationResult } from './types';
import { calculate } from './vramCalculator';
import { getHardwareById, HARDWARE_PRESETS } from './data/hardware';
import { getModelById, MODEL_PRESETS } from './data/models';
import { getQuantById, getKVCacheById, QUANTIZATION_CONFIGS, KV_CACHE_PRECISIONS } from './data/quantization';
import { EmpiricalResult } from './empiricalProfiler';

// ============================================================================
// Default State
// ============================================================================

const defaultState: CalculatorState = {
  hardwareId: 'rtx-4090',
  customVramGB: 24,
  customBandwidthGBs: 500,
  modelId: 'llama-3.1-8b',
  quantId: 'q4_k_m',
  contextLength: 8192,
  kvCachePrecisionId: 'fp16',
  gpuCount: 1,
  overclockPercent: 0,
};

// ============================================================================
// Context Types
// ============================================================================

interface CalculatorContextValue {
  state: CalculatorState;
  hardware: HardwareSpec;
  model: ModelSpec;
  quant: QuantizationConfig;
  kvCachePrecision: KVCachePrecision;
  result: CalculationResult;
  update: <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => void;
  updateState: (newState: Partial<CalculatorState>) => void;
  handleHardwareDetected: (hardwareId: string, customVramGB?: number, isIntegrated?: boolean) => void;
  handleBenchmarkComplete: (result: EmpiricalResult) => void;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

// ============================================================================
// URL Syncing Component (Requires Suspense)
// ============================================================================

function SearchParamsSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(CalculatorContext);
  
  if (!context) return null;
  const { state, updateState } = context;

  // Handle URL params on mount
  useEffect(() => {
    const gpu = searchParams.get('gpu');
    const model = searchParams.get('model');
    const quant = searchParams.get('quant');
    const ctx = searchParams.get('ctx');
    const gpus = searchParams.get('gpus');

    const newState: Partial<CalculatorState> = {};
    if (gpu) newState.hardwareId = gpu;
    if (model) newState.modelId = model;
    if (quant) newState.quantId = quant;
    if (ctx) newState.contextLength = parseInt(ctx, 10);
    if (gpus) newState.gpuCount = parseInt(gpus, 10);

    if (Object.keys(newState).length > 0) {
      updateState(newState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Auto-sync state to URL parameters bidirectionally
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    
    let needsUpdate = false;
    if (currentParams.get('gpu') !== state.hardwareId) { currentParams.set('gpu', state.hardwareId); needsUpdate = true; }
    if (currentParams.get('model') !== state.modelId) { currentParams.set('model', state.modelId); needsUpdate = true; }
    if (currentParams.get('quant') !== state.quantId) { currentParams.set('quant', state.quantId); needsUpdate = true; }
    if (currentParams.get('ctx') !== state.contextLength.toString()) { currentParams.set('ctx', state.contextLength.toString()); needsUpdate = true; }
    if (currentParams.get('gpus') !== state.gpuCount.toString()) { currentParams.set('gpus', state.gpuCount.toString()); needsUpdate = true; }

    if (needsUpdate) {
      // Use router.replace with scroll: false to satisfy Next.js App Router shallow replacement requirements
      router.replace(`?${currentParams.toString()}`, { scroll: false });
    }
  }, [state.hardwareId, state.modelId, state.quantId, state.contextLength, state.gpuCount, searchParams, router]);

  return null;
}

// ============================================================================
// Provider Component
// ============================================================================

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalculatorState>(defaultState);

  // Auto-load state from local storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('llmfit-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  // Auto-save state to local storage when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('llmfit-state', JSON.stringify(state));
  }, [state]);

  // Resolve lookups
  const hardware = useMemo((): HardwareSpec => {
    const targetId = state.activeProfile === 'secondary' && state.secondaryHardwareId 
      ? state.secondaryHardwareId 
      : state.hardwareId;

    let hw = getHardwareById(targetId);
    if (!hw) hw = HARDWARE_PRESETS[0];
    
    let baseHw = hw;
    if (baseHw.id === 'custom') {
      baseHw = {
        ...baseHw,
        vramGB: state.customVramGB,
        bandwidthGBs: state.customBandwidthGBs,
      };
    }
    
    if (state.isIntegrated !== undefined) {
      baseHw = {
        ...baseHw,
        isIntegrated: state.isIntegrated
      };
    }

    // Apply overclock
    if (state.overclockPercent && state.overclockPercent > 0) {
      return {
        ...baseHw,
        bandwidthGBs: baseHw.bandwidthGBs * (1 + state.overclockPercent / 100),
      };
    }
    return baseHw;
  }, [state.hardwareId, state.secondaryHardwareId, state.activeProfile, state.customVramGB, state.customBandwidthGBs, state.isIntegrated, state.overclockPercent]);

  const model = useMemo(() => {
    if (state.modelId === 'custom' && state.customModelSpec) {
      return state.customModelSpec;
    }
    return getModelById(state.modelId) ?? MODEL_PRESETS[0];
  }, [state.modelId, state.customModelSpec]);

  const quant = useMemo(
    () => getQuantById(state.quantId) ?? QUANTIZATION_CONFIGS[0],
    [state.quantId]
  );

  const kvCachePrecision = useMemo(
    () => getKVCacheById(state.kvCachePrecisionId) ?? KV_CACHE_PRECISIONS[0],
    [state.kvCachePrecisionId]
  );

  // Run the calculation engine
  const result = useMemo(
    () =>
      calculate({
        model,
        hardware,
        quant,
        kvCachePrecision,
        contextLength: state.contextLength,
        gpuCount: state.gpuCount,
      }),
    [model, hardware, quant, kvCachePrecision, state.contextLength, state.gpuCount]
  );

  // Updaters
  const update = useCallback(<K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateState = useCallback((newState: Partial<CalculatorState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const handleHardwareDetected = useCallback((hardwareId: string, customVramGB?: number, isIntegrated?: boolean) => {
    setState((prev) => ({ 
      ...prev, 
      hardwareId,
      ...(customVramGB !== undefined ? { customVramGB, customBandwidthGBs: customVramGB >= 12 ? 500 : 250 } : {}),
      ...(isIntegrated !== undefined ? { isIntegrated } : {})
    }));
  }, []);

  const handleBenchmarkComplete = useCallback((res: EmpiricalResult) => {
    setState((prev) => ({
      ...prev,
      // If we don't have a specific hardware matched, set to custom to show the sliders
      hardwareId: prev.hardwareId === '' || prev.hardwareId === 'rtx-4060-ti-8gb' ? 'custom' : prev.hardwareId,
      customVramGB: res.estimatedVramGB,
      customBandwidthGBs: res.estimatedBandwidthGBs
    }));
  }, []);

  return (
    <CalculatorContext.Provider
      value={{
        state,
        hardware,
        model,
        quant,
        kvCachePrecision,
        result,
        update,
        updateState,
        handleHardwareDetected,
        handleBenchmarkComplete,
      }}
    >
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
