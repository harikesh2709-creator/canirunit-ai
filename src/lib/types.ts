// ============================================================================
// LLMFit.ai — Core Type Definitions
// ============================================================================

/** Supported hardware platform types */
export type HardwarePlatform = 'nvidia' | 'amd' | 'intel' | 'apple' | 'custom';

/** Verdict for whether a model fits in available memory */
export type FitVerdict = 'smooth' | 'tight' | 'oom';

/** Performance tier classification */
export type PerformanceTier = 'excellent' | 'good' | 'usable' | 'slow' | 'unusable';

// ============================================================================
// Hardware
// ============================================================================

export interface HardwareSpec {
  /** Unique identifier (e.g., "rtx-4090") */
  id: string;
  /** Display name (e.g., "NVIDIA RTX 4090") */
  name: string;
  /** Platform type */
  platform: HardwarePlatform;
  /** Total available VRAM or unified memory in GB */
  vramGB: number;
  /** Memory bandwidth in GB/s */
  bandwidthGBs: number;
  /** Optional: FP32 compute power in TFLOPS */
  fp32TFLOPS?: number;
  /** Optional: memory bus width in bits */
  busWidth?: number;
  /** Optional: icon identifier for UI display */
  icon?: string;
  /** True if the GPU shares memory with the CPU (Unified Memory) */
  isIntegrated?: boolean;
}

// ============================================================================
// Models
// ============================================================================

export interface ModelSpec {
  /** Unique identifier (e.g., "llama-3.1-8b") */
  id: string;
  /** Display name (e.g., "Llama 3.1 8B") */
  name: string;
  /** Model family for grouping in UI (e.g., "Llama 3") */
  family: string;
  /** Total parameter count in billions */
  parametersBillion: number;
  /** Number of transformer layers */
  layers: number;
  /** Number of Key-Value heads (accounting for GQA) */
  kvHeads: number;
  /** Dimension of each attention head */
  headDimension: number;
  /** Default/max context length for the model */
  defaultContext: number;
  /**
   * For MoE models: active parameters per forward pass (in billions).
   * If undefined, all parameters are active (dense model).
   */
  activeParametersBillion?: number;
  /** Supported quantization format IDs */
  supportedQuants: string[];
}

// ============================================================================
// Quantization
// ============================================================================

export interface QuantizationConfig {
  /** Unique identifier (e.g., "q4_k_m") */
  id: string;
  /** Display label (e.g., "Q4_K_M") */
  label: string;
  /** Effective bits per weight */
  bitsPerWeight: number;
  /** Human-readable description */
  description: string;
  /** Format family (e.g., "GGUF", "EXL2", "AWQ") */
  format: string;
}

// ============================================================================
// KV Cache
// ============================================================================

export interface KVCachePrecision {
  /** Unique identifier (e.g., "fp16") */
  id: string;
  /** Display label (e.g., "FP16") */
  label: string;
  /** Bytes per value in KV cache */
  bytesPerValue: number;
  /** Description */
  description: string;
}

// ============================================================================
// Context Window
// ============================================================================

export interface ContextOption {
  /** Context length in tokens */
  tokens: number;
  /** Display label (e.g., "8K") */
  label: string;
}

// ============================================================================
// Calculation Results
// ============================================================================

export interface VRAMBreakdown {
  /** Model weights VRAM in GB */
  modelWeightsGB: number;
  /** CUDA Context / Overhead in GB */
  cudaContextGB: number;
  /** KV cache VRAM in GB */
  kvCacheGB: number;
  /** Total VRAM required in GB (weights + cache + context) */
  totalRequiredGB: number;
  /** Available VRAM on selected hardware in GB */
  availableVramGB: number;
  /** How much VRAM is left over (negative = overflow) */
  headroomGB: number;
  /** Percentage of VRAM used (can exceed 100%) */
  usagePercent: number;
}

export interface PerformanceEstimate {
  /** Theoretical maximum tokens per second */
  theoreticalTPS: number;
  /** Estimated real-world tokens per second (with efficiency factor) */
  estimatedTPS: number;
  /** Performance tier classification */
  tier: PerformanceTier;
  /** Whether CPU offload penalty is applied */
  cpuOffloadActive: boolean;
  /** Estimated time-to-first-token in seconds */
  ttftSeconds: number;
}

export interface CLICommands {
  /** Ollama CLI command */
  ollama: string;
  /** llama.cpp CLI command */
  llamaCpp: string;
  /** vLLM CLI command */
  vllm: string;
}

export interface CalculationResult {
  /** Fit verdict */
  verdict: FitVerdict;
  /** Verdict description text */
  verdictText: string;
  /** VRAM breakdown details */
  vramBreakdown: VRAMBreakdown;
  /** Performance estimates */
  performance: PerformanceEstimate;
  /** Generated CLI commands */
  cliCommands: CLICommands;
}

// ============================================================================
// UI State
// ============================================================================

export interface CalculatorState {
  /** Selected hardware ID (Primary) */
  hardwareId: string;
  /** Secondary hardware ID (e.g., Dedicated GPU in a laptop) */
  secondaryHardwareId?: string | null;
  /** Which profile is currently active */
  activeProfile?: 'primary' | 'secondary';
  /** Custom VRAM (only used when hardwareId is "custom") */
  customVramGB: number;
  /** Whether the user overrode the GPU to be integrated */
  isIntegrated?: boolean;
  /** Custom bandwidth (only used when hardwareId is "custom") */
  customBandwidthGBs: number;
  /** Selected model ID */
  modelId: string;
  /** Selected quantization ID */
  quantId: string;
  /** Selected context length in tokens */
  contextLength: number;
  /** Selected KV cache precision ID */
  kvCachePrecisionId: string;
  /** Number of GPUs */
  gpuCount: number;
  /** Theoretical Overclock Percentage for memory bandwidth (e.g. 0 to 100) */
  overclockPercent?: number;
  /** Custom model spec imported from HuggingFace */
  customModelSpec?: ModelSpec;
}
