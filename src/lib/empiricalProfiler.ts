// ============================================================================
// LLMFit.ai — WebGPU Empirical Profiler
// ============================================================================
// Runs a real FP32 matrix multiplication compute shader in the browser.
// Measures GFLOPS and estimates available VRAM / Memory bounds.
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export type BenchmarkStage =
  | 'idle'
  | 'initializing'
  | 'warmup'
  | 'running'
  | 'complete'
  | 'error'
  | 'unsupported';

export interface BenchmarkProgress {
  stage: BenchmarkStage;
  currentIteration: number;
  totalIterations: number;
  stageLabel: string;
  progress: number;
}

export type EmpiricalTier = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';

export interface EmpiricalResult {
  success: boolean;
  error?: string;

  matrixSize: number;
  flopsPerRun: number;

  iterationTimesMs: number[];
  averageTimeMs: number;
  stdDevMs: number;

  gflops: number;
  tflops: number;

  aiScore: number;
  tier: EmpiricalTier;
  tierLabel: string;
  
  estimatedVramGB: number;
  estimatedBandwidthGBs: number;
}

// ============================================================================
// Constants
// ============================================================================

const MATRIX_SIZE = 512; // Reduced further to prevent locking the OS compositor on slower GPUs
const WARMUP_PASSES = 5;
const TIMED_ITERATIONS = 50; // Increased passes to compensate for smaller workload
const DISPATCHES_PER_ITERATION = 1; // 1 dispatch per frame allows the GPU to context-switch and render the DOM
const TILE_SIZE = 16;

/** FLOPs for matrix multiply: 2 × N³ */
const FLOPS_PER_RUN = 2 * Math.pow(MATRIX_SIZE, 3);

// ============================================================================
// WGSL Compute Shader — Tiled Matrix Multiplication
// ============================================================================

const MATMUL_SHADER = /* wgsl */ `
struct Uniforms {
  N: u32,
}

@group(0) @binding(0) var<storage, read> matA: array<f32>;
@group(0) @binding(1) var<storage, read> matB: array<f32>;
@group(0) @binding(2) var<storage, read_write> matC: array<f32>;
@group(0) @binding(3) var<uniform> uniforms: Uniforms;

const TILE_SIZE: u32 = ${TILE_SIZE}u;

var<workgroup> tileA: array<array<f32, ${TILE_SIZE}>, ${TILE_SIZE}>;
var<workgroup> tileB: array<array<f32, ${TILE_SIZE}>, ${TILE_SIZE}>;

@compute @workgroup_size(${TILE_SIZE}, ${TILE_SIZE})
fn main(
  @builtin(global_invocation_id) globalId: vec3u,
  @builtin(local_invocation_id) localId: vec3u,
  @builtin(workgroup_id) groupId: vec3u,
) {
  let N = uniforms.N;
  let row = globalId.y;
  let col = globalId.x;
  let localRow = localId.y;
  let localCol = localId.x;

  var sum: f32 = 0.0;
  let numTiles = (N + TILE_SIZE - 1u) / TILE_SIZE;

  for (var t: u32 = 0u; t < numTiles; t = t + 1u) {
    let aRow = row;
    let aCol = t * TILE_SIZE + localCol;
    if (aRow < N && aCol < N) {
      tileA[localRow][localCol] = matA[aRow * N + aCol];
    } else {
      tileA[localRow][localCol] = 0.0;
    }

    let bRow = t * TILE_SIZE + localRow;
    let bCol = col;
    if (bRow < N && bCol < N) {
      tileB[localRow][localCol] = matB[bRow * N + bCol];
    } else {
      tileB[localRow][localCol] = 0.0;
    }

    workgroupBarrier();

    for (var k: u32 = 0u; k < TILE_SIZE; k = k + 1u) {
      sum = sum + tileA[localRow][k] * tileB[k][localCol];
    }

    workgroupBarrier();
  }

  if (row < N && col < N) {
    matC[row * N + col] = sum;
  }
}
`;

// ============================================================================
// Benchmark Runner
// ============================================================================

export async function runEmpiricalProfile(
  onProgress?: (progress: BenchmarkProgress) => void
): Promise<EmpiricalResult> {
  const report = (
    stage: BenchmarkStage,
    currentIteration: number,
    stageLabel: string,
    progress: number
  ) => {
    onProgress?.({
      stage,
      currentIteration,
      totalIterations: TIMED_ITERATIONS,
      stageLabel,
      progress,
    });
  };

  if (typeof navigator === 'undefined' || !navigator.gpu) {
    report('unsupported', 0, 'WebGPU not supported', 0);
    return makeErrorResult('WebGPU is not supported in this browser');
  }

  report('initializing', 0, 'Initializing WebGPU…', 0.05);

  try {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance',
    });
    if (!adapter) {
      report('error', 0, 'No GPU adapter found', 0);
      return makeErrorResult('No WebGPU adapter available');
    }

    const device = await adapter.requestDevice({
      requiredLimits: {
        maxStorageBufferBindingSize: Math.min(
          adapter.limits.maxStorageBufferBindingSize,
          MATRIX_SIZE * MATRIX_SIZE * 4 
        ),
      },
    });

    report('initializing', 0, 'Creating GPU buffers…', 0.1);

    const N = MATRIX_SIZE;
    const elementCount = N * N;
    const byteSize = elementCount * 4; 

    const dataA = new Float32Array(elementCount).fill(0.01);
    const dataB = new Float32Array(elementCount).fill(0.01);

    const bufferA = device.createBuffer({
      size: byteSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const bufferB = device.createBuffer({
      size: byteSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const bufferC = device.createBuffer({
      size: byteSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const uniformData = new Uint32Array([N]);
    const uniformBuffer = device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(bufferA, 0, dataA);
    device.queue.writeBuffer(bufferB, 0, dataB);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    report('initializing', 0, 'Compiling compute shader…', 0.15);

    const shaderModule = device.createShaderModule({
      code: MATMUL_SHADER,
    });

    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: bufferA } },
        { binding: 1, resource: { buffer: bufferB } },
        { binding: 2, resource: { buffer: bufferC } },
        { binding: 3, resource: { buffer: uniformBuffer } },
      ],
    });

    const workgroupCount = Math.ceil(N / TILE_SIZE);

    report('warmup', 0, 'Warmup pass…', 0.2);

    for (let w = 0; w < WARMUP_PASSES; w++) {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(workgroupCount, workgroupCount);
      pass.end();
      device.queue.submit([encoder.finish()]);
      await device.queue.onSubmittedWorkDone();
    }

    const iterationTimesMs: number[] = [];

    for (let i = 0; i < TIMED_ITERATIONS; i++) {
      const iterProgress = 0.3 + (i / TIMED_ITERATIONS) * 0.6;
      report('running', i + 1, `Benchmark pass ${i + 1}/${TIMED_ITERATIONS}…`, iterProgress);

      await yieldToMainThread();

      const startTime = performance.now();

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      for (let d = 0; d < DISPATCHES_PER_ITERATION; d++) {
        pass.dispatchWorkgroups(workgroupCount, workgroupCount);
      }
      pass.end();

      device.queue.submit([encoder.finish()]);
      await device.queue.onSubmittedWorkDone();

      const endTime = performance.now();
      iterationTimesMs.push((endTime - startTime) / DISPATCHES_PER_ITERATION);
    }

    report('complete', TIMED_ITERATIONS, 'Benchmark complete!', 1.0);

    const averageTimeMs =
      iterationTimesMs.reduce((a, b) => a + b, 0) / iterationTimesMs.length;
    const averageTimeSec = averageTimeMs / 1000;

    const variance =
      iterationTimesMs.reduce((sum, t) => sum + Math.pow(t - averageTimeMs, 2), 0) /
      iterationTimesMs.length;
    const stdDevMs = Math.sqrt(variance);

    const gflops = FLOPS_PER_RUN / (averageTimeSec * 1e9);
    const tflops = gflops / 1000;

    const { aiScore, tier, tierLabel } = calculateScoreAndTier(gflops);

    // Memory Estimation Heuristic
    const maxBufferLimit = Math.max(adapter.limits.maxStorageBufferBindingSize, adapter.limits.maxBufferSize);
    let estimatedVramGB = Math.round((maxBufferLimit * 4) / (1024 * 1024 * 1024));
    
    // Clamp to at least 4GB
    estimatedVramGB = Math.max(4, estimatedVramGB);

    const estimatedBandwidthGBs = Math.max(100, Math.round(gflops * 0.35));

    bufferA.destroy();
    bufferB.destroy();
    bufferC.destroy();
    uniformBuffer.destroy();
    device.destroy();

    return {
      success: true,
      matrixSize: N,
      flopsPerRun: FLOPS_PER_RUN,
      iterationTimesMs,
      averageTimeMs: Math.round(averageTimeMs * 100) / 100,
      stdDevMs: Math.round(stdDevMs * 100) / 100,
      gflops: Math.round(gflops * 10) / 10,
      tflops: Math.round(tflops * 100) / 100,
      aiScore,
      tier,
      tierLabel,
      estimatedVramGB,
      estimatedBandwidthGBs
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Benchmark failed unexpectedly';
    report('error', 0, msg, 0);
    return makeErrorResult(msg);
  }
}

// ============================================================================
// Score & Tier Classification
// ============================================================================

function calculateScoreAndTier(gflops: number): {
  aiScore: number;
  tier: EmpiricalTier;
  tierLabel: string;
} {
  const baseline = 30; 
  const scaleFactor = 150; 

  let aiScore: number;
  if (gflops <= baseline) {
    aiScore = Math.max(0, (gflops / baseline) * 20);
  } else {
    aiScore = Math.min(1000, scaleFactor * Math.log2(gflops / baseline));
  }

  aiScore = Math.round(aiScore);

  let tier: EmpiricalTier;
  let tierLabel: string;

  if (gflops < 150) {
    tier = 'tier-4';
    tierLabel = 'Tier 4 (Entry)';
  } else if (gflops < 500) {
    tier = 'tier-3';
    tierLabel = 'Tier 3 (Mid-Tier)';
  } else if (gflops < 1200) {
    tier = 'tier-2';
    tierLabel = 'Tier 2 (High-End)';
  } else {
    tier = 'tier-1';
    tierLabel = 'Tier 1 (Enthusiast)';
  }

  return { aiScore, tier, tierLabel };
}

// ============================================================================
// Helpers
// ============================================================================

function makeErrorResult(error: string): EmpiricalResult {
  return {
    success: false,
    error,
    matrixSize: MATRIX_SIZE,
    flopsPerRun: FLOPS_PER_RUN,
    iterationTimesMs: [],
    averageTimeMs: 0,
    stdDevMs: 0,
    gflops: 0,
    tflops: 0,
    aiScore: 0,
    tier: 'tier-1',
    tierLabel: 'N/A',
    estimatedVramGB: 8,
    estimatedBandwidthGBs: 200
  };
}

function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 16);
    }
  });
}

export function isEmpiricalProfilingSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator && !!navigator.gpu;
}
