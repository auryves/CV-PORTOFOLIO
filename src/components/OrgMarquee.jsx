import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, isTouch } from '../motion'

/**
 * Bandeau d'organisations en défilement continu, éclairé par un projecteur qui
 * suit le curseur.
 *
 * Extrait de `paneau lumineau magnifique.txt` (MagneticSpotlightMarquee). Le
 * composant d'origine est une section hero de 100 vh complète — titre,
 * sous-titres, paragraphes, navigation, pied de page — qui aurait remplacé la
 * moitié de la page. Seuls deux mécanismes sont repris :
 *   1. le défilement infini piloté par GSAP, avec reprise sans couture ;
 *   2. le projecteur radial suivi en `quickTo`, qui révèle les noms en doré au
 *      passage du curseur.
 *
 * Le reste (déplacement vertical de la bande, sillage sur le texte) supposait
 * une mise en page plein écran qui n'a pas de sens pour une simple ligne.
 */
export default function OrgMarquee({ items = [], speed = 28 }) {
  const wrapRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const track = trackRef.current
    if (!wrap || !track || reducedMotion()) return

    const ctx = gsap.context(() => {
      // La liste est dupliquée dans le rendu : décaler de la moitié exacte de la
      // piste ramène au même visuel, donc la boucle ne se voit pas.
      const loop = gsap.to(track, {
        xPercent: -50,
        duration: speed,
        ease: 'none',
        repeat: -1,
      })

      wrap.addEventListener('mouseenter', () => gsap.to(loop, { timeScale: 0.25, duration: 0.6 }))
      wrap.addEventListener('mouseleave', () => gsap.to(loop, { timeScale: 1, duration: 0.6 }))

      if (isTouch()) return

      // Le projecteur est une variable CSS : la position part en `quickTo` pour
      // réutiliser un seul tween au lieu d'en créer un par mousemove.
      const xTo = gsap.quickTo(wrap, '--spot-x', { duration: 0.35, ease: 'power3.out' })
      const yTo = gsap.quickTo(wrap, '--spot-y', { duration: 0.35, ease: 'power3.out' })

      const onMove = (e) => {
        const r = wrap.getBoundingClientRect()
        xTo(e.clientX - r.left)
        yTo(e.clientY - r.top)
      }
      const onEnter = () => gsap.to(wrap, { '--spot-o': 1, duration: 0.4 })
      const onLeave = () => gsap.to(wrap, { '--spot-o': 0, duration: 0.5 })

      wrap.addEventListener('mousemove', onMove)
      wrap.addEventListener('mouseenter', onEnter)
      wrap.addEventListener('mouseleave', onLeave)
    }, wrapRef)

    return () => ctx.revert()
  }, [speed, items.length])

  return (
    <div className="org-marquee" ref={wrapRef}>
      <div className="org-marquee-track" ref={trackRef}>
        {[...items, ...items].map((o, i) => (
          <span className="org-chip" key={`${o}-${i}`}>
            {o}
            <i className="org-chip-sep" aria-hidden="true">◆</i>
          </span>
        ))}
      </div>
      <div className="org-marquee-spot" aria-hidden="true" />
    </div>
  )
}
