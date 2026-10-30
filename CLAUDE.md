# CLAUDE.md — Cocoa & Co. brand one-pager

Portfolio demo: an animated, illustrated one-page site for a **fictional** chocolate brand.
Never use a real brand's name, logo, product names or copy. All reviews are fictional demo text.

## Stack
- Astro (static output) + TypeScript (strict)
- Tailwind CSS v4 (via `@tailwindcss/vite`), design tokens in `src/styles/global.css` (`@theme`)
- GSAP + ScrollTrigger — the only animation library. No jQuery, no carousel libs.
- Deployed to Vercel as a static site (no adapter needed)

## Commands
- `npm run dev` — local dev (http://localhost:4321)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the build
- `npm run check` — `astro check` (types). Run before every commit.

## Project structure
```
src/
  pages/index.astro         # EN (default locale, "/")
  pages/fr/index.astro      # FR ("/fr/")
  layouts/Base.astro        # <html lang>, meta, fonts, global css
  components/               # one component per section (Hero, Marquee, Products, Process,
                            #   Comparison, Reviews, WhereToBuy, Faq, Footer, LangToggle)
  components/illustrations/ # inline SVG illustrations (hand-made, no stock assets)
  content/                  # ALL editable copy lives here (see Content model)
  i18n/ui.json              # short UI strings (buttons, labels) per locale
  i18n/utils.ts             # t(locale, key), getLocale(Astro.url)
  scripts/animations.ts     # every GSAP timeline/ScrollTrigger, initialised once
  styles/global.css
```

## Content model (non-dev editable)
Every text field is an object with both locales: `{ "en": "...", "fr": "..." }`.
- `src/content/products.json` — `{ id, color, accent, name, tagline, notes[] }` (4–5 flavours)
- `src/content/steps.json` — `{ id, number, title, body, illustration }` (bean → chocolate → bar)
- `src/content/comparison.json` — rows `{ label, us, them }`
- `src/content/reviews.json` — `{ name, city, rating, text }` (fictional, marked as demo)
- `src/content/retailers.json` — `{ name, city, address, url? }`
- `src/content/faq.json` — `{ question, answer }`
- `src/content/site.json` — hero headline, marquee phrases, section titles, footer copy

Rules:
- Components never hard-code copy; they read JSON and pick `field[locale]`.
- Adding a product/FAQ/retailer must require editing **only** JSON.
- If a JSON field is missing for a locale, fall back to `en` and log a warning in dev.

## Brand
- Tone: playful, cheeky, premium. Short punchy headlines.
- Palette (Tailwind tokens): `cocoa #3B1F14`, `pink #FF4F9A`, `sun #FFD23F`, `cream #FFF4E4`,
  plus one accent colour per product in `products.json`.
- Type: one bold display font + one readable sans (Google Fonts, `font-display: swap`, preload display font).

## Animation rules
- All GSAP code in `src/scripts/animations.ts`, loaded once from `Base.astro`.
- Use `gsap.matchMedia()`: full animations under `(prefers-reduced-motion: no-preference)`,
  otherwise content is simply visible (no hidden-until-animated content).
- Animate only `transform` and `opacity`. No layout-thrashing properties.
- Pinned "How it's made" section only on ≥768px wide and ≥560px tall, and only if the content fits
  the viewport (checked at init, so longer copy falls back safely); otherwise steps stack with
  simple fade-ins.
- Marquee is pure CSS (`@keyframes`), paused under reduced motion.
- Carousel = CSS scroll-snap + pointer-based tilt (disabled on touch and reduced motion).
- Call `ScrollTrigger.refresh()` after fonts load.
- New ScrollTriggers for sections below "How it's made" must be created **after** the pinned
  Process trigger in `animations.ts` (its pin spacing shifts everything below it), and set
  `refreshPriority: -1` so they still refresh after it when matchMedia re-creates the pin on resize.

## Quality bar
- Mobile-first; test at 360px, 768px, 1280px.
- Lighthouse ≥ 90 in all four categories (mobile). No layout shift from fonts/images.
- Semantic HTML: one `<h1>`, sections with headings, FAQ via `<details>/<summary>`,
  carousel has prev/next buttons with `aria-label`s and is keyboard-scrollable.
- Visible focus styles. Colour contrast AA (careful with yellow on cream).
- Newsletter form: client-side validation + mock success message, no network request.

## Conventions
- TypeScript types for every JSON file in `src/content/types.ts`.
- Small commits with conventional messages (`feat:`, `fix:`, `style:`, `docs:`).
- Don't add dependencies without saying why.
