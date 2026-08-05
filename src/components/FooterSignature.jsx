import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../motion'

/**
 * Signature géante en pied de page — mécanique reprise d'`AnimatedFooter`
 * (`pied de page animé.txt`).
 *
 * Du composant d'origine on garde le titre découpé caractère par caractère,
 * chacun enfermé dans un masque et remontant avec décalage. Les deux canvas
 * ASCII qui glissent depuis les bords sont écartés : trois cents lignes de rendu
 * canvas pour un motif décoratif sans rapport avec le propos du site.
 *
 * Le décalage part des extrémités vers le centre plutôt que de gauche à droite :
 * le nom se referme sur lui-même au lieu de se dérouler, ce qui convient mieux à
 * une signature.
 */
export default function FooterSignature({ text = 'AURYVES BEDJE' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return

    const ctx = gsap.context(() => {
      const chars = el.querySelectorAll('[data-sig-char]')
      if (!chars.length) return

      gsap.from(chars, {
        yPercent: 115,
        duration: 1.1,
        ease: 'expo.out',
        stagger: { each: 0.035, from: 'edges' },
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          toggleActions: 'play none none reverse',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [text])

  return (
    <div className="footer-signature" ref={ref} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span className="footer-signature-mask" key={i} aria-hidden="true">
          <span data-sig-char>{ch === ' ' ? ' ' : ch}</span>
        </span>
      ))}
    </div>
  )
}
