// Every GSAP timeline / ScrollTrigger lives here. Loaded once from Base.astro.
// Rules: transform + opacity only; everything is visible without JS or with reduced motion
// (animations use `from` tweens, so the resting state is the real layout).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  initHero();
});

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
