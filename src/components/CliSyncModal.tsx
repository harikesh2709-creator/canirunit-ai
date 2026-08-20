'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export default function CliSyncModal() {
  const [copied, setCopied] = useState<'mac' | 'win' | null>(null);

  const handleCopy = (type: 'mac' | 'win', text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glass-card p-4 mt-4 text-left">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">1-Click Native Terminal Scan</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Run this command to bypass browser privacy masks and sync exact GPU specs natively.
      </p>

      <div className="space-y-3">
        {/* Mac / Linux */}
        <div>
          <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Mac / Linux</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/40 px-3 py-2 rounded-lg text-xs font-mono text-teal-300 overflow-x-auto whitespace-nowrap border border-white/5">
              curl -sL http://localhost:3000/scan.sh | bash
            </code>
            <button
              onClick={() => handleCopy('mac', 'curl -sL http://localhost:3000/scan.sh | bash')}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 text-slate-300 cursor-pointer"
              title="Copy Command"
            >
              {copied === 'mac' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Windows */}
        <div>
          <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Windows (PowerShell)</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/40 px-3 py-2 rounded-lg text-xs font-mono text-blue-300 overflow-x-auto whitespace-nowrap border border-white/5">
              irm http://localhost:3000/scan.ps1 | iex
            </code>
            <button
              onClick={() => handleCopy('win', 'irm http://localhost:3000/scan.ps1 | iex')}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 text-slate-300 cursor-pointer"
              title="Copy Command"
            >
              {copied === 'win' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
