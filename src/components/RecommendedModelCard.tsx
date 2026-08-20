'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Download, ExternalLink, Check, Activity, Code2, Box } from 'lucide-react';
import { ModelSpec, PerformanceEstimate, CLICommands } from '@/lib/types';

interface RecommendedModelCardProps {
  model: ModelSpec;
  performance: PerformanceEstimate;
  cliCommands: CLICommands;
}

type TabType = 'ollama' | 'llamacpp' | 'vllm';

export default function RecommendedModelCard({
  model,
  performance,
  cliCommands,
}: RecommendedModelCardProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ollama');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'ollama') textToCopy = cliCommands.ollama;
    else if (activeTab === 'llamacpp') textToCopy = cliCommands.llamaCpp;
    else textToCopy = cliCommands.vllm;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hfSearchUrl = `https://huggingface.co/models?pipeline_tag=text-generation&sort=trending&search=${encodeURIComponent(model.name + ' GGUF')}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex flex-col gap-4 relative overflow-hidden group h-full"
    >
      {/* Background glow accent based on performance */}
      <div 
        className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-all duration-500 group-hover:opacity-20
          ${performance.tier === 'excellent' || performance.tier === 'good' ? 'bg-emerald-500' : 'bg-yellow-500'}
        `}
      />

      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-lg font-bold text-white tracking-tight leading-tight">{model.name}</h4>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 uppercase tracking-wider whitespace-nowrap ml-2">
            {model.family}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {model.parametersBillion}B Params • {model.defaultContext / 1024}K Context
        </p>
      </div>

      {/* Performance Stats */}
      <div className="flex items-center gap-3 mt-auto">
        <div className="flex-1 glass-card bg-black/20 p-2 rounded-lg flex flex-col justify-center items-center">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
            <Activity className="w-3 h-3 text-teal-400" /> Est. Speed
          </div>
          <div className="font-mono text-sm font-bold text-white">
            {performance.estimatedTPS.toFixed(1)} <span className="text-slate-500 text-xs">t/s</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => setShowCommands(!showCommands)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors text-xs font-bold"
        >
          <Terminal className="w-3.5 h-3.5" />
          Run Local
        </button>
        <a
          href={hfSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold"
        >
          <Download className="w-3.5 h-3.5" />
          Get GGUF
        </a>
      </div>

      {/* Expanded Commands Area */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-white/10 mt-1 space-y-3">
              
              {/* Tabs */}
              <div className="flex gap-1 bg-black/30 p-1 rounded-md border border-white/5">
                {[
                  { id: 'ollama', label: 'Ollama', icon: Box },
                  { id: 'llamacpp', label: 'llama.cpp', icon: Terminal },
                  { id: 'vllm', label: 'vLLM', icon: Code2 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-all ${
                      activeTab === tab.id 
                        ? 'bg-slate-700/50 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Command Block */}
              <div className="relative group/copy">
                <div className="absolute right-2 top-2 z-10">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                    title="Copy command"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <ExternalLink className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="bg-black/50 border border-white/10 rounded-lg p-3 pt-4 pb-4 font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {activeTab === 'ollama' && cliCommands.ollama}
                  {activeTab === 'llamacpp' && cliCommands.llamaCpp}
                  {activeTab === 'vllm' && cliCommands.vllm}
                </pre>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
