// Every GSAP timeline / ScrollTrigger lives here. Loaded once from Base.astro.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Section animations are added here as sections are built.
});

// Webfonts change text metrics, so recalculate trigger positions once they're in.
document.fonts.ready.then(() => ScrollTrigger.refresh());
