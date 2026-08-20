'use client';

import { CLICommands } from '@/lib/types';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Copy, Check } from 'lucide-react';

interface CliCommandCardProps {
  commands: CLICommands;
}

type TabKey = 'ollama' | 'llamaCpp' | 'vllm';

const tabs: { key: TabKey; label: string; description: string }[] = [
  { key: 'ollama', label: 'Ollama', description: 'Easiest setup' },
  { key: 'llamaCpp', label: 'llama.cpp', description: 'Maximum control' },
  { key: 'vllm', label: 'vLLM', description: 'Production serving' },
];

export default function CliCommandCard({ commands }: CliCommandCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('ollama');
  const [copied, setCopied] = useState(false);

  const currentCommand = commands[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        Run Command
      </h4>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/60 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer
              ${activeTab === tab.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="cli-tab"
                className="absolute inset-0 rounded-lg bg-white/10 border border-white/10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Command block */}
      <div className="relative group">
        <pre className="glass-card p-4 text-xs font-mono text-emerald-300 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto custom-scrollbar">
          <code>{currentCommand}</code>
        </pre>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 border border-white/10
                     text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer
                     opacity-0 group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-600">
        {tabs.find((t) => t.key === activeTab)?.description} ·{' '}
        Adjust flags as needed for your setup
      </p>
    </div>
  );
}
