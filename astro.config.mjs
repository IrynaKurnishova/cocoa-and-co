// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Absolute URLs (hreflang, canonical) need the site origin. SITE_URL wins if set; on Vercel
// builds the production domain is exposed as VERCEL_PROJECT_PRODUCTION_URL (no protocol).
// Read via globalThis so @ts-check passes without adding @types/node.
const env = /** @type {Record<string, string | undefined>} */ (/** @type {any} */ (globalThis).process.env);
const site =
  env.SITE_URL ??
  (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4321');

// https://astro.build/config
export default defineConfig({
  site,
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // Self-hosted Google Fonts: font-display swap, preload links and
  // metric-matched fallbacks (no layout shift when the webfont arrives).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      weights: [800],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'DM Sans',
      cssVariable: '--font-dm-sans',
      weights: [400, 700],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
