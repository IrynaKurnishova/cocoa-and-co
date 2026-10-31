# Cocoa & Co.

An animated, illustrated one-page site for a **fictional** chocolate brand, built as a portfolio demo.
Cocoa & Co., its flavours, shops and reviews are all made up. Every illustration is hand-made inline SVG.

**Live:** https://cocoa-and-co.vercel.app

Available in English (`/`) and French (`/fr/`).

## What's on the page

- **Hero** with an illustrated bar, GSAP intro and scroll parallax, plus a CSS marquee
- **Flavours**: scroll-snap carousel where the section background changes to each bar's colour, with pointer tilt
- **How it's made**: four steps (bean → roast → conche → bar), pinned and scrubbed on larger screens, stacked on mobile
- **Us vs. the usual suspects**: comparison table with animated checkmarks
- **Reviews**: carousel with star ratings, clearly marked as fictional demo content
- **Where to buy**, **FAQ** (`<details>`/`<summary>`) and a footer with a mock newsletter signup

Built to a quality bar of Lighthouse ≥ 90 on mobile in all four categories, WCAG AA contrast, visible focus
styles, keyboard-operable carousels, and a fully usable page with `prefers-reduced-motion`.

## Stack

- [Astro](https://astro.build) (static output) + TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`, design tokens in `src/styles/global.css`
- [GSAP](https://gsap.com) + ScrollTrigger for all animation (no other animation or carousel libraries)
- Self-hosted Google Fonts (Bricolage Grotesque + DM Sans) through Astro's font API
- Deployed on Vercel as a static site

## Running it

Requires Node.js 22.23.4 or newer.

```sh
npm install
npm run dev       # http://localhost:4321
npm run check     # type-check (astro check)
npm run build     # production build to dist/
npm run preview   # serve the build locally
```

Absolute URLs (canonical and `hreflang` links) use `SITE_URL` if it's set, otherwise Vercel's production domain,
otherwise `localhost`. To pin the domain, set `SITE_URL` (e.g. `https://example.com`) in the Vercel project settings.

## Project structure

```text
src/
  pages/index.astro          English page ("/")
  pages/fr/index.astro       French page ("/fr/")
  layouts/Base.astro         <html lang>, meta, hreflang, fonts, global CSS, animations
  components/                One component per section (Hero, Marquee, Products, Process,
                             Comparison, Reviews, WhereToBuy, Faq, Footer) + LangToggle, CarouselNav
  components/illustrations/  Hand-made inline SVG illustrations
  content/                   All editable copy as JSON, typed in content/types.ts
  i18n/ui.json               Short UI strings (buttons, labels) per locale
  i18n/utils.ts              t(locale, key), pick(field, locale), getLocale(url)
  scripts/animations.ts      Every GSAP timeline and ScrollTrigger, set up once
  scripts/carousel.ts        Shared carousel behaviour (buttons, keyboard, live announcements)
  styles/global.css          Tailwind theme tokens and base styles
```

## Editing content

All copy lives in `src/content/*.json`. Every text field holds both languages, `{ "en": "…", "fr": "…" }`, so
adding a flavour, FAQ entry or shop means editing JSON only, with no component changes. If a French string is missing, the
page falls back to English and logs a warning in dev. In dev you also get a warning if a flavour's colours
don't meet contrast requirements.

You can edit the JSON by hand, or ask [Claude Code](https://claude.com/claude-code) in plain language:

```text
Add a new flavour "Salted Caramel" with an orange accent in EN and FR
```

```text
Add an FAQ entry about shipping times to Canada, in a playful tone, in both languages
```

```text
Add a stockist "Cacao Corner" at 3 Market Square, Geneva, with its website link
```

## Built with Claude Code

The site was built section by section with [Claude Code](https://claude.com/claude-code), working directly in this
repository. Each step was a short request, e.g. "build the pinned How it's made section" or "audit the site against
the quality bar". Claude Code then wrote the code, ran `npm run check` and `npm run build`, checked the result in a
headless browser at 360, 768 and 1280px in both languages, and committed with a conventional commit message.

[`CLAUDE.md`](./CLAUDE.md) holds the project rules Claude Code reads at the start of every session:

- the stack and commands
- the content model, including the rule that components never hard-code copy
- the brand palette and tone
- the animation rules (transform/opacity only, reduced-motion behaviour, ScrollTrigger ordering around the pinned section)
- the quality bar

When a build turned up something worth remembering, such as the ScrollTrigger ordering rule or when the Process section
is allowed to pin, it went into `CLAUDE.md` so later sessions follow it too.
