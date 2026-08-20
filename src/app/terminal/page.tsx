'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCalculator } from '@/lib/CalculatorContext';
import CliCommandCard from '@/components/CliCommandCard';
import { Terminal, Cpu, HardDrive, Zap, Clock, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  id: string;
  text: string;
  type: 'system' | 'vram' | 'kv' | 'compute' | 'error' | 'success' | 'info';
  timestamp: string;
}

export default function TerminalPage() {
  const { result, hardware, model, state } = useCalculator();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newLogs: LogEntry[] = [];
    const t = Math.random().toString(36).substring(2, 9);
    const getTimestamp = () => new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    newLogs.push({ id: `${t}-0`, text: `$ llmfit --scan`, type: 'system', timestamp: getTimestamp() });
    newLogs.push({ id: `${t}-1`, text: `[SYSTEM] Initializing LLMFit Engine v2.1...`, type: 'system', timestamp: getTimestamp() });
    newLogs.push({ id: `${t}-2`, text: `[HARDWARE] Detected ${hardware.name} (${hardware.vramGB} GB VRAM, ${hardware.bandwidthGBs} GB/s bandwidth)`, type: 'info', timestamp: getTimestamp() });
    newLogs.push({ id: `${t}-3`, text: `[MODEL] Loading ${model.name} (${model.parametersBillion}B params)`, type: 'info', timestamp: getTimestamp() });
    newLogs.push({ id: `${t}-4`, text: `[VRAM] Weights: ${result.vramBreakdown.modelWeightsGB.toFixed(2)} GB | KV Cache: ${result.vramBreakdown.kvCacheGB.toFixed(2)} GB`, type: 'vram', timestamp: getTimestamp() });
    newLogs.push({ id: `${t}-5`, text: `[VRAM] Total Required: ${result.vramBreakdown.totalRequiredGB.toFixed(2)} GB / ${result.vramBreakdown.availableVramGB} GB available`, type: 'vram', timestamp: getTimestamp() });

    if (result.verdict === 'oom') {
      newLogs.push({ id: `${t}-6`, text: `[ERROR] Out of Memory! Shortfall: ${Math.abs(result.vramBreakdown.headroomGB).toFixed(2)} GB. Try a smaller quant or model.`, type: 'error', timestamp: getTimestamp() });
    } else {
      newLogs.push({ id: `${t}-6`, text: `[OK] Memory check PASSED. Headroom: ${result.vramBreakdown.headroomGB.toFixed(2)} GB`, type: 'success', timestamp: getTimestamp() });
      newLogs.push({ id: `${t}-7`, text: `[PERF] Estimated throughput: ${result.performance.estimatedTPS} tok/s | Time to first token: ${result.performance.ttftSeconds.toFixed(2)}s`, type: 'compute', timestamp: getTimestamp() });
    }

    newLogs.push({ id: `${t}-9`, text: `[DONE] Analysis complete.`, type: 'success', timestamp: getTimestamp() });

    let i = 0;
    let interval: NodeJS.Timeout;
    const timer = setTimeout(() => {
      setLogs([]);
      interval = setInterval(() => {
        if (i < newLogs.length) {
          const currentLog = newLogs[i];
          setLogs(prev => [...prev, currentLog]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 200);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [result, hardware, model]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'system': return 'text-slate-500';
      case 'vram': return 'text-cyan-400';
      case 'kv': return 'text-pink-400';
      case 'compute': return 'text-amber-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'info': return 'text-blue-400';
      default: return 'text-slate-300';
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  console.log("TerminalPage Render logs: ", logs);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">CLI & Terminal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ready-to-run commands & live diagnostic output</p>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Cpu, label: 'GPU', value: hardware.name, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: HardDrive, label: 'VRAM', value: `${result.vramBreakdown.totalRequiredGB.toFixed(1)} / ${hardware.vramGB} GB`, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { icon: Zap, label: 'Speed', value: `${result.performance.estimatedTPS} tok/s`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Clock, label: 'TTFT', value: `${result.performance.ttftSeconds.toFixed(2)}s`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="theme-panel p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 1-Click CLI Commands */}
      <div className="theme-panel p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-teal-500" />
          1-Click Run Commands
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Copy and paste these into your terminal to run <span className="font-semibold text-slate-700 dark:text-slate-300">{model.name}</span> on your <span className="font-semibold text-slate-700 dark:text-slate-300">{hardware.name}</span>.</p>
        <CliCommandCard commands={result.cliCommands} />
      </div>

      {/* System Info Panel */}
      <div className="theme-panel p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-500" />
          System Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Hardware', value: hardware.name },
            { label: 'VRAM', value: `${hardware.vramGB} GB` },
            { label: 'Bandwidth', value: `${hardware.bandwidthGBs} GB/s` },
            { label: 'FP32 TFLOPS', value: `${hardware.fp32TFLOPS}` },
            { label: 'Model', value: model.name },
            { label: 'Parameters', value: `${model.parametersBillion}B` },
            { label: 'Quantization', value: state.quantId.toUpperCase() },
            { label: 'Context Length', value: `${state.contextLength.toLocaleString()} tokens` },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200/10 dark:border-white/5 last:border-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Terminal Output */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
        <div className="bg-slate-100 dark:bg-[#0a0a0f] px-4 py-2.5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 ml-2 tracking-wider">llmfit — diagnostic output</span>
          </div>
          <button
            onClick={() => handleCopy(logs.map(l => l.text).join('\n'), 'terminal')}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Copy terminal output"
          >
            {copied === 'terminal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="bg-white dark:bg-[#020205] p-4 font-mono text-xs overflow-y-auto h-72 custom-scrollbar">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-1.5 leading-relaxed ${getColor(log.type)}`}
              >
                <span className="opacity-40 mr-2 text-[10px] select-none">
                  {log.timestamp}
                </span>
                {log.text}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4 flex items-center">
            <span className="w-2 h-4 bg-emerald-500/60 animate-pulse inline-block" />
          </div>
        </div>
      </div>
    </div>
  );
}
