'use client';

import { MODEL_FAMILIES } from '@/lib/data/models';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ModelSpec } from '@/lib/types';

interface ModelSelectorProps {
  selectedId: string;
  customModelSpec?: ModelSpec;
  onSelect: (id: string) => void;
}

export default function ModelSelector({ selectedId, customModelSpec, onSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allModels = MODEL_FAMILIES.flatMap((f) => f.items);
  const presetSelected = allModels.find((m) => m.id === selectedId);
  const isCustom = selectedId === 'custom' && customModelSpec;
  const selected = isCustom ? customModelSpec : presetSelected;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Family color map for visual distinction
  const familyColors: Record<string, string> = {
    'Llama 3': 'text-blue-400',
    'Qwen 2.5': 'text-emerald-400',
    DeepSeek: 'text-orange-400',
    Mistral: 'text-amber-400',
    'Gemma 2': 'text-pink-400',
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">Model</label>

      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full glass-card px-4 py-3 flex items-center justify-between gap-3
                     text-left text-white hover:border-teal-500/50 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-sm font-medium">
              {isCustom ? `[HF] ${selected?.name}` : selected?.name ?? 'Select model'}
            </span>
            {selected && (
              <span className="block text-xs text-slate-400">
                {selected.parametersBillion}B params · {selected.layers} layers ·{' '}
                {selected.kvHeads} KV heads
                {selected.activeParametersBillion
                  ? ` · ${selected.activeParametersBillion}B active (MoE)`
                  : ''}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 w-full glass-card border-white/10 max-h-80 overflow-y-auto custom-scrollbar"
            >
              {MODEL_FAMILIES.map((family) => (
                <div key={family.label}>
                  <div
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${familyColors[family.label] ?? 'text-slate-500'}`}
                  >
                    {family.label}
                  </div>
                  {family.items.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onSelect(model.id);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm
                                  transition-colors cursor-pointer
                                  ${
                                    model.id === selectedId
                                      ? 'bg-teal-600/20 text-teal-300'
                                      : 'text-slate-300 hover:bg-white/5'
                                  }`}
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {model.parametersBillion}B
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
