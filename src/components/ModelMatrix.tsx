'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Filter,
} from 'lucide-react';

import { HardwareSpec } from '@/lib/types';
import {
  calculateAllModelCompatibility,
  filterByStatus,
  getStatusCounts,
  ModelCompatibility,
  MatrixFilter,
} from '@/lib/performanceCompare';
import { CONTEXT_OPTIONS } from '@/lib/data/quantization';
import { AffiliateCard } from './AffiliateTriggers';

// ============================================================================
// Props
// ============================================================================

interface ModelMatrixProps {
  hardware: HardwareSpec;
  gpuCount: number;
  kvCachePrecisionId: string;
}

// ============================================================================
// Filter tab config
// ============================================================================

const filterTabs: { key: MatrixFilter; label: string; emoji: string; color: string }[] = [
  { key: 'all', label: 'All Models', emoji: '📋', color: 'text-slate-300' },
  { key: 'ready', label: 'Ready to Run', emoji: '🟢', color: 'text-emerald-400' },
  { key: 'quantize', label: 'Needs Quantization', emoji: '🟡', color: 'text-amber-400' },
  { key: 'too-large', label: 'Too Large', emoji: '🔴', color: 'text-red-400' },
];

// ============================================================================
// Component
// ============================================================================

export default function ModelMatrix({
  hardware,
  gpuCount,
  kvCachePrecisionId,
}: ModelMatrixProps) {
  const [filter, setFilter] = useState<MatrixFilter>('all');
  const [contextLength, setContextLength] = useState(8192);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  // Calculate compatibility for all models
  const allModels = useMemo(
    () => calculateAllModelCompatibility(hardware, contextLength, gpuCount, kvCachePrecisionId),
    [hardware, contextLength, gpuCount, kvCachePrecisionId]
  );

  const counts = useMemo(() => getStatusCounts(allModels), [allModels]);
  const filteredModels = useMemo(() => filterByStatus(allModels, filter), [allModels, filter]);

  // Context slider
  const contextIndex = CONTEXT_OPTIONS.findIndex((o) => o.tokens === contextLength);
  const effectiveIndex = contextIndex >= 0 ? contextIndex : 2; // default to 8K

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card-elevated overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
              <LayoutGrid className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Model Compatibility Matrix</h2>
              <p className="text-[11px] text-slate-500">
                {hardware.name} · {hardware.vramGB * gpuCount}GB VRAM
              </p>
            </div>
          </div>

          {/* Context slider */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Context:</span>
            </div>
            <div className="flex gap-1">
              {CONTEXT_OPTIONS.slice(0, 6).map((opt, idx) => (
                <button
                  key={opt.tokens}
                  onClick={() => setContextLength(opt.tokens)}
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer
                    ${
                      idx === effectiveIndex || opt.tokens === contextLength
                        ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30'
                        : 'bg-white/5 text-slate-500 border border-transparent hover:bg-white/10 hover:text-slate-300'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-6 py-3 flex gap-2 flex-wrap border-b border-white/5">
        <Filter className="w-3.5 h-3.5 text-slate-600 mt-1.5" />
        {filterTabs.map((tab) => {
          const count = tab.key === 'all' ? counts.all : counts[tab.key as keyof typeof counts];
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                ${
                  filter === tab.key
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Model cards grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredModels.map((compat, idx) => (
              <ModelCard
                key={compat.model.id}
                compat={compat}
                index={idx}
                contextLength={contextLength}
                expanded={expandedModel === compat.model.id}
                onToggle={() =>
                  setExpandedModel(
                    expandedModel === compat.model.id ? null : compat.model.id
                  )
                }
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">No models match this filter</p>
            <p className="text-xs text-slate-600 mt-1">Try changing the filter or context length</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Model Card Sub-component
// ============================================================================

function ModelCard({
  compat,
  index,
  expanded,
  contextLength,
  onToggle,
}: {
  compat: ModelCompatibility;
  index: number;
  expanded: boolean;
  contextLength: number;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const verdictColor = {
    ready: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
    quantize: { border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
    'too-large': { border: 'border-red-500/30', bg: 'bg-red-500/5' },
    all: { border: 'border-white/10', bg: 'bg-white/5' },
  };

  const style = verdictColor[compat.status];
  const result = compat.bestFitResult;
  const tps = result?.performance.estimatedTPS ?? 0;

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const slug = compat.model.name.toLowerCase().replace(/[\s./]+/g, '-');
    const quantTag = compat.bestFitQuant?.label.toLowerCase() ?? 'q4_k_m';
    const cmd = `ollama run ${slug}:${quantTag}`;

    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback not needed
    }
  }, [compat, result]);

  // VRAM bar widths
  const maxGB = result
    ? Math.max(result.vramBreakdown.totalRequiredGB, result.vramBreakdown.availableVramGB) * 1.1
    : 1;
  const weightsPercent = result ? (result.vramBreakdown.modelWeightsGB / maxGB) * 100 : 0;
  const kvPercent = result ? (result.vramBreakdown.kvCacheGB / maxGB) * 100 : 0;
  const availPercent = result
    ? Math.min((result.vramBreakdown.availableVramGB / maxGB) * 100, 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className={`glass-card ${style.border} ${style.bg} p-4 space-y-3 cursor-pointer
                  hover:border-white/20 transition-all`}
      onClick={onToggle}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs">{compat.statusEmoji}</span>
            <h4 className="text-sm font-bold text-white truncate">{compat.model.name}</h4>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {compat.model.parametersBillion}B params · {compat.model.family}
            {compat.model.activeParametersBillion
              ? ` · ${compat.model.activeParametersBillion}B active`
              : ''}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        )}
      </div>

      {/* Status + TPS */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 truncate">{compat.statusLabel}</span>
        {result && (
          <span
            className="text-sm font-bold font-mono tabular-nums whitespace-nowrap"
            style={{
              color:
                tps >= 40
                  ? '#10b981'
                  : tps >= 20
                    ? '#3b82f6'
                    : tps >= 8
                      ? '#f59e0b'
                      : '#ef4444',
            }}
          >
            {tps.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">tok/s</span>
          </span>
        )}
      </div>

      {/* Mini VRAM bar */}
      {result && (
        <div className="relative h-2 rounded-full bg-slate-800/60 overflow-hidden">
          <div
            className="absolute h-full rounded-l-full bg-teal-500/70"
            style={{ width: `${weightsPercent}%` }}
          />
          <div
            className="absolute h-full bg-indigo-400/70"
            style={{ left: `${weightsPercent}%`, width: `${kvPercent}%` }}
          />
          <div
            className="absolute top-0 h-full w-px bg-white/50"
            style={{ left: `${availPercent}%` }}
          />
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-3 border-t border-white/5">
              {/* VRAM details */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Weights</div>
                  <div className="text-xs font-mono text-teal-300">
                    {result.vramBreakdown.modelWeightsGB.toFixed(1)}GB
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">KV Cache</div>
                  <div className="text-xs font-mono text-indigo-300">
                    {result.vramBreakdown.kvCacheGB.toFixed(2)}GB
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Total</div>
                  <div
                    className={`text-xs font-mono ${
                      result.verdict === 'oom' ? 'text-red-400' : 'text-emerald-300'
                    }`}
                  >
                    {result.vramBreakdown.totalRequiredGB.toFixed(1)}GB
                  </div>
                </div>
              </div>

              {/* Quant + copy */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">
                  Best quant: <span className="text-white font-medium">{compat.bestFitQuant?.label ?? 'N/A'}</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium
                             bg-white/5 text-slate-400 border border-white/10
                             hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20
                             transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> ollama run
                    </>
                  )}
                </button>
              </div>

              {/* Affiliate Card */}
              <AffiliateCard
                model={compat.model}
                userVram={result.vramBreakdown.availableVramGB}
                requiredVram={result.vramBreakdown.totalRequiredGB}
                contextSize={contextLength}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
