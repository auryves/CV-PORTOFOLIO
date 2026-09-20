import * as React from 'react'
import Icon from './Icon'

/* ────────────────────────────────────────────────────────────────────────────
 * Coverflow — carrousel en perspective, porté en JSX.
 *
 * Remplace la galerie circulaire WebGL. Trois raisons de fond :
 *   1. plus de contexte GL à maintenir ni de textures à recharger — c'est du DOM
 *      transformé, que le compositeur gère seul ;
 *   2. la légende intégrée affiche nom, fonction et organisation en clair : elle
 *      rend inutile l'infobulle au survol et sa détection à chaque frame ;
 *   3. le contenu est du vrai texte et de vraies images, donc lisible par les
 *      lecteurs d'écran et indexable — le canvas ne l'était pas.
 *
 * Écarts avec l'original : `cn` et lucide-react retirés (absents du projet, les
 * chevrons viennent du jeu d'icônes maison), cartes en portrait 3/4 plutôt qu'en
 * carré pour respecter le cadrage des photos, et palette alignée sur le site.
 * ──────────────────────────────────────────────────────────────────────────── */

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export default function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = 'clamp(160px, 24vw, 300px)',
  gap = 0.05,
  loop = true,
  showCaption = true,
  showPagination = true,
  showNavigation = true,
  label = 'Rencontres',
  className = '',
}) {
  const count = slides.length

  const frameRef = React.useRef(null)
  const cardRefs = React.useRef([])
  // Index fractionnaire au centre. Seule source de vérité.
  const posRef = React.useRef(0)
  // Cible du réglage en cours. Repartir de `pos` avalerait une touche pressée en
  // plein vol, avant que l'arrondi n'ait bougé.
  const targetRef = React.useRef(0)
  const widthRef = React.useRef(0)
  const rafRef = React.useRef(null)
  const paintScheduled = React.useRef(null)
  const dragRef = React.useRef(null)

  const [selected, setSelected] = React.useState(0)

  // Carte entière la plus proche, repliée dans 0..count-1.
  const indexAt = React.useCallback(
    (pos) => ((Math.round(pos) % count) + count) % count,
    [count]
  )

  // Peinture directe dans le DOM. Soixante mises à jour d'état par seconde
  // re-rendraient chaque carte pour des nombres que React n'a pas à connaître.
  const paint = React.useCallback(() => {
    const width = widthRef.current
    if (!width) return
    const pitch = width * (1 + gap)
    const pos = posRef.current

    cardRefs.current.forEach((card, index) => {
      if (!card) return

      // La distance est repliée sur le chemin le plus court de l'anneau. C'est
      // tout le mécanisme de bouclage : aucun nœud cloné, aucun remaniement DOM.
      let offset = index - pos
      if (loop) {
        offset = ((offset % count) + count) % count
        if (offset > count / 2) offset -= count
      }

      const distance = Math.abs(offset)
      // Inclinaison et recul s'atténuent à mesure que les cartes s'éloignent :
      // doubler la distance n'en ajoute qu'environ la moitié. Une rampe linéaire
      // refermerait la deuxième carte ; ainsi elle reste lisible.
      const ramp = Math.pow(distance, falloff)
      // Bridée avant la tranche, pour qu'une carte lointaine ne tourne jamais le dos.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset)

      card.style.transform =
        'translateX(calc(-50% + ' + offset * pitch + 'px)) ' +
        'translateZ(' + -depth * width * ramp + 'px) rotateY(' + -tilt + 'deg)'

      // Une carte est téléportée à l'opposé exactement à mi-tour : elle doit donc
      // avoir disparu à ce moment, sinon le saut se voit.
      //
      // La largeur de la zone de fondu est ramenée à ce que l'anneau peut porter.
      // Fixée à 1, elle dégénérait sur de très petites listes : à deux cartes la
      // non-sélectionnée restait invisible en permanence, à une seule la carte
      // centrale plafonnait à 50 % d'opacité.
      const zone = Math.min(1, count / 2)
      const edge = loop && count > 2
        ? Math.min(1, Math.max(0, (count / 2 - distance) / zone))
        : 1
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge)
      card.style.zIndex = String(100 - Math.round(distance))
    })
  }, [count, depth, fade, falloff, gap, loop, rotate])

  const settle = React.useCallback(
    (target) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      targetRef.current = target
      setSelected(indexAt(target))

      const step = () => {
        const remaining = target - posRef.current
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target
          paint()
          rafRef.current = null
          return
        }
        // Amorti exponentiel, pas un ressort : aucun dépassement voulu ici.
        posRef.current += remaining * 0.16
        paint()
        rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [indexAt, paint]
  )

  const clamp = React.useCallback(
    (pos) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop]
  )

  // Le clavier et le glissement écrivent tous deux dans `posRef`. Si une flèche
  // arrive pendant un glissement, `settle` démarre sa boucle pendant que
  // `onPointerMove` continue d'écrire : deux auteurs sur la même valeur, d'où
  // des soubresauts. On clôt le glissement avant de céder la main au clavier.
  const releaseDrag = React.useCallback(() => {
    dragRef.current = null
    targetRef.current = posRef.current
  }, [])

  const goTo = React.useCallback(
    (index) => {
      releaseDrag()
      // Emprunter le chemin le plus court plutôt que dérouler tout l'anneau.
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index
      settle(clamp(target))
    },
    [clamp, count, loop, releaseDrag, settle]
  )

  const nudge = React.useCallback(
    (by) => {
      releaseDrag()
      settle(clamp(Math.round(targetRef.current) + by))
    },
    [clamp, releaseDrag, settle]
  )

  const onPointerDown = (event) => {
    // Sans ce garde, un clic droit ou molette maintenu faisait glisser le
    // carrousel et parasitait le menu contextuel. Et un second doigt posé en
    // cours de glissement réassignait le drag : le premier pointeur ne trouvait
    // plus son `pointerup` et son geste restait en plan, sans calage final.
    if (dragRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (event.isPrimary === false) return

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    targetRef.current = posRef.current
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    }
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return

    const pitch = widthRef.current * (1 + gap)
    if (!pitch) return

    const now = performance.now()
    const previous = posRef.current
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch)
    // Cartes par seconde, pour l'élan.
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000
    drag.t = now

    const index = indexAt(posRef.current)
    if (index !== selected) setSelected(index)

    // `pointermove` peut se déclencher plus souvent que l'écran ne rafraîchit
    // (souris à haute fréquence, événements tactiles coalescés). On ne peint
    // qu'une fois par frame, comme le fait déjà `settle`.
    if (paintScheduled.current === null) {
      paintScheduled.current = requestAnimationFrame(() => {
        paintScheduled.current = null
        paint()
      })
    }
  }

  const endDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    dragRef.current = null
    // Un geste vif porte, mais jamais au-delà de deux cartes.
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18))
    settle(clamp(Math.round(posRef.current + carried)))
  }

  // La largeur de carte commande le pas, le recul et la perspective : c'est la
  // seule chose à mesurer, et seulement quand la boîte change vraiment.
  useIsoLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const measure = () => {
      const card = cardRefs.current[0]
      if (!card) return
      widthRef.current = card.offsetWidth
      paint()
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [paint])

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (paintScheduled.current !== null) cancelAnimationFrame(paintScheduled.current)
    },
    []
  )

  const active = slides[selected]

  return (
    <div
      className={'cf ' + className}
      style={{ '--cf-card': cardWidth }}
      role="region"
      aria-roledescription="carrousel"
      aria-label={label}
    >
      <div className="cf-stage">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              nudge(-1)
            } else if (event.key === 'ArrowRight') {
              event.preventDefault()
              nudge(1)
            }
          }}
          className="cf-frame"
          role="group"
          aria-roledescription="carrousel"
          // C'est cet élément qui reçoit le focus et les flèches, pas le parent
          // porteur du `role="region"`. Sans nom accessible ici, l'utilisateur
          // au clavier atterrissait sur un div anonyme sans savoir quoi en faire.
          aria-label={label + ' — flèches gauche et droite pour naviguer'}
          style={{
            perspective: 'calc(var(--cf-card) * ' + perspective + ')',
            // Le glissement horizontal nous revient ; la page garde le vertical.
            touchAction: 'pan-y',
          }}
        >
          <div className="cf-track">
            {slides.map((slide, index) => (
              <div
                key={slide.src}
                ref={(node) => { cardRefs.current[index] = node }}
                role="group"
                aria-roledescription="diapositive"
                aria-label={index + 1 + ' sur ' + count}
                // Seule la carte centrée est exposée à l'assistance. Les autres
                // sont soit à opacité nulle, soit inclinées jusqu'à 82° : les
                // laisser lisibles obligeait un lecteur d'écran à parcourir sept
                // photos dont une seule est réellement à l'écran.
                aria-hidden={index !== selected}
                className="cf-card"
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button type="button" aria-label="Photo précédente" onClick={() => nudge(-1)} className="cf-nav cf-nav--prev">
              <Icon name="chevron-left" size={18} />
            </button>
            <button type="button" aria-label="Photo suivante" onClick={() => nudge(1)} className="cf-nav cf-nav--next">
              <Icon name="chevron-right" size={18} />
            </button>
          </>
        )}
      </div>

      {/* La légende change visuellement ; sans région live, rien ne le signalait
          à un lecteur d'écran après un appui sur les flèches. */}
      <p className="cf-status" role="status" aria-live="polite">
        {active ? active.title + (active.subtitle ? ', ' + active.subtitle : '') : ''}
      </p>

      {showCaption && active && active.title && (
        <div key={selected} className="cf-caption">
          <p className="cf-caption-title serif">{active.title}</p>
          {active.subtitle && <p className="cf-caption-sub">{active.subtitle}</p>}
          {active.org && <p className="cf-caption-org">{active.org}</p>}
        </div>
      )}

      {showPagination && (
        <div className="cf-dots">
          {slides.map((s, index) => (
            <button
              key={s.src}
              type="button"
              aria-label={'Aller à la photo ' + (index + 1)}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={'cf-dot' + (index === selected ? ' is-on' : '')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
