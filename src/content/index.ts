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
