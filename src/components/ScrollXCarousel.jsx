/**
 * Carrousel horizontal piloté par le scroll vertical.
 *
 * Repris de « presenation des service caroussel.txt » (ScrollXCarousel).
 * Trois écarts avec la source :
 *   1. `motion/react` n'est pas installé ici ; le projet utilise
 *      `framer-motion`, dont l'API est la même pour useScroll/useTransform ;
 *   2. pas de `cn` ni de TypeScript dans ce projet — les classes sont
 *      concaténées à la main ;
 *   3. le nom de la prop `xRagnge` de la source est une coquille, corrigée en
 *      `xRange`.
 *
 * Le conteneur est `sticky` : il reste figé pendant que le wrapper glisse sur
 * l'axe X. La hauteur du bloc parent détermine la durée du défilement.
 */
import { createContext, useContext, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const Ctx = createContext(null)

const useCarousel = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Composant ScrollXCarousel utilisé hors de <ScrollXCarousel>')
  return ctx
}

export function ScrollXCarousel({ children, className = '', ...props }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref })
  return (
    <Ctx.Provider value={{ scrollYProgress }}>
      <div ref={ref} className={`relative w-full ${className}`} {...props}>
        {children}
      </div>
    </Ctx.Provider>
  )
}

export function ScrollXCarouselContainer({ className = '', ...props }) {
  return <div className={`sticky top-0 left-0 w-full overflow-hidden ${className}`} {...props} />
}

export function ScrollXCarouselWrap({ className = '', style, xRange = ['0%', '-80%'], ...props }) {
  const { scrollYProgress } = useCarousel()
  const x = useTransform(scrollYProgress, [0, 1], xRange)
  return <motion.div className={`w-fit ${className}`} style={{ x, ...style }} {...props} />
}

export function ScrollXCarouselProgress({ className = '', style, progressStyle = '', ...props }) {
  const { scrollYProgress } = useCarousel()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <div className={`max-w-full overflow-hidden ${className}`} {...props}>
      <motion.div className={`origin-left ${progressStyle}`} style={{ scaleX, ...style }} />
    </div>
  )
}
