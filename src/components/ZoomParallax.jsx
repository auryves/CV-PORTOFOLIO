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
//
// Les proportions sont volontairement proches du portrait : ce sont des photos
// de personnes, et un cadre très large impose un recadrage vertical si sévère
// que les visages sortent du champ. Les cadres d'origine (35vw × 30vh) coupaient
// les têtes sur la rangée du haut.
const LAYOUT = [
  { scale: 4, top: '0vh',    left: '0vw',     h: '30vh', w: '24vw' },
  { scale: 5, top: '-28vh',  left: '6vw',     h: '34vh', w: '26vw' },
  { scale: 6, top: '-8vh',   left: '-25vw',   h: '38vh', w: '23vw' },
  { scale: 5, top: '0vh',    left: '27vw',    h: '30vh', w: '22vw' },
  { scale: 6, top: '28vh',   left: '6vw',     h: '26vh', w: '20vw' },
  { scale: 8, top: '28vh',   left: '-23vw',   h: '26vh', w: '22vw' },
  { scale: 9, top: '24vh',   left: '26vw',    h: '20vh', w: '16vw' },
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
        {index === 0 && item.name && (
          <div className="zoom-caption">
            <span>{item.name}</span>
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
