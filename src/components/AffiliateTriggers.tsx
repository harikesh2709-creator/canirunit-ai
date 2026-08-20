'use client';

import { motion } from 'framer-motion';
import { Cloud, Cpu, ExternalLink, ShoppingCart } from 'lucide-react';
import { ModelSpec } from '@/lib/types';

interface AffiliateCardProps {
  model?: ModelSpec;
  userVram: number;
  requiredVram?: number;
  contextSize?: number;
  isBenchmarkReview?: boolean;
}

export function AffiliateCard({
  model,
  userVram,
  requiredVram = 0,
  contextSize = 8192,
  isBenchmarkReview = false,
}: AffiliateCardProps) {
  // Scenario 2: Hardware Upgrade (Benchmark Review)
  if (isBenchmarkReview) {
    let recommendation = '';
    const link = '#'; // placeholder
    
    if (userVram < 12) {
      recommendation = 'RTX 4070 Ti Super (16GB) – Best value for 32B models';
    } else {
      recommendation = 'Mac Studio (M2 Ultra) or RTX 4090 – High-bandwidth options';
    }

    return (
      <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.1)] group hover:border-amber-400/50 transition-all">
        <div className="flex gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 h-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Time for a Hardware Upgrade?</h4>
            <p className="text-xs text-slate-400 mt-1">
              Based on your score, we recommend the <span className="text-amber-300 font-medium">{recommendation}</span> to unlock top-tier local AI performance.
            </p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Check Prices on Amazon <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[9px] text-slate-500 mt-2 italic">
              We may earn an affiliate commission at no extra cost to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Scenario 1: High-Intent Cloud GPU Affiliate Card
  const modelName = model?.name || 'this model';
  const contextK = Math.round(contextSize / 1024);
  const isOomOrHighOffload = requiredVram > userVram;

  if (!isOomOrHighOffload) {
    return null; // Don't render if it fits fine
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)] group hover:border-cyan-400/50 transition-all"
    >
      <div className="flex gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 h-fit">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">
            Your GPU lacks the VRAM for {modelName} at {contextK}k context.
          </h4>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            To run this model with full acceleration, you need more than <span className="font-mono text-cyan-300">{userVram.toFixed(1)}GB</span> of VRAM. Rent a cloud GPU instead!
          </p>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="https://runpod.io?ref=YOUR_TAG"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
            >
              Deploy this model on RunPod Serverless ($0.20/hr) <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://vast.ai?ref=YOUR_TAG"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
            >
              Rent an A100 / RTX 4090 Cloud Pod <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <p className="text-[9px] text-slate-500 mt-3 italic">
            We may earn an affiliate commission at no extra cost to you.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
