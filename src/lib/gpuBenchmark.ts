// ============================================================================
// LLMFit.ai — GPU LLM Readiness Score Engine
// ============================================================================
// Calculates a composite 0–100 score reflecting how well a GPU can run local
// LLMs. Based on three weighted pillars:
//   - VRAM Capacity   (40%) — determines which models fit
//   - Mem Bandwidth   (40%) — determines token generation speed
//   - FP32 Compute    (20%) — determines prefill / TTFT speed
// ============================================================================

import { HardwareSpec } from './types';

// ============================================================================
// Types
// ============================================================================

export type GPUTier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface GPUBenchmarkResult {
  /** Composite LLM Readiness Score (0–100) */
  score: number;
  /** Tier classification */
  tier: GPUTier;
  /** Human-readable tier label */
  tierLabel: string;
  /** Tier description */
  tierDescription: string;
  /** Sub-scores (0–100 each) */
  vramScore: number;
  bandwidthScore: number;
  computeScore: number;
}

// ============================================================================
// Reference Ceilings
// ============================================================================
// These define the "100%" reference point for each pillar.
// Scores are capped at 100 — anything above the ceiling still gets 100.

/** 48 GB = top-tier consumer (RTX 3090/4090 class) */
const VRAM_CEILING_GB = 48;

/** 1000 GB/s = top-tier consumer bandwidth (RTX 4090 ~1008 GB/s) */
const BANDWIDTH_CEILING_GBS = 1000;

/** 80 TFLOPS = RTX 4090 FP32 peak */
const COMPUTE_CEILING_TFLOPS = 80;

// ============================================================================
// Weights
// ============================================================================

const WEIGHT_VRAM = 0.40;
const WEIGHT_BANDWIDTH = 0.40;
const WEIGHT_COMPUTE = 0.20;

// ============================================================================
// Tier Classification
// ============================================================================

export interface TierConfig {
  tier: GPUTier;
  label: string;
  description: string;
  color: string;
  glow: string;
  bg: string;
}

const TIER_CONFIGS: Record<GPUTier, TierConfig> = {
  S: {
    tier: 'S',
    label: 'S-Tier — Enthusiast',
    description: 'Run 70B+ models at full speed',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.3)',
    bg: 'rgba(168,85,247,0.1)',
  },
  A: {
    tier: 'A',
    label: 'A-Tier — High-End',
    description: 'Run 32B models comfortably',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.1)',
  },
  B: {
    tier: 'B',
    label: 'B-Tier — Mid-Range',
    description: 'Run 7–14B models well',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.3)',
    bg: 'rgba(59,130,246,0.1)',
  },
  C: {
    tier: 'C',
    label: 'C-Tier — Entry',
    description: 'Run 1–3B models, quantized only',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    bg: 'rgba(245,158,11,0.1)',
  },
  D: {
    tier: 'D',
    label: 'D-Tier — Minimal',
    description: 'Integrated GPU, very limited LLM capability',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
    bg: 'rgba(239,68,68,0.1)',
  },
};

// ============================================================================
// Main Scoring Function
// ============================================================================

/**
 * Calculate the LLM Readiness Score for a hardware spec.
 *
 * @param hardware - The resolved HardwareSpec (from presets or custom)
 * @param gpuCount - Number of GPUs (multiplies VRAM and bandwidth)
 * @returns GPUBenchmarkResult with composite score, tier, and sub-scores
 */
export function calculateLLMScore(
  hardware: HardwareSpec,
  gpuCount: number = 1
): GPUBenchmarkResult {
  // For Apple Silicon, apply the 75% usable memory factor
  const effectiveVram =
    hardware.platform === 'apple'
      ? hardware.vramGB * 0.75 * gpuCount
      : hardware.vramGB * gpuCount;

  // For multi-GPU, apply tensor parallelism overhead to bandwidth
  const effectiveBandwidth =
    gpuCount > 1
      ? hardware.bandwidthGBs * gpuCount * 0.85
      : hardware.bandwidthGBs;

  const effectiveTFLOPS = (hardware.fp32TFLOPS ?? 0) * gpuCount;

  // Calculate sub-scores (0–100 each, clamped)
  const vramScore = Math.min(100, Math.round((effectiveVram / VRAM_CEILING_GB) * 100));
  const bandwidthScore = Math.min(100, Math.round((effectiveBandwidth / BANDWIDTH_CEILING_GBS) * 100));
  const computeScore = Math.min(100, Math.round((effectiveTFLOPS / COMPUTE_CEILING_TFLOPS) * 100));

  // Composite weighted score
  const rawScore =
    vramScore * WEIGHT_VRAM +
    bandwidthScore * WEIGHT_BANDWIDTH +
    computeScore * WEIGHT_COMPUTE;

  const score = Math.min(100, Math.round(rawScore));

  // Tier classification
  const tier = classifyTier(score);
  const config = TIER_CONFIGS[tier];

  return {
    score,
    tier,
    tierLabel: config.label,
    tierDescription: config.description,
    vramScore,
    bandwidthScore,
    computeScore,
  };
}

/**
 * Get the visual styling config for a tier.
 */
export function getTierConfig(tier: GPUTier): TierConfig {
  return TIER_CONFIGS[tier];
}

// ============================================================================
// Internal Helpers
// ============================================================================

function classifyTier(score: number): GPUTier {
  if (score >= 80) return 'S';
  if (score >= 60) return 'A';
  if (score >= 40) return 'B';
  if (score >= 20) return 'C';
  return 'D';
}
