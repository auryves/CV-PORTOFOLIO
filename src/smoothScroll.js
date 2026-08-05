import Lenis from 'lenis'
import { gsap, ScrollTrigger, reducedMotion } from './motion'

/* ────────────────────────────────────────────────────────────────────────────
 * Scroll immersif (Lenis) synchronisé avec GSAP.
 *
 * Sans ça, chaque effet lié au scroll avance par à-coups au rythme des crans de
 * molette. Lenis interpole entre ces crans : les sections épinglées, les scrubs
 * et la parallaxe deviennent continus — c'est ce qui fait la différence entre
 * « animé au scroll » et « piloté par le scroll ».
 *
 * L'intégration canonique tient en trois lignes : Lenis prévient ScrollTrigger
 * à chaque frame, GSAP fournit l'horloge (une seule rAF pour tout le site), et
 * `lagSmoothing(0)` empêche GSAP de « rattraper » après un pic de charge, ce qui
 * désynchroniserait les deux.
 * ──────────────────────────────────────────────────────────────────────────── */

let lenis = null

export function initSmoothScroll() {
  if (lenis) return lenis
  // Le scroll natif reste le meilleur choix quand l'utilisateur limite les
  // animations — et sur tactile, où Lenis laisse déjà la main au navigateur.
  if (reducedMotion()) return null

  lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false, // le scroll tactile natif reste plus fiable
    touchMultiplier: 1.6,
    anchors: true, // les liens #section passent par Lenis
  })

  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function destroySmoothScroll() {
  if (!lenis) return
  lenis.destroy()
  lenis = null
  gsap.ticker.lagSmoothing(500, 33)
}

/** Remonte en haut de page — respecte Lenis quand il est actif. */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function getLenis() {
  return lenis
}
