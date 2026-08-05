import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ────────────────────────────────────────────────────────────────────────────
 * Zoom Parallax — d'après `scrol effeect.txt` (dossier « animation code ».)
 *
 * Une seule photo occupe l'écran ; au scroll, elle s'écarte et révèle six
 * autres visuels qui étaient cachés « derrière » elle, chacun grossissant à une
 * vitesse différente. La section est haute de 300 vh et son contenu est en
 * sticky : on ne descend pas la page, on traverse l'image.
 *
 * Écart avec l'original : les décalages passent par des styles inline plutôt
 * que par des variantes Tailwind arbitraires (`[&>div]:!-top-[30vh]`) — moins
 * dépendant de la configuration JIT, et lisible quand il faudra les régler.
 * ──────────────────────────────────────────────────────────────────────────── */

// Position de chaque visuel par rapport au centre, et vitesse de zoom associée.
// L'index 0 reste plein centre : c'est l'image d'accueil du plan.
const LAYOUT = [
  { scale: 4, top: '0vh', left: '0vw', h: '26vh', w: '26vw' },
  { scale: 5, top: '-30vh', left: '5vw', h: '30vh', w: '35vw' },
  { scale: 6, top: '-10vh', left: '-25vw', h: '45vh', w: '20vw' },
  { scale: 5, top: '0vh', left: '27.5vw', h: '25vh', w: '25vw' },
  { scale: 6, top: '27.5vh', left: '5vw', h: '25vh', w: '20vw' },
  { scale: 8, top: '27.5vh', left: '-22.5vw', h: '25vh', w: '30vw' },
  { scale: 9, top: '22.5vh', left: '25vw', h: '15vh', w: '15vw' },
]

function ZoomLayer({ item, index, progress }) {
  const cfg = LAYOUT[index % LAYOUT.length]
  const scale = useTransform(progress, [0, 1], [1, cfg.scale])

  return (
    <motion.div style={{ scale }} className="zoom-layer">
      <div
        className="zoom-frame"
        style={{ top: cfg.top, left: cfg.left, height: cfg.h, width: cfg.w }}
      >
        <img src={item.src} alt={item.alt} loading={index === 0 ? 'eager' : 'lazy'} />
        {index === 0 && item.caption && (
          <div className="zoom-caption">
            <span>{item.caption}</span>
          </div>
        )}
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

  return (
    <div ref={container} className="zoom-parallax">
      <div className="zoom-parallax-stage">
        {images.slice(0, 7).map((item, i) => (
          <ZoomLayer key={item.src} item={item} index={i} progress={scrollYProgress} />
        ))}
      </div>
    </div>
  )
}
