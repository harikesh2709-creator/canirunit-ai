'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  MonitorCheck,
  Shield,
  Sparkles,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitToLeaderboard } from '@/lib/leaderboardService';
import SearchableDropdown from './SearchableDropdown';
import { HARDWARE_GROUPS, HARDWARE_PRESETS } from '@/lib/data/hardware';
import { HardwareSpec } from '@/lib/types';

import {
  detectHardwareGPU,
  HardwareDetectionResult,
  isWebGPUSupported,
} from '@/lib/gpuDetector';
import {
  runEmpiricalProfile,
  BenchmarkProgress,
  EmpiricalResult,
  EmpiricalTier,
  isEmpiricalProfilingSupported,
} from '@/lib/empiricalProfiler';
import { AffiliateCard } from './AffiliateTriggers';
import { EthicalAdSlot, ProFeatureGate } from './MonetizationBanner';
import CliSyncModal from './CliSyncModal';
import { useCalculator } from '@/lib/CalculatorContext';
import { calculateLLMScore, getTierConfig, GPUTier } from '@/lib/gpuBenchmark';

// ============================================================================
// Props
// ============================================================================

interface BenchmarkScannerProps {
  onHardwareDetected: (hardwareId: string, customVramGB?: number, isIntegrated?: boolean) => void;
  onBenchmarkComplete: (result: EmpiricalResult) => void;
  onViewSetup?: () => void;
  onIntegratedGpuDetected?: () => void;
}

// ============================================================================
// Tier config for visual styling
// ============================================================================

// Tier styles are now driven by gpuBenchmark.ts via getTierConfig()

// ============================================================================
// Component
// ============================================================================

export default function BenchmarkScanner({
  onHardwareDetected,
  onBenchmarkComplete,
  onIntegratedGpuDetected,
}: BenchmarkScannerProps) {
  const [phase, setPhase] = useState<'idle' | 'detecting' | 'confirming' | 'benchmarking' | 'done' | 'error'>('idle');
  const [detection, setDetection] = useState<HardwareDetectionResult | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<EmpiricalResult | null>(null);
  const [progress, setProgress] = useState<BenchmarkProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>('rtx-4060-ti-8gb');
  
  const { state, hardware, result: calcResult, updateState } = useCalculator();
  const router = useRouter();

  const handleLeaderboardSubmit = useCallback(() => {
    if (!detection) return;
    const nickname = window.prompt("Enter your nickname for the global leaderboard:");
    if (!nickname || nickname.trim().length === 0) return;
    
    const llmScore = calculateLLMScore(hardware, state.gpuCount);
    let tierNum: 1 | 2 | 3 = 3;
    if (llmScore.tier === 'S') tierNum = 1;
    if (llmScore.tier === 'A') tierNum = 2;
    if (llmScore.tier === 'B' || llmScore.tier === 'C' || llmScore.tier === 'D') tierNum = 3;

    submitToLeaderboard(nickname.trim(), detection.name, llmScore.score, tierNum);
    router.push('/leaderboard');
  }, [detection, hardware, state.gpuCount, router]);

  const selectedHw = useMemo(() => {
    return HARDWARE_PRESETS.find(h => h.id === selectedHardwareId) || HARDWARE_PRESETS[0];
  }, [selectedHardwareId]);

  const previewLlmScore = useMemo(() => {
    return calculateLLMScore(selectedHw, state.gpuCount);
  }, [selectedHw, state.gpuCount]);

  const previewTierConfig = getTierConfig(previewLlmScore.tier);

  const handleScan = useCallback(async () => {
    setPhase('detecting');
    setErrorMsg('');
    setBenchmarkResult(null);
    setDetection(null);

    try {
      // Step 1: Detect GPU via WebGPU
      const gpuResult = await detectHardwareGPU();
      setDetection(gpuResult);

      let initialHwId = 'rtx-4060-ti-8gb';
      if (gpuResult.hardwareId && gpuResult.hardwareId !== 'custom') {
        initialHwId = gpuResult.hardwareId;
      } else if (gpuResult.name && gpuResult.name.toLowerCase().includes('4090')) {
        initialHwId = 'rtx-4090';
      } else if (gpuResult.name && gpuResult.name.toLowerCase().includes('3060')) {
        initialHwId = 'rtx-3060-12gb';
      }

      setSelectedHardwareId(initialHwId);
      setPhase('confirming');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Detection failed');
      setPhase('error');
    }
  }, []);

  const handleConfirmAndBenchmark = useCallback(async () => {
    setPhase('benchmarking');
    
    // Use the chosen hardware ID from dropdown
    const chosenId = selectedHardwareId || 'rtx-4060-ti-8gb';
    const chosenHw = HARDWARE_PRESETS.find(h => h.id === chosenId) || selectedHw;
      
    onHardwareDetected(chosenId, chosenHw.vramGB, chosenHw.isIntegrated);
    
    if (chosenHw.isIntegrated && onIntegratedGpuDetected) {
      onIntegratedGpuDetected();
    }

    try {
      if (isEmpiricalProfilingSupported()) {
        const result = await runEmpiricalProfile((p) => setProgress(p));

        if (result.success) {
          setBenchmarkResult(result);
          onBenchmarkComplete(result);
          updateState({ activeProfile: 'primary', hardwareId: chosenId });
          setPhase('done');
        } else {
          setErrorMsg(result.error ?? 'Benchmark failed');
          setPhase('done');
        }
      } else {
        updateState({ activeProfile: 'primary', hardwareId: chosenId });
        setPhase('done');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Benchmark failed');
      setPhase('error');
    }
  }, [selectedHardwareId, selectedHw, onHardwareDetected, onIntegratedGpuDetected, onBenchmarkComplete, updateState]);

  const isRunning = phase === 'detecting' || phase === 'benchmarking';

  return (
    <div className="relative">
      {/* Scan line effect during detection */}
      {isRunning && <div className="scan-line-effect" />}

      {/* Idle State */}
      {phase === 'idle' && (
        <button
          onClick={handleScan}
          className="w-full py-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 
                     border border-indigo-400/20 hover:border-indigo-400/40 shadow-lg hover:shadow-indigo-500/25
                     transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
        >
          <Zap className="w-4 h-4 text-indigo-300 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
          Run System Assessment
        </button>
      )}

      {/* Running State */}
      {isRunning && (
        <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50 animate-pulse"></div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <span className="text-sm text-indigo-100 font-medium tracking-wide">
              {progress?.stageLabel ?? (phase === 'detecting' ? 'Analyzing hardware architecture...' : 'Initializing benchmark...')}
            </span>
          </div>

          <div className="relative h-2.5 rounded-full bg-black/60 border border-white/10 overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full rainbow-progress opacity-90"
              initial={{ width: '5%' }}
              animate={{ width: `${Math.max(5, (progress?.progress ?? 0.1) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            />
          </div>
        </div>
      )}

      {/* Confirming & Dedicated GPU Selection State */}
      {phase === 'confirming' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 p-5 rounded-2xl bg-black/75 border border-indigo-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(99,102,241,0.2)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-70"></div>
          
          <div className="flex items-start gap-3">
            <MonitorCheck className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-white font-bold text-base">Select GPU for Benchmark</h3>
              <p className="text-xs text-indigo-200/80 mt-1">
                Detected: <strong className="text-indigo-300 font-mono">{detection?.name || detection?.rawRenderer || 'WebGPU Adapter'}</strong>.
                Select your target GPU below to run the benchmark:
              </p>
            </div>
          </div>

          {/* Quick Selection Chips */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Select Dedicated GPU</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'RTX 4090 (24GB)', id: 'rtx-4090' },
                { label: 'RTX 4080 (16GB)', id: 'rtx-4080' },
                { label: 'RTX 4070 (12GB)', id: 'rtx-4070' },
                { label: 'RTX 3060 (12GB)', id: 'rtx-3060-12gb' },
                { label: 'Apple M3 Max', id: 'm3-max-64gb' },
              ].map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedHardwareId(chip.id)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all border ${
                    selectedHardwareId === chip.id
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Searchable GPU Dropdown */}
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or Search GPU Database</label>
            <SearchableDropdown<HardwareSpec>
              label=""
              groups={HARDWARE_GROUPS}
              selectedId={selectedHardwareId}
              onSelect={(id) => setSelectedHardwareId(id)}
              placeholder="Search for your GPU..."
              getId={(hw) => hw.id}
              getSearchText={(hw) => `${hw.name} ${hw.vramGB}GB ${hw.bandwidthGBs}GB/s`}
              maxHeight="14rem"
              renderSelected={(hw) => (
                <div className="flex items-center justify-between w-full">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{hw.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{hw.vramGB} GB VRAM · {hw.bandwidthGBs} GB/s</div>
                  </div>
                  <span 
                    className="text-[9px] font-black px-2 py-0.5 rounded text-white ml-2"
                    style={{ background: previewTierConfig.color }}
                  >
                    {previewLlmScore.tier}-Tier
                  </span>
                </div>
              )}
              renderItem={(hw, isSelected) => (
                <div className="flex items-center justify-between gap-2 py-0.5">
                  <span className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'text-slate-300'}`}>
                    {hw.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                    {hw.vramGB}GB · {hw.bandwidthGBs}GB/s
                  </span>
                </div>
              )}
            />
          </div>

          {/* Selected GPU Live Spec Box */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Selected Hardware</span>
              <div className="text-sm font-bold text-white">{selectedHw.name}</div>
              <div className="text-[11px] text-indigo-300 font-mono mt-0.5">
                {selectedHw.vramGB} GB VRAM · {selectedHw.bandwidthGBs} GB/s · {(selectedHw.fp32TFLOPS ?? 0).toFixed(1)} TFLOPS
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Readiness</span>
              <div className="text-sm font-black font-mono" style={{ color: previewTierConfig.color }}>
                {previewLlmScore.score}/100 ({previewLlmScore.tier})
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleConfirmAndBenchmark}
            className="w-full mt-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 
                       border border-indigo-400/30 shadow-lg shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-white" />
            Run Benchmark with {selectedHw.name.split(' ')[0]} {selectedHw.name.split(' ')[1]}
          </button>
        </motion.div>
      )}

      {/* Error State */}
      {phase === 'error' && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-950/40 border border-red-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <div className="p-2 bg-red-500/20 rounded-full mt-0.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-200 font-bold uppercase tracking-wider">Assessment Failed</p>
            <p className="text-xs text-red-300/80 mt-1.5 leading-relaxed">{errorMsg}</p>
            <button
              onClick={handleScan}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Retry Assessment
            </button>
          </div>
        </div>
      )}

      {/* Results State */}
      {(phase === 'done' || (phase === 'error' && detection)) && detection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="space-y-4"
        >
          {/* Detected GPU Premium Card */}
          <div className="relative p-[1px] rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-purple-500/10 to-teal-500/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <MonitorCheck className="w-4 h-4 text-indigo-400" />
                  System Assessment
                </div>
                {(() => {
                  // Always compute LLM Score from the hardware spec
                  const llmScore = calculateLLMScore(hardware, state.gpuCount);
                  const tierConfig = getTierConfig(llmScore.tier);
                  
                  return (
                    <div 
                      className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold border cursor-help relative group/score" 
                      style={{ 
                        color: tierConfig.color, 
                        background: tierConfig.bg,
                        borderColor: tierConfig.glow
                      }}
                      title={`VRAM: ${llmScore.vramScore} | BW: ${llmScore.bandwidthScore} | Compute: ${llmScore.computeScore}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      LLM Score: {llmScore.score}/100
                      {/* Tooltip breakdown */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-lg bg-black/90 border border-white/10 backdrop-blur-xl opacity-0 group-hover/score:opacity-100 pointer-events-none transition-opacity z-50 text-left">
                        <div className="text-[10px] font-bold text-white mb-1.5">{llmScore.tierLabel}</div>
                        <div className="text-[9px] text-slate-400 mb-2">{llmScore.tierDescription}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">VRAM (40%)</span>
                            <span className="text-white font-mono">{llmScore.vramScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Bandwidth (40%)</span>
                            <span className="text-white font-mono">{llmScore.bandwidthScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Compute (20%)</span>
                            <span className="text-white font-mono">{llmScore.computeScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Hardware Details */}
              <div>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 truncate" title={state.activeProfile === 'secondary' ? hardware.name : detection.rawRenderer}>
                  {state.activeProfile === 'secondary' ? hardware.name : detection.name}
                </p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1" title={state.activeProfile === 'secondary' ? 'Manually selected profile' : detection.rawRenderer}>
                  {state.activeProfile === 'secondary' ? 'Status: Dedicated Profile Active' : `Raw Output: ${detection.rawRenderer}`}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">VRAM</span>
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-bold text-white leading-none">{state.activeProfile === 'secondary' ? hardware.vramGB : detection.vramGB}</span>
                    <span className="text-xs text-indigo-300 font-medium pb-0.5">GB</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bandwidth</span>
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-bold text-white leading-none">{state.activeProfile === 'secondary' ? hardware.bandwidthGBs : detection.bandwidthGBs}</span>
                    <span className="text-xs text-purple-300 font-medium pb-0.5">GB/s</span>
                  </div>
                </div>
                {detection.adapterLimits?.maxComputeInvocationsPerWorkgroup && (
                  <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Compute Architecture</span>
                    <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                      WebGPU Supported
                    </span>
                  </div>
                )}
              </div>

              {/* Dual GPU Warning Tip */}
              {detection.isFallback || detection.name.toLowerCase().includes('amd') || detection.name.toLowerCase().includes('intel') ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-500/90 leading-relaxed">
                    <strong>Laptop with dual GPUs?</strong> Browsers often force integrated graphics (like AMD/Intel) to save power. To see stats for your Nvidia GPU, use the <strong>Manual Hardware Picker</strong> below and select it manually.
                  </p>
                </div>
              ) : null}

            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLeaderboardSubmit}
              disabled={!benchmarkResult}
              className="py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 
                         hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 
                         transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Post Score
            </button>
            <button
              onClick={handleScan}
              className="py-3 rounded-xl text-xs font-bold bg-white/5 text-slate-300
                         border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              Recalibrate
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
