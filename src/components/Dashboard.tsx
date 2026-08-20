'use client';

import React, { useState } from 'react';
import { useCalculator } from '@/lib/CalculatorContext';
import { Download } from 'lucide-react';
import GpuVisualCard from '@/components/GpuVisualCard';
import VerdictBanner from '@/components/VerdictBanner';
import SpeedGauge from '@/components/SpeedGauge';
import CloudPricingCard from '@/components/CloudPricingCard';
import VramBreakdownBar from '@/components/VramBreakdownBar';
import StatCard from '@/components/StatCard';
import RecommendedModels from '@/components/RecommendedModels';
import DownloadModal from '@/components/DownloadModal';
import html2canvas from 'html2canvas';
import { Camera } from 'lucide-react';

export default function Dashboard() {
  const { hardware, model, quant, result, state } = useCalculator();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = React.useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `llmfit-${hardware.name.replace(/\s+/g, '-')}-${model.name.replace(/\s+/g, '-')}.jpg`;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Assessment</h1>
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isExporting ? <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {isExporting ? 'Exporting...' : 'Save as Image'}
        </button>
      </div>

      <div ref={exportRef} className="space-y-6 p-2 -m-2 rounded-xl">
        {/* Top Row: GPU Showcase & Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <GpuVisualCard hardware={hardware} gpuCount={state.gpuCount} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <VerdictBanner verdict={result.verdict} text={result.verdictText} />
          <div className="theme-panel p-6 flex items-center justify-center">
            <SpeedGauge performance={result.performance} />
          </div>
        </div>
      </div>

      <CloudPricingCard verdict={result.verdict} />

      {/* VRAM Main Bar */}
      <div className="theme-panel p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <VramBreakdownBar breakdown={result.vramBreakdown} />
      </div>
      </div>

      {/* Download / Run CTA */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full btn-primary group relative overflow-hidden flex items-center justify-center"
      >
        <div className="flex h-full w-full items-center justify-center gap-3">
          <Download className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <h3 className="text-xl font-bold text-white tracking-tight">Download & Run {model.name}</h3>
            <p className="text-white/90 text-sm font-medium">Get 1-click install commands and direct GGUF links.</p>
          </div>
        </div>
      </button>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Model Size"
          value={`${result.vramBreakdown.modelWeightsGB.toFixed(1)} GB`}
          color="gradient-text-cyan"
          accentClass="bg-gradient-to-b from-cyan-400 to-blue-500"
        />
        <StatCard
          label="KV Cache"
          value={`${result.vramBreakdown.kvCacheGB.toFixed(2)} GB`}
          color="gradient-text-purple"
          accentClass="bg-gradient-to-b from-purple-400 to-pink-500"
        />
        <StatCard
          label="Total VRAM"
          value={`${result.vramBreakdown.totalRequiredGB.toFixed(1)} GB`}
          color={result.verdict === 'oom' ? 'gradient-text-pink' : 'gradient-text-emerald'}
          accentClass={result.verdict === 'oom' ? 'bg-gradient-to-b from-pink-500 to-rose-600' : 'bg-gradient-to-b from-emerald-400 to-teal-500'}
        />
        <StatCard
          label="Headroom"
          value={
            result.vramBreakdown.headroomGB >= 0
              ? `+${result.vramBreakdown.headroomGB.toFixed(1)} GB`
              : `${result.vramBreakdown.headroomGB.toFixed(1)} GB`
          }
          color={result.vramBreakdown.headroomGB >= 0 ? 'gradient-text-emerald' : 'gradient-text-pink'}
          accentClass={result.vramBreakdown.headroomGB >= 0 ? 'bg-gradient-to-b from-emerald-400 to-teal-500' : 'bg-gradient-to-b from-pink-500 to-rose-600'}
        />
      </div>

      {/* AI Agent Recommendations */}
      <div className="pt-6 border-t border-white/10 pb-2">
        <RecommendedModels hardware={hardware} gpuCount={state.gpuCount} />
      </div>

      <DownloadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        model={model}
        quant={quant}
        verdict={result.verdict}
      />
    </div>
  );
}
