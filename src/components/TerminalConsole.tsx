'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalculationResult, HardwareSpec, ModelSpec } from '@/lib/types';
import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalConsoleProps {
  result: CalculationResult;
  hardware: HardwareSpec;
  model: ModelSpec;
}

interface LogEntry {
  id: string;
  text: string;
  type: 'system' | 'vram' | 'kv' | 'compute' | 'error' | 'success';
}

export default function TerminalConsole({ result, hardware, model }: TerminalConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate new logs based on the current calculation result
    const newLogs: LogEntry[] = [];
    const idPrefix = Date.now().toString();

    newLogs.push({
      id: `${idPrefix}-1`,
      text: `[SYSTEM] Initializing LLMFit Engine for ${model.name}...`,
      type: 'system'
    });

    newLogs.push({
      id: `${idPrefix}-2`,
      text: `[HARDWARE] Detected ${hardware.name} (${hardware.vramGB} GB VRAM).`,
      type: 'system'
    });

    newLogs.push({
      id: `${idPrefix}-3`,
      text: `[VRAM] Loading weights... Allocated ${result.vramBreakdown.modelWeightsGB.toFixed(2)} GB.`,
      type: 'vram'
    });

    newLogs.push({
      id: `${idPrefix}-4`,
      text: `[KV_CACHE] Reserving ${result.vramBreakdown.kvCacheGB.toFixed(2)} GB for context window.`,
      type: 'kv'
    });

    if (result.verdict === 'oom') {
      newLogs.push({
        id: `${idPrefix}-5`,
        text: `[ERROR] Out of Memory! Required: ${result.vramBreakdown.totalRequiredGB.toFixed(2)} GB, Available: ${result.vramBreakdown.availableVramGB} GB.`,
        type: 'error'
      });
    } else {
      newLogs.push({
        id: `${idPrefix}-5`,
        text: `[COMPUTE] Memory allocation successful. Headroom: ${result.vramBreakdown.headroomGB.toFixed(2)} GB.`,
        type: 'success'
      });
      newLogs.push({
        id: `${idPrefix}-6`,
        text: `[ESTIMATE] Projected inference speed: ${result.performance.estimatedTPS} tokens/s.`,
        type: 'compute'
      });
    }

    // Add them slowly to simulate typing
    let index = 0;
    const interval = setInterval(() => {
      if (index < newLogs.length) {
        setLogs(prev => [...prev.slice(-30), newLogs[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300); // 300ms delay between logs

    return () => clearInterval(interval);
  }, [result, hardware, model]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'system': return 'text-slate-400';
      case 'vram': return 'text-cyan-400';
      case 'kv': return 'text-pink-400';
      case 'compute': return 'text-amber-400';
      case 'error': return 'text-red-500';
      case 'success': return 'text-emerald-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col h-64 border border-white/10">
      <div className="bg-black/50 p-2 border-b border-white/5 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">LLMFit Terminal Output</span>
      </div>
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar bg-[#020205]/80">
        <AnimatePresence initial={false}>
          {logs.filter(Boolean).map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-1.5 ${getColor(log.type)}`}
            >
              <span className="opacity-50 mr-2 text-[10px]">
                {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              {log.text}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4 flex items-center">
          <span className="w-2 h-4 bg-white/50 animate-pulse inline-block" />
        </div>
      </div>
    </div>
  );
}
