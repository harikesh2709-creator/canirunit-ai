'use client';

import { QUANTIZATION_CONFIGS } from '@/lib/data/quantization';
import { motion } from 'framer-motion';

interface QuantSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Color gradient mapping for quality indication */
const quantColors: Record<string, { bg: string; border: string; text: string }> = {
  fp16: {
    bg: 'bg-violet-600/20',
    border: 'border-violet-500/50',
    text: 'text-violet-300',
  },
  q8_0: {
    bg: 'bg-blue-600/20',
    border: 'border-blue-500/50',
    text: 'text-blue-300',
  },
  q6_k: {
    bg: 'bg-indigo-600/20',
    border: 'border-indigo-500/50',
    text: 'text-indigo-300',
  },
  q5_k_m: {
    bg: 'bg-emerald-600/20',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
  },
  q4_k_m: {
    bg: 'bg-green-600/20',
    border: 'border-green-500/50',
    text: 'text-green-300',
  },
  q3_k_m: {
    bg: 'bg-amber-600/20',
    border: 'border-amber-500/50',
    text: 'text-amber-300',
  },
  iq2_xs: {
    bg: 'bg-red-600/20',
    border: 'border-red-500/50',
    text: 'text-red-300',
  },
};

const defaultColor = {
  bg: 'bg-slate-600/20',
  border: 'border-slate-500/50',
  text: 'text-slate-300',
};

export default function QuantSelector({ selectedId, onSelect }: QuantSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">Quantization</label>

      <div className="flex flex-wrap gap-2">
        {QUANTIZATION_CONFIGS.map((quant) => {
          const isSelected = quant.id === selectedId;
          const colors = quantColors[quant.id] ?? defaultColor;

          return (
            <motion.button
              key={quant.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(quant.id)}
              className={`
                relative px-3 py-2 rounded-xl text-xs font-semibold
                border transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? `${colors.bg} ${colors.border} ${colors.text} shadow-lg`
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }
              `}
              title={quant.description}
            >
              {/* Glow effect when selected */}
              {isSelected && (
                <motion.div
                  layoutId="quant-glow"
                  className={`absolute inset-0 rounded-xl ${colors.bg} opacity-50 blur-sm -z-10`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="flex flex-col items-center gap-0.5">
                <span>{quant.label}</span>
                <span className="text-[10px] opacity-60 font-mono">
                  {quant.bitsPerWeight}bpw
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Description for selected quant */}
      <p className="text-xs text-slate-500">
        {QUANTIZATION_CONFIGS.find((q) => q.id === selectedId)?.description}
      </p>
    </div>
  );
}
