// ============================================================================
// LLMFit.ai — GPU Detection Engine
// ============================================================================
// Detects user's GPU via WebGPU (primary) and WebGL (fallback).
// Fuzzy-matches detected GPU string against the hardware database.
// ============================================================================

import { HardwareSpec } from './types';
import { HARDWARE_PRESETS } from './data/hardware';

// ============================================================================
// Types
// ============================================================================

export interface GPUDetectionResult {
  /** Whether WebGPU is supported in this browser */
  webgpuSupported: boolean;
  /** Whether WebGL is supported in this browser */
  webglSupported: boolean;
  /** Detection method used */
  method: 'webgpu' | 'webgl' | 'none';

  /** Raw vendor string from the API */
  vendor: string;
  /** Raw renderer / device description string */
  renderer: string;
  /** GPU architecture (WebGPU only) */
  architecture: string;

  /** Best-matched hardware preset ID, or null if no match */
  detectedHardwareId: string | null;
  /** Match confidence score (0-1) */
  matchConfidence: number;
  /** The matched hardware spec, if any */
  matchedHardware: HardwareSpec | null;

  /** WebGPU adapter limits (if available) */
  adapterLimits: AdapterLimits | null;

  /** Whether the hardware was confidently auto-detected and unmasked */
  autoDetected: boolean;
  /** The cleaned/unmasked hardware string extracted from the browser */
  unmaskedRenderer: string;
}

export interface AdapterLimits {
  maxStorageBufferBindingSize: number;
  maxComputeWorkgroupSizeX: number;
  maxComputeWorkgroupSizeY: number;
  maxComputeWorkgroupSizeZ: number;
  maxComputeInvocationsPerWorkgroup: number;
  maxBufferSize: number;
}

// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Detect the user's GPU using WebGPU (preferred) or WebGL (fallback).
 * Returns detection results including the best-matched hardware preset.
 */
export async function detectGPU(): Promise<GPUDetectionResult> {
  // Try to get WebGL unmasked renderer first because it has the most accurate string (e.g. "RTX 4090")
  // WebGPU often masks this behind generic names like "WebGPU Device"
  const webglResult = tryWebGL();
  
  // Try WebGPU to get exact limits and compute capabilities
  const webgpuResult = await tryWebGPU();

  if (webgpuResult) {
    // If WebGPU is supported but the renderer string is generic, use WebGL's highly accurate unmasked string
    if (webglResult && webglResult.unmaskedRenderer && webgpuResult.unmaskedRenderer.length < 15) {
      webgpuResult.unmaskedRenderer = webglResult.unmaskedRenderer;
      webgpuResult.renderer = webglResult.renderer;
      
      // Re-run fuzzy match with the much better WebGL string
      const fullString = `${webgpuResult.vendor} ${webgpuResult.unmaskedRenderer} ${webgpuResult.architecture}`.toLowerCase();
      const match = findBestHardwareMatch(fullString);
      
      webgpuResult.detectedHardwareId = match?.id ?? null;
      webgpuResult.matchConfidence = match?.confidence ?? 0;
      webgpuResult.matchedHardware = match?.hardware ?? null;
      webgpuResult.autoDetected = (match?.confidence ?? 0) >= 0.6;
    }
    
    return webgpuResult;
  }

  // Fallback purely to WebGL if WebGPU is unsupported
  if (webglResult) {
    return webglResult;
  }

  // No GPU detection available
  return {
    webgpuSupported: false,
    webglSupported: false,
    method: 'none',
    vendor: '',
    renderer: '',
    architecture: '',
    detectedHardwareId: null,
    matchConfidence: 0,
    matchedHardware: null,
    adapterLimits: null,
    autoDetected: false,
    unmaskedRenderer: '',
  };
}

// ============================================================================
// Clean Renderer String
// ============================================================================

export function cleanRendererString(raw: string): string {
  if (!raw) return '';
  let cleaned = raw;

  // 1. Strip ANGLE wrapper: ANGLE (Vendor, Renderer, API)
  // e.g. "ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)"
  const angleMatch = cleaned.match(/ANGLE\s*\([^,]+,\s*([^,]+)/i);
  if (angleMatch) {
    cleaned = angleMatch[1];
  }

  // 2. Strip graphics APIs and generic terms
  const termsToRemove = [
    /Direct3D\s*11.*/ig,
    /D3D11/ig,
    /OpenGL Engine/ig,
    /Metal/ig,
    /vs_\d_\d/ig,
    /ps_\d_\d/ig,
    /\(TM\)/ig,
    /\(R\)/ig,
    /Graphics/ig,
    /Series/ig
  ];

  for (const term of termsToRemove) {
    cleaned = cleaned.replace(term, '');
  }

  // 3. Clean up extra spaces and commas
  cleaned = cleaned.replace(/,\s*[^a-z0-9]*$/i, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned;
}

export function isSoftwareRenderer(renderer: string): boolean {
  const softwareKeywords = [
    'swiftshader',
    'llvmpipe',
    'basic render driver',
    'generic',
    'microsoft basic',
    'software rasterizer'
  ];
  const lower = renderer.toLowerCase();
  return softwareKeywords.some((k) => lower.includes(k));
}

// ============================================================================
// WebGPU Detection
// ============================================================================

async function tryWebGPU(): Promise<GPUDetectionResult | null> {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return null;
  }

  try {
    const gpu: GPU = navigator.gpu;

    const adapter = await gpu.requestAdapter({
      powerPreference: 'high-performance',
    });

    if (!adapter) return null;

    // Extract adapter info
    const info = adapter.info;
    const vendor = info?.vendor ?? '';
    const architecture = info?.architecture ?? '';
    const device = info?.device ?? '';
    const description = info?.description ?? '';

    // Build a renderer string from available info
    const renderer = [description, device].filter(Boolean).join(' ').trim() || 'Unknown GPU';

    // Extract adapter limits
    const limits = adapter.limits;
    const adapterLimits: AdapterLimits = {
      maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
      maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
      maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
      maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
      maxComputeInvocationsPerWorkgroup: limits.maxComputeInvocationsPerWorkgroup,
      maxBufferSize: limits.maxBufferSize,
    };

    const unmaskedRenderer = cleanRendererString(renderer);

    // Fuzzy match against hardware database
    const fullString = `${vendor} ${unmaskedRenderer} ${architecture}`.toLowerCase();
    const match = findBestHardwareMatch(fullString);

    return {
      webgpuSupported: true,
      webglSupported: true, // If WebGPU works, WebGL almost certainly does too
      method: 'webgpu',
      vendor,
      renderer,
      architecture,
      detectedHardwareId: match?.id ?? null,
      matchConfidence: match?.confidence ?? 0,
      matchedHardware: match?.hardware ?? null,
      adapterLimits,
      autoDetected: (match?.confidence ?? 0) >= 0.6,
      unmaskedRenderer,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// WebGL Fallback Detection
// ============================================================================

function tryWebGL(): GPUDetectionResult | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const glOpts = { powerPreference: 'high-performance' };
    const gl =
      (canvas.getContext('webgl2', glOpts) as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl', glOpts) as WebGLRenderingContext | null);

    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return {
        webgpuSupported: false,
        webglSupported: true,
        method: 'webgl',
        vendor: gl.getParameter(gl.VENDOR) ?? '',
        renderer: gl.getParameter(gl.RENDERER) ?? '',
        architecture: '',
        detectedHardwareId: null,
        matchConfidence: 0,
        matchedHardware: null,
        adapterLimits: null,
        autoDetected: false,
        unmaskedRenderer: '',
      };
    }

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? '';

    // Clean up
    const ext = gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();

    const unmaskedRenderer = cleanRendererString(renderer);

    // Fuzzy match
    const fullString = `${vendor} ${unmaskedRenderer}`.toLowerCase();
    const match = findBestHardwareMatch(fullString);

    return {
      webgpuSupported: false,
      webglSupported: true,
      method: 'webgl',
      vendor,
      renderer,
      architecture: '',
      detectedHardwareId: match?.id ?? null,
      matchConfidence: match?.confidence ?? 0,
      matchedHardware: match?.hardware ?? null,
      adapterLimits: null,
      autoDetected: (match?.confidence ?? 0) >= 0.6,
      unmaskedRenderer,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Hardware Database Fuzzy Matcher
// ============================================================================

interface MatchResult {
  id: string;
  hardware: HardwareSpec;
  confidence: number;
}

/**
 * Find the best-matching hardware preset for a given GPU string.
 * Uses a scoring system based on keyword matches, model numbers, and vendor identification.
 */
function findBestHardwareMatch(gpuString: string): MatchResult | null {
  const normalized = gpuString.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  let bestMatch: MatchResult | null = null;
  let bestScore = 0;

  for (const hw of HARDWARE_PRESETS) {
    if (hw.id === 'custom') continue;

    const score = calculateMatchScore(normalized, hw);
    if (score > bestScore && score >= 0.3) {
      bestScore = score;
      bestMatch = {
        id: hw.id,
        hardware: hw,
        confidence: Math.min(score, 1),
      };
    }
  }

  return bestMatch;
}

/**
 * Score how well a detected GPU string matches a hardware preset.
 * Returns 0-1 confidence score.
 */
function calculateMatchScore(gpuString: string, hw: HardwareSpec): number {
  const hwName = hw.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  let score = 0;

  // Extract key tokens from hardware name
  const hwTokens = hwName.split(/\s+/).filter((t) => t.length > 1);

  // Check vendor match
  const vendors: Record<string, string[]> = {
    nvidia: ['nvidia', 'geforce', 'rtx', 'gtx', 'titan', 'quadro'],
    amd: ['amd', 'radeon', 'rx', 'instinct'],
    intel: ['intel', 'arc'],
    apple: ['apple', 'm1', 'm2', 'm3', 'm4'],
  };

  let vendorDetected = '';
  let hwVendor = '';

  for (const [vendor, keywords] of Object.entries(vendors)) {
    if (keywords.some((k) => gpuString.includes(k))) vendorDetected = vendor;
    if (keywords.some((k) => hwName.includes(k))) hwVendor = vendor;
  }

  if (vendorDetected && hwVendor && vendorDetected === hwVendor) {
    score += 0.25;
  } else if (vendorDetected && hwVendor && vendorDetected !== hwVendor) {
    return 0; // Wrong vendor, skip entirely
  }

  // Check for model name/number matches
  // Extract parts like "4090", "a770", "m1", "m2", "m3", "mi300x"
  const modelIdentifiers = hwTokens.filter(
    (t) => /^\d{3,5}/.test(t) || /^m[1-4]$/.test(t) || /^a\d{3}/.test(t) || /^b\d{3}/.test(t) || /^mi\d{3}/.test(t) || /^w\d{4}/.test(t)
  );

  for (const mod of modelIdentifiers) {
    if (gpuString.includes(mod)) {
      score += 0.40;
    }
  }

  // Check for series/variant tokens (e.g., "ti", "super", "xt", "xtx", "pro", "max", "ultra")
  const variantTokens = ['ti', 'super', 'xt', 'xtx', 'gre', 'pro', 'max', 'ultra', 'mini'];
  for (const variant of variantTokens) {
    // Check if variant exists as a distinct word
    const regex = new RegExp(`\\b${variant}\\b`);
    const inGpu = regex.test(gpuString);
    const inHw = regex.test(hwName);

    if (inGpu && inHw) {
      score += 0.20;
    } else if (inGpu !== inHw) {
      // One has the variant and the other doesn't — penalty
      score -= 0.15;
    }
  }

  // Check for VRAM size in string (e.g., "8gb", "24gb")
  const vramMatch = gpuString.match(/(\d+)\s*gb/);
  if (vramMatch) {
    const detectedVram = parseInt(vramMatch[1], 10);
    if (detectedVram === hw.vramGB) {
      score += 0.15;
    }
  }

  // Check for generation prefix match (e.g., "rtx", "gtx", "rx")
  const prefixes = ['rtx', 'gtx', 'rx', 'arc'];
  for (const prefix of prefixes) {
    if (gpuString.includes(prefix) && hwName.includes(prefix)) {
      score += 0.1;
    }
  }

  return Math.max(0, score);
}

// ============================================================================
// Utility: Check WebGPU Support
// ============================================================================

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator && !!navigator.gpu;
}

// ============================================================================
// detectHardwareGPU (Requested Export Signature)
// ============================================================================

export interface HardwareDetectionResult {
  name: string;
  vendor: string;
  vramGB: number;
  bandwidthGBs: number;
  fp32TFLOPS: number;
  rawRenderer: string;
  isSoftwareRenderer: boolean;
  isFallback: boolean;
  hardwareId: string | null;
  adapterLimits?: AdapterLimits | null;
}

export async function detectHardwareGPU(): Promise<HardwareDetectionResult> {
  const result = await detectGPU();

  const isSoftware = isSoftwareRenderer(result.unmaskedRenderer) || isSoftwareRenderer(result.renderer);
  
  if (isSoftware || (!result.matchedHardware && !result.autoDetected)) {
    const rawName = result.unmaskedRenderer || result.renderer || 'Unknown';
    const fallbackName = rawName.length > 3 ? rawName : 'Generic GPU';
    
    return {
      name: isSoftware ? 'Software Renderer (Fallback)' : `${fallbackName} (Unrecognized)`,
      vendor: result.vendor || 'Unknown',
      vramGB: 4,
      bandwidthGBs: 100,
      fp32TFLOPS: 2.0,
      rawRenderer: rawName,
      isSoftwareRenderer: isSoftware,
      isFallback: true,
      hardwareId: null,
      adapterLimits: result.adapterLimits,
    };
  }

  return {
    name: result.matchedHardware?.name || result.unmaskedRenderer || 'Unknown GPU',
    vendor: result.matchedHardware?.platform || result.vendor || 'Unknown',
    vramGB: result.matchedHardware?.vramGB || 8,
    bandwidthGBs: result.matchedHardware?.bandwidthGBs || 200,
    fp32TFLOPS: result.matchedHardware?.fp32TFLOPS || 5.0,
    rawRenderer: result.unmaskedRenderer || result.renderer,
    isSoftwareRenderer: false,
    isFallback: false,
    hardwareId: result.detectedHardwareId,
    adapterLimits: result.adapterLimits,
  };
}
