import ui from './ui.json';
import type { Localized } from '../content/types';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export type UiKey = keyof (typeof ui)[typeof defaultLocale];

/** Locale from the URL: "/fr/..." is French, everything else is the default (English). */
export function getLocale(url: URL): Locale {
  const [, first] = url.pathname.split('/');
  return (locales as readonly string[]).includes(first) ? (first as Locale) : defaultLocale;
}

function warnMissing(what: string, locale: Locale) {
  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing "${locale}" for ${what}, falling back to "${defaultLocale}".`);
  }
}

/** Short UI string by key, with `{name}` placeholders replaced from `vars`. */
export function t(locale: Locale, key: UiKey, vars: Record<string, string | number> = {}): string {
  const strings: Partial<Record<UiKey, string>> = ui[locale];
  let value = strings[key];
  if (value === undefined) {
    warnMissing(`ui key "${key}"`, locale);
    value = ui[defaultLocale][key];
  }
  return value.replace(/\{(\w+)\}/g, (match, name: string) => String(vars[name] ?? match));
}

/** Picks the locale's value from a `{ en, fr }` content field, falling back to English. */
export function pick(field: Localized, locale: Locale): string {
  const value = field[locale];
  if (value === undefined || value === '') {
    warnMissing(`content field "${field.en.slice(0, 40)}"`, locale);
    return field.en;
  }
  return value;
}
