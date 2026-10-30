// Carousel behaviour (not animation): buttons, keyboard, active slide, optional background swap.
// Shared by every `[data-carousel]` section; import it from each component's <script> (Astro
// bundles it once). Tilt and entrance animations live in src/scripts/animations.ts.
//
// Markup contract:
//   [data-carousel]               root, `data-status-template` with {current} {total} {name}
//   [data-carousel-track]         the scroll-snap list
//   [data-carousel-slide]         each slide, `data-name` for the live-region announcement
//   [data-carousel-btn=prev|next] buttons
//   [data-carousel-status]        aria-live region
//   [data-carousel-bg]            optional, one background layer per slide
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
  const track = root.querySelector<HTMLElement>('[data-carousel-track]')!;
  const slides = [...track.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
  const layers = [...root.querySelectorAll<HTMLElement>('[data-carousel-bg]')];
  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-btn="prev"]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-btn="next"]')!;
  const status = root.querySelector<HTMLElement>('[data-carousel-status]')!;
  const template = root.dataset.statusTemplate ?? '';
  let active = 0;
  let frame = 0;
  let settle = 0;

  const snapStart = () =>
    track.getBoundingClientRect().left + (parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0);

  // The slide whose left edge is nearest the snap line.
  function nearestIndex(): number {
    const line = snapStart();
    let best = 0;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.getBoundingClientRect().left - line);
      if (dist < Math.abs(slides[best].getBoundingClientRect().left - line)) best = i;
    });
    return best;
  }

  function setActive(index: number) {
    active = index;
    layers.forEach((layer, i) => (layer.dataset.active = String(i === index)));
    prev.setAttribute('aria-disabled', String(index === 0));
    next.setAttribute('aria-disabled', String(index === slides.length - 1));
  }

  function announce() {
    status.textContent = template
      .replace('{current}', String(active + 1))
      .replace('{total}', String(slides.length))
      .replace('{name}', slides[active].dataset.name ?? '');
  }

  function goTo(index: number) {
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    track.scrollTo({
      left: track.scrollLeft + target.getBoundingClientRect().left - snapStart(),
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
    });
  }

  track.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const index = nearestIndex();
        if (index !== active) setActive(index);
      });
      // Announce once scrolling settles, not on every passing slide.
      clearTimeout(settle);
      settle = window.setTimeout(announce, 250);
    },
    { passive: true },
  );

  prev.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));

  track.addEventListener('keydown', (event) => {
    const keys: Record<string, number> = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      goTo(keys[event.key]);
    }
  });

  setActive(nearestIndex());
});
