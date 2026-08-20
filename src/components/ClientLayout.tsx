'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid3X3, Activity, Share2, Check, LayoutDashboard, BarChart3, Terminal, Brain, Settings, Trophy } from 'lucide-react';
import { useCalculator } from '@/lib/CalculatorContext';
import { KV_CACHE_PRECISIONS } from '@/lib/data/quantization';

import BenchmarkScanner from './BenchmarkScanner';
import GpuScannerCard from './GpuScannerCard';
import HardwarePicker from './HardwarePicker';
import ModelSelector from './ModelSelector';
import HuggingFaceImport from './HuggingFaceImport';
import QuantSelector from './QuantSelector';
import ContextSlider from './ContextSlider';
import DualGpuWizardModal from './DualGpuWizardModal';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/ecosystem', label: 'Ecosystem', icon: Grid3X3 },
  { href: '/terminal', label: 'Terminal', icon: Terminal },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const {
    state,
    update,
    hardware,
    model,
    handleHardwareDetected,
    handleBenchmarkComplete,
    updateState,
  } = useCalculator();

  const [copied, setCopied] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const pathname = usePathname();

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('gpu', hardware.id);
    url.searchParams.set('model', model.id);
    url.searchParams.set('quant', state.quantId);
    url.searchParams.set('ctx', state.contextLength.toString());
    url.searchParams.set('gpus', state.gpuCount.toString());
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showLeftPanel = pathname === '/' || pathname === '/analytics' || pathname.startsWith('/can-i-run/');

  return (
    <div className="min-h-screen bg-transparent font-sans relative z-10 flex flex-col">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500 shadow-sm">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <Link href="/" className="flex items-baseline gap-1.5 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LLMFit</span>
            <span className="text-xl font-bold tracking-tight text-teal-400">.ai</span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-slate-100 text-teal-600 dark:bg-slate-800 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1">
        <div className={`grid grid-cols-1 ${showLeftPanel ? 'lg:grid-cols-12' : ''} gap-6 lg:gap-8 items-start`}>
          {/* ================================================================= */}
          {/* LEFT PANEL: CONTROLS & SCANNER (Sticky) */}
          {/* ================================================================= */}
          {showLeftPanel && (
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 z-10">
            {/* Share & Actions Strip */}
            <div className="flex items-center justify-between glass-panel p-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-widest">
                <Grid3X3 className="w-4 h-4 text-teal-400" /> Control Center
                <span className="text-[10px] text-teal-300 ml-2 px-2 py-0.5 rounded-full bg-teal-500/20 shadow-[0_0_8px_rgba(45,212,191,0.4)] animate-pulse">Auto-saved</span>
              </div>
              <button
                onClick={handleShare}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied URL!' : 'Share Setup'}
              </button>
            </div>

            {/* Benchmark Scanner Mini-Module */}
            <div className="glass-panel overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />
              <div className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white tracking-tight text-glow">System Scanner</h3>
                  </div>
                  
                  {state.secondaryHardwareId && (
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                      <button
                        onClick={() => update('activeProfile', 'primary')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                          (!state.activeProfile || state.activeProfile === 'primary') 
                            ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Integrated
                      </button>
                      <button
                        onClick={() => update('activeProfile', 'secondary')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                          state.activeProfile === 'secondary' 
                            ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Dedicated
                      </button>
                    </div>
                  )}
                </div>
                <BenchmarkScanner
                  onHardwareDetected={handleHardwareDetected}
                  onBenchmarkComplete={handleBenchmarkComplete}
                  onIntegratedGpuDetected={() => setShowWizard(true)}
                />
              </div>
            </div>

            {/* Primary Config Controls */}
            <div className="glass-panel p-5 space-y-6">
              <HardwarePicker
                selectedId={state.activeProfile === 'secondary' ? (state.secondaryHardwareId || '') : state.hardwareId}
                customVramGB={state.customVramGB}
                customBandwidthGBs={state.customBandwidthGBs}
                gpuCount={state.gpuCount}
                onSelect={(id) => {
                  if (state.activeProfile === 'secondary') {
                    updateState({ secondaryHardwareId: id });
                  } else {
                    update('hardwareId', id);
                  }
                }}
                onCustomVramChange={(v) => update('customVramGB', v)}
                onCustomBandwidthChange={(bw) => update('customBandwidthGBs', bw)}
                onGpuCountChange={(c) => update('gpuCount', c)}
              />

              <div className="w-full h-px bg-white/5" />

              <ModelSelector
                selectedId={state.modelId}
                customModelSpec={state.customModelSpec}
                onSelect={(id) => update('modelId', id)}
              />

              <HuggingFaceImport
                onImport={(spec) => {
                  update('modelId', 'custom');
                  update('customModelSpec', spec);
                }}
              />

              <QuantSelector
                selectedId={state.quantId}
                onSelect={(id) => update('quantId', id)}
              />

              <ContextSlider
                contextLength={state.contextLength}
                maxContext={model.defaultContext}
                onChange={(tokens) => update('contextLength', tokens)}
              />

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  KV Cache Precision
                </label>
                <div className="flex gap-2">
                  {KV_CACHE_PRECISIONS.map((kv) => (
                    <button
                      key={kv.id}
                      type="button"
                      onClick={() => update('kvCachePrecisionId', kv.id)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        state.kvCachePrecisionId === kv.id
                          ? 'bg-purple-500/30 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                      title={kv.description}
                    >
                      {kv.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider gradient-text-pink">
                    What-If Overclock
                  </label>
                  <span className="text-xs font-mono text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-md border border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                    +{state.overclockPercent || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={state.overclockPercent || 0}
                  onChange={(e) => update('overclockPercent', parseInt(e.target.value))}
                  className="w-full range-slider"
                  style={{
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${state.overclockPercent || 0}%, rgba(255,255,255,0.1) ${state.overclockPercent || 0}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Theoretical memory bandwidth multiplier to simulate future hardware or extreme overclocking.
                </p>
              </div>
            </div>
          </div>
          )}

          {/* ================================================================= */}
          {/* RIGHT CANVAS: RESULTS & ANALYTICS */}
          {/* ================================================================= */}
          <div className={`${showLeftPanel ? 'lg:col-span-8' : ''} space-y-6`}>
            {/* Mobile Nav Header (only visible on small screens) */}
            <nav className="flex md:hidden overflow-x-auto items-center gap-2 pb-2 scrollbar-hide">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 bg-black/20 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {children}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <DualGpuWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSelectDedicatedGpu={(id) => {
          updateState({
            secondaryHardwareId: id,
            activeProfile: 'secondary'
          });
        }}
      />
      <footer className="mt-auto border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="py-6 px-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            <span className="text-white font-bold tracking-wider">LLMFit.ai</span>
            <span>— Open-source LLM hardware calculator</span>
          </div>
          <div>All calculations run client-side. No data is collected.</div>
        </div>
      </footer>

      {/* Global Toast Notifications */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 toast-enter">
          <div className="glass-panel p-4 flex items-center gap-3 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-500/10">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300">Link Copied!</h4>
              <p className="text-xs text-slate-300">Share your setup with anyone.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
