import { useEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../motion'

/**
 * Préchargeur à progression réelle.
 *
 * L'ancienne version attendait un délai fixe de 2,4 s — une connexion rapide
 * payait le même prix qu'une connexion lente. Ici le compteur monte jusqu'à 90 %
 * pendant le chargement puis termine dès que `window.load` se déclenche : la page
 * s'ouvre aussi vite qu'elle est prête.
 *
 * `onReady` est appelé AVANT le rideau, pour que le contenu soit déjà monté
 * derrière lui et se retrouve dévoilé au lieu d'apparaître après coup.
 */
export default function Preloader({ onReady }) {
  // L'état de départ dépend déjà du réglage système : pas de préchargeur du tout
  // quand l'utilisateur limite les animations, plutôt qu'un montage suivi d'un
  // démontage immédiat.
  const [gone, setGone] = useState(() => reducedMotion())
  const rootRef = useRef(null)
  const countRef = useRef(null)
  const barRef = useRef(null)
  const logoRef = useRef(null)
  const readyRef = useRef(onReady)

  useEffect(() => { readyRef.current = onReady }, [onReady])

  useEffect(() => {
    if (reducedMotion()) {
      readyRef.current?.()
      return
    }

    const state = { v: 0 }
    let exited = false

    const paint = () => {
      const pct = Math.round(state.v)
      if (countRef.current) countRef.current.textContent = String(pct).padStart(3, '0')
      if (barRef.current) barRef.current.style.transform = `scaleX(${state.v / 100})`
    }

    const exit = () => {
      if (exited) return
      exited = true
      const tl = gsap.timeline()
      tl.to(state, { v: 100, duration: 0.45, ease: 'power2.out', onUpdate: paint })
        .to([countRef.current, barRef.current], { opacity: 0, duration: 0.35, ease: 'power2.in' }, '-=0.1')
        .to(logoRef.current, { scale: 1.18, opacity: 0, duration: 0.7, ease: 'expo.inOut' }, '<')
        .call(() => readyRef.current?.())
        .to(
          rootRef.current,
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' },
          '-=0.35'
        )
        .call(() => setGone(true))
      return tl
    }

    // Montée jusqu'à 90 % : on ne promet pas 100 % tant que la page n'est pas prête.
    const ramp = gsap.to(state, {
      v: 90,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate: paint,
    })

    let settle
    const onLoad = () => {
      ramp.kill()
      // Un battement minimum, sinon le préchargeur clignote sur un cache chaud.
      settle = gsap.delayedCall(0.25, exit)
    }

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })

    // Filet de sécurité : une image qui ne répond jamais ne doit pas bloquer le site.
    const failsafe = gsap.delayedCall(6, exit)

    return () => {
      window.removeEventListener('load', onLoad)
      ramp.kill()
      settle?.kill()
      failsafe.kill()
    }
  }, [])

  if (gone) return null

  return (
    <div ref={rootRef} className="loader">
      <div ref={logoRef} className="loader-logo">AB</div>
      <div className="loader-bar">
        <div ref={barRef} className="loader-bar-fill" />
      </div>
      <div className="loader-meta">
        <span className="loader-name">Auryves Bedje</span>
        <span ref={countRef} className="loader-count">000</span>
      </div>
    </div>
  )
}
