// Every GSAP timeline / ScrollTrigger lives here. Loaded once from Base.astro.
// Rules: transform + opacity only; everything is visible without JS or with reduced motion
// (animations use `from` tweens, so the resting state is the real layout).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  initHero();
  initProducts();
});

// "How it's made": pinned scrub on tablet/desktop, simple fade-ins on mobile.
mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => initProcessPinned());
mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767.98px)', () => initProcessFade());

// Sections below the pinned Process section: create their triggers after it (see CLAUDE.md).
mm.add('(prefers-reduced-motion: no-preference)', () => {
  initComparison();
});

// Pointer tilt only for a real mouse: no touch, no reduced motion.
mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => initTilt());

// Webfonts change text metrics, so recalculate trigger positions once they're in.
document.fonts.ready.then(() => ScrollTrigger.refresh());

function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const q = gsap.utils.selector(hero);
  const floaters = q('[data-float]');

  // Intro. The headline and subhead are likely LCP candidates, so they move but never fade.
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from(q('[data-hero-word]'), { yPercent: 60, rotate: 6, duration: 0.8, stagger: 0.08 })
    .from(q('[data-hero-sub]'), { y: 24, duration: 0.6 }, '-=0.5')
    .from(q('[data-hero-fade]'), { y: 16, opacity: 0, duration: 0.5, stagger: 0.12 }, '<0.1')
    .from(
      q('[data-hero-bar]'),
      { y: 60, rotate: -14, scale: 0.85, transformOrigin: '50% 60%', duration: 1, ease: 'back.out(1.6)' },
      0.15,
    )
    // Pop in the outer [data-depth] layers: [data-float] is owned by the idle loop, and
    // tweening `scale` on both would let the loop capture a half-scaled start value.
    .from(
      q('[data-depth]'),
      { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.06, ease: 'back.out(2)' },
      0.5,
    );

  // Idle bobbing, paused while the hero is off screen.
  const idle = gsap.timeline({ paused: true });
  floaters.forEach((el) => {
    const isSparkle = el.hasAttribute('data-sparkle');
    idle.to(
      el,
      {
        y: gsap.utils.random(-12, -6),
        rotate: isSparkle ? gsap.utils.random(-20, 20) : gsap.utils.random(-8, 8),
        scale: isSparkle ? 1.2 : 1,
        transformOrigin: '50% 50%',
        duration: gsap.utils.random(1.8, 3),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      },
      gsap.utils.random(0, 1),
    );
  });

  ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: ({ isActive }) => (isActive ? idle.play() : idle.pause()),
  });

  // Scroll parallax: deeper layers drift further up as the hero scrolls away.
  const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  q('[data-depth]').forEach((el) => {
    gsap.to(el, { y: -Number(el.dataset.depth) * 90, ease: 'none', scrollTrigger: scrub });
  });
  gsap.to(q('[data-hero-copy]'), { y: 50, ease: 'none', scrollTrigger: scrub });
}

function initProducts() {
  const slides = gsap.utils.toArray<HTMLElement>('[data-carousel-slide]');
  if (!slides.length) return;

  gsap.from(slides, {
    y: 80,
    rotate: 3,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: slides[0].parentElement, start: 'top 80%', once: true },
  });
}

function initProcessPinned() {
  const section = document.querySelector<HTMLElement>('[data-process]');
  const steps = gsap.utils.toArray<HTMLElement>('[data-process-step]');
  if (!section || steps.length < 2) return;

  const q = gsap.utils.selector(section);
  const digits = q('[data-process-digits]');
  const texts = steps.map((step) => step.querySelector('[data-process-text]'));
  const arts = steps.map((step) => step.querySelector('[data-process-art]'));
  const last = steps.length - 1;

  // Switch the CSS to the stacked-in-one-cell layout before ScrollTrigger measures anything.
  section.dataset.pinned = '';
  gsap.set([...texts.slice(1), ...arts.slice(1)], { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: 'top top',
      // One viewport of scrolling per step change; a function, so it's re-measured on refresh.
      // No invalidateOnRefresh: the tween values are static, and invalidating here wipes the
      // start state of other sections' untriggered from() tweens.
      end: () => `+=${last * window.innerHeight}`,
      scrub: 0.6,
      // Settle on the nearest step. No inertia: scrub lag reads as velocity and would skip steps.
      snap: { snapTo: 'labels', inertia: false, duration: { min: 0.2, max: 0.6 }, delay: 0.1, ease: 'power1.inOut' },
    },
  });

  tl.addLabel('step-1', 0);
  for (let i = 1; i <= last; i++) {
    const at = i - 1;
    tl.to(texts[i - 1], { opacity: 0, y: -30, duration: 0.45 }, at)
      .to(arts[i - 1], { opacity: 0, scale: 0.8, rotate: -10, duration: 0.45 }, at)
      .fromTo(texts[i], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45 }, at + 0.55)
      .fromTo(
        arts[i],
        { opacity: 0, scale: 0.8, rotate: 10 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.6)' },
        at + 0.45,
      )
      .to(digits, { yPercent: (-100 * i) / steps.length, duration: 0.7, ease: 'power3.inOut' }, at + 0.15)
      .addLabel(`step-${i + 1}`, i);
  }

  // Progress starts at 1/n so step 1 already reads as "on".
  tl.fromTo(q('[data-process-progress]'), { scaleX: 1 / steps.length }, { scaleX: 1, duration: last, ease: 'none' }, 0);

  // matchMedia reverts the tweens; the layout switch is ours to undo.
  return () => delete section.dataset.pinned;
}

function initProcessFade() {
  gsap.utils.toArray<HTMLElement>('[data-process-step]').forEach((step) => {
    gsap.from(step, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: step, start: 'top 85%', once: true },
    });
  });
}

function initComparison() {
  const table = document.querySelector<HTMLElement>('[data-compare]');
  if (!table) return;

  const q = gsap.utils.selector(table);
  gsap
    .timeline({
      defaults: { ease: 'power3.out' },
      // refreshPriority -1: if the Process pin is re-created on resize (matchMedia), this trigger
      // still refreshes after it and accounts for its pin spacing.
      scrollTrigger: { trigger: table, start: 'top 75%', once: true, refreshPriority: -1 },
    })
    .from(q('[data-compare-bar]'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.8, ease: 'power4.out' })
    .from(q('[data-compare-cell]'), { y: 16, opacity: 0, duration: 0.5, stagger: 0.04 }, 0.2)
    .from(
      q('[data-compare-check]'),
      { scale: 0, rotate: -45, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.1, ease: 'back.out(2.5)' },
      0.45,
    )
    .from(q('[data-compare-cross]'), { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.1 }, 0.6);
}

function initTilt() {
  const cleanups = gsap.utils.toArray<HTMLElement>('[data-tilt]').map((card) => {
    const art = card.querySelector<SVGElement>('[data-tilt-art]');
    const tween = { duration: 0.5, ease: 'power3.out' };
    gsap.set(card, { transformPerspective: 900 });

    const rotateX = gsap.quickTo(card, 'rotationX', tween);
    const rotateY = gsap.quickTo(card, 'rotationY', tween);
    const artX = art && gsap.quickTo(art, 'x', tween);
    const artY = art && gsap.quickTo(art, 'y', tween);

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY(px * 12);
      rotateX(py * -12);
      // The illustration drifts with the pointer for a bit of depth.
      artX?.(px * 14);
      artY?.(py * 14);
    };
    const reset = () => {
      rotateX(0);
      rotateY(0);
      artX?.(0);
      artY?.(0);
    };

    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', reset);
    return () => {
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', reset);
    };
  });

  // matchMedia reverts the tweens; listeners are ours to remove.
  return () => cleanups.forEach((cleanup) => cleanup());
}
