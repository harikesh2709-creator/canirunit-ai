'use client';

import { CONTEXT_OPTIONS } from '@/lib/data/quantization';
import { motion } from 'framer-motion';

interface ContextSliderProps {
  contextLength: number;
  maxContext: number;
  onChange: (tokens: number) => void;
}

export default function ContextSlider({
  contextLength,
  maxContext,
  onChange,
}: ContextSliderProps) {
  // Filter to only show options within the model's max context
  const availableOptions = CONTEXT_OPTIONS.filter((o) => o.tokens <= maxContext);
  const currentIndex = availableOptions.findIndex((o) => o.tokens === contextLength);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;

  // Find the label for current context
  const currentLabel =
    CONTEXT_OPTIONS.find((o) => o.tokens === contextLength)?.label ??
    `${Math.round(contextLength / 1024)}K`;

  // Color intensity based on context size
  const intensity = effectiveIndex / Math.max(1, availableOptions.length - 1);
  const hue = 270 - intensity * 120; // teal (270) → indigo (150)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Context Window</label>
        <motion.span
          key={contextLength}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-mono font-bold"
          style={{ color: `hsl(${hue}, 70%, 65%)` }}
        >
          {currentLabel} tokens
        </motion.span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={availableOptions.length - 1}
          step={1}
          value={effectiveIndex}
          onChange={(e) => {
            const idx = Number(e.target.value);
            onChange(availableOptions[idx].tokens);
          }}
          className="range-slider w-full"
          style={{
            // @ts-expect-error CSS custom properties
            '--slider-color': `hsl(${hue}, 70%, 55%)`,
          }}
        />

        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-0.5">
          {availableOptions.map((opt, idx) => (
            <button
              key={opt.tokens}
              type="button"
              onClick={() => onChange(opt.tokens)}
              className={`text-[10px] transition-colors cursor-pointer
                ${idx === effectiveIndex ? 'text-slate-200 font-semibold' : 'text-slate-600 hover:text-slate-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
