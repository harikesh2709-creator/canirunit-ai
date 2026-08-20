import { QuantizationConfig, KVCachePrecision, ContextOption } from '../types';

// ============================================================================
// Quantization Configurations
// ============================================================================

export const QUANTIZATION_CONFIGS: QuantizationConfig[] = [
  {
    id: 'fp16',
    label: 'FP16',
    bitsPerWeight: 16.0,
    description: 'Full half-precision — maximum quality, highest VRAM',
    format: 'Native',
  },
  {
    id: 'q8_0',
    label: 'Q8_0',
    bitsPerWeight: 8.5,
    description: 'Near-lossless 8-bit quantization',
    format: 'GGUF',
  },
  {
    id: 'q6_k',
    label: 'Q6_K',
    bitsPerWeight: 6.6,
    description: 'High-quality 6-bit with K-quant optimization',
    format: 'GGUF',
  },
  {
    id: 'q5_k_m',
    label: 'Q5_K_M',
    bitsPerWeight: 5.5,
    description: 'Excellent balance of quality and size',
    format: 'GGUF',
  },
  {
    id: 'q4_k_m',
    label: 'Q4_K_M',
    bitsPerWeight: 4.5,
    description: 'Most popular — good quality at low VRAM',
    format: 'GGUF',
  },
  {
    id: 'q3_k_m',
    label: 'Q3_K_M',
    bitsPerWeight: 3.5,
    description: 'Aggressive compression — noticeable quality loss',
    format: 'GGUF',
  },
  {
    id: 'iq2_xs',
    label: 'IQ2_XS',
    bitsPerWeight: 2.4,
    description: 'Extreme compression — significant quality reduction',
    format: 'GGUF',
  },
  {
    id: 'q2_k',
    label: 'Q2_K',
    bitsPerWeight: 2.8,
    description: 'Highly compressed 2-bit quantization',
    format: 'GGUF',
  }
];

// ============================================================================
// KV Cache Precision Options
// ============================================================================

export const KV_CACHE_PRECISIONS: KVCachePrecision[] = [
  {
    id: 'fp16',
    label: 'FP16',
    bytesPerValue: 2,
    description: 'Default precision — best quality',
  },
  {
    id: 'q8_0',
    label: 'Q8 Cache',
    bytesPerValue: 1,
    description: 'Quantized cache — half the memory, minimal quality loss',
  },
  {
    id: 'q4_0',
    label: 'Q4 Cache',
    bytesPerValue: 0.5,
    description: 'Aggressive cache compression — experimental',
  },
];

// ============================================================================
// Context Window Options
// ============================================================================

export const CONTEXT_OPTIONS: ContextOption[] = [
  { tokens: 2048, label: '2K' },
  { tokens: 4096, label: '4K' },
  { tokens: 8192, label: '8K' },
  { tokens: 16384, label: '16K' },
  { tokens: 32768, label: '32K' },
  { tokens: 65536, label: '64K' },
  { tokens: 131072, label: '128K' },
];

// ============================================================================
// Lookup Helpers
// ============================================================================

export function getQuantById(id: string): QuantizationConfig | undefined {
  return QUANTIZATION_CONFIGS.find((q) => q.id === id);
}

export function getKVCacheById(id: string): KVCachePrecision | undefined {
  return KV_CACHE_PRECISIONS.find((p) => p.id === id);
}
