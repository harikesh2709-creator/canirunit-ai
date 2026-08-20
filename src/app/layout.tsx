import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://llmfit.ai'),
  title: 'LLMFit.ai — Local LLM VRAM & Speed Calculator',
  description:
    'Instantly check if your GPU can run any local LLM. Calculate exact VRAM requirements, KV cache size, and estimated tokens/sec for Llama, Qwen, DeepSeek, Mistral, and Gemma across all quantization formats.',
  keywords: [
    'LLM VRAM calculator',
    'local LLM',
    'GPU VRAM',
    'llama.cpp',
    'ollama',
    'quantization',
    'GGUF',
    'tokens per second',
    'can I run',
  ],
  openGraph: {
    title: 'LLMFit.ai — Can Your GPU Run This LLM?',
    description:
      'Free client-side calculator for LLM VRAM requirements, KV cache sizing, and inference speed estimation.',
    url: 'https://llmfit.ai',
    siteName: 'LLMFit.ai',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLMFit.ai — Local LLM VRAM & Speed Calculator',
    description: 'Calculate exact VRAM requirements and estimated tokens/sec for local LLMs instantly.',
  },
};

import { CalculatorProvider } from '@/lib/CalculatorContext';
import ClientLayout from '@/components/ClientLayout';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "LLMFit.ai",
    "url": "https://llmfit.ai",
    "description": "Calculate exact VRAM requirements, KV cache size, and estimated tokens/sec for local LLMs.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google AdSense Integration (Uncomment and replace ca-pub-XXXXXX with your publisher ID) */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CalculatorProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </CalculatorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
