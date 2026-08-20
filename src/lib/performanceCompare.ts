// ============================================================================
// LLMFit.ai — Multi-Model Performance Comparison Utility
// ============================================================================
// Calculates VRAM/TPS/verdict for ALL models against user's hardware.
// Provides filter logic and chart-ready data for the compatibility matrix.
// ============================================================================

import { HardwareSpec, CalculationResult, FitVerdict } from './types';
import { MODEL_PRESETS } from './data/models';
import { QUANTIZATION_CONFIGS } from './data/quantization';
import { KV_CACHE_PRECISIONS } from './data/quantization';
import { calculate } from './vramCalculator';
import { ModelSpec, QuantizationConfig } from './types';

// ============================================================================
// Types
// ============================================================================

export type MatrixFilter = 'all' | 'ready' | 'quantize' | 'too-large';

export interface ModelCompatibility {
  /** Model spec */
  model: ModelSpec;
  /** Best quantization that fits in VRAM (highest quality that fits) */
  bestFitQuant: QuantizationConfig | null;
  /** The calculation result for the best fit quant */
  bestFitResult: CalculationResult | null;
  /** Results for each quantization option */
  quantResults: QuantResult[];
  /** Overall compatibility status */
  status: MatrixFilter;
  /** Human-readable status label */
  statusLabel: string;
  /** Status emoji */
  statusEmoji: string;
}

export interface QuantResult {
  quant: QuantizationConfig;
  result: CalculationResult;
}

export interface ChartDataPoint {
  /** Model name for chart label */
  name: string;
  /** Short name for mobile */
  shortName: string;
  /** Estimated tokens per second */
  tps: number;
  /** Fit verdict for coloring */
  verdict: FitVerdict;
  /** VRAM usage percentage */
  vramPercent: number;
  /** Model size in billions */
  paramB: number;
  /** Quantization label used */
  quantLabel: string;
}

// ============================================================================
// Main Comparison Function
// ============================================================================

/**
 * Calculate compatibility for all models against the user's hardware.
 *
 * @param hardware - User's resolved hardware spec
 * @param contextLength - Selected context window in tokens
 * @param gpuCount - Number of GPUs
 * @param kvCachePrecisionId - KV cache precision ID
 * @returns Array of model compatibility results, sorted by best TPS
 */
export function calculateAllModelCompatibility(
  hardware: HardwareSpec,
  contextLength: number,
  gpuCount: number,
  kvCachePrecisionId: string
): ModelCompatibility[] {
  const kvPrecision = KV_CACHE_PRECISIONS.find((p) => p.id === kvCachePrecisionId)
    ?? KV_CACHE_PRECISIONS[0];

  const results: ModelCompatibility[] = MODEL_PRESETS.map((model) => {
    // Calculate for each quantization
    const quantResults: QuantResult[] = QUANTIZATION_CONFIGS
      .filter((q) => model.supportedQuants.includes(q.id))
      .map((quant) => ({
        quant,
        result: calculate({
          model,
          hardware,
          quant,
          kvCachePrecision: kvPrecision,
          contextLength,
          gpuCount,
        }),
      }));

    // Find best quantization that fits (highest bitsPerWeight that has verdict !== 'oom')
    const fittingQuants = quantResults
      .filter((qr) => qr.result.verdict !== 'oom')
      .sort((a, b) => b.quant.bitsPerWeight - a.quant.bitsPerWeight);

    const bestFitQuant = fittingQuants.length > 0 ? fittingQuants[0].quant : null;
    const bestFitResult = fittingQuants.length > 0 ? fittingQuants[0].result : null;

    // Determine status
    let status: MatrixFilter;
    let statusLabel: string;
    let statusEmoji: string;

    if (fittingQuants.length > 0) {
      const bestVerdict = fittingQuants[0].result.verdict;
      if (bestVerdict === 'smooth' && fittingQuants[0].quant.bitsPerWeight >= 4.5) {
        // Fits at Q4_K_M or better
        status = 'ready';
        statusLabel = `Ready to Run at ${fittingQuants[0].quant.label}`;
        statusEmoji = '🟢';
      } else {
        // Fits but needs aggressive quantization
        status = 'quantize';
        statusLabel = `Needs ${fittingQuants[0].quant.label} quantization`;
        statusEmoji = '🟡';
      }
    } else {
      status = 'too-large';
      statusLabel = 'Exceeds available VRAM';
      statusEmoji = '🔴';
    }

    return {
      model,
      bestFitQuant,
      bestFitResult,
      quantResults,
      status,
      statusLabel,
      statusEmoji,
    };
  });

  // Sort: ready first (by TPS desc), then quantize (by TPS desc), then too-large
  const statusOrder: Record<MatrixFilter, number> = {
    ready: 0,
    quantize: 1,
    'too-large': 2,
    all: 3,
  };

  results.sort((a, b) => {
    const orderDiff = statusOrder[a.status] - statusOrder[b.status];
    if (orderDiff !== 0) return orderDiff;

    // Within same status, sort by TPS descending
    const tpsA = a.bestFitResult?.performance.estimatedTPS ?? 0;
    const tpsB = b.bestFitResult?.performance.estimatedTPS ?? 0;
    return tpsB - tpsA;
  });

  return results;
}

// ============================================================================
// Filter Helper
// ============================================================================

/**
 * Filter model compatibility results by status.
 */
export function filterByStatus(
  models: ModelCompatibility[],
  filter: MatrixFilter
): ModelCompatibility[] {
  if (filter === 'all') return models;
  return models.filter((m) => m.status === filter);
}

// ============================================================================
// Chart Data Generator
// ============================================================================

/**
 * Generate Recharts-compatible data from model compatibility results.
 * Returns top N models sorted by TPS.
 */
export function generateChartData(
  models: ModelCompatibility[],
  maxModels: number = 15
): ChartDataPoint[] {
  return models
    .filter((m) => m.bestFitResult !== null)
    .sort(
      (a, b) =>
        (b.bestFitResult?.performance.estimatedTPS ?? 0) -
        (a.bestFitResult?.performance.estimatedTPS ?? 0)
    )
    .slice(0, maxModels)
    .map((m) => {
      const result = m.bestFitResult!;
      // Generate short name for mobile (e.g., "Llama 3.1 8B" → "Ll 3.1 8B")
      const shortName = m.model.name
        .replace('DeepSeek-R1 Distill ', 'DS-R1 ')
        .replace('DeepSeek-', 'DS-')
        .replace('Mistral ', 'Mi ')
        .replace('Llama ', 'Ll ')
        .replace('Gemma ', 'Gm ')
        .replace('Qwen ', 'Qw ')
        .replace('Command R', 'CR');

      return {
        name: m.model.name,
        shortName,
        tps: result.performance.estimatedTPS,
        verdict: result.verdict,
        vramPercent: result.vramBreakdown.usagePercent,
        paramB: m.model.parametersBillion,
        quantLabel: m.bestFitQuant?.label ?? 'N/A',
      };
    });
}

// ============================================================================
// Status Counts
// ============================================================================

export interface StatusCounts {
  all: number;
  ready: number;
  quantize: number;
  'too-large': number;
}

export function getStatusCounts(models: ModelCompatibility[]): StatusCounts {
  return {
    all: models.length,
    ready: models.filter((m) => m.status === 'ready').length,
    quantize: models.filter((m) => m.status === 'quantize').length,
    'too-large': models.filter((m) => m.status === 'too-large').length,
  };
}
