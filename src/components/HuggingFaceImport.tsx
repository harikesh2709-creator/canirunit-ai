'use client';

import React, { useState } from 'react';
import { Download, Loader2, AlertTriangle, CheckCircle2, Box } from 'lucide-react';
import { ModelSpec } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface HuggingFaceImportProps {
  onImport: (spec: ModelSpec) => void;
}

export default function HuggingFaceImport({ onImport }: HuggingFaceImportProps) {
  const [repoId, setRepoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleImport = async () => {
    if (!repoId.trim()) return;
    
    setLoading(true);
    setStatus(null);
    
    try {
      const cleanId = repoId.trim();
      
      // 1. Fetch general model info from HF API
      const apiRes = await fetch(`https://huggingface.co/api/models/${cleanId}`);
      if (!apiRes.ok) {
        if (apiRes.status === 404) throw new Error('Model not found on HuggingFace Hub.');
        if (apiRes.status === 401) throw new Error('Model is gated. Only public models are supported.');
        throw new Error('Failed to fetch from HuggingFace API.');
      }
      const apiData = await apiRes.json();

      // Get parameter count from safetensors or fallback
      let paramsBillion = 0;
      if (apiData.safetensors?.total) {
        paramsBillion = apiData.safetensors.total / 1_000_000_000;
      } else {
        throw new Error('Model does not have safetensors metadata to determine parameter count.');
      }

      // 2. Fetch config.json directly
       
      const configRes = await fetch(`https://huggingface.co/${cleanId}/resolve/main/config.json`);
      if (!configRes.ok) {
        if (configRes.status === 401) throw new Error('Model config.json is gated.');
        throw new Error('Failed to fetch config.json. Model might not be a standard transformer.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configData: any = await configRes.json();

      // Extract architectural details
      const layers = configData.num_hidden_layers || configData.n_layer || 32;
      const hiddenSize = configData.hidden_size || configData.n_embd || 4096;
      const attentionHeads = configData.num_attention_heads || configData.n_head || 32;
      const kvHeads = configData.num_key_value_heads || configData.multi_query_group_num || attentionHeads;
      const headDimension = configData.head_dim || (hiddenSize / attentionHeads);
      const defaultContext = configData.max_position_embeddings || configData.n_positions || 8192;

      // Construct the custom ModelSpec
      const customSpec: ModelSpec = {
        id: 'custom',
        name: cleanId.split('/').pop() || cleanId,
        family: 'HuggingFace Import',
        parametersBillion: Number(paramsBillion.toFixed(2)),
        layers: layers,
        kvHeads: kvHeads,
        headDimension: headDimension,
        defaultContext: defaultContext,
        supportedQuants: ['q4_k_m', 'q8_0', 'fp16', 'bf16'], // Default assumption
      };

      onImport(customSpec);
      setStatus({ type: 'success', message: `Imported ${customSpec.name} successfully!` });
      setRepoId('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus(null), 3000);

    } catch (err: any) {
      console.error('HF Import Error:', err);
      setStatus({ type: 'error', message: err.message || 'An unknown error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-white/5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
        <Box className="w-3.5 h-3.5" />
        HuggingFace Import
      </label>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g., Qwen/Qwen2.5-0.5B"
          value={repoId}
          onChange={(e) => setRepoId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all"
        />
        <button
          onClick={handleImport}
          disabled={loading || !repoId.trim()}
          className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ padding: '0.5rem 1rem' }}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Fetching...</span>
            </div>
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className={`text-[10px] px-3 py-2 rounded-lg flex items-start gap-2 border ${
              status.type === 'error' 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {status.type === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              )}
              <span className="leading-tight">{status.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
