// ============================================================================
// LLMFit.ai — VRAM & Performance Calculation Engine
// ============================================================================
// Pure-function, side-effect-free calculation engine.
// All formulas from the specification are implemented here.
// ============================================================================

import {
  ModelSpec,
  HardwareSpec,
  QuantizationConfig,
  KVCachePrecision,
  CalculationResult,
  VRAMBreakdown,
  PerformanceEstimate,
  CLICommands,
  FitVerdict,
  PerformanceTier,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Standard CUDA context & activation overhead multiplier (20%) */
const CUDA_OVERHEAD_MULTIPLIER = 1.20;

/** Execution efficiency factor for realistic TPS estimation */
const EFFICIENCY_FACTOR = 0.65;

/** CPU offload penalty factor — memory bandwidth ratio (PCIe ~32 GB/s vs GPU) */
const CPU_OFFLOAD_BANDWIDTH_GBS = 32; // Typical PCIe 4.0 x16

/** Bytes per GB */
const BYTES_PER_GB = 1_073_741_824; // 2^30

// ============================================================================
// Formula 1: Model Weights VRAM Requirement
// ============================================================================
/**
 * Calculate the VRAM required to load model weights.
 *
 * Formula: M_vram = (P × b / 8)
 *
 * @param paramsBillion - Total model parameters in billions
 * @param bitsPerWeight - Effective bits per weight for the selected quantization
 * @returns VRAM required for model weights in GB
 */
export function calculateModelWeightsVRAM(
  paramsBillion: number,
  bitsPerWeight: number
): number {
  // P is in billions, so P * 1e9 gives total params
  // (P * 1e9 * b) / 8 gives bytes, then / 1e9 to get GB
  // Simplified: (P * b / 8) gives GB directly since the 1e9 cancels
  return (paramsBillion * bitsPerWeight) / 8;
}

// ============================================================================
// Formula 2: KV Cache VRAM Requirement
// ============================================================================
/**
 * Calculate the VRAM required for the KV cache.
 *
 * Formula: KV_vram = 2 × L × H_kv × D_head × C × P_bytes
 *
 * @param layers - Number of transformer layers
 * @param kvHeads - Number of Key-Value heads (accounting for GQA)
 * @param headDimension - Dimension of each attention head
 * @param contextLength - Context window length in tokens
 * @param cachePrecisionBytes - Bytes per value in KV cache
 * @returns VRAM required for KV cache in GB
 */
export function calculateKVCacheVRAM(
  layers: number,
  kvHeads: number,
  headDimension: number,
  contextLength: number,
  cachePrecisionBytes: number,
  batchSize: number = 1
): number {
  // 2 for K and V, result in bytes, convert to GB
  const totalBytes =
    2 * layers * kvHeads * headDimension * contextLength * cachePrecisionBytes * batchSize;
  return totalBytes / BYTES_PER_GB;
}

// ============================================================================
// Formula 3: Total VRAM Required
// ============================================================================
/**
 * Calculate total VRAM and breakdown details.
 *
 * Formula: VRAM_total = M_vram + KV_vram
 */
export function calculateVRAMBreakdown(
  modelWeightsGB: number,
  cudaContextGB: number,
  kvCacheGB: number,
  availableVramGB: number
): VRAMBreakdown {
  const totalRequiredGB = modelWeightsGB + cudaContextGB + kvCacheGB;
  const headroomGB = availableVramGB - totalRequiredGB;
  const usagePercent = (totalRequiredGB / availableVramGB) * 100;

  return {
    modelWeightsGB: round2(modelWeightsGB),
    cudaContextGB: round2(cudaContextGB),
    kvCacheGB: round2(kvCacheGB),
    totalRequiredGB: round2(totalRequiredGB),
    availableVramGB: round2(availableVramGB),
    headroomGB: round2(headroomGB),
    usagePercent: round1(usagePercent),
  };
}

// ============================================================================
// Formula 4: Performance / Tokens-per-Second Estimation
// ============================================================================
/**
 * Estimate inference speed (tokens per second).
 *
 * Formula: TPS_theoretical = bandwidth / M_vram
 *          TPS_estimated = TPS_theoretical × 0.65
 *
 * If model exceeds GPU VRAM, apply CPU offload penalty.
 */
export function calculatePerformance(
  modelWeightsGB: number,
  bandwidthGBs: number,
  totalRequiredGB: number,
  availableVramGB: number,
  activeParamWeightsGB?: number,
  isIntegrated: boolean = false
): PerformanceEstimate {
  // Use active parameter weights for TPS calculation (MoE models)
  const effectiveWeightsGB = activeParamWeightsGB ?? modelWeightsGB;

  const cpuOffloadActive = totalRequiredGB > availableVramGB;

  let theoreticalTPS: number;
  let estimatedTPS: number;

  if (!cpuOffloadActive) {
    // Full GPU fit
    theoreticalTPS = bandwidthGBs / effectiveWeightsGB;
    estimatedTPS = theoreticalTPS * EFFICIENCY_FACTOR;
  } else {
    // CPU offload: calculate blended bandwidth
    const overflowGB = totalRequiredGB - availableVramGB;
    const gpuFraction = availableVramGB / totalRequiredGB;
    const cpuFraction = overflowGB / totalRequiredGB;

    // Blended bandwidth: weighted average of GPU and PCIe bandwidth
    // If the GPU is integrated, it uses system RAM, so there is no PCIe penalty!
    const offloadBandwidth = isIntegrated ? bandwidthGBs : CPU_OFFLOAD_BANDWIDTH_GBS;
    const blendedBandwidth =
      gpuFraction * bandwidthGBs + cpuFraction * offloadBandwidth;

    theoreticalTPS = blendedBandwidth / effectiveWeightsGB;
    estimatedTPS = theoreticalTPS * EFFICIENCY_FACTOR;
  }

  // Clamp to reasonable minimums
  theoreticalTPS = Math.max(0.1, theoreticalTPS);
  estimatedTPS = Math.max(0.05, estimatedTPS);

  // Determine performance tier
  const tier = classifyPerformanceTier(estimatedTPS);

  // Estimate TTFT (very rough: proportional to model size)
  const ttftSeconds = cpuOffloadActive
    ? Math.min(30, effectiveWeightsGB * 0.5)
    : Math.min(5, effectiveWeightsGB * 0.05);

  return {
    theoreticalTPS: round1(theoreticalTPS),
    estimatedTPS: round1(estimatedTPS),
    tier,
    cpuOffloadActive,
    ttftSeconds: round2(ttftSeconds),
  };
}

// ============================================================================
// Verdict Classification
// ============================================================================

export function classifyVerdict(
  totalRequiredGB: number,
  availableVramGB: number,
  modelWeightsGB: number
): { verdict: FitVerdict; verdictText: string } {
  const usagePercent = (totalRequiredGB / availableVramGB) * 100;

  if (totalRequiredGB <= availableVramGB) {
    if (usagePercent <= 90) {
      return {
        verdict: 'smooth',
        verdictText: 'Smooth GPU Fit — Full model + context fits comfortably in VRAM',
      };
    }
    return {
      verdict: 'tight',
      verdictText: 'Tight Fit — Model and context fit, but very close to the VRAM limit.',
    };
  }

  if (modelWeightsGB <= availableVramGB) {
    return {
      verdict: 'tight',
      verdictText:
        'Partial Offload — Model fits but KV cache may spill to RAM. Reduce context or quantize further.',
    };
  }

  return {
    verdict: 'oom',
    verdictText:
      'OOM / Heavy Offload — Model weights exceed available VRAM. Use a smaller quant or more GPUs.',
  };
}

function classifyPerformanceTier(tps: number): PerformanceTier {
  if (tps >= 40) return 'excellent';
  if (tps >= 20) return 'good';
  if (tps >= 8) return 'usable';
  if (tps >= 2) return 'slow';
  return 'unusable';
}

// ============================================================================
// CLI Command Generation
// ============================================================================

function generateCLICommands(
  model: ModelSpec,
  quant: QuantizationConfig,
  contextLength: number,
  gpuLayers: number | 'all'
): CLICommands {
  // Derive a human-friendly model slug
  const slug = model.name.toLowerCase().replace(/[\s.\/]+/g, '-');
  const quantTag = quant.label.toLowerCase();

  // Ollama
  const ollamaModel = `${slug}:${quantTag}`;
  const ollama = `ollama run ${ollamaModel} --num-ctx ${contextLength}`;

  // llama.cpp
  const ngl = gpuLayers === 'all' ? model.layers : gpuLayers;
  const llamaCpp = [
    `./llama-cli`,
    `-m ./models/${slug}-${quantTag}.gguf`,
    `-c ${contextLength}`,
    `-ngl ${ngl}`,
    `--threads $(nproc)`,
  ].join(' \\\n  ');

  // vLLM
  const vllm = [
    `vllm serve "${model.name}"`,
    `--quantization ${quant.format.toLowerCase() === 'native' ? 'none' : quant.format.toLowerCase()}`,
    `--max-model-len ${contextLength}`,
    `--gpu-memory-utilization 0.90`,
  ].join(' \\\n  ');

  return { ollama, llamaCpp, vllm };
}

// ============================================================================
// Main Calculation Entry Point
// ============================================================================

export interface CalculationInput {
  model: ModelSpec;
  hardware: HardwareSpec;
  quant: QuantizationConfig;
  kvCachePrecision: KVCachePrecision;
  contextLength: number;
  gpuCount: number;
  batchSize?: number;
}

/**
 * Run the full VRAM & performance calculation pipeline.
 * This is the single entry point for the UI to call.
 */
export function calculate(input: CalculationInput): CalculationResult {
  const { model, hardware, quant, kvCachePrecision, contextLength, gpuCount = 1, batchSize = 1 } = input;

  // Step 1: Model weights VRAM & Overhead
  // User Requested: FP16=2.0, Q8_0=1.1, Q4_K_M=0.55-0.60, Q2_K=0.35 bytes/param + 10-15% runtime context/cuda overhead
  const modelWeightsGB = calculateModelWeightsVRAM(
    model.parametersBillion,
    quant.bitsPerWeight
  );
  
  // 15% CUDA context/overhead allocation
  const cudaContextGB = modelWeightsGB * 0.15;

  // Step 2: KV cache VRAM
  const kvCacheGB = calculateKVCacheVRAM(
    model.layers,
    model.kvHeads,
    model.headDimension,
    contextLength,
    kvCachePrecision.bytesPerValue,
    batchSize
  );

  // Step 3: VRAM breakdown
  const totalHardwareVramGB = hardware.vramGB * gpuCount;
  const vramBreakdown = calculateVRAMBreakdown(
    modelWeightsGB,
    cudaContextGB,
    kvCacheGB,
    totalHardwareVramGB
  );

  // Step 4: For MoE models, compute active parameter weight size for TPS
  let activeParamWeightsGB: number | undefined;
  if (model.activeParametersBillion !== undefined) {
    activeParamWeightsGB = calculateModelWeightsVRAM(
      model.activeParametersBillion,
      quant.bitsPerWeight
    );
  }

  // Step 5: Performance estimation
  // Bandwidth scales with GPU count but with ~10% overhead penalty
  const scaledBandwidthGBs = gpuCount > 1 ? hardware.bandwidthGBs * gpuCount * 0.9 : hardware.bandwidthGBs;
  const performance = calculatePerformance(
    modelWeightsGB,
    scaledBandwidthGBs,
    vramBreakdown.totalRequiredGB,
    totalHardwareVramGB,
    activeParamWeightsGB,
    hardware.isIntegrated ?? false
  );

  // Step 6: Verdict
  const { verdict, verdictText } = classifyVerdict(
    vramBreakdown.totalRequiredGB,
    totalHardwareVramGB,
    modelWeightsGB
  );

  // Step 7: CLI commands
  const gpuLayers =
    totalHardwareVramGB < vramBreakdown.totalRequiredGB
      ? Math.max(0, Math.min(model.layers, Math.floor(model.layers * (totalHardwareVramGB / modelWeightsGB))))
      : 'all';
  const cliCommands = generateCLICommands(model, quant, contextLength, gpuLayers);

  return {
    verdict,
    verdictText,
    vramBreakdown,
    performance,
    cliCommands,
  };
}

// ============================================================================
// Utility Helpers
// ============================================================================

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
