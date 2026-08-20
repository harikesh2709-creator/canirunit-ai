import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SEO_MODELS = ['llama-3-3-70b', 'deepseek-r1-14b', 'deepseek-r1-70b', 'qwen-2-5-32b', 'mistral-12b', 'phi-4'] as const;
const SEO_GPUS = ['rtx-4090', 'rtx-4080', 'rtx-4070', 'rtx-4060-ti', 'rtx-3060', 'm3-max', 'm2-pro', 'rx-7800-xt'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://llmfit.ai';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ecosystem`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  for (const model of SEO_MODELS) {
    for (const gpu of SEO_GPUS) {
      dynamicRoutes.push({
        url: `${baseUrl}/can-i-run/${model}-on-${gpu}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return [...staticRoutes, ...dynamicRoutes];
}
