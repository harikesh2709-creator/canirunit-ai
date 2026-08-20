'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, AlertTriangle, CheckCircle2, ChevronDown, Monitor, Apple, Settings } from 'lucide-react';
import { detectHardwareGPU, HardwareDetectionResult } from '@/lib/gpuDetector';
import { HARDWARE_GROUPS } from '@/lib/data/hardware';
import { HardwareSpec } from '@/lib/types';
import SearchableDropdown from './SearchableDropdown';

interface GpuScannerCardProps {
  selectedHardwareId: string;
  onHardwareSelect: (id: string) => void;
}

const vendorColors: Record<string, string> = {
  nvidia: 'bg-green-500/10 text-green-400 border-green-500/20',
  amd: 'bg-red-500/10 text-red-400 border-red-500/20',
  intel: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  apple: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'apple':
      return <Apple className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
    case 'custom':
      return <Settings className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
    default:
      return <Monitor className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
  }
};

const groupColors: Record<string, string> = {
  'NVIDIA GeForce': 'text-green-500',
  'NVIDIA Workstation / Data Center': 'text-green-400',
  'AMD Radeon': 'text-red-400',
  'Intel Arc': 'text-blue-400',
  'Apple Silicon': 'text-slate-300',
  Custom: 'text-teal-400',
};

export default function GpuScannerCard({
  selectedHardwareId,
  onHardwareSelect,
}: GpuScannerCardProps) {
  const [detection, setDetection] = useState<HardwareDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [showOverride, setShowOverride] = useState(false);
  const onHardwareSelectRef = useRef(onHardwareSelect);

  // Keep ref up to date to avoid dependency issues in useEffect
  useEffect(() => {
    onHardwareSelectRef.current = onHardwareSelect;
  }, [onHardwareSelect]);

  useEffect(() => {
    let mounted = true;
    async function scan() {
      setIsDetecting(true);
      try {
        const result = await detectHardwareGPU();
        if (mounted) {
          setDetection(result);
          setIsDetecting(false);
          // Auto-select if a clear hardware ID was found
          if (result.hardwareId && !result.isFallback) {
            onHardwareSelectRef.current(result.hardwareId);
          }
        }
      } catch {
        if (mounted) setIsDetecting(false);
      }
    }
    scan();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRescan = async () => {
    setIsDetecting(true);
    try {
      const result = await detectHardwareGPU();
      setDetection(result);
      if (result.hardwareId && !result.isFallback) {
        onHardwareSelectRef.current(result.hardwareId);
      }
    } catch {
      // ignore
    } finally {
      setIsDetecting(false);
    }
  };

  const hasWarning = detection?.isSoftwareRenderer || detection?.isFallback;
  const vendorBadgeClass = detection ? (vendorColors[detection.vendor.toLowerCase()] || 'bg-white/5 text-slate-400 border-white/10') : '';

  return (
    <div className="glass-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Cpu className="w-4 h-4 text-slate-400" />
          Hardware Scanner
        </div>
        <AnimatePresence mode="wait">
          {isDetecting ? (
            <motion.div
              key="detecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-indigo-400"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Scanning...
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-emerald-400"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detection Result */}
      <div className="min-h-[4rem] flex flex-col justify-center">
        {isDetecting ? (
          <div className="space-y-2">
            <div className="h-5 w-48 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
          </div>
        ) : detection ? (
          <div className="space-y-3">
            <div>
              <p className="text-base font-bold text-white tracking-tight">{detection.name}</p>
              <div className="flex gap-2 flex-wrap mt-1.5">
                {detection.vendor && detection.vendor !== 'Unknown' && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${vendorBadgeClass}`}>
                    {detection.vendor.toUpperCase()}
                  </span>
                )}
                {!detection.isFallback && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-mono">
                    {detection.vramGB}GB VRAM · {detection.fp32TFLOPS.toFixed(1)} TFLOPS
                  </span>
                )}
              </div>
            </div>

            {hasWarning && (
              <div className="flex gap-3 items-start bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[12px] text-amber-400 font-medium leading-tight">
                    Browser hardware acceleration is off or GPU string was masked by privacy settings.
                  </p>
                  <p className="text-[11px] text-amber-500/70">
                    Enable hardware acceleration in browser settings for accurate detection.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Could not detect hardware.</p>
        )}
      </div>

      {/* Manual Override Selector & Rescan */}
      <div className="pt-3 border-t border-white/5 space-y-3">
        <button
          onClick={handleRescan}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors text-xs font-bold"
        >
          {isDetecting ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          ) : (
            <Cpu className="w-3.5 h-3.5" />
          )}
          {isDetecting ? 'Scanning Hardware...' : 'Auto-Detect My Rig'}
        </button>

        <button
          onClick={() => setShowOverride(!showOverride)}
          className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-white transition-colors group"
        >
          <span>Not your GPU? Select manually</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:text-indigo-400 ${showOverride ? 'rotate-180 text-indigo-400' : ''}`} />
        </button>

        <AnimatePresence>
          {showOverride && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <SearchableDropdown<HardwareSpec>
                label="Choose your actual hardware"
                groups={HARDWARE_GROUPS}
                selectedId={selectedHardwareId}
                onSelect={(id) => {
                  onHardwareSelect(id);
                  setShowOverride(false); // Optionally close on select
                }}
                placeholder="Search models (e.g. RTX 4090)..."
                getId={(hw) => hw.id}
                getSearchText={(hw) => `${hw.name} ${hw.vramGB}GB ${hw.bandwidthGBs}GB/s`}
                getGroupColor={(label) => groupColors[label] ?? 'text-slate-500'}
                maxHeight="16rem"
                renderSelected={(hw) => (
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform={hw.platform} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{hw.name}</div>
                    </div>
                  </div>
                )}
                renderItem={(hw, isSelected) => (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <PlatformIcon platform={hw.platform} />
                      <span className={`truncate ${isSelected ? 'font-semibold text-white' : 'font-medium'}`}>
                        {hw.name}
                      </span>
                    </div>
                    {hw.id !== 'custom' && (
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex-shrink-0">
                        {hw.vramGB}GB
                      </span>
                    )}
                  </div>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
