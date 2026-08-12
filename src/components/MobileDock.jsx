import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { reducedMotion } from '../motion'

/**
 * Barre de sections flottante — mobile uniquement.
 *
 * Adaptée du `Dock` de `barre doutil telephone interactive.txt`. L'original
 * réagit au survol (échelle + rotation par icône), ce qui n'existe pas sur
 * tactile : ici c'est la **section visible à l'écran** qui pilote l'état actif.
 * On garde son langage visuel — arc en perspective, fond flouté, flottement
 * lent au repos — et sa mécanique de ressort pour la pastille active.
 *
 * Justifié par la longueur de la page : près de 26 000 px sur mobile. Le menu
 * hamburger seul obligeait à ouvrir un panneau plein écran pour se déplacer.
 */
const SECTIONS = [
  { id: 'about', icon: '◆', label: 'À propos' },
  { id: 'projects', icon: '▲', label: 'Projets' },
  { id: 'marches', icon: '▮', label: 'Marchés' },
  { id: 'skills', icon: '●', label: 'Compétences' },
  { id: 'certifications', icon: '✦', label: 'Certifs' },
  { id: 'networking', icon: '◈', label: 'Réseau' },
  { id: 'contact', icon: '✉', label: 'Contact' },
]

export default function MobileDock() {
  const [active, setActive] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Masquée dans le hero : elle n'a rien à indiquer tant qu'on n'a pas commencé
    // à parcourir la page, et elle mangerait le premier écran.
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      obs.disconnect()
    }
  }, [])

  const float = reducedMotion() ? {} : { y: [0, -3, 0] }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          className="mdock md:hidden"
          aria-label="Sections du portfolio"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="mdock-bar"
            animate={float}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {SECTIONS.map(({ id, icon, label }) => {
              const on = active === id
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`mdock-item${on ? ' is-on' : ''}`}
                  aria-label={label}
                  aria-current={on ? 'true' : undefined}
                >
                  {/* La pastille glisse d'un onglet à l'autre au lieu de
                      réapparaître : layoutId laisse Framer interpoler la position. */}
                  {on && (
                    <motion.span
                      layoutId="mdock-pill"
                      className="mdock-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="mdock-icon">{icon}</span>
                </a>
              )
            })}
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
