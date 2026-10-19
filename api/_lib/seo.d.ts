// Types for seo.js, which vite.config.ts imports.
export interface SeoMeta {
  siteName: string;
  twitter?: string;
  title: string;
  description: string;
  url: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  type?: string;
  publishedTime?: string;
}

export function excerpt(text: string | null | undefined, max?: number): string;
export function renderSeo(meta: SeoMeta): string;
export function replaceSeo(html: string, meta: SeoMeta): string;
