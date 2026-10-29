import type { Locale } from '../i18n/utils';

/** A text field with a value per locale. English is required and is the fallback. */
export type Localized = { en: string } & Partial<Record<Locale, string>>;

export interface Product {
  id: string;
  /** Main wrapper colour (hex). */
  color: string;
  /** Secondary colour for details and highlights (hex). */
  accent: string;
  name: Localized;
  tagline: Localized;
  notes: Localized[];
}

export type StepIllustration = 'bean' | 'roast' | 'grind' | 'bar';

export interface Step {
  id: string;
  number: number;
  title: Localized;
  body: Localized;
  illustration: StepIllustration;
}

export interface ComparisonRow {
  label: Localized;
  us: Localized;
  them: Localized;
}

export interface Review {
  name: string;
  city: Localized;
  /** 1–5 */
  rating: number;
  text: Localized;
}

export interface Retailer {
  name: string;
  city: Localized;
  address: string;
  url?: string;
}

export interface FaqItem {
  question: Localized;
  answer: Localized;
}

export interface SectionCopy {
  eyebrow: Localized;
  title: Localized;
  intro: Localized;
}

export interface Site {
  meta: { title: Localized; description: Localized };
  hero: { eyebrow: Localized; headline: Localized; subhead: Localized; cta: Localized };
  marquee: Localized[];
  sections: {
    products: SectionCopy;
    process: SectionCopy;
    comparison: SectionCopy & { usLabel: Localized; themLabel: Localized };
    reviews: SectionCopy & { demoNote: Localized };
    whereToBuy: SectionCopy;
    faq: SectionCopy;
  };
  footer: {
    tagline: Localized;
    newsletterTitle: Localized;
    newsletterBody: Localized;
    legal: Localized;
    demoNote: Localized;
  };
}
