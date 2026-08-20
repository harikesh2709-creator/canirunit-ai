'use client';

import { memo } from 'react';
import { FitVerdict } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface VerdictBannerProps {
  verdict: FitVerdict;
  text: string;
}

const verdictConfig: Record<
  FitVerdict,
  {
    icon: React.ElementType;
    gradient: string;
    border: string;
    glow: string;
    borderColor: string;
    particleColor: string;
    emoji: string;
    title: string;
  }
> = {
  smooth: {
    icon: CheckCircle2,
    gradient: 'from-emerald-600/30 via-teal-500/15 to-transparent',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/25',
    borderColor: 'rgba(16,185,129,0.4)',
    particleColor: '#10b981',
    emoji: '🟢',
    title: 'Smooth GPU Fit',
  },
  tight: {
    icon: AlertTriangle,
    gradient: 'from-amber-600/30 via-orange-500/15 to-transparent',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/25',
    borderColor: 'rgba(245,158,11,0.4)',
    particleColor: '#f59e0b',
    emoji: '🟡',
    title: 'Tight / Partial Offload',
  },
  oom: {
    icon: XCircle,
    gradient: 'from-red-600/30 via-rose-500/15 to-transparent',
    border: 'border-red-500/40',
    glow: 'shadow-red-500/25',
    borderColor: 'rgba(239,68,68,0.4)',
    particleColor: '#ef4444',
    emoji: '🔴',
    title: 'Out of Memory',
  },
};

export default memo(function VerdictBanner({ verdict, text }: VerdictBannerProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={verdict}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`
          relative overflow-hidden rounded-2xl border p-5
          bg-gradient-to-r ${config.gradient}
          ${config.border}
          shadow-lg ${config.glow}
        `}
      >
        {/* Animated background pulse */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0`}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
        />

        {/* Pulsing border ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1px solid ${config.borderColor}` }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Sparkle particles for 'smooth' verdict */}
        {verdict === 'smooth' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
                  y: [0, -(15 + i * 8)],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeOut',
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: '20%',
                }}
              >
                <Sparkles className="w-3 h-3 text-emerald-400/60" />
              </motion.div>
            ))}
          </div>
        )}

        <div className="relative flex items-start gap-4">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div
              className="p-2 rounded-xl"
              style={{
                background: `${config.particleColor}20`,
                boxShadow: `0 0 16px ${config.particleColor}30`,
              }}
            >
              <Icon className="w-6 h-6 flex-shrink-0" style={{ color: config.particleColor }} />
            </div>
          </motion.div>

          <div>
            <h3 className="text-lg font-bold">
              {config.emoji} {config.title}
            </h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{text}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
