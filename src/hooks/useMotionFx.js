import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, EASE_OUT, reducedMotion, isMobile, isTouch } from '../motion'

/**
 * Parallaxe liée au scroll (scrub).
 * `distance` = amplitude totale en px sur la traversée complète de l'élément.
 * Désactivée sur mobile : la barre d'URL qui se rétracte fausse les positions
 * et le gain visuel ne justifie pas le coût en frames.
 */
export function useParallax(distance = -80, options = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || isMobile()) return
    const tween = gsap.fromTo(
      el,
      { y: -distance / 2 },
      {
        y: distance / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: options.trigger || el,
          start: options.start || 'top bottom',
          end: options.end || 'bottom top',
          scrub: options.scrub ?? 1,
        },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [distance, options.trigger, options.start, options.end, options.scrub])
  return ref
}

/**
 * Bouton magnétique piloté par `gsap.quickTo`.
 *
 * `quickTo` réutilise un même tween au lieu d'en instancier un par mousemove :
 * c'est ce qui distingue un magnétique fluide d'un magnétique qui saccade.
 * Le retour utilise un elastic doux — le bouton "revient à sa place" au lieu de
 * s'y téléporter.
 */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || isTouch()) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: EASE_OUT })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: EASE_OUT })

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf(el)
    }
  }, [strength])
  return ref
}

/**
 * Vitesse de scroll normalisée, transmise à un callback.
 * Sert à faire réagir le bandeau BRVM au scroll — comme un flux de cotation qui
 * s'emballe quand on parcourt la page.
 */
export function useScrollVelocity(onVelocity, { max = 4 } = {}) {
  useEffect(() => {
    if (reducedMotion()) return
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity()) / 1200
        onVelocity(gsap.utils.clamp(0, max, v))
      },
    })
    return () => st.kill()
  }, [onVelocity, max])
}

/**
 * Révélation d'image par volet : le visuel est dévoilé par un `clip-path` qui
 * s'ouvre vers le haut pendant que l'image relâche un léger zoom.
 */
export function useClipReveal({ start = 'top 85%', duration = 1.25 } = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const img = el.querySelector('img')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start, toggleActions: 'play none none reverse' },
    })
    tl.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: EASE_OUT }
    )
    if (img) tl.from(img, { scale: 1.22, duration: duration * 1.1, ease: EASE_OUT }, 0)
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [start, duration])
  return ref
}

/** Media query réactive — pour ne monter le WebGL que là où il a du sens. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const m = window.matchMedia(query)
    const fn = (e) => setMatches(e.matches)
    m.addEventListener('change', fn)
    return () => m.removeEventListener('change', fn)
  }, [query])
  return matches
}
