import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, refreshSoon } from '../motion'

/* ────────────────────────────────────────────────────────────────────────────
 * Pile de cartes épinglée — d'après StickyCard_002 (Skiper UI, @gurvinder-singh02),
 * adapté aux certifications : cartes composées au lieu d'images plein cadre.
 *
 * Principe : la section est pinnée, chaque carte monte depuis `y: 100%` pendant
 * que la précédente recule (scale 0.72) et bascule de 4° — l'effet « paquet de
 * cartes qu'on étale » sans jamais quitter l'écran.
 *
 * Écarts : Lenis retiré (absent du projet), course de scroll comprimée à 0,72
 * écran par carte — 9 certificats à 100 vh chacun donnaient une section
 * interminable — et repli en grille si l'utilisateur limite les animations.
 * ──────────────────────────────────────────────────────────────────────────── */

export default function StickyCerts({ items = [] }) {
  const scope = useRef(null)
  const cardRefs = useRef([])

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const total = cards.length
    if (total < 2 || reducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.set(cards[0], { yPercent: 0, scale: 1, rotate: 0 })
      for (let i = 1; i < total; i++) {
        gsap.set(cards[i], { yPercent: 110, scale: 1, rotate: 0 })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.sticky-cards',
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.72 * (total - 1)}`,
          pin: true,
          scrub: 0.5,
          pinSpacing: true,
          invalidateOnRefresh: true,
        },
      })

      for (let i = 0; i < total - 1; i++) {
        tl.to(cards[i], { scale: 0.72, rotate: 4, opacity: 0.55, ease: 'none', duration: 1 }, i)
        tl.to(cards[i + 1], { yPercent: 0, ease: 'none', duration: 1 }, i)
      }
    }, scope)

    const ro = new ResizeObserver(() => refreshSoon())
    if (scope.current) ro.observe(scope.current)

    return () => {
      ro.disconnect()
      ctx.revert()
    }
  }, [items.length])

  return (
    <div ref={scope} className="sticky-cards-scope">
      <div className="sticky-cards">
        <div className="sticky-cards-frame">
          {items.map((c, i) => (
            <article
              key={c.title}
              ref={(el) => { cardRefs.current[i] = el }}
              className="cert-plate"
              style={{ '--accent': c.color }}
            >
              <div className="cert-plate-bar" />
              <header className="cert-plate-head">
                <span className="cert-plate-icon">{c.icon}</span>
                <span className="cert-plate-index">
                  {String(i + 1).padStart(2, '0')} <i>/ {String(items.length).padStart(2, '0')}</i>
                </span>
              </header>

              <h3 className="cert-plate-title serif">{c.title}</h3>
              <p className="cert-plate-issuer">{c.issuer}</p>

              <footer className="cert-plate-foot">
                <div className="cert-plate-meta">
                  <span className="cert-plate-date">{c.date}</span>
                  <span className="cert-plate-badge">{c.badge}</span>
                </div>
                <a href={c.file} target="_blank" rel="noreferrer" className="cert-plate-link">
                  Voir le certificat <span aria-hidden="true">↗</span>
                </a>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
