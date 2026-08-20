'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Sparkles, Zap, ArrowRight, ShieldAlert } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { HARDWARE_GROUPS } from '@/lib/data/hardware';
import { HardwareSpec } from '@/lib/types';

interface DualGpuWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDedicatedGpu: (hardwareId: string) => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === 'nvidia') return <span className="text-[#76b900]">🟩</span>;
  if (platform === 'amd') return <span className="text-[#ed1c24]">🟥</span>;
  if (platform === 'intel') return <span className="text-[#0071c5]">🟦</span>;
  if (platform === 'apple') return <span className="text-[#999999]">🍏</span>;
  return <span>💻</span>;
};

const groupColors: Record<string, string> = {
  'Consumer GPUs': 'text-teal-400',
  'Data Center / Pro': 'text-indigo-400',
  'Mac / Apple Silicon': 'text-purple-400',
  'Custom': 'text-amber-400',
};

export default function DualGpuWizardModal({
  isOpen,
  onClose,
  onSelectDedicatedGpu,
}: DualGpuWizardModalProps) {
  const [step, setStep] = useState<'prompt' | 'select'>('prompt');
  const [selectedId, setSelectedId] = useState<string>('');

  // Reset step when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep('prompt');
        setSelectedId('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirmSelection = () => {
    if (selectedId && selectedId !== 'custom') {
      onSelectDedicatedGpu(selectedId);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg glass-card-elevated overflow-visible shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between bg-black/20 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Integrated GPU Detected</h2>
                  <p className="text-xs text-amber-200/70 mt-0.5">Dual-GPU Setup Wizard</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-black/60 backdrop-blur-xl rounded-b-2xl">
              <AnimatePresence mode="wait">
                {step === 'prompt' ? (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Windows often forces web browsers to use your power-saving <strong>Integrated Graphics</strong> (like AMD Radeon Graphics or Intel Iris) instead of your Dedicated GPU.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      Does your laptop or PC also have a more powerful <strong>Dedicated GPU</strong> (like an NVIDIA RTX or AMD Radeon RX series)?
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={onClose}
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-2"
                      >
                        <Cpu className="w-6 h-6 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-300">No, this is it</span>
                      </button>
                      <button
                        onClick={() => setStep('select')}
                        className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all flex flex-col items-center gap-2 group shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      >
                        <Zap className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-indigo-300">Yes, select it</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Search for and select your Dedicated GPU. This will create a Dual-GPU Profile, allowing you to instantly compare performance between both!
                    </p>

                    <div className="relative z-50">
                      <SearchableDropdown<HardwareSpec>
                        label="Dedicated GPU Model"
                        groups={HARDWARE_GROUPS}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        placeholder="e.g. RTX 3060, RX 6700..."
                        getId={(hw) => hw.id}
                        getSearchText={(hw) => `${hw.name} ${hw.vramGB}GB ${hw.bandwidthGBs}GB/s`}
                        getGroupColor={(label) => groupColors[label] ?? 'text-slate-500'}
                        maxHeight="16rem"
                        renderSelected={(hw) => (
                          <div className="flex items-center gap-2.5">
                            <PlatformIcon platform={hw.platform} />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white truncate">{hw.name}</div>
                              {hw.id !== 'custom' && (
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {hw.vramGB} GB VRAM · {hw.bandwidthGBs} GB/s
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        renderItem={(hw, isSelected) => (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <PlatformIcon platform={hw.platform} />
                              <span className={`truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                                {hw.name}
                              </span>
                            </div>
                            {hw.id !== 'custom' && (
                              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex-shrink-0">
                                {hw.vramGB}GB · {hw.bandwidthGBs}GB/s
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        onClick={() => setStep('prompt')}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirmSelection}
                        disabled={!selectedId || selectedId === 'custom'}
                        className="px-6 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:hover:bg-teal-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                      >
                        <Sparkles className="w-4 h-4" />
                        Create Dual Profile
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
