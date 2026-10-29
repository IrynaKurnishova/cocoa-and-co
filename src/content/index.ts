// Typed entry point for all editable content. Assigning each JSON file to its
// type makes `astro check` catch malformed or missing fields.
import type { ComparisonRow, FaqItem, Product, Retailer, Review, Site, Step } from './types';
import productsJson from './products.json';
import stepsJson from './steps.json';
import comparisonJson from './comparison.json';
import reviewsJson from './reviews.json';
import retailersJson from './retailers.json';
import faqJson from './faq.json';
import siteJson from './site.json';

export const products: Product[] = productsJson;
export const steps: Step[] = stepsJson as Step[]; // `illustration` is a string union
export const comparison: ComparisonRow[] = comparisonJson;
export const reviews: Review[] = reviewsJson;
export const retailers: Retailer[] = retailersJson;
export const faq: FaqItem[] = faqJson;
export const site: Site = siteJson;

// Product colours are edited by non-devs, so check them against how they're used:
// cream text sits on `color` (section background), cocoa text sits on `accent` (chips).
// Keep in sync with the tokens in src/styles/global.css.
const CREAM = '#FFF4E4';
const COCOA = '#3B1F14';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

if (import.meta.env.DEV) {
  for (const p of products) {
    const onColor = contrast(CREAM, p.color);
    const onAccent = contrast(COCOA, p.accent);
    if (onColor < 4.5) {
      console.warn(`[content] products.json "${p.id}": cream on color ${p.color} is ${onColor.toFixed(2)}:1 (needs 4.5). Pick a darker color.`);
    }
    if (onAccent < 4.5) {
      console.warn(`[content] products.json "${p.id}": cocoa on accent ${p.accent} is ${onAccent.toFixed(2)}:1 (needs 4.5). Pick a lighter accent.`);
    }
  }
}
