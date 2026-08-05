import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Infobulle unique qui suit le curseur — mécanique reprise de
 * `carte de curseur.txt` (dossier « animation code »).
 *
 * Rendue dans <body> par un portail : à l'intérieur d'une scène transformée
 * (zoom, WebGL, carte inclinée) elle hériterait de la transformation du parent
 * et se retrouverait déformée ou mal placée.
 *
 * Une seule instance partagée par toutes les photos : elle glisse d'un visuel
 * à l'autre au lieu de disparaître puis réapparaître quand on balaie la galerie.
 */
export default function PhotoTip({ data, offset = 22 }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { damping: 26, stiffness: 320 })
  const springY = useSpring(y, { damping: 26, stiffness: 320 })

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX + offset)
      y.set(e.clientY + offset)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [x, y, offset])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {data && (
        <motion.div
          className="photo-tip"
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ x: springX, y: springY }}
        >
          <div className="photo-tip-name serif">{data.name}</div>
          {data.role && <div className="photo-tip-role">{data.role}</div>}
          {data.org && <div className="photo-tip-org">{data.org}</div>}
          {data.event && <div className="photo-tip-event">📍 {data.event}</div>}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
