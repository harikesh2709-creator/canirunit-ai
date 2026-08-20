import React, { useState } from 'react';
import { X, Terminal, Download, Check } from 'lucide-react';
import { ModelSpec, QuantizationConfig } from '@/lib/types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelSpec;
  quant: QuantizationConfig;
  verdict: 'smooth' | 'tight' | 'oom';
}

export default function DownloadModal({ isOpen, onClose, model, quant, verdict }: DownloadModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const ollamaCmd = `ollama run ${model.id}:${quant.id}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(ollamaCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative glass-card-elevated w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Run {model.name}</h2>
            <p className="text-slate-400 mt-1">Quantization: <span className="text-teal-400 font-mono">{quant.label}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {verdict === 'oom' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3">
              <div className="text-rose-400 font-bold mt-0.5">⚠️</div>
              <div>
                <h4 className="text-rose-400 font-bold">Hardware Warning</h4>
                <p className="text-rose-200/80 text-sm mt-1">
                  This model exceeds your VRAM capacity. Running this locally will be extremely slow. Consider a smaller quantization or cloud hosting.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-teal-400" />
              1-Click Install via Ollama
            </h3>
            <p className="text-slate-400 text-sm">
              The fastest way to get started. Ensure you have <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">Ollama installed</a>, then run this command:
            </p>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex items-center justify-between bg-black border border-white/10 rounded-xl p-4">
                <code className="text-teal-300 font-mono text-sm">{ollamaCmd}</code>
                <button onClick={handleCopy} className="secondary-button px-3 py-1.5 flex items-center gap-2 text-xs font-bold">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Manual PC Deployment (LM Studio)
            </h3>
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                To run this model manually on your hardware, follow these exact steps:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-400">
                <li>
                  Download and install <a href="https://lmstudio.ai/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-semibold">LM Studio</a> for your OS.
                </li>
                <li>
                  Open LM Studio and search for this exact string in the top search bar:
                  <div className="relative group mt-2 mb-2">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="relative flex items-center justify-between bg-black border border-white/10 rounded-xl p-3">
                      <code className="text-blue-300 font-mono text-sm">{model.name} {quant.id} GGUF</code>
                    </div>
                  </div>
                </li>
                <li>
                  Look for a result by <span className="text-white font-mono">bartowski</span> or <span className="text-white font-mono">MaziyarPanahi</span>.
                </li>
                <li>
                  Click the <span className="text-emerald-400 font-bold">Download</span> button next to the file that ends with <span className="text-white font-mono">{quant.id.toLowerCase()}.gguf</span>.
                </li>
                <li>
                  Navigate to the chat tab (💬) on the left sidebar, load the model from the top dropdown, and start chatting!
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
