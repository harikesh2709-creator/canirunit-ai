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

const tierStyles: Record<EmpiricalTier, { color: string; glow: string; bg: string; gradient: string }> = {
  'tier-1': { color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.1)', gradient: 'from-amber-500/20 to-orange-500/20' },
  'tier-2': { color: '#3b82f6', glow: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.1)', gradient: 'from-blue-500/20 to-cyan-500/20' },
  'tier-3': { color: '#10b981', glow: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.1)', gradient: 'from-emerald-500/20 to-teal-500/20' },
  'tier-4': { color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', bg: 'rgba(139,92,246,0.1)', gradient: 'from-violet-500/20 to-purple-500/20' },
};

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
  
  const [confirmVram, setConfirmVram] = useState<number>(8);
  const [confirmIsIntegrated, setConfirmIsIntegrated] = useState<boolean>(false);
  
  const { state, hardware, result: calcResult, updateState } = useCalculator();

  const router = useRouter();

  const handleLeaderboardSubmit = useCallback(() => {
    if (!benchmarkResult || !detection) return;
    const nickname = window.prompt("Enter your nickname for the global leaderboard:");
    if (!nickname || nickname.trim().length === 0) return;
    
    let tierNum: 1 | 2 | 3 = 3;
    if (benchmarkResult.tier === 'tier-1') tierNum = 1;
    if (benchmarkResult.tier === 'tier-2') tierNum = 2;
    if (benchmarkResult.tier === 'tier-3' || benchmarkResult.tier === 'tier-4') tierNum = 3;

    submitToLeaderboard(nickname.trim(), detection.name, benchmarkResult.aiScore, tierNum);
    router.push('/leaderboard');
  }, [benchmarkResult, detection, router]);

  const handleScan = useCallback(async () => {
    setPhase('detecting');
    setErrorMsg('');
    setBenchmarkResult(null);
    setDetection(null);

    try {
      // Step 1: Detect GPU via WebGPU (Masked)
      let gpuResult = await detectHardwareGPU();

      setDetection(gpuResult);

      let detectedVram = 8;
      let detectedIsIntegrated = false;

      if (gpuResult.hardwareId === 'custom') {
        detectedVram = gpuResult.vramGB || 8;
      } else if (gpuResult.hardwareId) {
        // Find hardware preset to check defaults
        const hw = HARDWARE_PRESETS.find(h => h.id === gpuResult.hardwareId);
        if (hw) {
          detectedVram = hw.vramGB;
          detectedIsIntegrated = hw.isIntegrated ?? false;
        }
      }

      if (gpuResult.isFallback || gpuResult.isSoftwareRenderer || gpuResult.vendor === 'intel' || gpuResult.vendor === 'amd' || gpuResult.vendor === 'apple') {
        detectedIsIntegrated = true;
      }
      
      setConfirmVram(detectedVram);
      setConfirmIsIntegrated(detectedIsIntegrated);
      setPhase('confirming');

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Detection failed');
      setPhase('error');
    }
  }, []);

  const handleConfirmAndBenchmark = useCallback(async () => {
    if (!detection) return;
    setPhase('benchmarking');
    
    // Apply user overrides
    const actualHardwareId = (detection.isFallback || detection.isSoftwareRenderer) && !detection.hardwareId 
      ? 'rtx-4060-ti-8gb' 
      : (detection.hardwareId || 'custom');
      
    onHardwareDetected(actualHardwareId, confirmVram, confirmIsIntegrated);
    
    if (confirmIsIntegrated && onIntegratedGpuDetected) {
      onIntegratedGpuDetected();
    }

    try {
      if (isEmpiricalProfilingSupported()) {
        const result = await runEmpiricalProfile((p) => setProgress(p));

        if (result.success) {
          setBenchmarkResult(result);
          onBenchmarkComplete(result);
          updateState({ activeProfile: 'primary' });
          setPhase('done');
        } else {
          setErrorMsg(result.error ?? 'Benchmark failed');
          setPhase('done');
        }
      } else {
        setPhase('done');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Benchmark failed');
      setPhase('error');
    }
  }, [detection, confirmVram, confirmIsIntegrated, onHardwareDetected, onIntegratedGpuDetected, onBenchmarkComplete, updateState]);

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
      {/* Confirming State */}
      {phase === 'confirming' && detection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 p-5 rounded-2xl bg-black/60 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50"></div>
          
          <div className="flex items-start gap-3">
            <MonitorCheck className="w-5 h-5 text-indigo-400 mt-1" />
            <div>
              <h3 className="text-white font-semibold">Confirm Hardware</h3>
              <p className="text-xs text-indigo-200/80 mt-1">
                We detected <strong className="text-indigo-300">{detection.name || detection.rawRenderer}</strong>. 
                Please verify the details below for accurate assessment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                VRAM (GB)
              </label>
              <input
                type="number"
                value={confirmVram}
                onChange={(e) => setConfirmVram(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                GPU Type
              </label>
              <select
                value={confirmIsIntegrated ? 'integrated' : 'dedicated'}
                onChange={(e) => setConfirmIsIntegrated(e.target.value === 'integrated')}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="dedicated">Dedicated GPU</option>
                <option value="integrated">Integrated GPU</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleConfirmAndBenchmark}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 
                       border border-indigo-400/20 transition-all duration-300 cursor-pointer"
          >
            Confirm & Run Benchmark
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
                  const theoreticalTierMap: Record<string, string> = {
                    'excellent': 'tier-1',
                    'good': 'tier-2',
                    'usable': 'tier-3',
                    'slow': 'tier-4',
                    'unusable': 'tier-4'
                  };
                  
                  const isSec = state.activeProfile === 'secondary';
                  const hasResult = isSec ? (calcResult?.performance?.estimatedTPS ?? 0) > 0 : benchmarkResult?.success;
                  
                  if (!hasResult) return null;
                  
                  const activeScore = isSec ? Math.round(calcResult.performance.estimatedTPS * 10) : benchmarkResult?.aiScore;
                  const rawTier = isSec ? theoreticalTierMap[calcResult.performance.tier] : benchmarkResult?.tier;
                  const activeTier = rawTier as 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';
                  
                  return (
                    <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold border" 
                         style={{ 
                           color: tierStyles[activeTier]?.color || '#8b5cf6', 
                           background: tierStyles[activeTier]?.bg || 'rgba(139,92,246,0.1)',
                           borderColor: tierStyles[activeTier]?.glow || 'rgba(139,92,246,0.3)'
                         }}>
                      <Sparkles className="w-3 h-3" />
                      Score: {activeScore} {isSec && '(Theoretical)'}
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
