import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Brain, Cpu, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

import SeoDashboardWrapper from '@/components/SeoDashboardWrapper';
import { calculate } from '@/lib/vramCalculator';
import { getHardwareById } from '@/lib/data/hardware';
import { getModelById } from '@/lib/data/models';
import { getQuantById, getKVCacheById } from '@/lib/data/quantization';

// ============================================================================
// Data Mappings
// ============================================================================

const SEO_MODELS = ['llama-3-3-70b', 'deepseek-r1-14b', 'deepseek-r1-70b', 'qwen-2-5-32b', 'mistral-12b', 'phi-4'] as const;
const SEO_GPUS = ['rtx-4090', 'rtx-4080', 'rtx-4070', 'rtx-4060-ti', 'rtx-3060', 'm3-max', 'm2-pro', 'rx-7800-xt'] as const;

const MODEL_MAP: Record<string, string> = {
  'llama-3-3-70b': 'llama-3.3-70b',
  'deepseek-r1-14b': 'deepseek-r1-distill-14b',
  'deepseek-r1-70b': 'deepseek-r1-distill-70b',
  'qwen-2-5-32b': 'qwen-2.5-32b',
  'mistral-12b': 'mistral-nemo-12b',
  'phi-4': 'phi-4-14b',
};

const GPU_MAP: Record<string, string> = {
  'rtx-4090': 'rtx-4090',
  'rtx-4080': 'rtx-4080',
  'rtx-4070': 'rtx-4070',
  'rtx-4060-ti': 'rtx-4060-ti-16gb',
  'rtx-3060': 'rtx-3060-12gb',
  'm3-max': 'm3-max-64gb',
  'm2-pro': 'm2-pro-16gb',
  'rx-7800-xt': 'rx-7800-xt',
};

// Default calculation params for the summary box
const DEFAULT_QUANT = 'q4_k_m';
const DEFAULT_CONTEXT = 32768; // 32k
const DEFAULT_KV = 'fp16';

// ============================================================================
// Helpers
// ============================================================================

function parseSlug(slug: string) {
  const parts = slug.split('-on-');
  if (parts.length !== 2) return null;
  const [modelSlug, gpuSlug] = parts;
  
  const modelId = MODEL_MAP[modelSlug];
  const hardwareId = GPU_MAP[gpuSlug];

  if (!modelId || !hardwareId) return null;
  
  const model = getModelById(modelId);
  const hardware = getHardwareById(hardwareId);
  const quant = getQuantById(DEFAULT_QUANT)!;
  const kv = getKVCacheById(DEFAULT_KV)!;
  
  if (!model || !hardware) return null;

  return { model, hardware, quant, kv, modelId, hardwareId };
}

// ============================================================================
// Static Params
// ============================================================================

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  for (const m of SEO_MODELS) {
    for (const g of SEO_GPUS) {
      params.push({ slug: `${m}-on-${g}` });
    }
  }
  
  return params;
}

// ============================================================================
// Metadata Generation
// ============================================================================

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: 'Not Found' };
  
  const { model, hardware } = parsed;
  
  const title = `Can I Run ${model.name} on ${hardware.name}? VRAM & Speed Benchmark`;
  const description = `Calculate exact VRAM fit, KV cache footprint at 32k context, and estimated tokens/second for ${model.name} running on ${hardware.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function CanIRunPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) {
    notFound();
  }

  const { model, hardware, quant, kv, modelId, hardwareId } = parsed;

  // Run calculation server-side for the summary box
  const result = calculate({
    model,
    hardware,
    quant,
    kvCachePrecision: kv,
    contextLength: DEFAULT_CONTEXT,
    gpuCount: 1,
  });

  const vramRequired = result.vramBreakdown.totalRequiredGB.toFixed(1);
  const vramAvailable = result.vramBreakdown.availableVramGB.toFixed(1);
  // canRun removed
  const needsCloud = result.verdict === 'oom';
  
  let summaryText = '';
  if (result.verdict === 'smooth') {
    summaryText = `Yes! ${model.name} fits comfortably on the ${hardware.name} at ${quant.label} quantization. It requires ${vramRequired} GB VRAM, leaving plenty of headroom.`;
  } else if (result.verdict === 'tight') {
    summaryText = `Yes, but it's tight. ${model.name} requires ${vramRequired} GB VRAM on the ${hardware.name} at ${quant.label} quantization. Make sure to close other VRAM-heavy applications.`;
  } else {
    summaryText = `No, ${model.name} requires ${vramRequired} GB VRAM at ${quant.label}. The ${hardware.name} (${vramAvailable}GB) will experience Out of Memory errors without aggressive CPU offload.`;
  }

  // Generate structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Can I run ${model.name} on ${hardware.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: summaryText,
        },
      },
    ],
  };

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: model.name,
    operatingSystem: 'Any',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  // Build the Header UI
  const headerNode = (
    <div className="relative z-10 max-w-4xl mx-auto text-left space-y-6">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Brain className="w-4 h-4" />
        <span>LLMFit.ai</span>
        <span className="px-2">/</span>
        <span>Models</span>
        <span className="px-2">/</span>
        <span className="text-white font-medium">{model.name}</span>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
        Can I run <span className="text-teal-400">{model.name}</span> <br/>
        on an <span className="text-indigo-400">{hardware.name}</span>?
      </h1>
      
      <div className={`mt-6 p-6 md:p-8 rounded-2xl border bg-black/40 backdrop-blur-md shadow-2xl
        ${result.verdict === 'smooth' ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 
          result.verdict === 'tight' ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 
          'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]'}`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
            {result.verdict === 'smooth' ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> :
             result.verdict === 'tight' ? <AlertTriangle className="w-8 h-8 text-amber-400" /> :
             <XCircle className="w-8 h-8 text-red-400" />}
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-xl font-bold text-white">Summary Answer</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              {summaryText}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Cpu className="w-4 h-4" /> 
                <span>VRAM Needed: <strong className="text-white font-mono">{vramRequired} GB</strong></span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <span>Context: <strong className="text-white font-mono">32k</strong></span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <span>Estimated Speed: <strong className="text-white font-mono">{result.performance.estimatedTPS.toFixed(1)} tok/s</strong></span>
              </div>
            </div>
            
            {needsCloud && (
              <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm">
                <span className="text-cyan-400 font-semibold">Recommendation: </span>
                <span className="text-cyan-100">Since this model exceeds your local VRAM, consider renting a cloud GPU on </span>
                <a href="https://runpod.io?ref=YOUR_TAG" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-medium hover:text-cyan-200">RunPod</a>
                <span className="text-cyan-100"> or </span>
                <a href="https://vast.ai?ref=YOUR_TAG" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-medium hover:text-cyan-200">Vast.ai</a>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <SeoDashboardWrapper
        initialState={{
          hardwareId,
          modelId,
          quantId: DEFAULT_QUANT,
          contextLength: DEFAULT_CONTEXT,
          kvCachePrecisionId: DEFAULT_KV,
        }}
        headerNode={headerNode}
      />
    </>
  );
}
