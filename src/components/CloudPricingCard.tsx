import React from 'react';
import { Cloud, ExternalLink, Zap } from 'lucide-react';

import { FitVerdict } from '@/lib/types';

interface CloudPricingCardProps {
  verdict: FitVerdict;
}

export default function CloudPricingCard({ verdict }: CloudPricingCardProps) {
  if (verdict !== 'oom') return null;

  return (
    <div className="glass-card p-5 border-rose-500/20 bg-rose-500/5 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="w-5 h-5 text-rose-400" />
        <h3 className="font-bold text-white tracking-tight">Cloud Fallback Options</h3>
      </div>
      <p className="text-sm text-slate-300 mb-4">
        Your current local setup does not have enough VRAM. Here are estimated cloud rental costs:
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="font-semibold text-sm text-white">RunPod - 1x RTX 4090</div>
              <div className="text-xs text-slate-400">24GB VRAM • Fast Inference</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-emerald-400">$0.69<span className="text-xs text-slate-500">/hr</span></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold text-sm text-white">Lambda Labs - 1x A100</div>
              <div className="text-xs text-slate-400">80GB VRAM • Large Models</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-emerald-400">$1.89<span className="text-xs text-slate-500">/hr</span></div>
          </div>
        </div>
      </div>
      <a href="https://runpod.io" target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-semibold text-sm border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
        Deploy to Cloud <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
