import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'

/* ────────────────────────────────────────────────────────────────────────────
 * Zoom Parallax — d'après `scrol effeect.txt` (dossier « animation code »),
 * avec une infobulle suivant le curseur reprise de `carte de curseur.txt`.
 *
 * Une seule photo occupe l'écran ; au scroll, elle s'écarte et révèle six
 * autres visuels qui étaient cachés « derrière » elle, chacun grossissant à une
 * vitesse différente. La section est haute et son contenu est en sticky : on ne
 * descend pas la page, on traverse l'image.
 *
 * Écarts avec l'original : décalages en styles inline plutôt qu'en variantes
 * Tailwind arbitraires, et proportions rapprochées du portrait — des cadres très
 * allongés rognaient les visages.
 * ──────────────────────────────────────────────────────────────────────────── */

// Position de chaque visuel par rapport au centre, et vitesse de zoom associée.
// L'index 0 reste plein centre : c'est l'image d'accueil du plan.
const LAYOUT = [
  { scale: 4, top: '0vh',    left: '0vw',     h: '30vh', w: '24vw' },
  { scale: 5, top: '-28vh',  left: '6vw',     h: '34vh', w: '26vw' },
  { scale: 6, top: '-8vh',   left: '-25vw',   h: '38vh', w: '23vw' },
  { scale: 5, top: '0vh',    left: '27vw',    h: '30vh', w: '22vw' },
  { scale: 6, top: '28vh',   left: '6vw',     h: '26vh', w: '20vw' },
  { scale: 8, top: '28vh',   left: '-23vw',   h: '26vh', w: '22vw' },
  { scale: 9, top: '24vh',   left: '26vw',    h: '20vh', w: '16vw' },
]

function ZoomLayer({ item, index, progress, onEnter, onMove, onLeave }) {
  const cfg = LAYOUT[index % LAYOUT.length]
  const scale = useTransform(progress, [0, 1], [1, cfg.scale])

  return (
    <motion.div style={{ scale }} className="zoom-layer">
      <div
        className="zoom-frame"
        style={{ top: cfg.top, left: cfg.left, height: cfg.h, width: cfg.w }}
        onMouseEnter={() => onEnter(item)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <img src={item.src} alt={item.alt} loading={index === 0 ? 'eager' : 'lazy'} />
      </div>
    </motion.div>
  )
}

export default function ZoomParallax({ images = [] }) {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  })

  // Une seule infobulle partagée plutôt qu'une par photo : elle se déplace d'un
  // cadre à l'autre au lieu d'apparaître et disparaître, ce qui rend le survol
  // continu quand on balaie plusieurs visuels.
  const [hovered, setHovered] = useState(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { damping: 26, stiffness: 320 })
  const springY = useSpring(y, { damping: 26, stiffness: 320 })

  const handleMove = (e) => {
    x.set(e.clientX + 22)
    y.set(e.clientY + 22)
  }
  const handleEnter = (item) => setHovered(item)
  const handleLeave = () => setHovered(null)

  return (
    <div ref={container} className="zoom-parallax">
      <div className="zoom-parallax-stage">
        {images.slice(0, 7).map((item, i) => (
          <ZoomLayer
            key={item.src}
            item={item}
            index={i}
            progress={scrollYProgress}
            onEnter={handleEnter}
            onMove={handleMove}
            onLeave={handleLeave}
          />
        ))}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {hovered && (
              <motion.div
                className="photo-tip"
                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 6 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                style={{ x: springX, y: springY }}
              >
                <div className="photo-tip-name serif">{hovered.name}</div>
                {hovered.role && <div className="photo-tip-role">{hovered.role}</div>}
                {hovered.org && <div className="photo-tip-org">{hovered.org}</div>}
                {hovered.event && <div className="photo-tip-event">📍 {hovered.event}</div>}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
