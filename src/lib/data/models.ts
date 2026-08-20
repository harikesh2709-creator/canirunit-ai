import { ModelSpec } from '../types';

// ============================================================================
// Comprehensive Model Architecture Database
// ============================================================================

const ALL_QUANTS = ['fp16', 'q8_0', 'q6_k', 'q5_k_m', 'q4_k_m', 'q3_k_m', 'iq2_xs'];

// --- Meta Llama 3 / 3.1 / 3.2 / 3.3 / 4 ---
const llama: ModelSpec[] = [
  { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', family: 'Llama', parametersBillion: 1.24, layers: 16, kvHeads: 8, headDimension: 64, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', family: 'Llama', parametersBillion: 3.21, layers: 28, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', family: 'Llama', parametersBillion: 8.03, layers: 32, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', family: 'Llama', parametersBillion: 70.6, layers: 80, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', family: 'Llama', parametersBillion: 70.6, layers: 80, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', family: 'Llama', parametersBillion: 405, layers: 126, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'llama-4-scout', name: 'Llama 4 Scout 17B (MoE)', family: 'Llama', parametersBillion: 109, layers: 48, kvHeads: 8, headDimension: 256, defaultContext: 131072, activeParametersBillion: 17, supportedQuants: ALL_QUANTS },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick 17B (MoE)', family: 'Llama', parametersBillion: 402, layers: 48, kvHeads: 8, headDimension: 256, defaultContext: 131072, activeParametersBillion: 17, supportedQuants: ALL_QUANTS },
];

// --- Qwen 2.5 / 3 / QwQ ---
const qwen: ModelSpec[] = [
  { id: 'qwen-2.5-0.5b', name: 'Qwen 2.5 0.5B', family: 'Qwen', parametersBillion: 0.5, layers: 24, kvHeads: 2, headDimension: 64, defaultContext: 32768, supportedQuants: ALL_QUANTS },
  { id: 'qwen-2.5-1.5b', name: 'Qwen 2.5 1.5B', family: 'Qwen', parametersBillion: 1.5, layers: 28, kvHeads: 2, headDimension: 128, defaultContext: 32768, supportedQuants: ALL_QUANTS },
  { id: 'qwen-2.5-3b', name: 'Qwen 2.5 3B', family: 'Qwen', parametersBillion: 3, layers: 36, kvHeads: 2, headDimension: 128, defaultContext: 32768, supportedQuants: ALL_QUANTS },
  { id: 'qwen-2.5-7b', name: 'Qwen 2.5 7B', family: 'Qwen', parametersBillion: 7, layers: 28, kvHeads: 4, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'qwen-2.5-14b', name: 'Qwen 2.5 14B', family: 'Qwen', parametersBillion: 14, layers: 48, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B', family: 'Qwen', parametersBillion: 32, layers: 64, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', family: 'Qwen', parametersBillion: 72, layers: 80, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'qwq-32b', name: 'QwQ 32B', family: 'Qwen', parametersBillion: 32, layers: 64, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
];

// --- DeepSeek ---
const deepseek: ModelSpec[] = [
  { id: 'deepseek-r1-distill-1.5b', name: 'DeepSeek-R1 Distill 1.5B', family: 'DeepSeek', parametersBillion: 1.5, layers: 28, kvHeads: 2, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'deepseek-r1-distill-7b', name: 'DeepSeek-R1 Distill 7B', family: 'DeepSeek', parametersBillion: 7, layers: 28, kvHeads: 4, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'deepseek-r1-distill-8b', name: 'DeepSeek-R1 Distill 8B', family: 'DeepSeek', parametersBillion: 8, layers: 32, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'deepseek-r1-distill-14b', name: 'DeepSeek-R1 Distill 14B', family: 'DeepSeek', parametersBillion: 14, layers: 48, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'deepseek-r1-distill-32b', name: 'DeepSeek-R1 Distill 32B', family: 'DeepSeek', parametersBillion: 32, layers: 64, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'deepseek-r1-distill-70b', name: 'DeepSeek-R1 Distill 70B', family: 'DeepSeek', parametersBillion: 70, layers: 80, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'deepseek-v3-671b', name: 'DeepSeek-V3 671B (MoE)', family: 'DeepSeek', parametersBillion: 671, layers: 61, kvHeads: 1, headDimension: 512, defaultContext: 131072, activeParametersBillion: 37, supportedQuants: ALL_QUANTS },
  { id: 'deepseek-r1-671b', name: 'DeepSeek-R1 671B (MoE)', family: 'DeepSeek', parametersBillion: 671, layers: 61, kvHeads: 1, headDimension: 512, defaultContext: 131072, activeParametersBillion: 37, supportedQuants: ALL_QUANTS },
];

// --- Mistral ---
const mistral: ModelSpec[] = [
  { id: 'mistral-7b', name: 'Mistral 7B', family: 'Mistral', parametersBillion: 7.24, layers: 32, kvHeads: 8, headDimension: 128, defaultContext: 32768, supportedQuants: ALL_QUANTS },
  { id: 'mistral-nemo-12b', name: 'Mistral NeMo 12B', family: 'Mistral', parametersBillion: 12, layers: 40, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'mistral-small-24b', name: 'Mistral Small 3 24B', family: 'Mistral', parametersBillion: 24, layers: 40, kvHeads: 8, headDimension: 128, defaultContext: 32768, supportedQuants: ALL_QUANTS },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B (MoE)', family: 'Mistral', parametersBillion: 46.7, layers: 32, kvHeads: 8, headDimension: 128, defaultContext: 32768, activeParametersBillion: 12.9, supportedQuants: ALL_QUANTS },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B (MoE)', family: 'Mistral', parametersBillion: 141, layers: 56, kvHeads: 8, headDimension: 128, defaultContext: 65536, activeParametersBillion: 39, supportedQuants: ALL_QUANTS },
  { id: 'mistral-large-123b', name: 'Mistral Large 123B', family: 'Mistral', parametersBillion: 123, layers: 88, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
];

// --- Google Gemma ---
const gemma: ModelSpec[] = [
  { id: 'gemma-2-2b', name: 'Gemma 2 2B', family: 'Gemma', parametersBillion: 2.61, layers: 26, kvHeads: 4, headDimension: 256, defaultContext: 8192, supportedQuants: ALL_QUANTS },
  { id: 'gemma-2-9b', name: 'Gemma 2 9B', family: 'Gemma', parametersBillion: 9.24, layers: 42, kvHeads: 4, headDimension: 256, defaultContext: 8192, supportedQuants: ALL_QUANTS },
  { id: 'gemma-2-27b', name: 'Gemma 2 27B', family: 'Gemma', parametersBillion: 27.23, layers: 46, kvHeads: 16, headDimension: 128, defaultContext: 8192, supportedQuants: ALL_QUANTS },
  { id: 'gemma-3-1b', name: 'Gemma 3 1B', family: 'Gemma', parametersBillion: 1, layers: 18, kvHeads: 4, headDimension: 256, defaultContext: 32768, supportedQuants: ALL_QUANTS },
  { id: 'gemma-3-4b', name: 'Gemma 3 4B', family: 'Gemma', parametersBillion: 4, layers: 34, kvHeads: 4, headDimension: 256, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'gemma-3-12b', name: 'Gemma 3 12B', family: 'Gemma', parametersBillion: 12, layers: 48, kvHeads: 4, headDimension: 256, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'gemma-3-27b', name: 'Gemma 3 27B', family: 'Gemma', parametersBillion: 27, layers: 62, kvHeads: 16, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
];

// --- Microsoft Phi ---
const phi: ModelSpec[] = [
  { id: 'phi-3-mini-3.8b', name: 'Phi-3 Mini 3.8B', family: 'Phi', parametersBillion: 3.82, layers: 32, kvHeads: 32, headDimension: 96, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'phi-3-small-7.4b', name: 'Phi-3 Small 7.4B', family: 'Phi', parametersBillion: 7.39, layers: 32, kvHeads: 8, headDimension: 96, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'phi-3-medium-14b', name: 'Phi-3 Medium 14B', family: 'Phi', parametersBillion: 14, layers: 40, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'phi-4-14b', name: 'Phi-4 14B', family: 'Phi', parametersBillion: 14, layers: 40, kvHeads: 8, headDimension: 128, defaultContext: 16384, supportedQuants: ALL_QUANTS },
  { id: 'phi-4-mini-3.8b', name: 'Phi-4 Mini 3.8B', family: 'Phi', parametersBillion: 3.8, layers: 32, kvHeads: 8, headDimension: 96, defaultContext: 131072, supportedQuants: ALL_QUANTS },
];

// --- Cohere Command R ---
const cohere: ModelSpec[] = [
  { id: 'command-r-35b', name: 'Command R 35B', family: 'Command R', parametersBillion: 35, layers: 40, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
  { id: 'command-r-plus-104b', name: 'Command R+ 104B', family: 'Command R', parametersBillion: 104, layers: 64, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
];

// --- 01.AI Yi ---
const yi: ModelSpec[] = [
  { id: 'yi-1.5-6b', name: 'Yi 1.5 6B', family: 'Yi', parametersBillion: 6, layers: 32, kvHeads: 4, headDimension: 128, defaultContext: 4096, supportedQuants: ALL_QUANTS },
  { id: 'yi-1.5-9b', name: 'Yi 1.5 9B', family: 'Yi', parametersBillion: 9, layers: 48, kvHeads: 4, headDimension: 128, defaultContext: 4096, supportedQuants: ALL_QUANTS },
  { id: 'yi-1.5-34b', name: 'Yi 1.5 34B', family: 'Yi', parametersBillion: 34, layers: 60, kvHeads: 8, headDimension: 128, defaultContext: 4096, supportedQuants: ALL_QUANTS },
];

// --- Stability AI / StableLM ---
const starcoder: ModelSpec[] = [
  { id: 'starcoder2-3b', name: 'StarCoder2 3B', family: 'StarCoder', parametersBillion: 3, layers: 30, kvHeads: 2, headDimension: 128, defaultContext: 16384, supportedQuants: ALL_QUANTS },
  { id: 'starcoder2-7b', name: 'StarCoder2 7B', family: 'StarCoder', parametersBillion: 7, layers: 32, kvHeads: 4, headDimension: 128, defaultContext: 16384, supportedQuants: ALL_QUANTS },
  { id: 'starcoder2-15b', name: 'StarCoder2 15B', family: 'StarCoder', parametersBillion: 15, layers: 40, kvHeads: 4, headDimension: 128, defaultContext: 16384, supportedQuants: ALL_QUANTS },
];

// --- Internlm ---
const internlm: ModelSpec[] = [
  { id: 'internlm2.5-7b', name: 'InternLM 2.5 7B', family: 'InternLM', parametersBillion: 7, layers: 32, kvHeads: 8, headDimension: 128, defaultContext: 32768, supportedQuants: ALL_QUANTS },
  { id: 'internlm2.5-20b', name: 'InternLM 2.5 20B', family: 'InternLM', parametersBillion: 20, layers: 48, kvHeads: 8, headDimension: 128, defaultContext: 32768, supportedQuants: ALL_QUANTS },
];

// --- NVIDIA Nemotron ---
const nemotron: ModelSpec[] = [
  { id: 'nemotron-mini-4b', name: 'Nemotron Mini 4B', family: 'Nemotron', parametersBillion: 4, layers: 32, kvHeads: 8, headDimension: 128, defaultContext: 4096, supportedQuants: ALL_QUANTS },
  { id: 'nemotron-70b', name: 'Nemotron 70B', family: 'Nemotron', parametersBillion: 70, layers: 80, kvHeads: 8, headDimension: 128, defaultContext: 131072, supportedQuants: ALL_QUANTS },
];

// --- xAI ---
const xai: ModelSpec[] = [
  { id: 'grok-1', name: 'Grok-1 314B (MoE)', family: 'Grok', parametersBillion: 314, layers: 64, kvHeads: 8, headDimension: 128, defaultContext: 8192, activeParametersBillion: 86, supportedQuants: ALL_QUANTS },
];

// ============================================================================
// Exports
// ============================================================================

export const MODEL_PRESETS: ModelSpec[] = [
  ...llama,
  ...qwen,
  ...deepseek,
  ...mistral,
  ...gemma,
  ...phi,
  ...cohere,
  ...yi,
  ...starcoder,
  ...internlm,
  ...nemotron,
  ...xai,
];

export const MODEL_FAMILIES = [
  { label: 'Llama (Meta)', items: llama },
  { label: 'Qwen / QwQ (Alibaba)', items: qwen },
  { label: 'DeepSeek', items: deepseek },
  { label: 'Mistral / Mixtral', items: mistral },
  { label: 'Gemma (Google)', items: gemma },
  { label: 'Phi (Microsoft)', items: phi },
  { label: 'Command R (Cohere)', items: cohere },
  { label: 'Yi (01.AI)', items: yi },
  { label: 'StarCoder', items: starcoder },
  { label: 'InternLM', items: internlm },
  { label: 'Nemotron (NVIDIA)', items: nemotron },
  { label: 'Grok (xAI)', items: xai },
];

export function getModelById(id: string): ModelSpec | undefined {
  return MODEL_PRESETS.find((m) => m.id === id);
}
