// ─────────────────────────────────────────────────────────────────────────────
// Couche motion — noyau GSAP partagé
// Un seul point d'enregistrement des plugins, un seul jeu de constantes d'easing,
// et les gardes (reduced-motion / mobile) que tous les effets doivent respecter.
// ─────────────────────────────────────────────────────────────────────────────
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Courbe maison — même signature que le cubic-bezier utilisé côté Framer Motion,
// pour que les deux moteurs d'animation aient exactement le même "feel".
export const CURVE = [0.16, 1, 0.3, 1]
export const EASE_OUT = 'expo.out'
export const EASE_SOFT = 'power3.out'

const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const reducedMotion = () => mq('(prefers-reduced-motion: reduce)')
export const isMobile = () => mq('(max-width: 768px)')
export const isTouch = () => mq('(hover: none)')

// Les polices display sont chargées depuis Google Fonts : découper le texte avant
// leur arrivée fige des largeurs de ligne fausses. On attend `fonts.ready`, avec
// un garde-fou temporel pour ne jamais laisser un titre invisible.
export function whenFontsReady(cb, timeout = 1500) {
  let done = false
  const run = () => {
    if (done) return
    done = true
    cb()
  }
  const t = setTimeout(run, timeout)
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(() => {
      clearTimeout(t)
      run()
    })
  }
  return () => {
    done = true
    clearTimeout(t)
  }
}

// ScrollTrigger recalcule ses positions au resize ; sur mobile, la barre d'URL
// qui se rétracte déclenche un resize à chaque scroll et provoque du jank.
ScrollTrigger.config({ ignoreMobileResize: true })

// `ScrollTrigger.refresh()` remesure toute la page : appelé une fois par titre
// découpé, il provoque une dizaine de recalculs de layout d'affilée. On regroupe.
let refreshTimer
export function refreshSoon(delay = 200) {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), delay)
}

export { gsap, ScrollTrigger, SplitText }
