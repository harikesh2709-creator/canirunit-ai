'use client';

import { FitVerdict } from '@/lib/types';
import { motion } from 'framer-motion';
import { Cloud, Cpu, ExternalLink } from 'lucide-react';

interface AffiliateCardsProps {
  verdict: FitVerdict;
  modelName: string;
  requiredVramGB: number;
}

export default function AffiliateCards({
  verdict,
  modelName,
  requiredVramGB,
}: AffiliateCardsProps) {
  // Only show if the model doesn't fit comfortably
  const showCloudCTA = verdict === 'tight' || verdict === 'oom';
  const showHardwareCTA = verdict === 'oom';

  // Determine recommended GPU
  const recommendedGPU =
    requiredVramGB <= 24
      ? 'RTX 4090 (24 GB)'
      : requiredVramGB <= 48
        ? 'A6000 (48 GB)'
        : requiredVramGB <= 80
          ? 'A100 (80 GB)'
          : 'H100 (80 GB)';

  return (
    <div className="space-y-3">
      {/* Cloud GPU CTA */}
      {showCloudCTA && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 border-teal-500/20 hover:border-teal-500/40 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-600/20">
              <Cloud className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">
                Need more VRAM? Run in the cloud
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Deploy <span className="text-teal-300">{modelName}</span> on cloud
                GPUs from $0.20/hr. No hardware purchase needed.
              </p>
              <div className="flex gap-2 mt-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-teal-600/20 text-teal-300 border border-teal-500/30
                             hover:bg-teal-600/30 transition-colors"
                >
                  RunPod <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-white/5 text-slate-300 border border-white/10
                             hover:bg-white/10 transition-colors"
                >
                  Lambda Labs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hardware Recommendation CTA */}
      {showHardwareCTA && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 border-indigo-500/20 hover:border-indigo-500/40 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">
                Best GPU for {modelName}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                You need at least{' '}
                <span className="text-indigo-300 font-mono">
                  {requiredVramGB.toFixed(0)} GB
                </span>{' '}
                of VRAM. We recommend the{' '}
                <span className="text-indigo-300">{recommendedGPU}</span>.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-indigo-600/20 text-indigo-300 border border-indigo-500/30
                           hover:bg-indigo-600/30 transition-colors"
              >
                Compare GPUs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Always show a subtle tip */}
      {!showCloudCTA && !showHardwareCTA && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-slate-600 text-center py-2"
        >
          ✨ Your hardware is a great match for this model configuration
        </motion.p>
      )}
    </div>
  );
}
