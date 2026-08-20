'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Cpu, Code, CheckCircle2, Lock, X } from 'lucide-react';

// ============================================================================
// Ethical Ads Slot
// ============================================================================

export function EthicalAdSlot() {
  useEffect(() => {
    // Load EthicalAds script if it hasn't been loaded
    const scriptId = 'ethicalads-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-4">
      <div 
        id="ethical-ad-placement" 
        className="horizontal"
        data-ea-publisher="YOUR_PUBLISHER_ID" 
        data-ea-type="image" 
      />
    </div>
  );
}

// ============================================================================
// Pro Feature Gate Modal
// ============================================================================

export function ProFeatureGate() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example trigger for Lemon Squeezy checkout
  const handleCheckout = () => {
    // In a real app, integrate LemonSqueezy checkout script:
    // window.createLemonSqueezy() or LemonSqueezy.Url.Open()
    alert('Redirecting to Lemon Squeezy Checkout ($4.99)...');
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full md:w-auto mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 
                   hover:from-indigo-500/90 hover:to-purple-500/90 transition-all border border-indigo-400/30
                   flex items-center justify-center gap-3 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-[1.02] cursor-pointer"
      >
        <Download className="w-5 h-5" />
        <span className="font-semibold text-sm">Download Certified GPU AI Benchmark PDF & Custom Ollama Modelfile</span>
        <Lock className="w-4 h-4 ml-1 opacity-70" />
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-4">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Upgrade to LLMFit Pro</h2>
                  <p className="text-slate-400 text-sm">Unlock advanced benchmarking, multi-GPU rigs, and custom exports.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-5 rounded-xl bg-white/5 border border-white/5">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Free</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Web-based benchmark
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Basic fit calculation
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Basic CLI commands
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-bl-lg">RECOMMENDED</div>
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">Pro Pass</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /> <strong>Multi-GPU Rig Calculator</strong> (Dual 3090/4090)
                      </li>
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /> Downloadable System Report Badge for GitHub
                      </li>
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <Code className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /> Tailored Prompt/Context Optimizer Script
                      </li>
                      <li className="flex items-start gap-2 text-sm text-indigo-200">
                        <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /> Custom Ollama Modelfile Generation
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <button 
                    onClick={handleCheckout}
                    className="w-full md:w-auto px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                               text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]
                               hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] cursor-pointer"
                  >
                    Get Pro Pass - $4.99 <span className="text-indigo-200 text-sm font-normal ml-1">One-time payment</span>
                  </button>
                  <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Secure checkout powered by Lemon Squeezy
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Local mock of Sparkles icon since it wasn't imported from lucide-react in the top list but used below.
function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
