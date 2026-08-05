import { useEffect, useRef } from 'react'
import { gsap, SplitText, EASE_OUT, reducedMotion, isMobile } from '../motion'

/**
 * Titre à révélation ligne par ligne.
 *
 * Chaque ligne est enveloppée dans un masque `overflow:hidden` puis remonte
 * depuis le bas — le geste signature des sites primés, et la raison pour
 * laquelle ces titres "respirent" au lieu de simplement apparaître en fondu.
 *
 * `autoSplit` laisse GSAP re-découper le texte quand la police arrive ou que la
 * largeur change : sans ça, un titre sur deux lignes en desktop se retrouve
 * masqué de travers après rotation d'un mobile.
 */
export default function SplitReveal({
  as: Tag = 'h2',
  className = '',
  children,
  delay = 0,
  stagger = 0.09,
  start = 'top 88%',
  style,
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return

    const mob = isMobile()
    const split = SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      aria: 'auto', // conserve le texte lisible pour les lecteurs d'écran
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 118,
          opacity: 0,
          duration: mob ? 0.85 : 1.15,
          ease: EASE_OUT,
          stagger: mob ? stagger * 0.6 : stagger,
          delay: mob ? delay * 0.5 : delay,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: 'play none none reverse',
          },
        }),
    })

    return () => split.revert()
  }, [delay, stagger, start])

  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  )
}
